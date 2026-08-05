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
 * AuthKit says who you are. This says whether you're allowed in.
 *
 * Call it in the admin layout AND in every mutating route. The middleware matcher is not
 * the gate — if it ever gets edited wrong, this is what still stops people.
 *
 * 404 rather than 403, because a 403 confirms that /admin exists.
 */
export async function requireAdmin() {
  const { user } = await withAuth({ ensureSignedIn: true })
  if (!isAdminEmail(user?.email)) notFound()
  return user
}
