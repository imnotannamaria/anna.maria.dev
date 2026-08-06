import { authkitProxy } from "@workos-inc/authkit-nextjs"

/**
 * Next 16 renamed the middleware convention to `proxy`, and AuthKit deprecated
 * `authkitMiddleware` in favour of `authkitProxy`. Same signature, both new names.
 *
 * middlewareAuth.enabled makes the proxy itself bounce signed-out users to WorkOS.
 * Without it, `withAuth({ ensureSignedIn: true })` inside a server component tries to
 * write the session cookie during render, which Next forbids ("Cookies can only be
 * modified in a Server Action or Route Handler").
 *
 * unauthenticatedPaths is empty because every path this matcher covers needs a session.
 */
export default authkitProxy({
  middlewareAuth: {
    enabled: true,
    // The API is listed here so the proxy resolves the session but does not redirect.
    // A JSON endpoint answering with a 303 to an HTML login page is useless to a fetch;
    // requireAdminApi returns a JSON 404 instead. Pages still get bounced to sign-in.
    unauthenticatedPaths: ["/api/v1/admin/:path*"],
  },
})

/**
 * Deliberately narrow. The public site is static and cached at the edge, and running this
 * across all of it would throw that away for no reason.
 *
 * /api/v1/wristkit stays out: it authenticates with an API key, not a session.
 */
export const config = {
  matcher: ["/admin/:path*", "/api/v1/admin/:path*", "/api/auth/:path*"],
}
