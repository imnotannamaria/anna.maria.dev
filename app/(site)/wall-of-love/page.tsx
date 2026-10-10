import { Wall } from "@/components/site/wall/wall"
import { createMetadata } from "@/lib/metadata"

export const metadata = createMetadata({
  title: "Wall of love",
  description: "Kind words, by invitation.",
  path: "/wall-of-love",
})

export default function Page() {
  return <Wall />
}
