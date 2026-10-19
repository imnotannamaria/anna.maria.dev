import "server-only"
import { withAuth } from "@workos-inc/authkit-nextjs"
import { notFound } from "next/navigation"

/** Emails allowed into /admin, parsed from ADMIN_EMAILS. */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return adminEmails().includes(email.toLowerCase())
}

/**
 * The allowlist is the email, so it is only as good as the email being the person's: AuthKit
 * says who signed in, and `emailVerified` says whether it checked the address. An account that
 * WorkOS marks as unverified is not let in, whatever address it carries. Only an explicit
 * `false` refuses: a user object without the field (an older SDK) is not locked out by this.
 */
export function isAdmin(
  user: { email?: string | null; emailVerified?: boolean } | null | undefined,
) {
  return !!user && user.emailVerified !== false && isAdminEmail(user.email)
}

/**
 * AuthKit says who you are. This says whether you're allowed in.
 *
 * Call it in the admin layout AND in every mutating route. The middleware matcher is not
 * the gate — if it ever gets edited wrong, this is what still stops people.
 *
 * 404 rather than 403, because a 403 confirms that /admin exists.
 */
export async function requireAdmin() {
  const { user } = await withAuth({ ensureSignedIn: true })
  if (!isAdmin(user)) notFound()
  return user
}
