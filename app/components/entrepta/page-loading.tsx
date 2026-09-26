import type * as React from "react"
import { cn } from "@/lib/utils"

/** When the extra lines start, and how far apart they land, in seconds. */
const SLOW_AT = 2.2
const STEP_GAP = 0.6

/** Seconds to type `n` characters: floored so a short line still reads as typed, capped so a long one is not the wait. */
const duration = (n: number) => Math.max(0.28, Math.min(n * 0.028, 1.1))

/** Two decimals, so `2.2 + 0.6` does not print as 2.8000000000000003 in the HTML. */
const secs = (n: number) => `${Number(n.toFixed(2))}s`

function Typed({ text, delay }: { text: string; delay: number }) {
  return (
    <span
      className="type-line text-[var(--fg-primary)]"
      style={
        {
          // the real length: steps() counts it, and a guess clips the last glyph
          "--type-chars": text.length,
          "--type-dur": secs(duration(text.length)),
          "--type-delay": secs(delay),
        } as React.CSSProperties
      }
    >
      {text}
    </span>
  )
}

export interface PageLoadingProps {
  /** The `$` command the loaded page prints at its top, verbatim. */
  command: string
  /** Breadcrumb after `~`, such as `log` or `admin / entries`. */
  crumb?: string
  /**
   * What the page is waiting on, shown only if the wait passes 2.2s. Written as
   * what is being done ("reading entries"), never as ticks: nothing is measured.
   */
  steps?: readonly string[]
  /** For the one screen reader announcement: "Loading {label}". */
  label: string
  className?: string
}

/**
 * A loading screen made of CSS alone, so it animates before any JavaScript
 * runs, which is the whole time a loading state is on screen.
 *
 * The command types itself (`.type-line` in globals.css), a caret blinks, and
 * the steps appear only if the wait runs long: the animation delay is the
 * measurement, so a fast page never shows them. It announces itself once, as a
 * status, and hides the decoration from screen readers.
 */
function PageLoading({ command, crumb, steps = [], label, className }: PageLoadingProps) {
  const caretAt = 0.15 + duration(command.length)

  return (
    <div
      className={cn(
        "flex h-full min-h-[58vh] w-full items-center justify-center px-5 py-16",
        className,
      )}
    >
      <div aria-hidden className="font-mono">
        <div className="text-mono-sm mb-4 text-[var(--fg-muted)]">
          <span>~</span>
          {crumb && (
            <>
              <span className="mx-1.5 opacity-50">/</span>
              <span className="text-[var(--fg-primary)]">{crumb}</span>
            </>
          )}
        </div>

        <div className="text-mono-md">
          <span className="text-[var(--fg-brand)]">$ </span>
          <Typed text={command} delay={0.15} />
          <span
            className="type-caret ml-0.5"
            style={{ "--type-delay": secs(caretAt) } as React.CSSProperties}
          />
        </div>

        {steps.length > 0 && (
          <div className="mt-5 flex flex-col gap-2">
            {steps.map((step, i) => (
              <div
                key={step}
                className="type-late text-mono-sm flex items-center gap-2.5"
                style={{ "--type-delay": secs(SLOW_AT + i * STEP_GAP) } as React.CSSProperties}
              >
                <span className="text-[var(--fg-brand)]">→</span>
                <span className="text-[var(--fg-secondary)]">{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* biome-ignore lint/a11y/useSemanticElements: a live status message, not the result of a form */}
      <span className="sr-only" role="status">{`Loading ${label}`}</span>
    </div>
  )
}

export { PageLoading }
