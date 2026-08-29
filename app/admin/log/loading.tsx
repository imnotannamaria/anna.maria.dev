/** The list is force-dynamic and hits Postgres, so navigating here shows nothing until the
 *  query returns. */
import { PageLoading } from "@/components/chrome/page-loading"

export default function AdminLogLoading() {
  return (
    <PageLoading
      command="log --admin"
      crumb="admin / log"
      label="entries"
      steps={["checking the allowlist", "reading log_entries", "including drafts"]}
    />
  )
}
