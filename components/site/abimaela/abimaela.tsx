"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef, useState, type CSSProperties } from "react"
import { OVERLAY_SURFACE } from "@/lib/overlay"
import { cn } from "@/lib/utils"
import confused from "./abimaela-confused.png"
import happy from "./abimaela-happy.png"
import waking from "./abimaela-waking.png"
import walking from "./abimaela-walking.png"
import angry from "./abimaela-angry.png"
import sleepingSheet from "./abimaela-sleeping.png"
import sheet from "./abimaela-idle.png"
import stopping from "./abimaela-stopping.png"
import jumping from "./abimaela-jumping.png"
import {
  gestureOf,
  isPageEvent,
  waitToSpeak,
  WAITING_MS,
  type Gesture,
  type PetEvent,
} from "./events"
import "./abimaela.css"

/**
 * Abimaela, the cat in the corner: CSS sprite sheets, and a tiny event bus the pages talk to.
 * What she reacts to is in events.ts, what she says is in the messages, and docs/abimaela.md
 * explains both.
 */
export type { PetEvent }

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

// a little past the jump sheet's own 900ms (abimaela.css), so its last frame is seen
const JUMP_MS = 940
const ANGRY_MS = 1500
// as long as the confused and the happy sheets take to play (abimaela.css)
const CONFUSED_MS = 1700
const HAPPY_MS = 1900

const GESTURE_MS = {
  jump: JUMP_MS,
  angry: ANGRY_MS,
  confused: CONFUSED_MS,
  happy: HAPPY_MS,
} as const

// as long as the waking sheet takes to play (abimaela.css)
const WAKE_MS = 1800

/**
 * The sheets she plays when something happens. A sheet is a CSS background of an element that
 * only exists while she plays it, so its image was first asked for at the moment of the click.
 * The idle sprite is hidden the instant she starts, so on a slow phone she vanished for as long
 * as the sheet took to arrive and came back mid-gesture. They are fetched and decoded when the
 * browser has nothing better to do, the sleeping sheet (the biggest, and wanted only after 45
 * seconds) last. Until the gestures are ready she only shows the idle sprite: a tap draws no
 * second cat over it.
 */
const GESTURE_SHEETS = [jumping, angry, confused, happy, waking].map((image) => image.src)

const preload = (src: string) => {
  const image = new Image()
  image.src = src
  // a sheet that fails to decode must not hold the others back
  return image.decode().catch(() => undefined)
}

let sheetsLoaded: Promise<void> | undefined
function loadSheets() {
  sheetsLoaded ??= Promise.all(GESTURE_SHEETS.map(preload)).then(() => {
    void preload(sleepingSheet.src)
  })
  return sheetsLoaded
}

/** Safari has no `requestIdleCallback`; a short timer stands in for it. */
function whenIdle(run: () => void) {
  if (typeof requestIdleCallback === "function") {
    const id = requestIdleCallback(run, { timeout: 3000 })
    return () => cancelIdleCallback(id)
  }
  const id = setTimeout(run, 1500)
  return () => clearTimeout(id)
}

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

export function CatStopping({ height = 70 }: { height?: number }) {
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

/**
 * She is angry: the sheet plays once and holds the last frame. `height` is how tall she is
 * drawn; the sheet is sized from the idle frame's height (abimaela.css), so that is worked back
 * from it here.
 */
export function CatAngry({ height = 96 }: { height?: number }) {
  return (
    <span
      aria-hidden
      className="relative block"
      style={
        {
          "--st-abi-h": `${(height * 235) / 229}px`,
          width: (height * 254) / 229,
          height,
        } as CSSProperties
      }
    >
      <span
        className="st-abi-angry"
        style={{ "--st-abi-sheet": `url(${angry.src})` } as CSSProperties}
      />
    </span>
  )
}

/** She is happy: eyes closed, tail going, hearts over her head. The sheet plays once. */
export function CatHappy({ height = 96 }: { height?: number }) {
  return (
    <span
      aria-hidden
      className="relative block"
      style={{ "--st-abi-h": `${height}px`, width: (height * 224) / 235, height } as CSSProperties}
    >
      <span
        className="st-abi-happy"
        style={{ "--st-abi-sheet": `url(${happy.src})` } as CSSProperties}
      />
    </span>
  )
}

/** She falls asleep: the sheet's first row plays once, and its second loops after it. */
export function CatSleeping({ height = 96 }: { height?: number }) {
  return (
    <span
      aria-hidden
      className="relative block"
      style={{ "--st-abi-h": `${height}px`, width: (height * 245) / 235, height } as CSSProperties}
    >
      <span
        className="st-abi-sleep"
        style={{ "--st-abi-sheet": `url(${sleepingSheet.src})` } as CSSProperties}
      />
    </span>
  )
}

/** The cat in the corner. She stays there: the footer's game is its own thing now. */
export function Abimaela() {
  const t = useTranslations("cat")
  const [speech, setSpeech] = useState<string | null>(null)
  const [looking, setLooking] = useState<"left" | "right">("left")
  const [sleeping, setSleeping] = useState(false)

  const [action, setAction] = useState<"idle" | "wake" | Gesture>("idle")
  // whether she is asleep, for the code below that runs outside of a render
  const asleep = useRef(false)
  const [tap, setTap] = useState(0)
  const [sheetsReady, setSheetsReady] = useState(false)
  const back = useRef<ReturnType<typeof setTimeout>>(undefined)
  const body = useRef<HTMLButtonElement>(null)
  const turn = useRef<Partial<Record<PetEvent, number>>>({})
  const lastClick = useRef(0)

  useEffect(() => {
    let hideSpeech: ReturnType<typeof setTimeout> | undefined
    let sleep: ReturnType<typeof setTimeout> | undefined

    const doze = () => {
      asleep.current = true
      setSleeping(true)
    }
    const wake = () => {
      // If she was asleep she wakes properly, yawn and stretch, before anything else she does.
      // A gesture that comes with what woke her (a click makes her jump) takes over from it.
      if (asleep.current) {
        asleep.current = false
        setAction("wake")
        setTap((n) => n + 1)
        clearTimeout(back.current)
        back.current = setTimeout(() => setAction("idle"), WAKE_MS)
      }
      setSleeping(false)
      clearTimeout(sleep)
      sleep = setTimeout(doze, SLEEP_MS)
    }

    // when she last spoke, and when someone last typed in a field
    const last = { spokeAt: 0, typedAt: 0 }

    // A line she could not say when it happened: a page opened right after she spoke. It is kept for a few seconds and said when she can. Only the latest
    // one is kept, so three pages opened in a row get one line, for the page the visitor is on.
    let waiting: { event: PetEvent; at: number } | null = null
    let retry: ReturnType<typeof setTimeout> | undefined
    const later = () => {
      const held = waiting
      waiting = null
      if (held && Date.now() - held.at <= WAITING_MS) say(held.event)
    }

    const say = (event: PetEvent) => {
      const now = Date.now()
      const wait = waitToSpeak(event, now, last)
      if (wait > 0) {
        // anything else nobody asked her for is dropped: late, it would be about nothing
        if (!isPageEvent(event)) return
        waiting = { event, at: now }
        clearTimeout(retry)
        retry = setTimeout(later, wait)
        return
      }
      waiting = null
      last.spokeAt = now
      // her lines for this, as the messages list them
      const lines = Object.values(
        (t.raw as (key: string) => unknown)(`lines.${event}`) as Record<string, string>,
      )
      const index = turn.current[event] ?? 0
      turn.current[event] = index + 1
      setSpeech(lines[index % lines.length])
      clearTimeout(hideSpeech)
      hideSpeech = setTimeout(() => setSpeech(null), SPEECH_MS)
      const wasAsleep = asleep.current
      wake()

      // Some things get a gesture with the line. A click on her sets its own, below. Any other
      // line takes over from the gesture of the one before it, which stops where it is.
      // One that wakes her from sleep leaves her yawning, which is its own gesture.
      if (event !== "click" && event !== "clickAgain") {
        const gesture = gestureOf(event)
        if (gesture) {
          clearTimeout(back.current)
          setAction(gesture)
          setTap((n) => n + 1)
          back.current = setTimeout(() => setAction("idle"), GESTURE_MS[gesture])
        } else if (!wasAsleep) {
          clearTimeout(back.current)
          setAction("idle")
        }
      }
    }

    const onType = (event: KeyboardEvent) => {
      wake()
      const field = event.target instanceof Element && event.target.closest("input, textarea")
      // Enter sends, it does not type: the line it earns is an answer
      if (field && event.key !== "Enter") last.typedAt = Date.now()
    }

    const onNotify = (event: Event) => say((event as CustomEvent<PetEvent>).detail)

    const onPress = (event: PointerEvent) => {
      const box = body.current?.getBoundingClientRect()
      if (box) {
        setLooking(event.clientX < box.left + box.width / 2 ? "left" : "right")
      }
      wake()
    }

    sleep = setTimeout(doze, SLEEP_MS)

    const hello = setTimeout(() => {
      const hour = new Date().getHours()
      say(hour >= 6 && hour < 18 ? "day" : "night")
    }, 1400)
    target?.addEventListener(CHANNEL, onNotify)
    window.addEventListener("pointerdown", onPress)
    window.addEventListener("keydown", onType)
    return () => {
      clearTimeout(hideSpeech)
      clearTimeout(retry)
      clearTimeout(sleep)
      clearTimeout(hello)
      clearTimeout(back.current)
      target?.removeEventListener(CHANNEL, onNotify)
      window.removeEventListener("pointerdown", onPress)
      window.removeEventListener("keydown", onType)
    }
  }, [t])

  useEffect(() => {
    let alive = true
    const cancel = whenIdle(() => void loadSheets().then(() => alive && setSheetsReady(true)))
    return () => {
      alive = false
      cancel()
    }
  }, [])

  // sitting in the corner with nothing else going on
  const resting = action === "idle" && !sleeping

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
        aria-label={sleeping ? t("asleep") : t("awake")}
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
            data-hidden={resting || !sheetsReady ? undefined : ""}
            style={{ "--st-abi-sheet": `url(${sheet.src})` } as CSSProperties}
          />
          {sleeping && action === "idle" ? (
            <span
              aria-hidden
              className="st-abi-sleep"
              style={{ "--st-abi-sheet": `url(${sleepingSheet.src})` } as CSSProperties}
            />
          ) : null}
          {sheetsReady && action === "confused" ? (
            <span
              key={tap}
              aria-hidden
              className="st-abi-confused"
              style={{ "--st-abi-sheet": `url(${confused.src})` } as CSSProperties}
            />
          ) : null}
          {sheetsReady && action === "happy" ? (
            <span
              key={tap}
              aria-hidden
              className="st-abi-happy"
              style={{ "--st-abi-sheet": `url(${happy.src})` } as CSSProperties}
            />
          ) : null}
          {sheetsReady && action === "jump" ? (
            <span
              key={tap}
              aria-hidden
              className="st-abi-jump"
              style={{ "--st-abi-sheet": `url(${jumping.src})` } as CSSProperties}
            />
          ) : null}
          {sheetsReady && action === "wake" ? (
            <span
              key={tap}
              aria-hidden
              className="st-abi-wake"
              style={{ "--st-abi-sheet": `url(${waking.src})` } as CSSProperties}
            />
          ) : null}
          {sheetsReady && action === "angry" ? (
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
