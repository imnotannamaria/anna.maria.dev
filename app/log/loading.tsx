/**
 * `/log` is force-dynamic and reads Postgres, so there is a moment with nothing on screen.
 *
 * It used to trace the whole page in grey — the outline rail, the header, the filter pills and
 * six poster tiles. That is a lot of hand-copied layout to keep in step with the real page, and
 * it bought less than it looks: the tiles it drew were a guess at how many entries there are,
 * so the layout it was protecting from jumping jumped anyway the moment the real count differed.
 */
import { PageLoading } from "@/components/chrome/page-loading"

export default function LogLoading() {
  return (
    <PageLoading
      command="log --all --sort=albums,favorites"
      crumb="log"
      label="the log"
      steps={["connecting to postgres", "reading log_entries", "grouping by type"]}
    />
  )
}
