/** The real thing, rendered by Next while the page next door sits on its await. */
import { PageLoading } from "@/components/chrome/page-loading"
import { CONTEXTS } from "../../contexts"

export default function Loading() {
  return <PageLoading {...CONTEXTS.log} />
}
