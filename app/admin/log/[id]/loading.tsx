/** Same reason as the list: the edit page reads the entry before it can render the form. */
import { PageLoading } from "@/components/chrome/page-loading"

export default function EditLogEntryLoading() {
  return (
    <PageLoading
      command="log --edit"
      crumb="admin / log / edit"
      label="the entry"
      steps={["checking the allowlist", "reading the entry"]}
    />
  )
}
