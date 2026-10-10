import { createMetadata } from "@/lib/metadata"

export const metadata = createMetadata({
  title: "Back",
  description: "The same site as a terminal: files, routes and commands.",
  path: "/back",
})

/** This side is drawn by the layout, which keeps it mounted across pages. The route names it. */
export default function Page() {
  return null
}
