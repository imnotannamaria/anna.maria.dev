/**
 * `/components` — what the site is drawn from, what is built from it, and what not to do.
 *
 * Fully static, and deliberately so. Every other page that reads Postgres is force-dynamic and
 * that reasoning is good; it does not apply here. This is documentation, and documentation whose
 * demos break when the database does is the worst possible version of it — so every demo renders
 * from a fixture in `lib/showcase/fixtures.ts` and nothing on this route reads a live anything.
 * It is also the only way an error frame exists at all: you cannot ask a healthy API to fail on
 * command.
 *
 * Note the folder this sits in. `app/components/entrepta/` holds the design-system copies and has
 * no `page.tsx`, so it is not a route — which is why adding one here is safe, and why
 * `/components/entrepta` falls through to `[slug]`, misses the lookup, and 404s.
 */

import { ShowcasePage } from "@/components/showcase/showcase-page"
import { THEMES } from "@/lib/site-config"
import { createMetadata } from "@/lib/metadata"

export const metadata = createMetadata({
  title: "Components",
  description:
    "The design tokens this site is drawn from, and the components built from them — each shown in every state it can be in.",
  path: "/components",
})

export default function ComponentsPage() {
  return <ShowcasePage themeCount={THEMES.length} />
}
