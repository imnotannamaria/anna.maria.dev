import { Home } from "@/components/site/home/home"
import { createMetadata } from "@/lib/metadata"

const DESCRIPTION =
  "I build things end to end, from the UI and the front, web or mobile, to shipping. Notes, projects, and a cat."

export const metadata = createMetadata({
  title: "Anna Maria",
  description: DESCRIPTION,
  titleAbsolute: true,
})

export default function Page() {
  return <Home />
}
