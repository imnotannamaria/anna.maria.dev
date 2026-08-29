/**
 * The fallback for every `/admin` route without a nearer one — the dashboard itself and the two
 * `new/` forms. They were the three pages under here with no loading state at all, which is easy
 * to miss because none of them is force-dynamic: they are dynamic anyway, since `requireAdmin()`
 * reads cookies before anything renders.
 *
 * Next picks the nearest `loading.tsx` up the tree, so the four files below this one still win
 * on their own routes.
 */
import { PageLoading } from "@/components/chrome/page-loading"

export default function AdminLoading() {
  return (
    <PageLoading
      command="auth --whoami"
      crumb="admin"
      label="admin"
      steps={["checking the session", "checking the allowlist"]}
    />
  )
}
