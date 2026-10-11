import type { Metadata } from "next"
import { toLetter } from "@/components/site/wall/letters"
import { Wall } from "@/components/site/wall/wall"
import { createMetadata } from "@/lib/metadata"
import { getApprovedTestimonials } from "@/lib/wall/queries"

/** Approving a letter in the admin puts it on the wall now: rendered per request, not cached. */
export const dynamic = "force-dynamic"

const read = () =>
  getApprovedTestimonials()
    .then((list) => list.map(toLetter))
    .catch(() => null)

/** An empty wall is not worth a place in a search result, so it is only indexed with letters. */
export async function generateMetadata(): Promise<Metadata> {
  const letters = await read()
  return {
    ...createMetadata({
      title: "Wall of love",
      description: "What people I have worked with wrote about working with me.",
      path: "/wall-of-love",
    }),
    robots: letters?.length ? undefined : { index: false, follow: true },
  }
}

export default async function Page() {
  // a database that is down costs a line of text on the page, not the page
  return <Wall letters={await read()} />
}
