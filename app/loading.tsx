/**
 * The home page is force-dynamic — the wristkit rings and the log shelf are supposed to read
 * as live — so it waits on Postgres before anything paints.
 *
 * This does not draw the page in grey. The first attempt did: a rounded rectangle for the
 * avatar, bars for the name and the stats, a pill for the CTA. A skeleton works when the
 * thing behind it is a uniform repeating shape, because then the grey blocks *are* the
 * layout. The first row here is a bespoke card — a photo, a serif name, an odometer, three
 * social buttons — and a grey caricature of that reads as a broken page rather than a
 * loading one.
 *
 * So it says what is happening, in the voice the rest of the site already uses: the real
 * section prompt, then a `$` line that types itself in. Type cannot look broken the way a
 * bad mock can. `60vh` keeps the status bar from jumping up to meet it and back down again.
 *
 * `TypeIn` is the site's typing animation, the one the page titles use — it fades every
 * character in from a stagger rather than growing a sliced string, so the whole sentence is
 * in the DOM from the first render. The dots are CSS, and they loop: once the line has
 * landed, one thing should still be moving, and an ellipsis says "still working" where a
 * caret only says "cursor".
 */
import { TypeIn } from "@/components/ui/type-in"

export default function HomeLoading() {
  return (
    <div
      className="mx-auto flex flex-col px-4 py-6 sm:px-6 md:px-8 lg:px-12 lg:py-8"
      style={{ maxWidth: 1280, minHeight: "60vh" }}
    >
      {/* The same head the section renders for real, so this line does not move when the
          page lands — it is the one piece of the home page that is known without a query. */}
      <div
        className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-dashed pb-3"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <span className="font-mono text-xs tracking-[0.08em] uppercase">
          <span style={{ color: "var(--fg-brand)" }}>$</span>{" "}
          <span style={{ color: "var(--fg-muted)" }}>whoami</span>
        </span>
      </div>

      <p className="m-0 font-mono text-[13px]" style={{ color: "var(--fg-muted)" }}>
        <span aria-hidden style={{ color: "var(--fg-brand)" }}>
          $
        </span>{" "}
        <TypeIn text="loading page" speed={0.045} />
        <span aria-hidden>
          <span className="load-dot load-dot-1">.</span>
          <span className="load-dot load-dot-2">.</span>
          <span className="load-dot load-dot-3">.</span>
        </span>
      </p>

      <span className="sr-only" role="status">
        Loading the page
      </span>
    </div>
  )
}
