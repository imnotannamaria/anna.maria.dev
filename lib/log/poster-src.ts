/**
 * The `src` a poster is rendered with. Client-safe on purpose: this is a string builder and
 * nothing else, so it can be imported from a `"use client"` card without dragging the
 * Postgres client into the browser bundle. The half that talks to the database lives in
 * `poster-allowlist.ts`, which only the API route imports.
 *
 * The returned path is **local**, and that is the trick the whole change rests on:
 * `next/image` optimises a local path with no `remotePatterns` entry, so Next does the
 * resize and the WebP/AVIF encode while a poster stays free to come from any host in the
 * world. The proxy is what makes an arbitrary remote URL look local.
 *
 * See lib/api/routes/poster.ts for what the route is protecting against.
 */

/**
 * The upstream URL travels as a base64url path segment, not as `?u=`, and that is not a
 * style choice. `next/image` refuses a local `src` carrying a query string unless
 * `images.localPatterns` allows it, and a LocalPattern's `search` is a literal — `"?v=1"`
 * or `""`, no wildcard. There is no pattern that means "any query string", so a URL in the
 * query is a `src` next/image will not accept. In the path it is one segment matched by
 * `/api/v1/poster/*`.
 *
 * base64url rather than `encodeURIComponent`: a percent-encoded `/` or `:` inside a path
 * segment is at the mercy of every layer that might normalise the path between the browser
 * and the handler. base64url has no reserved characters, so nothing along the way is
 * tempted to rewrite it.
 */
export function posterSrc(url: string): string {
  return `/api/v1/poster/${encodePosterToken(url)}`
}

/** Shared with the route, which reverses it. `btoa` is global in browsers and in Node. */
export function encodePosterToken(url: string): string {
  const bytes = new TextEncoder().encode(url)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

/** Returns null on anything that is not valid base64url, which the route treats as a 400. */
export function decodePosterToken(token: string): string | null {
  try {
    const binary = atob(token.replace(/-/g, "+").replace(/_/g, "/"))
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}
