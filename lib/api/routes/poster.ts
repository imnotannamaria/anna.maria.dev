import { Hono } from "hono"
import { isKnownPosterUrl } from "@/lib/log/poster-allowlist"
import { rateLimit } from "../middleware/rate-limit"

export const poster = new Hono()

/** A poster nobody will ever look at closely is not worth more than this. */
const MAX_BYTES = 8 * 1024 * 1024

/** Long enough that the upstream is hit roughly never; the URL is the cache key. */
const CACHE_CONTROL = "public, max-age=31536000, s-maxage=31536000, immutable"

/** One redirect, so a CDN's `/latest` style URL still resolves. Two is a chain. */
const MAX_REDIRECTS = 1

/**
 * The reverse of `encodePosterToken` in lib/log/poster-src.ts. It lives here rather than
 * beside its pair because that file is imported by a `"use client"` card, and shipping the
 * decoder to the browser is ten lines of dead weight in the bundle. The two must stay in
 * step; there is a pointer in both directions.
 *
 * Returns null on anything that is not valid base64url, which the caller treats as a 400.
 *
 * Exported only so the round trip with encodePosterToken can be tested directly — no other
 * caller should need it, since posterSrc/encodePosterToken already do the encoding half.
 */
export function decodePosterToken(token: string): string | null {
  try {
    const binary = atob(token.replace(/-/g, "+").replace(/_/g, "/"))
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}

/**
 * Literal addresses that must never be fetched: loopback, link-local — which is where cloud
 * metadata endpoints live — and the private ranges.
 *
 * This is a check on the literal, not a resolution. A hostname whose DNS points inside the
 * network still passes, and closing that properly means resolving before connecting, which
 * `fetch` gives no hook for. It is worth having anyway: the addresses actually worth reaching
 * are typed as literals, and `169.254.169.254` is the whole reason redirects are validated.
 */
function isBlockedHost(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase()

  if (host === "localhost" || host.endsWith(".localhost")) return true
  if (host === "::1" || host === "0.0.0.0") return true

  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\d{1,3}$/)
  if (!v4) return false

  const [a, b] = [Number(v4[1]), Number(v4[2])]
  return (
    a === 127 || // loopback
    a === 10 || // private
    (a === 172 && b >= 16 && b <= 31) || // private
    (a === 192 && b === 168) || // private
    (a === 169 && b === 254) // link-local, incl. the metadata endpoint
  )
}

/** https, and not pointed at ourselves. Applied to the stored URL and to every redirect. */
function isFetchableUrl(url: URL): boolean {
  return url.protocol === "https:" && !isBlockedHost(url.hostname)
}

/**
 * `redirect: "manual"`, because "follow" would validate the first URL and then go anywhere.
 * Every hop is checked with the same rule as the original, so a poster host that expires and
 * gets re-registered cannot turn a stored row into an arbitrary fetch out of this server.
 */
async function fetchImage(start: URL): Promise<Response | null> {
  let current = start

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await fetch(current, {
      redirect: "manual",
      // Nothing of the visitor's request is forwarded — not the cookie jar, not the Referer,
      // not the UA. The upstream sees this server asking for an image and learns nothing
      // about who is looking at the page.
      headers: { accept: "image/*" },
      signal: AbortSignal.timeout(10_000),
    })

    if (res.status < 300 || res.status >= 400) return res

    const location = res.headers.get("location")
    if (!location) return null

    let next: URL
    try {
      next = new URL(location, current)
    } catch {
      return null
    }
    if (!isFetchableUrl(next)) return null
    current = next
  }

  return null
}

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
 *
 * ## What the rate limit counts
 *
 * The token, not the caller. Keying on IP is the default and it is wrong here: the browser
 * never calls this route, it calls `/_next/image?url=/api/v1/poster/…`, and Next's optimiser
 * fetches us from the server's own loopback. Measured, the route sees `x-forwarded-for: ::1`
 * for every visitor — so an IP-keyed limit is one shared bucket, a global cap that a busy
 * moment can trip for everybody at once, while a direct caller gets a private bucket of their
 * own. Exactly backwards.
 *
 * Per token, the limit caps the thing that actually costs something: an outbound fetch to
 * someone else's server. Legitimate traffic asks for a handful of widths per poster and then
 * lives in the optimiser's cache; a loop on one valid token stops at 60. There are only ever
 * as many buckets as there are posters.
 */
poster.get(
  "/:token",
  rateLimit({ max: 60, windowMs: 5 * 60 * 1000, key: (c) => `poster:${c.req.param("token")}` }),
  async (c) => {
    const raw = decodePosterToken(c.req.param("token"))
    if (!raw) return c.json({ error: "invalid_url" }, 400)

    let target: URL
    try {
      target = new URL(raw)
    } catch {
      return c.json({ error: "invalid_url" }, 400)
    }

    // https only — an http poster would downgrade the page's transport for a decoration —
    // and never an address inside the network.
    if (!isFetchableUrl(target)) return c.json({ error: "invalid_url" }, 400)

    if (!(await isKnownPosterUrl(target.toString()))) {
      return c.json({ error: "not_found" }, 404)
    }

    let upstream: Response | null
    try {
      upstream = await fetchImage(target)
    } catch (err) {
      console.error("[poster] fetch failed", target.hostname, err)
      return c.json({ error: "upstream_unavailable" }, 502)
    }

    if (!upstream || !upstream.ok || !upstream.body) {
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

    // Only these two headers are set. Notably not `set-cookie`, which is the entire reason
    // the route exists — and notably not `content-length`, which the runtime computes from
    // the body it is handed and gets right without being told.
    return c.body(bytes, 200, {
      "content-type": contentType,
      "cache-control": CACHE_CONTROL,
    })
  },
)
