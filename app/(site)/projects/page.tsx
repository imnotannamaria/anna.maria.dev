import { Projects } from "@/components/site/projects/projects"
import { createMetadata } from "@/lib/metadata"

export const metadata = createMetadata({
  title: "Projects",
  description:
    "Open-source tools, libraries and side projects. The things I built because I wanted them to exist.",
  path: "/projects",
})

export default function Page() {
  return <Projects />
}
