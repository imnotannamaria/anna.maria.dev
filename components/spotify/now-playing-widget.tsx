"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useNowPlayingStore } from "@/store/nowPlayingStore"
import { Skeleton } from "@/app/components/entrepta/skeleton"
import { motion, useReducedMotion } from "motion/react"
import { ArrowLink } from "@/components/ui/arrow-link"
import { CardHead } from "@/components/ui/card-parts"
import { useReveal } from "@/components/ui/reveal"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { cn } from "@/lib/utils"

function formatMs(ms: number): string {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

function Equalizer() {
  return (
    <span
      className="flex shrink-0 items-end gap-[2px]"
      style={{ height: "12px", width: "11px" }}
      aria-hidden
    >
      <span className="npw-eq-bar npw-eq-1" />
      <span className="npw-eq-bar npw-eq-2" />
      <span className="npw-eq-bar npw-eq-3" />
    </span>
  )
}

function CoverFallback() {
  return (
    <div
      className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-lg"
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
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="bento-card">
      <CardHead label="me, as a playlist" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-[72px] w-[72px] shrink-0 rounded-lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <Skeleton variant="line" className="h-3.5 w-[78%]" />
          <Skeleton variant="line" className="h-2.5 w-[52%]" />
          <div
            className="mt-1.5 h-px rounded-full"
            style={{ background: "var(--bg-surface-elevated)" }}
          />
        </div>
      </div>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bento-card">
      <CardHead label="me, as a playlist" />
      <div className="flex items-center gap-4">
        <div
          className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-lg border border-dashed text-2xl"
          style={{
            background: "var(--bg-surface-elevated)",
            borderColor: "var(--border-strong)",
            color: "var(--zinc-600)",
          }}
        >
          ✕
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="mb-1 font-mono text-sm font-medium"
            style={{ color: "var(--fg-secondary)" }}
          >
            playlist unavailable
          </div>
          <div className="mb-3 font-mono text-xs" style={{ color: "var(--fg-muted)" }}>
            spotify api didn&apos;t respond
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs" style={{ color: "var(--zinc-600)" }}>
              $
            </span>
            <button
              onClick={onRetry}
              className="font-mono text-xs transition-colors"
              style={{ color: "var(--fg-brand)" }}
            >
              retry →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function NowPlayingWidget({ className }: { className?: string }) {
  const { tracks, currentIndex, elapsedMs, status, load, tick } = useNowPlayingStore()
  const [coverError, setCoverError] = useState(false)
  const [fading, setFading] = useState(false)
  const [prevIndex, setPrevIndex] = useState(0)
  const reduce = useReducedMotion() ?? false
  const { onMouseMove, spotlight } = useSpotlight(360)
  const reveal = useReveal()

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (status !== "playing") return
    const id = setInterval(() => tick(), 1000)
    return () => clearInterval(id)
  }, [status, tick])

  // Reset cover error on track change + trigger fade
  useEffect(() => {
    if (currentIndex === prevIndex) return
    const startFade = setTimeout(() => {
      setFading(true)
      setCoverError(false)
    }, 0)
    const endFade = setTimeout(() => {
      setPrevIndex(currentIndex)
      setFading(false)
    }, 240)
    return () => {
      clearTimeout(startFade)
      clearTimeout(endFade)
    }
  }, [currentIndex, prevIndex])

  if (status === "idle" || status === "loading") return <LoadingSkeleton />
  if (status === "error") return <ErrorState onRetry={load} />
  if (status === "empty") return null

  const track = tracks[currentIndex]
  const progress = Math.min(elapsedMs / track.durationMs, 1)
  const remaining = track.durationMs - elapsedMs

  return (
    <motion.div className={cn("bento-card", className)} onMouseMove={onMouseMove} {...reveal}>
      <Spotlight {...spotlight} />
      <h3 className="sr-only">Songs that sound like me</h3>

      {/* Not "now playing" — nothing is playing, and this was never a live feed.
          It's a playlist of songs that sound like me, some of them answers to
          asking friends which song they think of when they think of me. The
          label should say that, because "now playing" was quietly a lie. */}
      <CardHead
        label="me, as a playlist"
        meta={
          <ArrowLink href={track.spotifyUrl} external className="text-[10px]">
            spotify
          </ArrowLink>
        }
      />

      {/* The track name leads. It used to be 14px mono under a 72px cover, which
          made the cover the loudest thing in a widget whose whole point is what
          is playing — the art shrinks, the title takes the serif. */}
      <div
        className={cn(
          "relative flex items-center gap-4 transition-opacity duration-[240ms]",
          fading ? "opacity-0" : "opacity-100",
        )}
      >
        <div
          className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg"
          style={{ border: "1px solid var(--border-subtle)" }}
        >
          {track.coverUrl && !coverError ? (
            <Image
              src={track.coverUrl}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
              unoptimized
              onError={() => setCoverError(true)}
            />
          ) : (
            <CoverFallback />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <span
            className="truncate"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 24,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              color: "var(--fg-primary)",
            }}
          >
            {track.name}
          </span>
          <span className="truncate font-mono text-xs" style={{ color: "var(--fg-secondary)" }}>
            {track.artist}
          </span>
        </div>

        <Equalizer />
      </div>

      <div className="relative mt-auto flex items-center justify-between gap-3 font-mono text-[10px]">
        <span style={{ color: "var(--fg-muted)" }}>
          <span style={{ opacity: 0.6 }}>{"// "}</span>some of these my friends picked for me
        </span>
        <span className="shrink-0" style={{ color: "var(--fg-secondary)" }}>
          {formatMs(elapsedMs)}{" "}
          <span style={{ color: "var(--fg-muted)" }}>/ -{formatMs(remaining)}</span>
        </span>
      </div>

      {/* Progress rides the card's bottom edge, clipped by its radius, instead of
          being one more line competing with the text above it. */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ height: 2, background: "var(--border-subtle)" }}
        role="progressbar"
        aria-label={`Playback progress: ${track.name} by ${track.artist}`}
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.span
          className="absolute inset-y-0 left-0 block w-full"
          style={{ background: "var(--fg-brand)", originX: 0 }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress }}
          transition={reduce ? { duration: 0 } : { duration: 1, ease: "linear" }}
        />
      </div>
    </motion.div>
  )
}
