import { Hono } from "hono"
import { isKnownPosterUrl } from "@/lib/log/poster-allowlist"
import { decodePosterToken } from "@/lib/log/poster-src"
import { rateLimit } from "../middleware/rate-limit"

export const poster = new Hono()

/** A poster nobody will ever look at closely is not worth more than this. */
const MAX_BYTES = 8 * 1024 * 1024

/** Long enough that the upstream is hit roughly never; the URL is the cache key. */
const CACHE_CONTROL = "public, max-age=31536000, s-maxage=31536000, immutable"

/**
 * Fetches a /log poster server-side so the browser never does.
 *
 * ## Why this exists
 *
 * Posters come from wherever the thing was catalogued — Wikimedia, Amazon, Deezer, the
 * PlayStation store — and they used to be hotlinked straight into an `<img>`. That was a
 * deliberate call, and the reason was good: `next/image` would have meant listing every
 * poster host in `remotePatterns`, a config edit standing between me and saving an entry.
 *
 * What it cost, measured on /log:
 *
 *   - **2.7 MB of wasted image bytes.** The Game of Thrones poster is 1791×2704 and 1.79 MB,
 *     served into a 92px-wide box. It is hosted on a WordPress blog, not a CDN, and it was
 *     43% of the page weight on its own.
 *   - **11 third-party cookies.** `image.api.playstation.com` sets nine, including Adobe
 *     Analytics identity and Kampyle session cookies; Wikimedia sets `WMF-Uniq`. Every
 *     visitor to /log was being handed to Sony's analytics stack by an `<img>` tag. That is
 *     what dropped the page's Lighthouse best-practices score to 77, and it is the half of
 *     this that actually matters.
 *
 * ## How it keeps the original decision intact
 *
 * The card asks for `/api/v1/poster/<base64url>`, which is a **local** path — so
 * `next/image` optimises it without any host ever appearing in `remotePatterns`. Next
 * resizes and re-encodes; this route only fetches. A poster can still come from any host,
 * with no config edit, which was the whole point of the plain `<img>`.
 *
 * The upstream URL is a path segment rather than `?u=`, because next/image rejects a local
 * `src` with a query string unless `images.localPatterns` matches it, and a LocalPattern's
 * `search` is a literal with no wildcard. See `posterSrc`.
 *
 * ## Why this is not an open proxy
 *
 * A route that fetches an arbitrary URL on request is a proxy for whoever finds it. This one
 * only ever fetches a URL that is already in `log_entries.poster_url` — see
 * `isKnownPosterUrl`. Anything else is a 404. That is a stronger guarantee than an
 * allowlist of hosts would be, and unlike `remotePatterns` it needs no maintenance: writing
 * the entry is what authorises the image.
 */
poster.get("/:token", rateLimit({ max: 300, windowMs: 5 * 60 * 1000 }), async (c) => {
  const raw = decodePosterToken(c.req.param("token"))
  if (!raw) return c.json({ error: "invalid_url" }, 400)

  let target: URL
  try {
    target = new URL(raw)
  } catch {
    return c.json({ error: "invalid_url" }, 400)
  }

  // https only. An http poster would downgrade the page's transport for a decoration.
  if (target.protocol !== "https:") return c.json({ error: "invalid_url" }, 400)

  if (!(await isKnownPosterUrl(target.toString()))) {
    return c.json({ error: "not_found" }, 404)
  }

  let upstream: Response
  try {
    upstream = await fetch(target, {
      // No credentials, and nothing of the visitor's request is forwarded — not the
      // cookie jar, not the Referer, not the UA. The upstream sees this server asking
      // for an image and learns nothing about who is looking at the page.
      redirect: "follow",
      headers: { accept: "image/*" },
      signal: AbortSignal.timeout(10_000),
    })
  } catch (err) {
    console.error("[poster] fetch failed", target.hostname, err)
    return c.json({ error: "upstream_unavailable" }, 502)
  }

  if (!upstream.ok || !upstream.body) {
    return c.json({ error: "upstream_unavailable" }, 502)
  }

  const contentType = upstream.headers.get("content-type") ?? ""
  if (!contentType.startsWith("image/")) {
    return c.json({ error: "not_an_image" }, 415)
  }

  const declared = Number(upstream.headers.get("content-length") ?? NaN)
  if (Number.isFinite(declared) && declared > MAX_BYTES) {
    return c.json({ error: "too_large" }, 413)
  }

  // Buffered rather than streamed, on purpose: a Content-Length is a claim, and streaming
  // would mean discovering a 400 MB response by having already sent most of it. These are
  // a few hundred KB and the answer is cached forever after the first hit.
  const bytes = await upstream.arrayBuffer()
  if (bytes.byteLength > MAX_BYTES) {
    return c.json({ error: "too_large" }, 413)
  }

  // Only these three headers are copied through. Notably not `set-cookie`, which is the
  // entire reason the route exists.
  return c.body(bytes, 200, {
    "content-type": contentType,
    "content-length": String(bytes.byteLength),
    "cache-control": CACHE_CONTROL,
  })
})
