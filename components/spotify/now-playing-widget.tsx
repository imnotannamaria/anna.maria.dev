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
import { SleeveCard, SleeveEmpty, SleeveError, SleeveLoading } from "./sleeve-card"

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

  if (status === "idle" || status === "loading") return <SleeveLoading className={className} />
  if (status === "error") return <SleeveError onRetry={load} className={className} />
  if (status === "empty" || !track) return <SleeveEmpty className={className} />

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
