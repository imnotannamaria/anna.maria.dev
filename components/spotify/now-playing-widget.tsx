"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useNowPlayingStore } from "@/store/nowPlayingStore"
import { Skeleton } from "@/app/components/entrepta/skeleton"
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
            "repeating-linear-gradient(45deg, transparent 0 6px, rgba(124,107,255,0.06) 6px 7px)",
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
    <div
      className="flex items-center gap-4 rounded-2xl border p-5"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
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
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl border p-5"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
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
          music unavailable
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
  )
}

export function NowPlayingWidget({ className }: { className?: string }) {
  const { tracks, currentIndex, elapsedMs, status, load, tick } = useNowPlayingStore()
  const [coverError, setCoverError] = useState(false)
  const [fading, setFading] = useState(false)
  const [prevIndex, setPrevIndex] = useState(0)

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
    <div
      className={cn(
        "group/card relative overflow-hidden rounded-2xl border p-5",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]",
        className,
      )}
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-strong)",
        transition:
          "transform 200ms var(--ease-out), box-shadow 200ms var(--ease-out), border-color 200ms var(--ease-out)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--fg-brand)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
    >
      {/* spotify ↗ — absolute, respects card padding */}
      <a
        href={track.spotifyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-5 right-5 font-mono text-[10px] tracking-[0.06em] transition-all duration-150 hover:tracking-[0.1em]"
        style={{ color: "var(--fg-muted)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fg-brand)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
        aria-label="Open on Spotify"
      >
        spotify ↗
      </a>

      <div className="flex items-center gap-4">
        {/* Cover */}
        <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg">
          {track.coverUrl && !coverError ? (
            <Image
              src={track.coverUrl}
              alt={`${track.name} cover`}
              fill
              sizes="72px"
              className={cn(
                "object-cover transition-opacity duration-[240ms]",
                fading ? "opacity-0" : "opacity-100",
              )}
              unoptimized
              onError={() => setCoverError(true)}
            />
          ) : (
            <CoverFallback />
          )}
        </div>

        {/* Track info + progress */}
        <div
          className={cn(
            "min-w-0 flex-1 pr-16 transition-opacity duration-[240ms]",
            fading ? "opacity-0" : "opacity-100",
          )}
        >
          {/* Equalizer + track name */}
          <div className="mb-1 flex items-center gap-2">
            <Equalizer />
            <span
              className="truncate font-mono text-sm font-medium"
              style={{ color: "var(--fg-primary)" }}
            >
              {track.name}
            </span>
          </div>

          {/* Artist */}
          <div className="mb-3 truncate font-mono text-xs" style={{ color: "var(--fg-muted)" }}>
            {track.artist}
          </div>

          {/* Progress bar */}
          <div
            className="relative h-px overflow-hidden rounded-full"
            style={{ background: "var(--bg-surface-elevated)" }}
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progress * 100}%`, background: "var(--fg-brand)" }}
            />
          </div>

          {/* Time */}
          <div className="mt-1.5 flex justify-between">
            <span className="font-mono text-[10px]" style={{ color: "var(--zinc-600)" }}>
              {formatMs(elapsedMs)}
            </span>
            <span className="font-mono text-[10px]" style={{ color: "var(--zinc-600)" }}>
              -{formatMs(remaining)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
