"use client"

/**
 * "me, as a playlist" as a record half out of its sleeve.
 *
 * The pure half: everything here comes from props, so the card can be rendered in any state
 * without a network or a store — which is what `docs/components-page-plan.md` asks of every
 * component that reads data, and what will let this one appear on `/components` later.
 * `now-playing-widget.tsx` is the connected half.
 *
 * It replaced a 72px cover beside two lines of text. The disc is the reason: it turns while a
 * track plays, which is a state the card previously expressed with three equaliser bars that
 * animated whether or not anything was happening. One object doing it is better than one glyph
 * claiming it.
 */

import { useId, useState } from "react"
import Image from "next/image"
import { motion } from "motion/react"
import { PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon } from "@phosphor-icons/react"
import type { SimplifiedTrack } from "@/lib/spotify"
import { Skeleton } from "@/app/components/entrepta/skeleton"
import { ArrowLink } from "@/components/ui/arrow-link"
import { CardFoot, CardHead } from "@/components/ui/card-parts"
import { useReveal } from "@/components/ui/reveal"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { cn } from "@/lib/utils"

/**
 * The sleeve is square and the disc is a circle behind it; they only line up at a known ratio,
 * so these are fixed and the text column takes what is left.
 *
 * `COVER` is exported because the loading and error frames next door stand in for this exact
 * box — a skeleton at a different size is a card that resizes the moment its data lands, which
 * is the one thing a skeleton exists to prevent.
 */
export const COVER = 92
const OUT_PLAYING = 52
const OUT_STOPPED = 20

export function formatMs(ms: number): string {
  const total = Math.floor(ms / 1000)
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`
}

// ─── The disc ─────────────────────────────────────────────────────────────────

/**
 * Grooves are one `repeating-radial-gradient` — a static background, so turning it is a
 * transform on the compositor rather than a repaint. The sheen is a separate layer that does
 * *not* turn: on a real record the light stays put while the disc moves under it, and pinning
 * it is also the only reason the rotation reads at all, since a uniform black circle spinning
 * looks exactly like a black circle.
 *
 * The rotation itself is `.vinyl-disc` in globals.css — CSS rather than Motion, so the global
 * prefers-reduced-motion reset stops it without this component asking, the same deal the
 * loading dots and the old equaliser bars had.
 */
export function Disc({ size, running }: { size: number; running: boolean }) {
  const label = Math.round(size * 0.34)
  const hole = Math.max(4, Math.round(size * 0.04))

  return (
    <div aria-hidden className="relative" style={{ width: size, height: size }}>
      <div
        className="vinyl-disc absolute inset-0 rounded-full"
        data-running={running}
        style={{
          background: `
            repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,.055) 0 1px, transparent 1px 3px),
            radial-gradient(circle at 50% 50%,
              color-mix(in srgb, var(--fg-brand) 55%, #101014) 0 ${label / 2}px,
              #0c0c10 ${label / 2}px, #16161b 74%, #08080b 100%)
          `,
          border: "1px solid rgba(255,255,255,.1)",
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: hole,
            height: hole,
            left: `calc(50% - ${hole / 2}px)`,
            top: `calc(50% - ${hole / 2}px)`,
            background: "var(--bg-card)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,.16)",
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "linear-gradient(115deg, transparent 33%, rgba(255,255,255,.08) 46%, transparent 57%)",
        }}
      />
    </div>
  )
}

/** Shown when Spotify's CDN doesn't hand over the art. A record label, so the sleeve still
 *  reads as a sleeve rather than as a grey square. */
export function CoverFallback() {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center"
      style={{ background: "var(--bg-surface-elevated)" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(45deg, transparent 0 6px, color-mix(in srgb, var(--fg-brand) 6%, transparent) 6px 7px)",
        }}
      />
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--fg-brand)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    </div>
  )
}

// ─── The bubble ───────────────────────────────────────────────────────────────

/**
 * The floating label that appears over the sleeve. It carries the album and the year — what a
 * real sleeve prints, and the one thing the card does not already say, so it is not a second
 * copy of the title sitting two inches from the title.
 *
 * `aria-hidden`, because the same sentence is rendered `sr-only` in the column beside it: a
 * tooltip that only exists on hover is information a screen reader would never reach, and the
 * fix for that is to put the text in the document, not to make the tooltip announce itself.
 */
function Bubble({ show, album, year }: { show: boolean; album: string; year: string | null }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-20 transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
        show ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
      )}
      style={{ left: "50%", bottom: "calc(100% + 8px)" }}
    >
      <div
        className="rounded-[var(--radius-md)] px-3 py-2 text-left whitespace-nowrap"
        style={{
          background: "var(--bg-overlay)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-overlay)",
        }}
      >
        <div className="text-mono-xs font-mono" style={{ color: "var(--fg-muted)" }}>
          album{year ? ` · ${year}` : ""}
        </div>
        <div
          className="text-mono-sm max-w-[200px] truncate font-mono"
          style={{ color: "var(--fg-primary)" }}
        >
          {album}
        </div>
      </div>
    </div>
  )
}

// ─── Controls ─────────────────────────────────────────────────────────────────

function ControlButton({
  label,
  onClick,
  children,
  primary,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
  primary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors"
      style={{
        // --fg-brand-on-tint, not --fg-brand: brand ink on the brand tint fails contrast in
        // eight of the twelve theme×mode combinations. See the token's note in globals.css.
        color: primary ? "var(--fg-brand-on-tint)" : "var(--fg-muted)",
        background: primary ? "var(--bg-surface-brand)" : "transparent",
      }}
    >
      {children}
    </button>
  )
}

// ─── The card ─────────────────────────────────────────────────────────────────

export function SleeveCard({
  track,
  elapsedMs,
  totalMs,
  running,
  audible,
  onToggle,
  onNext,
  onPrev,
  className,
}: {
  track: SimplifiedTrack
  elapsedMs: number
  /**
   * What the clock counts up to, which is not always the track length. A preview is 30
   * seconds of a four-minute song, so showing 0:04 / 4:16 while a clip plays would put a
   * progress bar that finishes in half a minute under a number saying otherwise.
   */
  totalMs: number
  running: boolean
  /** Whether the toggle controls sound, or only the record and the playlist. */
  audible: boolean
  onToggle: () => void
  onNext: () => void
  onPrev: () => void
  className?: string
}) {
  const [peek, setPeek] = useState(false)
  const [coverError, setCoverError] = useState(false)
  const { onMouseMove, spotlight } = useSpotlight(360)
  const reveal = useReveal()
  const albumId = useId()

  const progress = totalMs > 0 ? Math.min(elapsedMs / totalMs, 1) : 0
  const out = running ? OUT_PLAYING : OUT_STOPPED

  return (
    <motion.div className={cn("bento-card", className)} onMouseMove={onMouseMove} {...reveal}>
      <Spotlight {...spotlight} />
      <h3 className="sr-only">Songs that sound like me</h3>

      <CardHead
        label="me, as a playlist"
        meta={
          <ArrowLink href={track.spotifyUrl} external className="text-mono-xs">
            spotify
          </ArrowLink>
        }
      />

      <div className="flex items-center gap-4">
        {/* The sleeve is the big target: poking the record is the obvious way to start it, and
            it gives the bubble something focusable to hang off, so the hover affordance is
            mirrored on keyboard rather than being sighted-mouse-only. */}
        <button
          type="button"
          onClick={onToggle}
          onMouseEnter={() => setPeek(true)}
          onMouseLeave={() => setPeek(false)}
          onFocus={() => setPeek(true)}
          onBlur={() => setPeek(false)}
          aria-label={running ? "Pause" : "Play"}
          aria-describedby={albumId}
          className="relative shrink-0 cursor-pointer rounded-[var(--radius-sm)]"
          style={{ width: COVER + out, height: COVER }}
        >
          <Bubble show={peek} album={track.album} year={track.year} />

          {/* Slides on a transform only, so the button's own box never moves. A hit area that
              travels out from under the cursor is the flicker loop in Cards and motion. */}
          <div
            className="absolute top-0 left-0 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{ transform: `translateX(${out}px)` }}
          >
            <Disc size={COVER} running={running} />
          </div>

          <div
            className="absolute top-0 left-0 overflow-hidden rounded-sm"
            style={{
              width: COVER,
              height: COVER,
              border: "1px solid var(--border-subtle)",
              boxShadow: "2px 0 10px rgba(0,0,0,.45)",
            }}
          >
            {track.coverUrl && !coverError ? (
              <Image
                src={track.coverUrl}
                alt=""
                fill
                sizes="92px"
                className="object-cover"
                unoptimized
                onError={() => setCoverError(true)}
              />
            ) : (
              <CoverFallback />
            )}
          </div>
        </button>

        <div className="flex min-w-0 flex-1 flex-col">
          <span
            className="text-heading-lg truncate"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--fg-primary)",
              lineHeight: 1.15,
            }}
          >
            {track.name}
          </span>
          <span
            className="text-mono-sm truncate font-mono"
            style={{ color: "var(--fg-secondary)" }}
          >
            {track.artist}
          </span>

          {/* What the bubble shows, always in the document. */}
          <span id={albumId} className="sr-only">
            {`From the album ${track.album}${track.year ? `, ${track.year}` : ""}`}
          </span>

          <span className="text-mono-xs mt-1.5 font-mono" style={{ color: "var(--fg-muted)" }}>
            {formatMs(elapsedMs)} / {formatMs(totalMs)}
          </span>
        </div>
      </div>

      <CardFoot comment={audible ? "30s preview · spotify" : "my friends picked some of these"}>
        <div className="flex items-center gap-1">
          <ControlButton label="Previous track" onClick={onPrev}>
            <SkipBackIcon size={13} weight="fill" aria-hidden />
          </ControlButton>
          <ControlButton label={running ? "Pause" : "Play"} onClick={onToggle} primary>
            {running ? (
              <PauseIcon size={13} weight="fill" aria-hidden />
            ) : (
              <PlayIcon size={13} weight="fill" aria-hidden />
            )}
          </ControlButton>
          <ControlButton label="Next track" onClick={onNext}>
            <SkipForwardIcon size={13} weight="fill" aria-hidden />
          </ControlButton>
        </div>
      </CardFoot>

      {/* Progress rides the card's bottom edge, clipped by its radius, instead of being one
          more line competing with the text above it. A CSS transition rather than Motion, so
          the reduced-motion reset reaches it. */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ height: 2, background: "var(--border-subtle)" }}
        role="progressbar"
        aria-label={`Progress: ${track.name} by ${track.artist}`}
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span
          className="absolute inset-y-0 left-0 block w-full origin-left transition-transform duration-1000 ease-linear"
          style={{ background: "var(--fg-brand)", transform: `scaleX(${progress})` }}
        />
      </div>
    </motion.div>
  )
}

// ─── The other three frames ───────────────────────────────────────────────────

/**
 * Loading, empty and error, and they live *here* rather than next door in the widget.
 *
 * They were private to `now-playing-widget.tsx`, so `/components` could not render them and
 * hand-rolled approximations instead — which is how the showcase ended up drawing the *loading*
 * frame under the word "empty". A documentation page that shows a lookalike is worse than one
 * that shows nothing: it is wrong and it looks right.
 *
 * This is the pure half of the card, so a frame that takes no props and no store belongs in it.
 * The widget picks between them; the showcase renders them directly; neither owns a copy.
 */
function StateCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("bento-card", className)}>
      <CardHead label="me, as a playlist" />
      <div className="flex items-center gap-4">{children}</div>
    </div>
  )
}

/**
 * The card before the playlist answers.
 *
 * It traces the whole card, not the top third of it: the head with its `spotify` link slot, the
 * sleeve at `COVER + OUT_STOPPED` so the disc's parked edge is already accounted for, the serif
 * title and the artist line, the elapsed/total clock, the footer comment, three control buttons
 * at their real 26px, and the 2px progress rail on the card's bottom edge. The previous version
 * was a square and two bars, which is every card on the site.
 *
 * The disc is drawn for real rather than greyed. It is not data — it is the object the card is,
 * it costs one gradient, and a turntable with nothing on it is what the *empty* frame means.
 */
export function SleeveLoading({ className }: { className?: string }) {
  return (
    <div className={cn("bento-card relative", className)}>
      <CardHead
        label="me, as a playlist"
        meta={<Skeleton style={{ width: 46, height: 9, borderRadius: 3 }} />}
      />

      <div className="flex items-center gap-4" aria-hidden>
        <div className="relative shrink-0" style={{ width: COVER + OUT_STOPPED, height: COVER }}>
          <div
            className="absolute top-0 left-0 opacity-60"
            style={{ transform: `translateX(${OUT_STOPPED}px)` }}
          >
            <Disc size={COVER} running={false} />
          </div>
          <Skeleton
            className="absolute top-0 left-0 rounded-sm"
            style={{
              width: COVER,
              height: COVER,
              border: "1px solid var(--border-subtle)",
              boxShadow: "2px 0 10px rgba(0,0,0,.45)",
            }}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton delay={0.06} style={{ width: "72%", height: 20, borderRadius: 4 }} />
          <Skeleton delay={0.12} style={{ width: "48%", height: 10, borderRadius: 3 }} />
          <Skeleton delay={0.18} style={{ width: 62, height: 8, borderRadius: 3 }} />
        </div>
      </div>

      <CardFoot comment="reading the playlist">
        <div className="flex items-center gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <Skeleton
              key={i}
              delay={0.24 + i * 0.06}
              // h-7 w-7 rounded-full, exactly what `ControlButton` is.
              variant="circle"
              style={{ width: 28, height: 28 }}
            />
          ))}
        </div>
      </CardFoot>

      {/* The rail keeps its 2px so the card is exactly as tall as it will be, with no brand
          fill on it — there is no position to report yet, and a bar sitting at zero would be
          a claim rather than a placeholder. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0"
        style={{ height: 2, background: "var(--border-subtle)" }}
      />

      <span className="sr-only" role="status">
        Loading me, as a playlist
      </span>
    </div>
  )
}

/**
 * Empty used to `return null`, which took the card out of the bento grid and left a hole in
 * the row — the page silently reflowed around a component that had decided not to exist. An
 * empty playlist is a fact, not an absence, and it says so with the record still on the deck.
 */
export function SleeveEmpty({ className }: { className?: string }) {
  return (
    <StateCard className={className}>
      <div className="shrink-0 opacity-40">
        <Disc size={COVER} running={false} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-mono-md mb-1 font-mono" style={{ color: "var(--fg-secondary)" }}>
          nothing on the turntable
        </div>
        <div className="text-mono-sm font-mono" style={{ color: "var(--fg-muted)" }}>
          {"// the playlist came back empty"}
        </div>
      </div>
    </StateCard>
  )
}

/**
 * `onRetry` is optional because the showcase renders this frame
 * with nothing behind it to re-run, and a retry button that does nothing is a worse lie than
 * no button.
 */
export function SleeveError({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  return (
    <StateCard className={className}>
      <div
        className="text-heading-lg flex shrink-0 items-center justify-center rounded-sm border border-dashed"
        style={{
          width: COVER,
          height: COVER,
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
          playlist unavailable
        </div>
        <div className="text-mono-sm font-mono" style={{ color: "var(--fg-muted)" }}>
          {"// spotify api didn't respond"}
        </div>
        {onRetry && (
          <div className="mt-3 flex items-center gap-2.5">
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
    </StateCard>
  )
}
