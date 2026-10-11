"use client"

import { useTranslations } from "next-intl"
import {
  PauseIcon,
  MusicNotesIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
  VinylRecordIcon,
} from "@phosphor-icons/react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { ArrowLink } from "@/app/components/entrepta/arrow-link"
import { Button } from "@/app/components/entrepta/button"
import { useMuted } from "@/lib/sound-muted"
import { useNowPlayingStore } from "@/store/nowPlayingStore"
import { Tile } from "@/components/site/tile"
import "./playlist.css"

function minutes(ms: number): string {
  const total = Math.floor(ms / 1000)
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`
}

export function Playlist() {
  const { tracks, currentIndex, elapsedMs, status, running, load, tick, toggle, next, prev } =
    useNowPlayingStore()
  const t = useTranslations("person.playlist")
  const audioRef = useRef<HTMLAudioElement>(null)
  const silenced = useMuted()
  const [armed, setArmed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [clip, setClip] = useState<{ index: number; elapsed: number; total: number } | null>(null)
  const [noCover, setNoCover] = useState<string | null>(null)
  // the track whose cover has finished loading
  const [coverIn, setCoverIn] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [load])

  const track = tracks[currentIndex]

  useEffect(() => {
    if (status !== "playing" || playing) return
    const id = setInterval(() => tick(), 1000)
    return () => clearInterval(id)
  }, [status, playing, tick])

  useEffect(() => {
    const el = audioRef.current
    if (!el || !track?.previewUrl || !armed) return
    if (running) el.play().catch(() => setPlaying(false))
    else el.pause()
  }, [running, armed, track?.previewUrl, currentIndex])

  if (status !== "playing" || !track) {
    const failed = status === "error"
    // The same rows, sizes and controls as the playing state, drawn empty: the card keeps its
    // shape while the songs come in, and only fills.
    return (
      <Tile
        label={t("label")}
        icon={<VinylRecordIcon />}
        note={
          <span aria-hidden className="text-mono-xs invisible">
            spotify
          </span>
        }
      >
        <div
          className="flex flex-1 flex-col items-center justify-center gap-2.5"
          aria-busy={status === "loading"}
        >
          <span aria-hidden className="st-player">
            <span className="st-player-vinyl" />
            <span className="st-player-cover" data-empty>
              <MusicNotesIcon aria-hidden size={28} />
            </span>
          </span>

          <div className="w-full min-w-0 text-center">
            {/* where the title will be, as a bar: it has the title's own height */}
            <p aria-hidden className="text-heading-md flex justify-center py-[0.3em] font-serif">
              <span className="st-player-bar" style={{ width: "58%" }} />
            </p>
            <p className="text-mono-sm truncate font-mono text-[var(--fg-muted)]" role="status">
              {failed ? t("error") : status === "empty" ? t("empty") : t("loading")}
            </p>
          </div>

          {failed ? (
            <div className="flex h-10 w-full items-center justify-center">
              <Button variant="secondary" size="sm" onClick={() => load()}>
                {t("retry")}
              </Button>
            </div>
          ) : (
            <div className="flex w-full items-center justify-between gap-2" aria-hidden>
              <span className="text-mono-xs w-9 font-mono text-[var(--fg-muted)] tabular-nums">
                0:00
              </span>
              <div className="flex items-center gap-1.5 opacity-45">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full"
                  disabled
                  tabIndex={-1}
                >
                  <SkipBackIcon aria-hidden size={14} weight="fill" />
                </Button>
                <Button size="icon-md" className="rounded-full" disabled tabIndex={-1}>
                  <PlayIcon aria-hidden size={16} weight="fill" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full"
                  disabled
                  tabIndex={-1}
                >
                  <SkipForwardIcon aria-hidden size={14} weight="fill" />
                </Button>
              </div>
              <span className="text-mono-xs w-9 text-right font-mono text-[var(--fg-muted)] tabular-nums">
                0:00
              </span>
            </div>
          )}
        </div>

        {/* the progress line, empty */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--border-subtle)]" />
      </Tile>
    )
  }

  const arm = (action: () => void) => () => {
    setArmed(true)
    action()
  }
  const hasClip = playing && clip !== null && clip.index === currentIndex
  const elapsed = hasClip ? clip.elapsed : elapsedMs
  const total = hasClip ? clip.total : track.durationMs
  const progress = total > 0 ? Math.min(elapsed / total, 1) : 0

  return (
    <Tile
      label={t("label")}
      icon={<VinylRecordIcon />}
      note={
        <ArrowLink href={track.spotifyUrl} external className="text-mono-xs">
          spotify
        </ArrowLink>
      }
    >
      {track.previewUrl ? (
        <audio
          ref={audioRef}
          src={track.previewUrl}
          preload="none"
          muted={silenced}
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
          aria-label={running ? t("pause") : t("play")}
          onClick={arm(toggle)}
        >
          <span aria-hidden className="st-player-vinyl" />
          {/* the note is what shows until the cover has come in, or when there is none: the
              box is never an empty white square */}
          <span className="st-player-cover" data-empty={coverIn !== track.id || undefined}>
            <MusicNotesIcon aria-hidden size={28} />
            {track.coverUrl && noCover !== track.id ? (
              <Image
                key={track.id}
                src={track.coverUrl}
                alt=""
                fill
                sizes="92px"
                unoptimized
                onLoad={() => setCoverIn(track.id)}
                onError={() => setNoCover(track.id)}
              />
            ) : null}
          </span>
        </button>

        <div key={track.id} className="st-enter w-full min-w-0 text-center">
          <p className="text-heading-md truncate font-serif text-[var(--fg-primary)]">
            {track.name}
          </p>
          <p className="text-mono-sm truncate font-mono text-[var(--fg-secondary)]">
            {track.artist}
          </p>
          <p className="sr-only">
            {track.year
              ? t("albumYear", { album: track.album, year: track.year })
              : t("album", { album: track.album })}
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
              aria-label={t("previous")}
              onClick={arm(prev)}
            >
              <SkipBackIcon aria-hidden size={14} weight="fill" />
            </Button>
            <Button
              size="icon-md"
              className="rounded-full"
              aria-label={running ? t("pause") : t("play")}
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
              aria-label={t("next")}
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
        aria-label={t("progress", { song: track.name, artist: track.artist })}
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
