import { handleAuth } from "@workos-inc/authkit-nextjs"

/**
 * Where WorkOS sends the user back after sign-in. The URL here has to match
 * NEXT_PUBLIC_WORKOS_REDIRECT_URI and the Redirects list in the WorkOS dashboard.
 */
export const GET = handleAuth({ returnPathname: "/admin" })
