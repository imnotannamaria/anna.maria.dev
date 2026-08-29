/**
 * The one loading screen every non-static page shares.
 *
 * Three things decided how it is built, and none of them is taste.
 *
 * **It is CSS, and it ships no JavaScript.** `app/(home)/loading.tsx` learned this the
 * expensive way with `TypeIn`: anything animated through JS cannot show until React has
 * hydrated, and a loading state's entire job happens before that. On a cold load the real data
 * can land before hydration finishes, so the typed line stayed invisible for the state's whole
 * time on screen while the CSS dots beside it animated throughout. So the text is in the DOM
 * from the first byte and CSS clips it — `.type-line` in globals.css, with `steps()` counting
 * the real character length.
 *
 * **It says more the longer you wait.** The prompt lands in under a second. The list of what is
 * actually being waited on only appears after `SLOW_AT`, which on any reasonable connection
 * never happens — the page has already arrived. There is no timer and no state: the delay on a
 * CSS animation *is* the measurement, and a fallback that gets unmounted never reaches it.
 *
 * **It is the page's own header, not a spinner's idea of one.** `crumb` and `command` are what
 * the loaded page prints at the top, so the thing you watch being typed is the thing that stays
 * there. Every value is known without a query, which is why there is one to print at all.
 *
 * Centred on both axes rather than pinned to the top-left, because this is the only thing on
 * the screen and there is nothing for it to align to. The lines inside stay left-aligned to
 * each other — a terminal with centred lines stops reading as a terminal.
 */

import { cn } from "@/lib/utils"

/**
 * When the extra lines start, and how far apart they land.
 *
 * Long enough that a healthy request never gets here — the queries behind these pages are two
 * indexed reads against a pooled connection — and short enough that the moment you start
 * wondering whether the page is stuck, it answers.
 */
const SLOW_AT = 2.2
const STEP_GAP = 0.6

/** Seconds a line of `n` characters takes to type, floored so a short line still reads as typed
 *  and capped so a long command does not become the wait. */
const dur = (n: number) => Math.max(0.28, Math.min(n * 0.028, 1.1))

/** Two decimals, because `2.2 + 0.6` is `2.8000000000000003` and that ends up in the HTML. */
const secs = (n: number) => `${Number(n.toFixed(2))}s`

function Typed({
  text,
  delay,
  style,
}: {
  text: string
  delay: number
  style?: React.CSSProperties
}) {
  return (
    <span
      className="type-line"
      style={
        {
          // The real length: `steps()` counts these, and a guess clips mid-glyph on the last
          // character. Exact because every line here is JetBrains Mono, where `1ch` is the
          // advance width of every character rather than only of a zero.
          "--type-chars": text.length,
          "--type-dur": secs(dur(text.length)),
          "--type-delay": secs(delay),
          ...style,
        } as React.CSSProperties
      }
    >
      {text}
    </span>
  )
}

export function PageLoading({
  command,
  crumb,
  steps,
  label,
  className,
}: {
  /** The `$` command the loaded page prints, verbatim. */
  command: string
  /** Breadcrumb tail — `log`, `roadmap`, `admin / entries`. Omitted on the home page, which is
   *  already at `~`. */
  crumb?: string
  /**
   * What the page is waiting on, shown only if the wait runs long.
   *
   * Written as what is *being* done, never as a checklist with ticks: nothing here is measured,
   * so a `✓` would be a claim. "reading log_entries" is true for as long as it is on screen.
   */
  steps: readonly string[]
  /** For the one screen-reader announcement: "Loading the log". */
  label: string
  className?: string
}) {
  const caretAt = 0.15 + dur(command.length)

  return (
    <div
      /*
       * `h-full` and a `min-h` floor, together, because the two places this renders give it
       * different parents. On `/`, `/log` and `/roadmap` it is a direct child of `<main>`,
       * which is a grid row with a definite height — so `height: 100%` fills it and the box
       * centres on the true middle of the screen. Under `/admin` it sits below the layout's
       * own header in an auto-height div, where `height: 100%` computes to `auto` per spec and
       * quietly does nothing; the floor is what centres it there.
       */
      className={cn("flex h-full w-full items-center justify-center px-5 py-16", className)}
      style={{ minHeight: "58vh" }}
    >
      <div aria-hidden className="font-mono">
        <div className="text-mono-sm mb-4" style={{ color: "var(--fg-muted)" }}>
          <span>~</span>
          {crumb && (
            <>
              <span style={{ opacity: 0.5, margin: "0 6px" }}>/</span>
              <span style={{ color: "var(--fg-primary)" }}>{crumb}</span>
            </>
          )}
        </div>

        <div className="text-mono-md">
          <span style={{ color: "var(--fg-brand)" }}>$ </span>
          <Typed text={command} delay={0.15} style={{ color: "var(--fg-primary)" }} />
          {/* The caret stays on the command line rather than moving under the output, which is
              where a real shell leaves it: the command has not returned a prompt yet. */}
          <span
            className="type-caret ml-0.5"
            style={{ "--type-delay": secs(caretAt) } as React.CSSProperties}
          />
        </div>

        <div className="mt-5 flex flex-col gap-2">
          {steps.map((step, i) => (
            <div
              key={step}
              className="text-mono-sm type-late flex items-center gap-2.5"
              style={{ "--type-delay": secs(SLOW_AT + i * STEP_GAP) } as React.CSSProperties}
            >
              <span style={{ color: "var(--fg-brand)" }}>→</span>
              <span style={{ color: "var(--fg-secondary)" }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* One announcement for the whole screen. The steps are decoration for this purpose:
          they carry no fact a screen reader needs, and announcing three of them mid-wait would
          interrupt whatever the reader was doing. */}
      <span className="sr-only" role="status">{`Loading ${label}`}</span>
    </div>
  )
}
