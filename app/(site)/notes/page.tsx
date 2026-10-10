import { Notes } from "@/components/site/notes/notes"
import { createMetadata } from "@/lib/metadata"

export const metadata = createMetadata({
  title: "Notes",
  description:
    "Notes on development, architecture, and the tools I reach for. Long-form thinking, build logs, and the occasional opinion.",
  path: "/notes",
})

export default function Page() {
  return <Notes />
}
