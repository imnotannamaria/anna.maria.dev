"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { PlayIcon, StopIcon } from "@phosphor-icons/react"
import { PianoKeyboard, playPianoNote, NOTE_FREQ_MAP } from "@/components/ui/piano-modal"
import { cn } from "@/lib/utils"

const KEYBOARD_MAP: Record<string, string> = {
  C4: "Z",
  D4: "X",
  E4: "C",
  F4: "V",
  G4: "B",
  "G#4": "H",
  A4: "N",
  "A#4": "J",
  B4: "M",
  C5: "Q",
  D5: "W",
  "D#5": "3",
  E5: "E",
  F5: "R",
  G5: "T",
  A5: "Y",
}

const SONGS = [
  {
    id: "twinkle",
    title: "Twinkle Twinkle Little Star",
    notes: [
      "C4",
      "C4",
      "G4",
      "G4",
      "A4",
      "A4",
      "G4",
      "|",
      "F4",
      "F4",
      "E4",
      "E4",
      "D4",
      "D4",
      "C4",
      "|",
      "G4",
      "G4",
      "F4",
      "F4",
      "E4",
      "E4",
      "D4",
      "|",
      "G4",
      "G4",
      "F4",
      "F4",
      "E4",
      "E4",
      "D4",
      "|",
      "C4",
      "C4",
      "G4",
      "G4",
      "A4",
      "A4",
      "G4",
      "|",
      "F4",
      "F4",
      "E4",
      "E4",
      "D4",
      "D4",
      "C4",
    ],
  },
  {
    id: "birthday",
    title: "Happy Birthday",
    notes: [
      "C4",
      "C4",
      "D4",
      "C4",
      "F4",
      "E4",
      "|",
      "C4",
      "C4",
      "D4",
      "C4",
      "G4",
      "F4",
      "|",
      "C4",
      "C4",
      "C5",
      "A4",
      "F4",
      "E4",
      "D4",
      "|",
      "A#4",
      "A#4",
      "A4",
      "F4",
      "G4",
      "F4",
    ],
  },
  {
    id: "ode",
    title: "Ode to Joy",
    notes: [
      "E4",
      "E4",
      "F4",
      "G4",
      "G4",
      "F4",
      "E4",
      "D4",
      "C4",
      "C4",
      "D4",
      "E4",
      "E4",
      "D4",
      "D4",
      "|",
      "E4",
      "E4",
      "F4",
      "G4",
      "G4",
      "F4",
      "E4",
      "D4",
      "C4",
      "C4",
      "D4",
      "E4",
      "D4",
      "C4",
      "C4",
    ],
  },
  {
    id: "mary",
    title: "Mary Had a Little Lamb",
    notes: [
      "E4",
      "D4",
      "C4",
      "D4",
      "E4",
      "E4",
      "E4",
      "|",
      "D4",
      "D4",
      "D4",
      "|",
      "E4",
      "G4",
      "G4",
      "|",
      "E4",
      "D4",
      "C4",
      "D4",
      "E4",
      "E4",
      "E4",
      "E4",
      "D4",
      "D4",
      "E4",
      "D4",
      "C4",
    ],
  },
  {
    id: "jingle",
    title: "Jingle Bells",
    notes: [
      "E4",
      "E4",
      "E4",
      "|",
      "E4",
      "E4",
      "E4",
      "|",
      "E4",
      "G4",
      "C4",
      "D4",
      "E4",
      "|",
      "F4",
      "F4",
      "F4",
      "F4",
      "|",
      "F4",
      "E4",
      "E4",
      "E4",
      "|",
      "E4",
      "D4",
      "D4",
      "E4",
      "D4",
      "G4",
      "|",
      "E4",
      "E4",
      "E4",
      "|",
      "E4",
      "E4",
      "E4",
      "|",
      "E4",
      "G4",
      "C4",
      "D4",
      "E4",
      "|",
      "F4",
      "F4",
      "F4",
      "F4",
      "|",
      "F4",
      "E4",
      "E4",
      "E4",
      "|",
      "G4",
      "G4",
      "F4",
      "D4",
      "C4",
    ],
  },
  {
    id: "fur-elise",
    title: "Für Elise",
    notes: [
      "E5",
      "D#5",
      "E5",
      "D#5",
      "E5",
      "B4",
      "D5",
      "C5",
      "A4",
      "|",
      "C4",
      "E4",
      "A4",
      "B4",
      "|",
      "E4",
      "G#4",
      "B4",
      "C5",
      "|",
      "E4",
      "E5",
      "D#5",
      "E5",
      "D#5",
      "E5",
      "B4",
      "D5",
      "C5",
      "A4",
      "|",
      "C4",
      "E4",
      "A4",
      "B4",
      "|",
      "E4",
      "C5",
      "B4",
      "A4",
    ],
  },
]

function formatNote(note: string) {
  return note.replace(/\d$/, "")
}

export default function PianoPage() {
  const router = useRouter()
  const [selectedSong, setSelectedSong] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const audioCtxRef = useRef<AudioContext | null>(null)

  function getAudioCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    if (audioCtxRef.current.state === "suspended") {
      void audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }

  function stopPlayback() {
    for (const t of timersRef.current) clearTimeout(t)
    timersRef.current = []
    setPlaying(false)
    setActiveIndex(null)
  }

  function playSong(notes: string[]) {
    if (playing) {
      stopPlayback()
      return
    }

    setPlaying(true)
    const ctx = getAudioCtx()
    let delay = 0

    notes.forEach((note, i) => {
      if (note === "|") {
        delay += 150
        return
      }

      const freq = NOTE_FREQ_MAP[note]
      const t = delay

      timersRef.current.push(
        setTimeout(() => {
          setActiveIndex(i)
          if (freq) playPianoNote(ctx, freq)
        }, t),
      )

      delay += 420
    })

    timersRef.current.push(
      setTimeout(() => {
        setPlaying(false)
        setActiveIndex(null)
      }, delay + 300),
    )
  }

  const song = SONGS.find((s) => s.id === selectedSong)

  function selectSong(id: string) {
    if (selectedSong === id) {
      stopPlayback()
      setSelectedSong(null)
    } else {
      stopPlayback()
      setSelectedSong(id)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="w-full max-w-3xl">
        <PianoKeyboard onClose={() => router.back()} />
      </div>

      <div className="w-full max-w-3xl">
        <p className="text-text-muted mb-4 font-mono text-xs tracking-widest uppercase">Songs</p>

        <div className="mb-6 flex flex-wrap gap-2">
          {SONGS.map((s) => (
            <button
              key={s.id}
              onClick={() => selectSong(s.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                selectedSong === s.id
                  ? "bg-indigo-500 text-white"
                  : "border-border text-text-secondary hover:border-border-hover hover:text-text-primary border",
              )}
            >
              {s.title}
            </button>
          ))}
        </div>

        {song && (
          <div className="border-border bg-bg-surface rounded-xl border p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-text-secondary font-mono text-xs">{song.title}</p>
              <button
                onClick={() => playSong(song.notes)}
                aria-label={playing ? "Stop" : "Play"}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  playing
                    ? "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30"
                    : "border-border text-text-secondary hover:border-border-hover hover:text-text-primary border",
                )}
              >
                {playing ? (
                  <StopIcon size={12} weight="fill" />
                ) : (
                  <PlayIcon size={12} weight="fill" />
                )}
                {playing ? "Stop" : "Play"}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {song.notes.map((note, i) =>
                note === "|" ? (
                  <div key={i} className="border-border mx-1 self-stretch border-l" />
                ) : (
                  <div
                    key={i}
                    className={cn(
                      "flex min-w-9 flex-col items-center rounded-md border px-2 py-1.5 transition-colors duration-100",
                      activeIndex === i
                        ? "border-indigo-500 bg-indigo-500/20"
                        : "border-border bg-bg-elevated",
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-[10px] font-medium transition-colors",
                        activeIndex === i ? "text-indigo-300" : "text-text-primary",
                      )}
                    >
                      {formatNote(note)}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[10px] transition-colors",
                        activeIndex === i ? "text-indigo-400" : "text-indigo-400",
                      )}
                    >
                      {KEYBOARD_MAP[note] ?? "?"}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
