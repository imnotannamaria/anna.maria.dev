import { authkitProxy } from "@workos-inc/authkit-nextjs"
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server"
import { LOCALE_COOKIE, routePage } from "@/lib/i18n/locales"

/**
 * Two jobs, on two sets of addresses that never overlap.
 *
 * **The admin and its API: the session.** Next 16 renamed the middleware convention to `proxy`,
 * and AuthKit deprecated `authkitMiddleware` in favour of `authkitProxy`. middlewareAuth.enabled
 * makes the proxy itself bounce signed-out users to WorkOS. Without it,
 * `withAuth({ ensureSignedIn: true })` inside a server component tries to write the session
 * cookie during render, which Next forbids.
 *
 * **Every public page: the language.** English is at the root and Portuguese under `/pt`. Inside
 * the app both live under a `[locale]` segment, so:
 *
 * - `/pt/...` is served as it is
 * - `/en/...` is not an address of the site: it is sent to the same page without the prefix
 * - anything else is the English page, served from `/en/...` without the address changing,
 *   unless the visitor would rather read Portuguese: they chose it on the flag, or they have
 *   chosen nothing and their browser asks for it. Then they are sent to `/pt/...`.
 *
 * A crawler sends no language, so it reads English at the root and finds Portuguese through
 * the `hreflang` links on every page.
 */
const session = authkitProxy({
  middlewareAuth: {
    enabled: true,
    // The API is listed here so the proxy resolves the session but does not redirect.
    // A JSON endpoint answering with a 303 to an HTML login page is useless to a fetch;
    // requireAdminApi returns a JSON 404 instead. Pages still get bounced to sign-in.
    unauthenticatedPaths: ["/api/v1/admin/:path*"],
  },
})

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/")) return session(request, event)

  const routing = routePage(
    pathname,
    request.cookies.get(LOCALE_COOKIE)?.value,
    request.headers.get("accept-language"),
  )
  if (routing.kind === "serve") return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = routing.to
  if (routing.kind === "rewrite") return NextResponse.rewrite(url)
  // 307 when it depends on who is asking, so it is never remembered for the next visitor
  return NextResponse.redirect(url, routing.permanent ? 308 : 307)
}

/**
 * The session's three, then every page. Left out: the rest of the API (/api/v1/wristkit
 * authenticates with an API key, not a session), Next's own files, and anything with a dot in
 * it, which is a file: an image, the sitemap, robots.txt.
 */
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/v1/admin/:path*",
    "/api/auth/:path*",
    "/((?!api/|_next/|.*\\..*).*)",
  ],
}
