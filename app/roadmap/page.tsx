import Link from "next/link"
import { ChatsCircleIcon } from "@phosphor-icons/react/dist/ssr"
import { buttonVariants } from "@/app/components/entrepta/button-variants"
import { TypeIn } from "@/components/ui/type-in"
import { RoadmapBoard } from "@/components/roadmap/roadmap-board"
import { createMetadata } from "@/lib/metadata"
import { getPublicItems } from "@/lib/roadmap/queries"

export const metadata = createMetadata({
  title: "Roadmap",
  description:
    "Loose ideas for what comes next on this site, and what already shipped: to do, in progress, done.",
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
        className="text-mono-sm mb-6 font-mono"
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
          className="text-mono-sm mb-3 font-mono tracking-[0.08em] uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          <span style={{ color: "var(--fg-brand)" }}>$</span>{" "}
          <TypeIn text="roadmap --all --group=status" />
        </div>

        <h1
          className="text-display-md lg:text-display-lg font-serif leading-none font-normal tracking-[-0.02em]"
          style={{ color: "var(--fg-primary)" }}
        >
          Roadmap
        </h1>

        <p
          className="text-body-lg mt-4 max-w-[58ch] font-sans leading-relaxed"
          style={{ color: "var(--fg-secondary)" }}
        >
          Hi. You&apos;re probably wondering why a portfolio has a roadmap. The honest answer is
          that I&apos;ve been having too much fun building things for this site. At some point it
          stopped being a portfolio and turned into{" "}
          <em className="font-serif italic" style={{ color: "var(--fg-brand)" }}>
            me, as a website
          </em>
          . It is also the best proof I have of what I can build.
        </p>

        <p
          className="text-body-lg mt-3 max-w-[58ch] font-sans leading-relaxed"
          style={{ color: "var(--fg-secondary)" }}
        >
          So this is what might come next. Loose ideas, nothing else. No dates, no promises.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          {/* A link wearing the button's clothes, the way the home page CTA does. A <Button>
              inside a <Link> is a <button> inside an <a>: invalid markup, and two tab stops
              for one destination. */}
          <Link href="/contact" className={buttonVariants({ variant: "secondary" })}>
            <ChatsCircleIcon size={14} aria-hidden />
            tell me what to build next
          </Link>

          <p className="text-mono-sm m-0 font-mono" style={{ color: "var(--fg-muted)" }}>
            {"// an idea that grows up leaves here and becomes a plan in docs/."}
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <p
          className="text-mono-md mt-10 text-center font-mono"
          style={{ color: "var(--fg-muted)" }}
        >
          {"// nothing on the board yet."}
        </p>
      ) : (
        <RoadmapBoard items={items} />
      )}
    </div>
  )
}
