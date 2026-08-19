"use client"

/**
 * The connected half of "me, as a playlist": it subscribes to the store, decides which frame
 * to render, and owns the preview audio. `sleeve-card.tsx` is the pure half and knows none of
 * this — the split is what `docs/components-page-plan.md` Phase 1 asks for, and what will let
 * the card be shown in every state on `/components` without a live Spotify behind it.
 *
 * Not "now playing", and it never was a live feed: it's a playlist of songs that sound like me,
 * some of them answers to asking friends which song they think of when they think of me.
 */

import { useEffect, useRef, useState } from "react"
import { useNowPlayingStore } from "@/store/nowPlayingStore"
import { Skeleton } from "@/app/components/entrepta/skeleton"
import { CardHead } from "@/components/ui/card-parts"
import { COVER, Disc, SleeveCard } from "./sleeve-card"

function StateCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bento-card">
      <CardHead label="me, as a playlist" />
      <div className="flex items-center gap-4">{children}</div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <StateCard>
      <Skeleton className="shrink-0 rounded-sm" style={{ width: COVER, height: COVER }} />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <Skeleton variant="line" className="h-3.5 w-[78%]" />
        <Skeleton variant="line" className="h-2.5 w-[52%]" />
      </div>
    </StateCard>
  )
}

/**
 * Empty used to `return null`, which took the card out of the bento grid and left a hole in
 * the row — the page silently reflowed around a component that had decided not to exist. An
 * empty playlist is a fact, not an absence, and it says so with the record still on the deck.
 */
function EmptyState() {
  return (
    <StateCard>
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

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <StateCard>
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
        <div className="text-mono-sm mb-3 font-mono" style={{ color: "var(--fg-muted)" }}>
          spotify api didn&apos;t respond
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-mono-sm font-mono" style={{ color: "var(--zinc-600)" }} aria-hidden>
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
      </div>
    </StateCard>
  )
}

export function NowPlayingWidget({ className }: { className?: string }) {
  const { tracks, currentIndex, elapsedMs, status, running, load, tick, toggle, next, prev } =
    useNowPlayingStore()
  const audioRef = useRef<HTMLAudioElement>(null)

  /**
   * Sound needs intent. `running` starts true so the record is already turning when the card
   * arrives — a still object in a bento grid reads as broken — but audio that starts on its own
   * is what every autoplay policy exists to stop, and it would be startling on a home page. So
   * a preview only ever plays after someone has pressed a control.
   */
  const [armed, setArmed] = useState(false)

  /**
   * Position and length of the actual clip, tagged with the track it belongs to. The tag is
   * what makes this stale-proof without an effect that resets it: on a skip the index moves,
   * the reading stops matching, and the simulated clock takes over until the element reports
   * its first `timeupdate` for the new source.
   */
  const [audio, setAudio] = useState<{ index: number; elapsed: number; total: number } | null>(null)

  useEffect(() => {
    load()
  }, [load])

  const track = tracks[currentIndex]
  const live = Boolean(track?.previewUrl) && armed

  /**
   * The simulated clock is the fallback, not the default. When a real clip is playing the
   * element is the only honest source of position — a 1s interval and an audio element drift
   * apart within seconds, and the one actually making sound wins.
   */
  useEffect(() => {
    if (status !== "playing" || live) return
    const id = setInterval(() => tick(), 1000)
    return () => clearInterval(id)
  }, [status, live, tick])

  useEffect(() => {
    const el = audioRef.current
    if (!el || !track?.previewUrl || !armed) return
    if (running) {
      // Rejected when the gesture didn't count as one. The record keeps turning either way.
      el.play().catch(() => {})
    } else {
      el.pause()
    }
  }, [running, armed, track?.previewUrl, currentIndex])

  if (status === "idle" || status === "loading") return <LoadingSkeleton />
  if (status === "error") return <ErrorState onRetry={load} />
  if (status === "empty" || !track) return <EmptyState />

  const arm = (fn: () => void) => () => {
    setArmed(true)
    fn()
  }

  /** A clip reading that belongs to the track on screen right now. */
  const fresh = live && audio !== null && audio.index === currentIndex

  return (
    <>
      {track.previewUrl && (
        <audio
          ref={audioRef}
          src={track.previewUrl}
          preload="none"
          className="hidden"
          onTimeUpdate={(e) => {
            const el = e.currentTarget
            setAudio({
              index: currentIndex,
              elapsed: el.currentTime * 1000,
              total: Number.isFinite(el.duration) ? el.duration * 1000 : 30_000,
            })
          }}
          onEnded={next}
        />
      )}
      <SleeveCard
        className={className}
        track={track}
        elapsedMs={fresh ? audio.elapsed : elapsedMs}
        totalMs={fresh ? audio.total : track.durationMs}
        running={running}
        audible={Boolean(track.previewUrl)}
        onToggle={arm(toggle)}
        onNext={arm(next)}
        onPrev={arm(prev)}
      />
    </>
  )
}
