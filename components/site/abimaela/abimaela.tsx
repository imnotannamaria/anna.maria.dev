"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { OVERLAY_SURFACE } from "@/lib/overlay"
import { cn } from "@/lib/utils"
import walking from "./abimaela-walking.png"
import angry from "./abimaela-angry.png"
import sleepingSheet from "./abimaela-sleeping.png"
import sheet from "./abimaela-idle.png"
import stopping from "./abimaela-stopping.png"
import jumping from "./abimaela-jumping.png"
import "./abimaela.css"

/** Abimaela, the cat in the corner: CSS sprite sheets, and a tiny event bus the pages talk to. */
const LINES = {
  day: ["morning. or whatever this is.", "you're up. so am I, technically."],
  night: ["it's late. I'm only awake because you are."],
  click: ["mrrp.", "what.", "I was sitting here.", "fine. hi."],
  clickAgain: ["again?", "that's enough.", "you can stop now.", "…okay, one more."],
  page: [
    "new page. I checked it first.",
    "following you.",
    "this one's still empty.",
    "keep going.",
  ],
  front: ["back to the part with the pictures."],
  back: ["this is where the terminal lives."],
  ia: ["ask. I'm listening. mostly."],
  sidebar: ["more room for me."],
  meow: ["...meow.", "I heard that."],
  secret: ["you weren't supposed to find that."],
  snake: ["no snake yet. I would have caught it."],
} as const

export type PetEvent = keyof typeof LINES

const CHANNEL = "abimaela"
const target = typeof window === "undefined" ? null : new EventTarget()

export const pet = {
  notify(event: PetEvent) {
    target?.dispatchEvent(new CustomEvent<PetEvent>(CHANNEL, { detail: event }))
  },
}

const SPEECH_MS = 3600
const SLEEP_MS = 45_000

const AGAIN_MS = 2500

const JUMP_MS = 760
const ANGRY_MS = 1500

export function Cat({ height = 60 }: { height?: number }) {
  return (
    <span
      aria-hidden
      className="st-abi-sprite"
      style={
        { "--st-abi-sheet": `url(${sheet.src})`, "--st-abi-h": `${height}px` } as CSSProperties
      }
    />
  )
}

export function CatWalking({ height = 70 }: { height?: number }) {
  return (
    <span
      aria-hidden
      className="st-abi-walk"
      style={
        { "--st-abi-sheet": `url(${walking.src})`, "--st-abi-h": `${height}px` } as CSSProperties
      }
    />
  )
}

export function CatStopping({ height = 78 }: { height?: number }) {
  return (
    <span
      aria-hidden
      className="st-abi-stop"
      style={
        { "--st-abi-sheet": `url(${stopping.src})`, "--st-abi-h": `${height}px` } as CSSProperties
      }
    />
  )
}

export function Abimaela() {
  const [speech, setSpeech] = useState<string | null>(null)
  const [looking, setLooking] = useState<"left" | "right">("left")
  const [sleeping, setSleeping] = useState(false)

  const [action, setAction] = useState<"idle" | "jump" | "angry">("idle")
  const [tap, setTap] = useState(0)
  const back = useRef<ReturnType<typeof setTimeout>>(undefined)
  const body = useRef<HTMLButtonElement>(null)
  const turn = useRef<Partial<Record<PetEvent, number>>>({})
  const lastClick = useRef(0)

  useEffect(() => {
    let hideSpeech: ReturnType<typeof setTimeout> | undefined
    let sleep: ReturnType<typeof setTimeout> | undefined

    const wake = () => {
      setSleeping(false)
      clearTimeout(sleep)
      sleep = setTimeout(() => setSleeping(true), SLEEP_MS)
    }

    const say = (event: PetEvent) => {
      const lines = LINES[event]
      const index = turn.current[event] ?? 0
      turn.current[event] = index + 1
      setSpeech(lines[index % lines.length])
      clearTimeout(hideSpeech)
      hideSpeech = setTimeout(() => setSpeech(null), SPEECH_MS)
      wake()
    }

    const onNotify = (event: Event) => say((event as CustomEvent<PetEvent>).detail)

    const onPress = (event: PointerEvent) => {
      const box = body.current?.getBoundingClientRect()
      if (box) {
        setLooking(event.clientX < box.left + box.width / 2 ? "left" : "right")
      }
      wake()
    }

    sleep = setTimeout(() => setSleeping(true), SLEEP_MS)

    const hello = setTimeout(() => {
      const hour = new Date().getHours()
      say(hour >= 6 && hour < 18 ? "day" : "night")
    }, 1400)
    target?.addEventListener(CHANNEL, onNotify)
    window.addEventListener("pointerdown", onPress)
    window.addEventListener("keydown", wake)
    return () => {
      clearTimeout(hideSpeech)
      clearTimeout(sleep)
      clearTimeout(hello)
      clearTimeout(back.current)
      target?.removeEventListener(CHANNEL, onNotify)
      window.removeEventListener("pointerdown", onPress)
      window.removeEventListener("keydown", wake)
    }
  }, [])

  return (
    <div className="st-abi">
      <p
        role="status"
        className={cn(
          OVERLAY_SURFACE,
          "st-abi-speech text-mono-sm font-mono text-[var(--fg-primary)]",
        )}
        data-visible={speech ? "" : undefined}
      >
        {speech ?? ""}
      </p>

      <button
        ref={body}
        type="button"
        className="st-abi-body focus-ring"
        aria-label={
          sleeping
            ? "Abimaela, the cat, asleep. Click to wake her."
            : "Abimaela, the cat. Click to say hi."
        }
        onClick={() => {
          const now = Date.now()
          const again = now - lastClick.current < AGAIN_MS
          lastClick.current = now
          setAction(again ? "angry" : "jump")
          setTap((n) => n + 1)
          clearTimeout(back.current)
          back.current = setTimeout(() => setAction("idle"), again ? ANGRY_MS : JUMP_MS)
          pet.notify(again ? "clickAgain" : "click")
        }}
      >
        <span className="st-abi-stage" data-looking={looking}>
          <span
            aria-hidden
            className="st-abi-sprite"
            data-hidden={action === "idle" && !sleeping ? undefined : ""}
            style={{ "--st-abi-sheet": `url(${sheet.src})` } as CSSProperties}
          />
          {sleeping && action === "idle" ? (
            <span
              aria-hidden
              className="st-abi-sleep"
              style={{ "--st-abi-sheet": `url(${sleepingSheet.src})` } as CSSProperties}
            />
          ) : null}
          {action === "jump" ? (
            <span
              key={tap}
              aria-hidden
              className="st-abi-jump"
              style={{ "--st-abi-sheet": `url(${jumping.src})` } as CSSProperties}
            />
          ) : null}
          {action === "angry" ? (
            <span
              key={tap}
              aria-hidden
              className="st-abi-angry"
              style={{ "--st-abi-sheet": `url(${angry.src})` } as CSSProperties}
            />
          ) : null}
        </span>
      </button>
    </div>
  )
}
