import { createMetadata } from "@/lib/metadata"
import { countByType } from "@/lib/log/counts"
import { getPublishedEntries } from "@/lib/log/queries"
import { LogFeed } from "@/components/log/log-feed"
import { DocLabel, Em } from "@/components/chrome/page-parts"
import { TypeIn } from "@/components/ui/type-in"

export const metadata = createMetadata({
  title: "Log",
  description:
    "Everything I finish: films, series, books, albums, podcasts and games. Rated when my heart demands.",
  path: "/log",
})

/**
 * Rendered per request, not cached. The log is meant to read as live: publishing an entry
 * should show up on the next load, not after an ISR window or a revalidate call I have to
 * remember to wire up. Two indexed queries against a pooled connection cost little enough
 * that the caching was buying convenience, not speed.
 *
 * It also means a database that is down during `next build` no longer fails the build —
 * error.tsx handles it at request time instead.
 */
export const dynamic = "force-dynamic"

export default async function LogPage() {
  const entries = await getPublishedEntries()
  const counts = countByType(entries)

  return (
    <LogFeed entries={entries} counts={counts}>
      <nav
        aria-label="Breadcrumb"
        className="text-mono-sm mb-8 font-mono"
        style={{ color: "var(--fg-muted)" }}
      >
        <span>~</span>
        <span aria-hidden style={{ opacity: 0.5, margin: "0 6px" }}>
          /
        </span>
        <span style={{ color: "var(--fg-primary)" }}>log</span>
      </nav>

      <div id="log" style={{ scrollMarginTop: 24 }}>
        <DocLabel level="#">log --all --sort=albums,favorites</DocLabel>

        <TypeIn
          as="h1"
          text="Log."
          emphasis="Log"
          speed={0.06}
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "clamp(48px, 6vw, 72px)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "var(--fg-primary)",
            margin: 0,
            display: "block",
          }}
        />

        {/* No <Reveal>: this paragraph is the page's LCP element, and an entrance starting at
            `opacity: 0` ships that way in the SSR markup, so the largest thing on the page
            stays invisible until hydration plus the delay. The <TypeIn> title carries the
            entrance instead. Same shape on every page header. */}
        <p
          className="text-body-lg mt-4 leading-relaxed"
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--fg-secondary)",
            maxWidth: "56ch",
          }}
        >
          A single feed for <Em>everything</Em> I finish: films, series, books, albums, podcasts and
          games. Rated when my heart demands, favorites marked{" "}
          <span aria-hidden style={{ color: "var(--fg-brand)" }}>
            ♥
          </span>
          <span className="sr-only">with a heart</span>.
        </p>

        <p className="text-mono-sm mt-3 font-mono" style={{ color: "var(--fg-muted)" }}>
          {"// still adding some favorite stuff."}
        </p>
      </div>
    </LogFeed>
  )
}
