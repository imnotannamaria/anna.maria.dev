/**
 * `/components` — what the site is drawn from, then what is built from it.
 *
 * Fully static, and deliberately so. Every other page that reads Postgres is force-dynamic and
 * that reasoning is good; it does not apply here. This is documentation, and documentation
 * whose demos break when the database does is the worst possible version of it — so every demo
 * renders from a fixture in `lib/showcase/fixtures.ts` and nothing on this route reads a live
 * anything. It is also the only way an error frame exists at all: you cannot ask a healthy API
 * to fail on command.
 *
 * Note the folder this sits in. `app/components/entrepta/` holds the design-system copies and
 * has no `page.tsx`, so it is not a route — which is why adding one here is safe, and why
 * `/components/entrepta` falls through to `[slug]`, misses the lookup, and 404s.
 */

import { TokensSection } from "@/components/showcase/tokens-section"
import { ShowcaseFeed } from "@/components/showcase/showcase-feed"
import type { OutlineItem } from "@/components/chrome/page-outline"
import { SHOWCASE_LIST } from "@/lib/showcase/registry"
import { TOKEN_GROUPS } from "@/lib/design-tokens"
import { THEMES } from "@/lib/site-config"
import { createMetadata } from "@/lib/metadata"

export const metadata = createMetadata({
  title: "Components",
  description:
    "The design tokens this site is drawn from, and the components built from them — each shown in every state it can be in.",
  path: "/components",
})

/** The token subsections, plus the rules block, above the showcase groups in the rail. */
const TOKEN_OUTLINE: OutlineItem[] = [
  { id: "tokens", label: "tokens", level: 1 },
  ...TOKEN_GROUPS.map((g) => ({ id: g.id, label: g.label, level: 2 as const })),
  { id: "tokens-rules", label: "rules", level: 2 as const },
]

export default function ComponentsPage() {
  return (
    <ShowcaseFeed entries={[...SHOWCASE_LIST]} preOutline={TOKEN_OUTLINE}>
      <div id="tokens" style={{ scrollMarginTop: 24 }}>
        <h1
          className="text-display-md m-0"
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            color: "var(--fg-primary)",
          }}
        >
          Components
        </h1>
        <p
          className="text-body-lg mt-3 max-w-[62ch] font-sans"
          style={{ color: "var(--fg-secondary)" }}
        >
          The tokens this site is drawn from, and the components built out of them. Every card below
          is the real thing running, shown in each state it can actually be in — including the ones
          you only see when something has gone wrong.
        </p>

        <div className="mt-10">
          <TokensSection themeCount={THEMES.length} />
        </div>

        <div
          className="mt-14 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-dashed pb-3"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <h2
            id="showcase"
            className="text-mono-sm m-0 font-mono"
            style={{ color: "var(--fg-secondary)", scrollMarginTop: 24 }}
          >
            <span aria-hidden style={{ color: "var(--fg-brand)" }}>
              ${" "}
            </span>
            ls ./components
          </h2>
          <span
            className="text-mono-xs font-mono tracking-[0.08em] uppercase"
            style={{ color: "var(--fg-muted)" }}
          >
            {SHOWCASE_LIST.length} components
          </span>
        </div>
      </div>
    </ShowcaseFeed>
  )
}
