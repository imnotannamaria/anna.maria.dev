"use client"

import { useTranslations } from "next-intl"
import { useReducedMotion } from "motion/react"
import { useEffect, useRef, useState, type CSSProperties } from "react"
import { OVERLAY_SURFACE } from "@/lib/overlay"
import { cn } from "@/lib/utils"
import confused from "./abimaela-confused.png"
import happy from "./abimaela-happy.png"
import leaving from "./abimaela-leaving.png"
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
// leaving the corner and coming back: she gets up, walks, and on the way back sits down again
const OUT_MS = 600
const WALK_MS = 800
const SETTLE_MS = 220

// as long as the confused and the happy sheets take to play (abimaela.css)
const CONFUSED_MS = 1700
const HAPPY_MS = 1900

const GESTURE_MS = {
  jump: JUMP_MS,
  angry: ANGRY_MS,
  confused: CONFUSED_MS,
  happy: HAPPY_MS,
} as const

/**
 * Where she is. `here` is the corner. The rest is the trip out of it and back: getting up,
 * walking off the edge of the screen, gone, walking back in, sitting down.
 */
type Presence = "here" | "leaving" | "walkingOut" | "gone" | "walkingIn" | "settling"
// as long as the waking sheet takes to play (abimaela.css)
const WAKE_MS = 1800

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

/**
 * `away` is the frame saying she should not be in the corner (the footer is on screen, and she
 * is in the game down there). She walks out, and walks back in when it stops being true.
 */
export function Abimaela({ away = false }: { away?: boolean }) {
  const t = useTranslations("cat")
  const reduce = useReducedMotion() ?? false
  const [presence, setPresence] = useState<Presence>("here")
  // the same, for the code that runs outside of a render
  const where = useRef<Presence>("here")
  const trip = useRef<ReturnType<typeof setTimeout>>(undefined)
  // what the speech code wants to hear when she is back in the corner
  const arrived = useRef<() => void>(undefined)
  const [speech, setSpeech] = useState<string | null>(null)
  const [looking, setLooking] = useState<"left" | "right">("left")
  const [sleeping, setSleeping] = useState(false)

  const [action, setAction] = useState<"idle" | "wake" | Gesture>("idle")
  // whether she is asleep, for the code below that runs outside of a render
  const asleep = useRef(false)
  const [tap, setTap] = useState(0)
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

    // A line she could not say when it happened: she was out of the corner, or a page opened
    // right after she spoke. It is kept for a few seconds and said when she can. Only the latest
    // one is kept, so three pages opened in a row get one line, for the page the visitor is on.
    let waiting: { event: PetEvent; at: number } | null = null
    let retry: ReturnType<typeof setTimeout> | undefined
    const later = () => {
      const held = waiting
      waiting = null
      if (held && Date.now() - held.at <= WAITING_MS) say(held.event)
    }
    arrived.current = later

    const say = (event: PetEvent) => {
      const now = Date.now()
      // she is not in the corner to say it
      if (where.current !== "here") {
        waiting = { event, at: now }
        return
      }
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
  }, [])

  // The trip out of the corner and back, one timer per leg. A change of mind in the middle (the
  // footer scrolled past and back) drops the timer and starts the other way from where she is.
  useEffect(() => {
    const go = (to: Presence) => {
      where.current = to
      setPresence(to)
      if (to === "here") arrived.current?.()
    }
    const walk = ([[to, ms], ...rest]: [Presence, number][]) => {
      go(to)
      if (rest.length) trip.current = setTimeout(() => walk(rest), ms)
    }
    trip.current = setTimeout(() => {
      if (away) {
        if (where.current === "gone") return
        // whatever she was doing, she stops it to go
        clearTimeout(back.current)
        setAction("idle")
        setSpeech(null)
        asleep.current = false
        setSleeping(false)
        if (reduce) return go("gone")
        // the sheets face right, and so does the way out
        setLooking("right")
        walk([
          ["leaving", OUT_MS],
          ["walkingOut", WALK_MS],
          ["gone", 0],
        ])
        return
      }
      if (where.current === "here") return
      if (reduce) return go("here")
      // she comes back the way she left, so she walks facing left
      setLooking("left")
      walk([
        ["walkingIn", WALK_MS],
        ["settling", SETTLE_MS],
        ["here", 0],
      ])
    }, 0)
    return () => clearTimeout(trip.current)
  }, [away, reduce])

  const here = presence === "here"
  // sitting in the corner with nothing else going on
  const resting = here && action === "idle" && !sleeping

  return (
    <div className="st-abi" data-presence={presence}>
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
            data-hidden={resting ? undefined : ""}
            style={{ "--st-abi-sheet": `url(${sheet.src})` } as CSSProperties}
          />
          {presence === "leaving" ? (
            <span
              aria-hidden
              className="st-abi-out"
              style={{ "--st-abi-sheet": `url(${leaving.src})` } as CSSProperties}
            />
          ) : null}
          {presence === "walkingOut" || presence === "walkingIn" ? (
            <span
              aria-hidden
              className="st-abi-gait"
              style={{ "--st-abi-sheet": `url(${walking.src})` } as CSSProperties}
            />
          ) : null}
          {presence === "settling" ? (
            <span
              aria-hidden
              className="st-abi-settle"
              style={{ "--st-abi-sheet": `url(${stopping.src})` } as CSSProperties}
            />
          ) : null}
          {here && sleeping && action === "idle" ? (
            <span
              aria-hidden
              className="st-abi-sleep"
              style={{ "--st-abi-sheet": `url(${sleepingSheet.src})` } as CSSProperties}
            />
          ) : null}
          {here && action === "confused" ? (
            <span
              key={tap}
              aria-hidden
              className="st-abi-confused"
              style={{ "--st-abi-sheet": `url(${confused.src})` } as CSSProperties}
            />
          ) : null}
          {here && action === "happy" ? (
            <span
              key={tap}
              aria-hidden
              className="st-abi-happy"
              style={{ "--st-abi-sheet": `url(${happy.src})` } as CSSProperties}
            />
          ) : null}
          {here && action === "jump" ? (
            <span
              key={tap}
              aria-hidden
              className="st-abi-jump"
              style={{ "--st-abi-sheet": `url(${jumping.src})` } as CSSProperties}
            />
          ) : null}
          {here && action === "wake" ? (
            <span
              key={tap}
              aria-hidden
              className="st-abi-wake"
              style={{ "--st-abi-sheet": `url(${waking.src})` } as CSSProperties}
            />
          ) : null}
          {here && action === "angry" ? (
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
