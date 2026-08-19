/**
 * The three frames a card wears when it does not have its data.
 *
 * Every card that reads something needs a loading, an empty and an error state. Written per
 * card that is fifteen hand-rolled skeletons, which is the Duplication rule broken fifteen
 * times and fifteen chances to drift. These are the shared ones: same surface, same head, same
 * voice, and each caller passes strings.
 *
 * The file carries no `"use client"` on purpose, which makes it a *shared* module: rendered
 * from a server component it stays on the server, and imported by a client component it is
 * compiled into the client bundle. That is what lets `CardLoading` be a `<Suspense fallback>`
 * in a server component — most of what it is for — while `CardError` still takes an `onRetry`
 * from a client caller. The rule this relies on is that a server-rendered instance never
 * passes `onRetry`, so the one piece of JSX with an event handler is never even constructed
 * there; every server usage is a `<Suspense fallback>`, which has nothing to retry by
 * definition.
 *
 * Two things they deliberately do not do:
 *
 * **No live regions.** `role="alert"` or `role="status"` here fires on `/components`, where
 * seven cards sit in fake error states and nothing is actually wrong; a screen reader would
 * announce seven failures on a healthy page. wristkit's frames use `role="img"` with an
 * `aria-label`, which is the right call and is what these copy.
 *
 * **No grey caricature of a bespoke card.** `app/(home)/loading.tsx` argues this at length and
 * it is right: a skeleton works when the thing behind it is a uniform repeating shape. For a
 * card that is a photo, a serif name, an odometer and three buttons, grey blocks read as
 * broken rather than loading. `CardLoading` takes `rows`/`media` so the choice of how much to
 * trace is made per card, and a card with nothing worth tracing passes `rows={0}` and gets the
 * `$` line instead.
 */

import { Skeleton } from "@/app/components/entrepta/skeleton"
import { CardHead } from "@/components/ui/card-parts"
import { cn } from "@/lib/utils"

/** The shared shell, so the three frames cannot drift from each other or from `.bento-card`. */
function Frame({
  label,
  meta,
  minHeight,
  className,
  children,
}: {
  label: string
  meta?: React.ReactNode
  /**
   * Reserved height, so swapping this frame for the real card does not shift everything below
   * it. Cards live in a bento grid; a card that grows on data arrival is CLS on the home page.
   * The number is per card because only the card knows how tall it ends up.
   */
  minHeight?: number
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("bento-card", className)} style={minHeight ? { minHeight } : undefined}>
      <CardHead label={label} meta={meta} />
      {children}
    </div>
  )
}

export function CardLoading({
  label,
  meta,
  rows = 2,
  media,
  minHeight,
  className,
}: {
  label: string
  meta?: React.ReactNode
  /** Grey lines standing in for text. 0 means "this card is not a repeating shape" — see above. */
  rows?: number
  /** Square block on the left, in px, for a card that leads with a cover or an avatar. */
  media?: number
  minHeight?: number
  className?: string
}) {
  return (
    <Frame label={label} meta={meta} minHeight={minHeight} className={className}>
      {rows === 0 ? (
        <p className="text-mono-md m-0 font-mono" style={{ color: "var(--fg-muted)" }}>
          <span style={{ color: "var(--fg-brand)" }} aria-hidden>
            ${" "}
          </span>
          loading
          <span aria-hidden>
            <span className="load-dot load-dot-1">.</span>
            <span className="load-dot load-dot-2">.</span>
            <span className="load-dot load-dot-3">.</span>
          </span>
        </p>
      ) : (
        <div className="flex items-center gap-4">
          {media != null && (
            <Skeleton className="shrink-0 rounded-sm" style={{ width: media, height: media }} />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            {Array.from({ length: rows }, (_, i) => (
              <Skeleton
                key={i}
                variant="line"
                className={i === 0 ? "h-3.5 w-[78%]" : "h-2.5 w-[52%]"}
              />
            ))}
          </div>
        </div>
      )}

      {/* One announcement for the whole frame. The bars and dots above are decoration. */}
      <span className="sr-only">{`Loading ${label}`}</span>
    </Frame>
  )
}

/**
 * Not a failure. "Nothing yet" is a fact and it reads in the site's voice, the way
 * `roadmap-board` says "nothing here" and the admin tables say `// nothing logged yet`.
 */
export function CardEmpty({
  label,
  meta,
  title,
  note,
  media,
  minHeight,
  className,
}: {
  label: string
  meta?: React.ReactNode
  /** The fact, in words: "nothing on the turntable", "no contributions yet". */
  title: string
  /** The `//` line under it. Written without the slashes; they are added here. */
  note?: string
  /** Optional dimmed object on the left — a card that has a thing can show the thing, empty. */
  media?: React.ReactNode
  minHeight?: number
  className?: string
}) {
  return (
    <Frame label={label} meta={meta} minHeight={minHeight} className={className}>
      <div className="flex items-center gap-4">
        {media && (
          <div className="shrink-0 opacity-40" aria-hidden>
            {media}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-mono-md mb-1 font-mono" style={{ color: "var(--fg-secondary)" }}>
            {title}
          </div>
          {note && (
            <div className="text-mono-sm font-mono" style={{ color: "var(--fg-muted)" }}>
              {`// ${note}`}
            </div>
          )}
        </div>
      </div>
    </Frame>
  )
}

/**
 * Says it broke, and offers a retry when there is something to retry.
 *
 * `onRetry` makes this a client component at the call site, so it is optional: a server
 * component that cannot re-run its own query passes nothing and the frame just states the
 * failure, which is still infinitely better than an empty card pretending to be fine.
 */
export function CardError({
  label,
  meta,
  title = "couldn't load",
  note,
  onRetry,
  minHeight,
  className,
}: {
  label: string
  meta?: React.ReactNode
  title?: string
  note?: string
  onRetry?: () => void
  minHeight?: number
  className?: string
}) {
  return (
    <Frame label={label} meta={meta} minHeight={minHeight} className={className}>
      <div className="flex items-center gap-4">
        <div
          className="text-heading-lg flex h-16 w-16 shrink-0 items-center justify-center rounded-sm border border-dashed"
          style={{
            background: "var(--bg-surface-elevated)",
            borderColor: "var(--border-strong)",
            color: "var(--zinc-600)",
          }}
          aria-hidden
        >
          ✕
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="text-mono-md mb-1 font-mono font-medium"
            style={{ color: "var(--fg-secondary)" }}
          >
            {title}
          </div>
          {note && (
            <div className="text-mono-sm mb-3 font-mono" style={{ color: "var(--fg-muted)" }}>
              {`// ${note}`}
            </div>
          )}
          {onRetry && (
            <div className="flex items-center gap-2.5">
              <span
                className="text-mono-sm font-mono"
                style={{ color: "var(--zinc-600)" }}
                aria-hidden
              >
                $
              </span>
              <button
                type="button"
                onClick={onRetry}
                className="text-mono-sm cursor-pointer font-mono transition-colors"
                style={{ color: "var(--fg-brand)" }}
              >
                retry →
              </button>
            </div>
          )}
        </div>
      </div>
    </Frame>
  )
}
