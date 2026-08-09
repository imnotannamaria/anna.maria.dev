import { TypeIn } from "@/components/ui/type-in"
import { RoadmapBoard } from "@/components/roadmap/roadmap-board"
import { createMetadata } from "@/lib/metadata"
import { getPublicItems } from "@/lib/roadmap/queries"

export const metadata = createMetadata({
  title: "Roadmap",
  description:
    "Everything I want to build on this site and what already shipped — to do, in progress, done.",
  path: "/roadmap",
})

/**
 * Rendered per request, like /log and the home page. A board that shows yesterday's
 * columns is the same lie as an activity ring frozen at this morning's numbers: I move a
 * card in /admin and the page should say so on the next load, not after a revalidate call
 * I have to remember to wire up.
 *
 * It also means a database that is down during `next build` no longer fails the build —
 * error.tsx handles it at request time instead.
 */
export const dynamic = "force-dynamic"

export default async function RoadmapPage() {
  const items = await getPublicItems()

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 py-12 sm:px-8 lg:px-11">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 font-mono text-xs"
        style={{ color: "var(--fg-muted)" }}
      >
        <span>~</span>
        <span aria-hidden style={{ opacity: 0.5, margin: "0 6px" }}>
          /
        </span>
        <span style={{ color: "var(--fg-primary)" }}>roadmap</span>
      </nav>

      <header className="mb-8 border-b pb-7" style={{ borderColor: "var(--border-subtle)" }}>
        <div
          className="mb-3 font-mono text-xs tracking-[0.08em] uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          <span style={{ color: "var(--fg-brand)" }}>$</span>{" "}
          <TypeIn text="roadmap --all --group=status" />
        </div>

        <h1
          className="font-serif text-[40px] leading-none font-normal tracking-[-0.02em] sm:text-5xl lg:text-[64px]"
          style={{ color: "var(--fg-primary)" }}
        >
          Roadmap
        </h1>

        <p
          className="mt-4 max-w-[58ch] font-sans text-base leading-relaxed"
          style={{ color: "var(--fg-secondary)" }}
        >
          Everything I want to build on this site, and what already{" "}
          <em className="font-serif italic" style={{ color: "var(--fg-brand)" }}>
            shipped
          </em>
          . Nothing here has a date and not all of it will get built — an item is a thought I had,
          not a promise.
        </p>

        <p className="mt-3 font-mono text-xs" style={{ color: "var(--fg-muted)" }}>
          {"// an idea that grows up leaves here and becomes a plan in docs/."}
        </p>
      </header>

      {items.length === 0 ? (
        <p className="mt-10 text-center font-mono text-[13px]" style={{ color: "var(--fg-muted)" }}>
          {"// nothing on the board yet."}
        </p>
      ) : (
        <RoadmapBoard items={items} />
      )}
    </div>
  )
}
