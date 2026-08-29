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

  /**
   * Whether the element is *actually* producing sound, reported by the element.
   *
   * This used to be inferred — `previewUrl && armed`, i.e. "there is a clip and someone pressed
   * a button" — which is intent, not playback. `el.play()` is a promise that browsers reject
   * routinely: sound blocked for the site, a policy that wanted a more direct gesture, a source
   * that failed to load. On a rejection the clip never starts, so no `timeupdate` ever arrives
   * — and the inferred flag had already switched the simulated clock off. The result was a card
   * whose record kept turning while the timer, the progress bar and the auto-advance were
   * frozen for good, with nothing on screen saying why.
   *
   * Reading it from `onPlay`/`onPause` instead means a refusal simply leaves this false and the
   * simulated clock keeps running, which is what the card does when there is no preview at all.
   */
  const [sounding, setSounding] = useState(false)

  useEffect(() => {
    load()
  }, [load])

  const track = tracks[currentIndex]

  /**
   * The simulated clock is the fallback, not the default. When a real clip is playing the
   * element is the only honest source of position — a 1s interval and an audio element drift
   * apart within seconds, and the one actually making sound wins.
   */
  useEffect(() => {
    if (status !== "playing" || sounding) return
    const id = setInterval(() => tick(), 1000)
    return () => clearInterval(id)
  }, [status, sounding, tick])

  useEffect(() => {
    const el = audioRef.current
    if (!el || !track?.previewUrl || !armed) return
    if (running) {
      // Rejected when the gesture didn't count as one, or when the site is muted. The record
      // keeps turning either way, and `sounding` stays false so the simulated clock covers it.
      el.play().catch(() => setSounding(false))
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
  const fresh = sounding && audio !== null && audio.index === currentIndex

  return (
    <>
      {track.previewUrl && (
        <audio
          ref={audioRef}
          src={track.previewUrl}
          preload="none"
          className="hidden"
          onPlay={() => setSounding(true)}
          onPause={() => setSounding(false)}
          // A source that 404s or decodes badly is the same situation as a refused play: hand
          // the clock back to the simulation rather than leaving it stopped.
          onError={() => setSounding(false)}
          onTimeUpdate={(e) => {
            const el = e.currentTarget
            setAudio({
              index: currentIndex,
              elapsed: el.currentTime * 1000,
              total: Number.isFinite(el.duration) ? el.duration * 1000 : 30_000,
            })
          }}
          onEnded={() => {
            setSounding(false)
            next()
          }}
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
