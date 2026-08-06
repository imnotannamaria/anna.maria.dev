import { createMetadata } from "@/lib/metadata"
import { getPublishedEntries, getTypeCounts } from "@/lib/log/queries"
import { LogFeed } from "@/components/log/log-feed"
import { LogStats } from "@/components/log/log-stats"

export const metadata = createMetadata({
  title: "Log",
  description:
    "Everything I finish — films, series, books, albums, podcasts and games — rated when my heart demands.",
  path: "/log",
})

/**
 * Static with ISR. The admin calls revalidatePath("/log") after a write, so publishing is
 * immediate and this is only the fallback.
 */
export const revalidate = 300

export default async function LogPage() {
  const [entries, counts] = await Promise.all([getPublishedEntries(), getTypeCounts()])

  return (
    <div className="mx-auto w-full max-w-[1020px] px-5 py-12 sm:px-8 lg:px-11">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 font-mono text-xs"
        style={{ color: "var(--fg-muted)" }}
      >
        <span>~</span>
        <span aria-hidden style={{ opacity: 0.5, margin: "0 6px" }}>
          /
        </span>
        <span style={{ color: "var(--fg-primary)" }}>log</span>
      </nav>

      <header className="mb-6 border-b pb-7" style={{ borderColor: "var(--border-subtle)" }}>
        <div
          className="mb-3 font-mono text-xs tracking-[0.08em] uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          <span style={{ color: "var(--fg-brand)" }}>$</span> log --all --sort=albums,favorites
        </div>

        <h1
          className="font-serif text-[40px] leading-none font-normal tracking-[-0.02em] sm:text-5xl lg:text-[64px]"
          style={{ color: "var(--fg-primary)" }}
        >
          Log
        </h1>

        <p
          className="mt-4 max-w-[56ch] font-sans text-base leading-relaxed"
          style={{ color: "var(--fg-secondary)" }}
        >
          A single feed for{" "}
          <em className="font-serif italic" style={{ color: "var(--fg-brand)" }}>
            everything
          </em>{" "}
          I finish — films, series, books, albums, podcasts and games. Rated when my heart demands,
          favorites marked{" "}
          <span aria-hidden style={{ color: "var(--fg-brand)" }}>
            ♥
          </span>
          <span className="sr-only">with a heart</span>.
        </p>

        <p className="mt-3 font-mono text-xs" style={{ color: "var(--fg-muted)" }}>
          {"// still adding some favorite stuff."}
        </p>

        <LogStats counts={counts} total={entries.length} />
      </header>

      <LogFeed entries={entries} counts={counts} />
    </div>
  )
}
