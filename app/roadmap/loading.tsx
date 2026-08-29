/** The board is force-dynamic and reads Postgres, so there is a moment with nothing on screen. */
import { PageLoading } from "@/components/chrome/page-loading"

export default function RoadmapLoading() {
  return (
    <PageLoading
      command="roadmap --all --group=status"
      crumb="roadmap"
      label="the roadmap"
      steps={["connecting to postgres", "reading roadmap_items", "counting by status"]}
    />
  )
}
