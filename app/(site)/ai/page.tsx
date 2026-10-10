import { createMetadata } from "@/lib/metadata"

export const metadata = createMetadata({
  title: "IA",
  description: "A chat that answers questions about Anna and what is on this site.",
  path: "/ai",
})

/** This side is drawn by the layout, which keeps it mounted across pages. The route names it. */
export default function Page() {
  return null
}
