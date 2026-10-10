"use client"

import {
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
  VinylRecordIcon,
} from "@phosphor-icons/react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { ArrowLink } from "@/app/components/entrepta/arrow-link"
import { Button } from "@/app/components/entrepta/button"
import { useNowPlayingStore } from "@/store/nowPlayingStore"
import { Tile } from "../tile"

function minutes(ms: number): string {
  const total = Math.floor(ms / 1000)
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`
}

const LABEL = "me, as a playlist"

export function Playlist() {
  const { tracks, currentIndex, elapsedMs, status, running, load, tick, toggle, next, prev } =
    useNowPlayingStore()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [armed, setArmed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [clip, setClip] = useState<{ index: number; elapsed: number; total: number } | null>(null)
  const [noCover, setNoCover] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [load])

  const range = tracks[currentIndex]

  useEffect(() => {
    if (status !== "playing" || playing) return
    const id = setInterval(() => tick(), 1000)
    return () => clearInterval(id)
  }, [status, playing, tick])

  useEffect(() => {
    const el = audioRef.current
    if (!el || !range?.previewUrl || !armed) return
    if (running) el.play().catch(() => setPlaying(false))
    else el.pause()
  }, [running, armed, range?.previewUrl, currentIndex])

  if (status !== "playing" || !range) {
    return (
      <Tile label={LABEL} icon={<VinylRecordIcon />}>
        <div className="flex flex-1 flex-col items-center justify-center gap-2.5 text-center">
          <span aria-hidden className="st-player opacity-50">
            <span className="st-player-vinyl" />
            <span className="st-player-cover" />
          </span>
          <p className="text-mono-sm font-mono text-[var(--fg-muted)]" role="status">
            {status === "error"
              ? "spotify did not answer."
              : status === "empty"
                ? "nothing on the turntable."
                : "putting a record on…"}
          </p>
          {status === "error" ? (
            <Button variant="secondary" size="sm" onClick={() => load()}>
              try again
            </Button>
          ) : null}
        </div>
      </Tile>
    )
  }

  const arm = (action: () => void) => () => {
    setArmed(true)
    action()
  }
  const clipOf = playing && clip !== null && clip.index === currentIndex
  const elapsed = clipOf ? clip.elapsed : elapsedMs
  const total = clipOf ? clip.total : range.durationMs
  const progress = total > 0 ? Math.min(elapsed / total, 1) : 0

  return (
    <Tile
      label={LABEL}
      icon={<VinylRecordIcon />}
      note={
        <ArrowLink href={range.spotifyUrl} external className="text-mono-xs">
          spotify
        </ArrowLink>
      }
    >
      {range.previewUrl ? (
        <audio
          ref={audioRef}
          src={range.previewUrl}
          preload="none"
          className="hidden"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setPlaying(false)}
          onTimeUpdate={(event) => {
            const el = event.currentTarget
            setClip({
              index: currentIndex,
              elapsed: el.currentTime * 1000,
              total: Number.isFinite(el.duration) ? el.duration * 1000 : 30_000,
            })
          }}
          onEnded={() => {
            setPlaying(false)
            next()
          }}
        />
      ) : null}

      <div className="flex flex-1 flex-col items-center justify-center gap-2.5">
        <button
          type="button"
          className="st-player focus-ring"
          data-playing={running || undefined}
          aria-label={running ? "Pause" : "Play"}
          onClick={arm(toggle)}
        >
          <span aria-hidden className="st-player-vinyl" />
          <span className="st-player-cover">
            {range.coverUrl && noCover !== range.id ? (
              <Image
                src={range.coverUrl}
                alt=""
                fill
                sizes="92px"
                unoptimized
                onError={() => setNoCover(range.id)}
              />
            ) : null}
          </span>
        </button>

        <div key={range.id} className="st-enter w-full min-w-0 text-center">
          <p className="text-heading-md truncate font-serif text-[var(--fg-primary)]">
            {range.name}
          </p>
          <p className="text-mono-sm truncate font-mono text-[var(--fg-secondary)]">
            {range.artist}
          </p>
          <p className="sr-only">
            {`From the album ${range.album}${range.year ? `, ${range.year}` : ""}`}
          </p>
        </div>

        <div className="flex w-full items-center justify-between gap-2">
          <span className="text-mono-xs w-9 font-mono text-[var(--fg-muted)] tabular-nums">
            {minutes(elapsed)}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              aria-label="Previous song"
              onClick={arm(prev)}
            >
              <SkipBackIcon aria-hidden size={14} weight="fill" />
            </Button>
            <Button
              size="icon-md"
              className="rounded-full"
              aria-label={running ? "Pause" : "Play"}
              onClick={arm(toggle)}
            >
              {running ? (
                <PauseIcon aria-hidden size={16} weight="fill" />
              ) : (
                <PlayIcon aria-hidden size={16} weight="fill" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              aria-label="Next song"
              onClick={arm(next)}
            >
              <SkipForwardIcon aria-hidden size={14} weight="fill" />
            </Button>
          </div>
          <span className="text-mono-xs w-9 text-right font-mono text-[var(--fg-muted)] tabular-nums">
            {minutes(total)}
          </span>
        </div>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-0.5"
        role="progressbar"
        aria-label={`Progress: ${range.name} by ${range.artist}`}
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span
          className="absolute inset-y-0 left-0 block w-full origin-left bg-[var(--fg-brand)] transition-transform duration-1000 ease-linear"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </Tile>
  )
}
