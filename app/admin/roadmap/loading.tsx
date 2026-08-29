/** Same as the log list: force-dynamic, and Postgres before anything can render. */
import { PageLoading } from "@/components/chrome/page-loading"

export default function AdminRoadmapLoading() {
  return (
    <PageLoading
      command="roadmap --admin"
      crumb="admin / roadmap"
      label="roadmap items"
      steps={["checking the allowlist", "reading roadmap_items", "including raw"]}
    />
  )
}
