import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth/require-admin"

/**
 * /admin/log is the only thing here so far.
 *
 * The guard runs even though this only redirects, because the rule in CLAUDE.md is
 * unconditional — every page under /admin calls it, and a page that is exempt today because it
 * happens to hold nothing is a page somebody adds a query to tomorrow.
 */
export default async function AdminIndexPage() {
  await requireAdmin()
  redirect("/admin/log")
}
