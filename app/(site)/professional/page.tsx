import { Professional } from "@/components/site/professional/professional"
import { createMetadata } from "@/lib/metadata"

export const metadata = createMetadata({
  title: "Anna, the professional",
  description: "Where I have worked and studied, what I work with, and the apps I work in.",
  path: "/professional",
})

export default function Page() {
  return <Professional />
}
