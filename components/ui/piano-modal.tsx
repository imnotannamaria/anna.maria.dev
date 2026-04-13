"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { XIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { PianoKeysIcon, MusicNoteIcon, MusicNoteSimpleIcon } from "@phosphor-icons/react/dist/ssr"

function playPianoNote(audioCtx: AudioContext, frequency: number) {
  const now = audioCtx.currentTime

  const osc1 = audioCtx.createOscillator()
  const osc2 = audioCtx.createOscillator()
  const osc3 = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  const filter = audioCtx.createBiquadFilter()

  osc1.type = "triangle"
  osc1.frequency.setValueAtTime(frequency, now)

  osc2.type = "sine"
  osc2.frequency.setValueAtTime(frequency * 2.001, now)

  osc3.type = "sine"
  osc3.frequency.setValueAtTime(frequency * 3.0, now)

  filter.type = "lowpass"
  filter.frequency.setValueAtTime(5000, now)
  filter.frequency.exponentialRampToValueAtTime(800, now + 1.5)

  osc1.connect(gain)
  osc2.connect(gain)
  osc3.connect(gain)
  gain.connect(filter)
  filter.connect(audioCtx.destination)

  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.45, now + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.15)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2)

  osc1.start(now)
  osc2.start(now)
  osc3.start(now)
  osc1.stop(now + 2.2)
  osc2.stop(now + 2.2)
  osc3.stop(now + 2.2)
}

interface PianoKey {
  note: string
  freq: number
  isBlack: boolean
  kbd: string
  wi: number
}

const WHITE_COUNT = 14

const KEYS: PianoKey[] = [
  { note: "C4", freq: 261.63, isBlack: false, kbd: "z", wi: 0 },
  { note: "C#4", freq: 277.18, isBlack: true, kbd: "s", wi: 0.7 },
  { note: "D4", freq: 293.66, isBlack: false, kbd: "x", wi: 1 },
  { note: "D#4", freq: 311.13, isBlack: true, kbd: "d", wi: 1.7 },
  { note: "E4", freq: 329.63, isBlack: false, kbd: "c", wi: 2 },
  { note: "F4", freq: 349.23, isBlack: false, kbd: "v", wi: 3 },
  { note: "F#4", freq: 369.99, isBlack: true, kbd: "g", wi: 3.7 },
  { note: "G4", freq: 392.0, isBlack: false, kbd: "b", wi: 4 },
  { note: "G#4", freq: 415.3, isBlack: true, kbd: "h", wi: 4.7 },
  { note: "A4", freq: 440.0, isBlack: false, kbd: "n", wi: 5 },
  { note: "A#4", freq: 466.16, isBlack: true, kbd: "j", wi: 5.7 },
  { note: "B4", freq: 493.88, isBlack: false, kbd: "m", wi: 6 },
  { note: "C5", freq: 523.25, isBlack: false, kbd: "q", wi: 7 },
  { note: "C#5", freq: 554.37, isBlack: true, kbd: "2", wi: 7.7 },
  { note: "D5", freq: 587.33, isBlack: false, kbd: "w", wi: 8 },
  { note: "D#5", freq: 622.25, isBlack: true, kbd: "3", wi: 8.7 },
  { note: "E5", freq: 659.25, isBlack: false, kbd: "e", wi: 9 },
  { note: "F5", freq: 698.46, isBlack: false, kbd: "r", wi: 10 },
  { note: "F#5", freq: 739.99, isBlack: true, kbd: "5", wi: 10.7 },
  { note: "G5", freq: 783.99, isBlack: false, kbd: "t", wi: 11 },
  { note: "G#5", freq: 830.61, isBlack: true, kbd: "6", wi: 11.7 },
  { note: "A5", freq: 880.0, isBlack: false, kbd: "y", wi: 12 },
  { note: "A#5", freq: 932.33, isBlack: true, kbd: "7", wi: 12.7 },
  { note: "B5", freq: 987.77, isBlack: false, kbd: "u", wi: 13 },
]

const KBD_MAP: Record<string, PianoKey> = Object.fromEntries(KEYS.map((k) => [k.kbd, k]))

interface PianoKeyboardProps {
  onClose: () => void
}

type WebkitWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext
  }

function PianoKeyboard({ onClose }: PianoKeyboardProps) {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())
  const [noteDisplay, setNoteDisplay] = useState<{ note: string; id: number } | null>(null)

  function getAudioCtx(): AudioContext {
    if (!audioCtxRef.current) {
      const AudioContextCtor = window.AudioContext || (window as WebkitWindow).webkitAudioContext

      if (!AudioContextCtor) {
        throw new Error("AudioContext is not supported in this browser")
      }

      audioCtxRef.current = new AudioContextCtor()
    }
    if (audioCtxRef.current.state === "suspended") {
      void audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }

  const triggerKey = useCallback((key: PianoKey) => {
    const ctx = getAudioCtx()
    playPianoNote(ctx, key.freq)
    setNoteDisplay({ note: key.note, id: Date.now() })
    setActiveKeys((prev) => new Set([...prev, key.note]))
    setTimeout(() => {
      setActiveKeys((prev) => {
        const next = new Set(prev)
        next.delete(key.note)
        return next
      })
    }, 180)
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.repeat) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === "Escape") {
        onClose()
        return
      }
      const key = KBD_MAP[e.key.toLowerCase()]
      if (key) triggerKey(key)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [triggerKey, onClose])

  const whiteKeys = KEYS.filter((k) => !k.isBlack)
  const blackKeys = KEYS.filter((k) => k.isBlack)

  const blackWidthPct = (0.6 / WHITE_COUNT) * 100

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <PianoKeysIcon size={17} />
          <span className="text-text-primary text-sm font-medium">Piano</span>

          <AnimatePresence mode="popLayout">
            {noteDisplay && (
              <motion.span
                key={noteDisplay.id}
                initial={{ opacity: 0, y: -6, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-xs text-indigo-400"
              >
                {noteDisplay.note}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={onClose}
          aria-label="Close piano"
          className="text-text-secondary hover:bg-bg-elevated hover:text-text-primary flex size-7 cursor-pointer items-center justify-center rounded-lg transition-colors"
        >
          <XIcon size={14} />
        </button>
      </div>

      <div className="border-border bg-bg-elevated mx-auto w-full max-w-2xl rounded-xl border p-3 shadow-inner">
        <div
          className="relative flex h-32 w-full overflow-hidden rounded-lg border border-[#555]"
          style={{ background: "#1a1a20" }}
        >
          {whiteKeys.map((key, i) => (
            <button
              key={key.note}
              aria-label={`${key.note} (${key.kbd.toUpperCase()})`}
              onPointerDown={(e) => {
                if (e.pointerType === "mouse" && e.button !== 0) return
                triggerKey(key)
              }}
              className={cn(
                "relative flex-1 cursor-pointer touch-none transition-colors duration-75 select-none focus:outline-none focus-visible:outline-none",
                "border-r border-[#aaa] last:border-r-0",
                activeKeys.has(key.note) ? "bg-indigo-200" : "bg-[#f5f5f2] hover:bg-[#eaeaf0]",
              )}
            >
              {key.note === "C5" && (
                <span className="absolute top-1.5 left-1/2 -translate-x-1/2 font-mono text-[7px] text-[#999]">
                  C5
                </span>
              )}
              <span
                className={cn(
                  "absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[8px] transition-colors select-none",
                  activeKeys.has(key.note) ? "text-indigo-600" : "text-[#aaa]",
                  i < 3 || i > 10 ? "" : "",
                )}
              >
                {key.kbd.toUpperCase()}
              </span>
            </button>
          ))}

          {blackKeys.map((key) => (
            <button
              key={key.note}
              aria-label={`${key.note} (${key.kbd.toUpperCase()})`}
              onPointerDown={(e) => {
                if (e.pointerType === "mouse" && e.button !== 0) return
                e.stopPropagation()
                triggerKey(key)
              }}
              style={{
                position: "absolute",
                left: `${(key.wi / WHITE_COUNT) * 100}%`,
                width: `${blackWidthPct}%`,
                top: 0,
                height: "62%",
              }}
              className={cn(
                "z-10 cursor-pointer touch-none rounded-b-md border border-[#333] transition-colors duration-75 select-none focus:outline-none focus-visible:outline-none",
                activeKeys.has(key.note) ? "bg-indigo-600" : "bg-[#1a1a20] hover:bg-[#2d2d3a]",
              )}
            >
              <span
                className={cn(
                  "absolute bottom-1.5 left-1/2 -translate-x-1/2 font-mono text-[7px] select-none",
                  activeKeys.has(key.note) ? "text-indigo-200" : "text-[#777]",
                )}
              >
                {key.kbd.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-text-muted text-center font-mono text-xs">
        click keys or use keyboard · esc to close
      </p>
    </div>
  )
}

interface PianoModalProps {
  open: boolean
  onClose: () => void
}

export function PianoModal({ open, onClose }: PianoModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            className="border-border bg-bg-base fixed bottom-0 left-0 z-50 w-full border-t px-6 py-5 shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="bg-border mx-auto mb-4 h-1 w-10 rounded-full" />
            <PianoKeyboard onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface PianoButtonProps {
  onClick: () => void
  active?: boolean
  pulse?: boolean
}

const NOTE_VARIANTS = [
  { Icon: MusicNoteIcon, x: -10, delay: 0 },
  { Icon: MusicNoteSimpleIcon, x: 0, delay: 0.35 },
  { Icon: MusicNoteIcon, x: -5, delay: 0.65 },
]

export function PianoButton({ onClick, active, pulse }: PianoButtonProps) {
  const [pinging, setPinging] = useState(false)

  useEffect(() => {
    if (!pulse || active) return
    const trigger = () => {
      setPinging(true)
      setTimeout(() => setPinging(false), 1600)
    }
    trigger()
    const id = setInterval(trigger, 3000)
    return () => clearInterval(id)
  }, [pulse, active])

  return (
    <button
      onClick={onClick}
      aria-label={active ? "Close piano" : "Open piano"}
      className={cn(
        "relative flex size-9 cursor-pointer items-center justify-center rounded-lg transition-colors",
        active
          ? "border-border bg-bg-elevated border text-indigo-500"
          : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
      )}
    >
      <AnimatePresence>
        {pulse &&
          pinging &&
          !active &&
          NOTE_VARIANTS.map(({ Icon, x, delay }, i) => (
            <motion.span
              key={i}
              className="pointer-events-none absolute -top-1 left-1/2 text-indigo-400"
              style={{ x }}
              initial={{ opacity: 0, y: 0, scale: 0.7 }}
              animate={{ opacity: [0, 1, 0], y: 0, scale: [0.7, 1, 0.85] }}
              transition={{ duration: 1.1, delay, ease: "easeOut" }}
            >
              <Icon size={10} weight="fill" />
            </motion.span>
          ))}
      </AnimatePresence>
      <PianoKeysIcon size={16} />
    </button>
  )
}
