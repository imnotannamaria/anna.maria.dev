"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { DisplayH2, DocLabel, Em, Kbd, Prose, Section } from "@/components/chrome/page-parts"

/* ════════════════════════════════════════════════
   DATA — 2 octaves, C4 → B5
   ════════════════════════════════════════════════ */

const WHITE_NOTES = [
  "C4",
  "D4",
  "E4",
  "F4",
  "G4",
  "A4",
  "B4",
  "C5",
  "D5",
  "E5",
  "F5",
  "G5",
  "A5",
  "B5",
] as const

const WHITE_KEYS = ["z", "x", "c", "v", "b", "n", "m", "q", "w", "e", "r", "t", "y", "u"] as const

/** Black keys, positioned after the white key at index `i`. */
const BLACK_AFTER: { i: number; note: string; kbd: string }[] = [
  { i: 0, note: "C#4", kbd: "s" },
  { i: 1, note: "D#4", kbd: "d" },
  { i: 3, note: "F#4", kbd: "g" },
  { i: 4, note: "G#4", kbd: "h" },
  { i: 5, note: "A#4", kbd: "j" },
  { i: 7, note: "C#5", kbd: "2" },
  { i: 8, note: "D#5", kbd: "3" },
  { i: 10, note: "F#5", kbd: "5" },
  { i: 11, note: "G#5", kbd: "6" },
  { i: 12, note: "A#5", kbd: "7" },
]

const FREQ: Record<string, number> = {
  C4: 261.63,
  "C#4": 277.18,
  D4: 293.66,
  "D#4": 311.13,
  E4: 329.63,
  F4: 349.23,
  "F#4": 369.99,
  G4: 392.0,
  "G#4": 415.3,
  A4: 440.0,
  "A#4": 466.16,
  B4: 493.88,
  C5: 523.25,
  "C#5": 554.37,
  D5: 587.33,
  "D#5": 622.25,
  E5: 659.25,
  F5: 698.46,
  "F#5": 739.99,
  G5: 783.99,
  "G#5": 830.61,
  A5: 880.0,
  "A#5": 932.33,
  B5: 987.77,
}

const KEY_TO_NOTE: Record<string, string> = {}
WHITE_NOTES.forEach((n, i) => (KEY_TO_NOTE[WHITE_KEYS[i]] = n))
BLACK_AFTER.forEach((b) => (KEY_TO_NOTE[b.kbd] = b.note))

type Song = { id: string; title: string; meta: string; tempo: number; notes: [string, number][] }

const SONGS: Song[] = [
  {
    id: "twinkle",
    title: "Twinkle Twinkle Little Star",
    meta: "mozart · 1761",
    tempo: 120,
    notes: [
      ["C4", 1],
      ["C4", 1],
      ["G4", 1],
      ["G4", 1],
      ["A4", 1],
      ["A4", 1],
      ["G4", 2],
      ["F4", 1],
      ["F4", 1],
      ["E4", 1],
      ["E4", 1],
      ["D4", 1],
      ["D4", 1],
      ["C4", 2],
      ["G4", 1],
      ["G4", 1],
      ["F4", 1],
      ["F4", 1],
      ["E4", 1],
      ["E4", 1],
      ["D4", 2],
      ["G4", 1],
      ["G4", 1],
      ["F4", 1],
      ["F4", 1],
      ["E4", 1],
      ["E4", 1],
      ["D4", 2],
      ["C4", 1],
      ["C4", 1],
      ["G4", 1],
      ["G4", 1],
      ["A4", 1],
      ["A4", 1],
      ["G4", 2],
      ["F4", 1],
      ["F4", 1],
      ["E4", 1],
      ["E4", 1],
      ["D4", 1],
      ["D4", 1],
      ["C4", 2],
    ],
  },
  {
    id: "happy",
    title: "Happy Birthday",
    meta: "hill sisters · 1893",
    tempo: 120,
    notes: [
      ["C4", 0.75],
      ["C4", 0.25],
      ["D4", 1],
      ["C4", 1],
      ["F4", 1],
      ["E4", 2],
      ["C4", 0.75],
      ["C4", 0.25],
      ["D4", 1],
      ["C4", 1],
      ["G4", 1],
      ["F4", 2],
      ["C4", 0.75],
      ["C4", 0.25],
      ["C5", 1],
      ["A4", 1],
      ["F4", 1],
      ["E4", 1],
      ["D4", 2],
      ["A#4", 0.75],
      ["A#4", 0.25],
      ["A4", 1],
      ["F4", 1],
      ["G4", 1],
      ["F4", 2],
    ],
  },
  {
    id: "odetojoy",
    title: "Ode to Joy",
    meta: "beethoven · 1824",
    tempo: 120,
    notes: [
      ["E4", 1],
      ["E4", 1],
      ["F4", 1],
      ["G4", 1],
      ["G4", 1],
      ["F4", 1],
      ["E4", 1],
      ["D4", 1],
      ["C4", 1],
      ["C4", 1],
      ["D4", 1],
      ["E4", 1],
      ["E4", 1.5],
      ["D4", 0.5],
      ["D4", 2],
      ["E4", 1],
      ["E4", 1],
      ["F4", 1],
      ["G4", 1],
      ["G4", 1],
      ["F4", 1],
      ["E4", 1],
      ["D4", 1],
      ["C4", 1],
      ["C4", 1],
      ["D4", 1],
      ["E4", 1],
      ["D4", 1.5],
      ["C4", 0.5],
      ["C4", 2],
    ],
  },
  {
    id: "mary",
    title: "Mary Had a Little Lamb",
    meta: "hale · 1830",
    tempo: 130,
    notes: [
      ["E4", 1],
      ["D4", 1],
      ["C4", 1],
      ["D4", 1],
      ["E4", 1],
      ["E4", 1],
      ["E4", 2],
      ["D4", 1],
      ["D4", 1],
      ["D4", 2],
      ["E4", 1],
      ["G4", 1],
      ["G4", 2],
      ["E4", 1],
      ["D4", 1],
      ["C4", 1],
      ["D4", 1],
      ["E4", 1],
      ["E4", 1],
      ["E4", 1],
      ["E4", 1],
      ["D4", 1],
      ["D4", 1],
      ["E4", 1],
      ["D4", 1],
      ["C4", 2],
    ],
  },
  {
    id: "jingle",
    title: "Jingle Bells",
    meta: "pierpont · 1857",
    tempo: 150,
    notes: [
      ["E4", 1],
      ["E4", 1],
      ["E4", 2],
      ["E4", 1],
      ["E4", 1],
      ["E4", 2],
      ["E4", 1],
      ["G4", 1],
      ["C4", 1.5],
      ["D4", 0.5],
      ["E4", 3],
      ["F4", 1],
      ["F4", 1],
      ["F4", 1.5],
      ["F4", 0.5],
      ["F4", 1],
      ["E4", 1],
      ["E4", 1],
      ["E4", 0.5],
      ["E4", 0.5],
      ["E4", 1],
      ["D4", 1],
      ["D4", 1],
      ["E4", 1],
      ["D4", 2],
      ["G4", 2],
    ],
  },
  {
    id: "elise",
    title: "Für Elise",
    meta: "beethoven · 1810",
    tempo: 160,
    notes: [
      ["E5", 0.5],
      ["D#5", 0.5],
      ["E5", 0.5],
      ["D#5", 0.5],
      ["E5", 0.5],
      ["B4", 0.5],
      ["D5", 0.5],
      ["C5", 0.5],
      ["A4", 1],
      ["C4", 0.5],
      ["E4", 0.5],
      ["A4", 0.5],
      ["B4", 1],
      ["E4", 0.5],
      ["G#4", 0.5],
      ["B4", 0.5],
      ["C5", 1],
      ["E4", 0.5],
      ["E5", 0.5],
      ["D#5", 0.5],
      ["E5", 0.5],
      ["D#5", 0.5],
      ["E5", 0.5],
      ["B4", 0.5],
      ["D5", 0.5],
      ["C5", 0.5],
      ["A4", 1],
    ],
  },
]

type WebkitWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }

/* ════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════ */

export function PianoStudio() {
  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const volumeRef = useRef(0.55)
  const sustainRef = useRef(false)

  const [volume, setVolume] = useState(55)
  const [sustain, setSustain] = useState(false)
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set())
  const [nowNote, setNowNote] = useState<{ note: string; id: number } | null>(null)

  const [currentSong, setCurrentSong] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const heldKeys = useRef<Record<string, boolean>>({})
  const flashTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const songTimers = useRef<ReturnType<typeof setTimeout>[]>([])
  const rafRef = useRef<number | null>(null)

  /* ── audio engine ──────────────────────────────── */

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as WebkitWindow).webkitAudioContext
      if (!AC) throw new Error("AudioContext is not supported in this browser")
      const ctx = new AC()
      const master = ctx.createGain()
      master.gain.value = volumeRef.current
      master.connect(ctx.destination)
      ctxRef.current = ctx
      masterRef.current = master
    }
    const ctx = ctxRef.current
    if (ctx.state === "suspended") void ctx.resume()
    return ctx
  }, [])

  const playNote = useCallback(
    (note: string) => {
      const ctx = ensureCtx()
      const master = masterRef.current
      const freq = FREQ[note]
      if (!master || !freq) return

      const t = ctx.currentTime
      const release = sustainRef.current ? 3.4 : 1.2

      const env = ctx.createGain()
      env.gain.setValueAtTime(0, t)
      env.gain.linearRampToValueAtTime(0.9, t + 0.005)
      env.gain.exponentialRampToValueAtTime(0.5, t + 0.08)
      env.gain.exponentialRampToValueAtTime(0.001, t + release)
      env.connect(master)

      const lp = ctx.createBiquadFilter()
      lp.type = "lowpass"
      lp.frequency.setValueAtTime(4200, t)
      lp.frequency.exponentialRampToValueAtTime(1400, t + release)
      lp.Q.value = 0.5
      lp.connect(env)

      const partials: { mult: number; gain: number; type: OscillatorType }[] = [
        { mult: 1, gain: 1.0, type: "triangle" },
        { mult: 2, gain: 0.45, type: "sine" },
        { mult: 3, gain: 0.22, type: "sine" },
        { mult: 4.01, gain: 0.12, type: "sine" },
        { mult: 5.99, gain: 0.06, type: "sine" },
      ]

      partials.forEach((p) => {
        const o = ctx.createOscillator()
        o.type = p.type
        o.frequency.value = freq * p.mult
        const g = ctx.createGain()
        g.gain.value = p.gain
        o.connect(g).connect(lp)
        o.start(t)
        o.stop(t + release + 0.05)
      })
    },
    [ensureCtx],
  )

  /* ── press feedback ────────────────────────────── */

  const flashKey = useCallback((note: string) => {
    setActiveNotes((prev) => new Set(prev).add(note))
    if (flashTimers.current[note]) clearTimeout(flashTimers.current[note])
    flashTimers.current[note] = setTimeout(() => {
      setActiveNotes((prev) => {
        const next = new Set(prev)
        next.delete(note)
        return next
      })
    }, 220)
  }, [])

  const stopSong = useCallback(() => {
    songTimers.current.forEach(clearTimeout)
    songTimers.current = []
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    setCurrentSong(null)
    setProgress(0)
  }, [])

  const pressNote = useCallback(
    (note: string, fromSong = false) => {
      playNote(note)
      flashKey(note)
      setNowNote({ note, id: Date.now() })
      if (!fromSong) stopSong()
    },
    [playNote, flashKey, stopSong],
  )

  const playSong = useCallback(
    (song: Song) => {
      ensureCtx()
      setCurrentSong(song.id)

      const beat = 60 / song.tempo // seconds per beat
      let t = 0
      song.notes.forEach(([note, dur]) => {
        songTimers.current.push(setTimeout(() => pressNote(note, true), t * 1000))
        t += dur * beat
      })

      const duration = t * 1000
      const startedAt = performance.now()

      const tick = () => {
        const elapsed = performance.now() - startedAt
        setProgress(Math.min(100, (elapsed / duration) * 100))
        if (elapsed >= duration + 400) {
          stopSong()
          return
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
      songTimers.current.push(setTimeout(stopSong, duration + 1200))
    },
    [ensureCtx, pressNote, stopSong],
  )

  const toggleSong = useCallback(
    (song: Song) => {
      if (currentSong === song.id) {
        stopSong()
        return
      }
      stopSong()
      playSong(song)
    },
    [currentSong, stopSong, playSong],
  )

  /* ── physical keyboard ─────────────────────────── */

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const k = e.key.toLowerCase()
      if (k === " ") {
        e.preventDefault()
        stopSong()
        return
      }
      if (heldKeys.current[k]) return
      const note = KEY_TO_NOTE[k]
      if (!note) return
      e.preventDefault()
      heldKeys.current[k] = true
      pressNote(note)
    }
    function onKeyUp(e: KeyboardEvent) {
      heldKeys.current[e.key.toLowerCase()] = false
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [pressNote, stopSong])

  /* ── cleanup ───────────────────────────────────── */

  useEffect(() => {
    const flashes = flashTimers.current
    return () => {
      songTimers.current.forEach(clearTimeout)
      Object.values(flashes).forEach(clearTimeout)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      void ctxRef.current?.close()
    }
  }, [])

  /* ── controls ──────────────────────────────────── */

  function onVolume(v: number) {
    setVolume(v)
    volumeRef.current = v / 100
    if (masterRef.current && ctxRef.current) {
      masterRef.current.gain.setTargetAtTime(v / 100, ctxRef.current.currentTime, 0.02)
    }
  }

  function toggleSustain() {
    const next = !sustain
    setSustain(next)
    sustainRef.current = next
  }

  /* ── render ────────────────────────────────────── */

  const WHITE_COUNT = WHITE_NOTES.length

  return (
    <>
      {/* ══════════ KEYBOARD ══════════ */}
      <Section id="keyboard">
        <DocLabel level="##">keyboard</DocLabel>
        <DisplayH2 size={36} margin="0 0 8px">
          <Em>Twenty-four</Em> keys.
        </DisplayH2>
        <Prose>
          Web Audio API, no samples. Pure additive synthesis with a piano-shaped envelope, and
          volume and sustain live in the toolbar.
        </Prose>

        <div
          className="overflow-hidden rounded-[var(--radius-xl)] border"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
        >
          {/* toolbar */}
          <div
            className="text-mono-sm flex flex-wrap items-center gap-4 border-b px-4 py-3 font-mono"
            style={{
              borderColor: "var(--border-subtle)",
              background: "var(--bg-chrome)",
              color: "var(--fg-secondary)",
            }}
          >
            <div className="flex gap-1.5">
              <span
                className="size-2.5 rounded-full opacity-60"
                style={{ background: "var(--status-error)" }}
              />
              <span
                className="size-2.5 rounded-full opacity-60"
                style={{ background: "var(--status-warning)" }}
              />
              <span
                className="size-2.5 rounded-full opacity-60"
                style={{ background: "var(--status-success)" }}
              />
            </div>

            <span
              className="text-mono-xs tracking-[0.08em] uppercase"
              style={{ color: "var(--fg-muted)" }}
            >
              <span aria-hidden style={{ color: "var(--fg-brand)", marginRight: 6, fontSize: 9 }}>
                ◆
              </span>
              piano · <span className="min-[481px]:hidden">1</span>
              <span className="hidden min-[481px]:inline">2</span> oct
            </span>

            {/* live note */}
            <span
              className="inline-flex min-w-[90px] items-center gap-1.5"
              style={{ color: "var(--fg-primary)" }}
            >
              <span
                key={nowNote?.id ?? "idle"}
                aria-hidden
                className="size-[7px] rounded-full"
                style={{
                  background: nowNote ? "var(--fg-brand)" : "var(--border-strong)",
                  animation: nowNote ? "piano-ping 0.6s ease-out" : undefined,
                }}
              />
              {nowNote ? (
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    color: "var(--fg-brand)",
                    fontSize: "var(--text-body-md)",
                  }}
                >
                  {nowNote.note}
                </span>
              ) : (
                <span style={{ color: "var(--fg-muted)" }}>—</span>
              )}
            </span>

            <div className="flex-1" />

            {/* sustain */}
            <div className="inline-flex items-center gap-2">
              <span
                className="text-mono-xs tracking-[0.08em] uppercase"
                style={{ color: "var(--fg-muted)" }}
              >
                sustain
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={sustain}
                aria-label="Toggle sustain"
                onClick={toggleSustain}
                className="relative h-4 w-[30px] rounded-full transition-colors"
                style={{ background: sustain ? "var(--fg-brand)" : "var(--border-strong)" }}
              >
                <span
                  className="absolute top-0.5 size-3 rounded-full bg-white transition-[left]"
                  style={{ left: sustain ? 16 : 2 }}
                />
              </button>
            </div>

            {/* volume */}
            <div className="inline-flex items-center gap-2">
              <span
                className="text-mono-xs tracking-[0.08em] uppercase"
                style={{ color: "var(--fg-muted)" }}
              >
                vol
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                aria-label="Volume"
                onChange={(e) => onVolume(Number(e.target.value))}
                className="piano-range h-[3px] w-[90px] cursor-pointer appearance-none rounded-[2px] outline-none"
                style={{ background: "var(--border-strong)" }}
              />
            </div>
          </div>

          {/* stage */}
          <div
            className="px-6 pt-6 pb-4 max-[820px]:px-3"
            style={{ background: "var(--piano-stage)" }}
          >
            <div
              className="relative rounded-[var(--radius-md)] px-3.5 pt-3.5 pb-2.5"
              style={{
                background: "var(--piano-frame)",
                border: "1px solid var(--piano-frame-border)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.04), 0 12px 32px var(--piano-frame-cast)",
              }}
            >
              <div
                className="piano-keys relative flex h-[220px] max-[820px]:h-[180px]"
                style={{ borderRadius: "0 0 6px 6px", overflow: "hidden", isolation: "isolate" }}
                role="application"
                aria-label="Piano keyboard"
              >
                {/* white keys */}
                {WHITE_NOTES.map((note, i) => {
                  const on = activeNotes.has(note)
                  const kbd = WHITE_KEYS[i]
                  return (
                    <button
                      key={note}
                      type="button"
                      aria-label={`${note} ${kbd.toUpperCase()}`}
                      onPointerDown={(e) => {
                        if (e.pointerType === "mouse" && e.button !== 0) return
                        pressNote(note)
                      }}
                      className={cn(
                        "relative flex h-full flex-1 cursor-pointer touch-none flex-col items-center justify-end pb-3.5 select-none",
                        i >= 7 && "piano-oct2",
                      )}
                      style={{
                        background: on
                          ? "linear-gradient(180deg, var(--fg-brand-hover) 0%, var(--fg-brand) 100%)"
                          : "var(--piano-white-key)",
                        borderRight:
                          i === WHITE_COUNT - 1 ? "none" : "1px solid var(--piano-key-sep)",
                        boxShadow: on
                          ? "inset 0 -3px 0 rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.2)"
                          : "inset 0 -3px 0 rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)",
                      }}
                    >
                      {note === "C5" && (
                        <span
                          className="text-mono-xs absolute top-2 font-mono tracking-[0.04em]"
                          style={{ color: on ? "rgba(255,255,255,0.7)" : "var(--piano-key-label)" }}
                        >
                          C5
                        </span>
                      )}
                      <span
                        className="text-mono-sm font-mono tracking-[0.04em] uppercase"
                        style={{ color: on ? "rgba(255,255,255,0.85)" : "var(--piano-key-label)" }}
                      >
                        {kbd}
                      </span>
                    </button>
                  )
                })}

                {/* black keys — positioned from the --wk (white-key count) var so
                    the layout recomputes when small screens drop to one octave */}
                {BLACK_AFTER.map((b) => {
                  const on = activeNotes.has(b.note)
                  return (
                    <button
                      key={b.note}
                      type="button"
                      aria-label={`${b.note} ${b.kbd.toUpperCase()}`}
                      onPointerDown={(e) => {
                        if (e.pointerType === "mouse" && e.button !== 0) return
                        e.stopPropagation()
                        pressNote(b.note)
                      }}
                      className={cn(
                        "absolute top-0 z-[3] flex cursor-pointer touch-none flex-col items-center justify-end pb-2.5 select-none",
                        b.i >= 7 && "piano-oct2",
                      )}
                      style={{
                        ["--k" as string]: b.i + 1,
                        left: "calc((var(--k) * 100% - 35%) / var(--wk))",
                        width: "calc(70% / var(--wk))",
                        height: "60%",
                        borderRadius: "0 0 5px 5px",
                        border: "1px solid #000",
                        borderTop: "none",
                        background: on
                          ? "linear-gradient(180deg, var(--fg-brand-hover) 0%, var(--fg-brand) 60%, color-mix(in srgb, var(--fg-brand) 55%, #000) 100%)"
                          : "var(--piano-black-key)",
                        boxShadow: on
                          ? "0 4px 6px rgba(0,0,0,0.5), 0 0 16px var(--fg-brand-glow), inset 0 -2px 0 rgba(255,255,255,0.08)"
                          : "0 4px 6px rgba(0,0,0,0.5), inset 0 -2px 0 rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)",
                      }}
                    >
                      <span
                        className="text-mono-xs font-mono uppercase"
                        style={{
                          color: on ? "rgba(255,255,255,0.9)" : "var(--piano-black-key-label)",
                        }}
                      >
                        {b.kbd}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* hint */}
          <div
            className="text-mono-sm px-4 pt-3 pb-4 text-center font-mono"
            style={{
              color: "var(--fg-muted)",
              background: "var(--piano-hint)",
            }}
          >
            {"// "}click keys or use your keyboard · press <Kbd>space</Kbd> to stop a song
          </div>
        </div>
      </Section>

      {/* ══════════ SONGS ══════════ */}
      <Section id="songs">
        <DocLabel level="##">songs</DocLabel>
        <DisplayH2 size={36} margin="0 0 8px">
          <Em>Six</Em> classics, one tap.
        </DisplayH2>
        <Prose>
          Tap any title to auto-play. The piano lights up note by note. Tap again, press{" "}
          <Em>space</Em>, or hit any key to stop.
        </Prose>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
          {SONGS.map((song) => {
            const playing = currentSong === song.id
            const totalBeats = song.notes.reduce((a, n) => a + n[1], 0)
            const seconds = Math.round(totalBeats * (60 / song.tempo))
            return (
              <button
                key={song.id}
                type="button"
                onClick={() => toggleSong(song)}
                /* `.bento-card` for the surface and `!grid` for the layout: the class sets
                   flex-column, and this row is three columns. It used to hand-roll
                   `rounded-[var(--radius-md)] border p-4` with its own hover, six times over,
                   and painted itself `--bg-surface` — the token for what sits above a card.

                   No spotlight here, unlike the content cards. These are controls with a
                   playing state that already lights the whole surface brand; a glow following
                   the cursor across six of them would compete with the one that means
                   something. */
                className={cn(
                  "bento-card bento-card-sm group !grid grid-cols-[auto_1fr_auto] items-center !gap-3 text-left",
                  playing && "!border-(--fg-brand) !bg-(--bg-surface-brand)",
                )}
              >
                <span
                  className="grid size-8 place-items-center rounded-[var(--radius-sm)] border transition-colors"
                  style={{
                    background: playing ? "var(--fg-brand)" : "var(--bg-canvas)",
                    borderColor: playing ? "var(--fg-brand)" : "var(--border-subtle)",
                    color: playing ? "var(--bg-canvas)" : "var(--fg-brand)",
                  }}
                >
                  {playing ? (
                    <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor">
                      <rect x="6" y="5" width="4" height="14" rx="1" />
                      <rect x="14" y="5" width="4" height="14" rx="1" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor">
                      <path d="M6 4l14 8-14 8z" />
                    </svg>
                  )}
                </span>

                <span className="flex min-w-0 flex-col gap-0.5">
                  <span
                    className="truncate"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      fontSize: "var(--text-heading-md)",
                      lineHeight: 1.2,
                      color: "var(--fg-primary)",
                    }}
                  >
                    {song.title}
                  </span>
                  <span
                    className="text-mono-xs font-mono tracking-[0.08em] uppercase"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {song.meta} · {seconds}s
                  </span>
                </span>

                <span
                  aria-hidden
                  className="text-body-lg font-mono transition-transform group-hover:translate-x-0.5"
                  style={{ color: "var(--fg-brand)" }}
                >
                  {playing ? "■" : "→"}
                </span>
              </button>
            )
          })}
        </div>

        {currentSong && (
          <div
            className="text-mono-sm mt-4 flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3 font-mono"
            style={{
              background: "var(--bg-surface-brand)",
              borderColor: "var(--border-brand)",
            }}
          >
            <span
              className="text-mono-xs tracking-[0.08em] uppercase"
              style={{ color: "var(--fg-brand-hover)" }}
            >
              <span aria-hidden style={{ marginRight: 4 }}>
                ◆
              </span>
              now playing
            </span>
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "var(--text-body-lg)",
                color: "var(--fg-primary)",
              }}
            >
              {SONGS.find((s) => s.id === currentSong)?.title}
            </span>
            <div
              className="h-[3px] min-w-[100px] flex-1 overflow-hidden rounded-[2px]"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <span
                className="block h-full"
                style={{
                  width: `${progress}%`,
                  background: "var(--fg-brand)",
                  transition: "width 60ms linear",
                }}
              />
            </div>
            <button
              type="button"
              onClick={stopSong}
              className="text-mono-sm rounded-[var(--radius-sm)] border px-2.5 py-1 font-mono transition-colors hover:border-[var(--fg-brand)]"
              style={{ borderColor: "var(--border-strong)", color: "var(--fg-primary)" }}
            >
              <span aria-hidden style={{ color: "var(--fg-brand)", marginRight: 4, fontSize: 9 }}>
                ■
              </span>
              stop
            </button>
          </div>
        )}
      </Section>
    </>
  )
}
