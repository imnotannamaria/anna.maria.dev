/** Same reason as the list: the edit page reads the item before it can render the form. */
import { PageLoading } from "@/components/chrome/page-loading"

export default function EditRoadmapItemLoading() {
  return (
    <PageLoading
      command="roadmap --edit"
      crumb="admin / roadmap / edit"
      label="the item"
      steps={["checking the allowlist", "reading the item"]}
    />
  )
}
