"use client"

import { useEffect } from "react"
import { SOUND_EFFECTS, soundEffectSrc, type SoundEffectName } from "@/lib/sound-effects"
import { muted } from "@/lib/sound-muted"

/**
 * Sound is supplementary feedback, never the only confirmation of an action. Keeping this
 * tiny helper at the call site also means the site has no audio provider, SDK, or telemetry.
 *
 * Web Audio, not `<audio>`. An HTMLAudioElement goes through the media pipeline on every play,
 * and on a phone that is a delay you can hear: the click landed noticeably after the tap, and
 * the first one also waited for its file to download. Now the three files (about 8 KB) are
 * fetched when the browser is idle, decoded on the first touch, and played from memory, which
 * starts in the same frame as the click.
 *
 * One thing plays on its own, with no call from the component: the click of a button (any
 * control, see `CLICKABLE`). A component that wants another sound asks with `playSoundEffect`.
 *
 * The AudioContext is created only after the page has had a user gesture. One made before that
 * starts suspended and logs a console warning, which is noise on every page load for nothing.
 */

const EFFECTS = Object.keys(SOUND_EFFECTS) as SoundEffectName[]
/** What counts as a button: everything the visitor presses to make something happen. */
export const CLICKABLE = [
  "button",
  '[data-sound="click"]',
  '[role="button"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="option"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="radio"]',
  "summary",
  'input[type="checkbox"]',
  'input[type="radio"]',
  'input[type="submit"]',
  'input[type="button"]',
].join(", ")

let context: AudioContext | null = null
const bytes = new Map<SoundEffectName, Promise<ArrayBuffer | null>>()
const buffers = new Map<SoundEffectName, Promise<AudioBuffer | null>>()
/** The node each effect is playing, so a rapid second click restarts it instead of layering. */
const playing = new Map<SoundEffectName, AudioBufferSourceNode>()

/**
 * Why a sound did not play, said once in the console while developing. A sound that is silent
 * for one of these reasons looks exactly like one that is broken, and from outside they are
 * not the same thing: the site is muted, nobody has touched the page yet, the file is missing.
 */
function why(effect: SoundEffectName, reason: string): false {
  if (process.env.NODE_ENV === "development") console.debug(`[sound] ${effect}: ${reason}`)
  return false
}

/** How long a file that did not load is left alone before the next play tries it again. */
const RETRY_MS = 5000
const failedAt = new Map<SoundEffectName, number>()

function fetchBytes(effect: SoundEffectName): Promise<ArrayBuffer | null> {
  const failed = failedAt.get(effect)
  if (failed !== undefined && Date.now() - failed < RETRY_MS) return Promise.resolve(null)
  let request = bytes.get(effect)
  if (!request) {
    request = fetch(soundEffectSrc(effect))
      .then((response) => (response.ok ? response.arrayBuffer() : null))
      .catch(() => null)
      // A file that did not load is not remembered as missing for good: the page that asked was
      // open before the file existed (a sound just generated), or the network blinked.
      .then((data) => {
        if (!data) {
          bytes.delete(effect)
          failedAt.set(effect, Date.now())
        } else failedAt.delete(effect)
        return data
      })
    bytes.set(effect, request)
  }
  return request
}

function audioContext(): AudioContext | null {
  if (context) return context
  if (typeof window === "undefined" || typeof window.AudioContext === "undefined") return null
  // `userActivation` is missing in older browsers; there, fall through and let them decide.
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return null
  context = new AudioContext()
  return context
}

function decoded(effect: SoundEffectName): Promise<AudioBuffer | null> {
  let buffer = buffers.get(effect)
  if (!buffer) {
    const ctx = audioContext()
    // Not cached: without a context yet, the next call after a gesture should try again.
    if (!ctx) return Promise.resolve(null)
    buffer = fetchBytes(effect)
      // `slice`, because decodeAudioData detaches the buffer it is given.
      .then((data) => (data ? ctx.decodeAudioData(data.slice(0)) : null))
      .catch(() => null)
      .then((decodedBuffer) => {
        // not kept when it failed, for the same reason as the bytes above
        if (!decodedBuffer && buffers.get(effect) === buffer) buffers.delete(effect)
        return decodedBuffer
      })
    buffers.set(effect, buffer)
  }
  return buffer
}

export async function tryPlaySoundEffect(effect: SoundEffectName): Promise<boolean> {
  try {
    if (muted()) return why(effect, "the site is muted (the speaker button in the header)")
    const ctx = audioContext()
    if (!ctx) return why(effect, "no gesture on the page yet, or no Web Audio here")
    // Called from a click, this is what unlocks audio on iOS. `!== "running"` rather than
    // `=== "suspended"`: Safari parks the context as "interrupted" after the tab has been in
    // the background. A source started while the context resumes plays as soon as it runs.
    if (ctx.state !== "running") void ctx.resume()

    const buffer = await decoded(effect)
    if (!buffer) return why(effect, `${soundEffectSrc(effect)} did not load or did not decode`)

    try {
      playing.get(effect)?.stop()
    } catch {
      // Already finished.
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const gain = ctx.createGain()
    gain.gain.value = SOUND_EFFECTS[effect].volume
    source.connect(gain).connect(ctx.destination)
    source.onended = () => {
      if (playing.get(effect) === source) playing.delete(effect)
    }
    source.start()
    playing.set(effect, source)
    return true
  } catch (error) {
    // Audio is optional progressive enhancement. Where it fails, stay silent.
    return why(effect, `threw ${String(error)}`)
  }
}

export function playSoundEffect(effect: SoundEffectName) {
  void tryPlaySoundEffect(effect)
}

/**
 * Plays a sound once when a state screen becomes visible (404s and error boundaries). Opened
 * straight from a URL, before any gesture, it stays silent, as browsers require anyway.
 */
export function SoundEffectOnMount({ effect }: { effect: SoundEffectName }) {
  useEffect(() => {
    playSoundEffect(effect)
  }, [effect])

  return null
}

/** Whether a control is switched off, or sits in a part of the page that makes its own sound. */
export function isOff(control: HTMLElement): boolean {
  return (
    (control instanceof HTMLButtonElement && control.disabled) ||
    control.getAttribute("aria-disabled") === "true" ||
    control.hasAttribute("data-disabled") ||
    control.closest('[data-sound="off"]') !== null
  )
}

/**
 * The site uses real buttons for interactive controls, so one document-level listener covers
 * the chrome, filters, dialogs and forms without teaching each component about audio. Controls
 * inside `[data-sound="off"]` opt out — the piano already makes the sound the button represents.
 * A link is not a button: one that behaves like one (the sidebar, a link
 * drawn as a button) says so with `data-sound="click"`.
 */
export function ButtonSoundFeedback() {
  useEffect(() => {
    // The bytes download while the browser has nothing better to do, off the critical path.
    const prefetch = () => EFFECTS.forEach((effect) => void fetchBytes(effect))
    // Safari only gained requestIdleCallback recently; a timeout stands in for it there.
    let idle: number | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    if (typeof window.requestIdleCallback === "function") {
      idle = window.requestIdleCallback(prefetch, { timeout: 4000 })
    } else {
      timer = setTimeout(prefetch, 2000)
    }

    // The first touch or key decodes them, so the click that follows has nothing left to wait
    // for. On a touchscreen `pointerdown` does not count as a gesture yet; the decode then
    // happens on the click itself, from bytes that are already here.
    const warmUp = () => EFFECTS.forEach((effect) => void decoded(effect))

    // A control that already clicked on the way down (see handlePress), so the click event that
    // may follow on the same control does not play a second time.
    let pressed: Element | null = null
    let pressedAt = 0

    function handleClick(event: MouseEvent) {
      if (!event.isTrusted || !(event.target instanceof Element)) return

      const control = event.target.closest(CLICKABLE)
      if (!(control instanceof HTMLElement) || isOff(control)) return
      // only the click of that same press: a second after it, the control clicks again as usual
      const sameGesture = control === pressed && performance.now() - pressedAt < 1000
      pressed = null
      if (sameGesture) return

      playSoundEffect("click")
    }

    // A select does not wait for a click: it opens when the pointer goes down and picks when it
    // comes up, and the list closes before any click event exists. So those two are heard here.
    // The keyboard is the same story: Enter and space on an option are handled by the list, with
    // no click. (A button gets a real click from both, and is heard above.)
    function handlePress(event: PointerEvent | KeyboardEvent) {
      if (!event.isTrusted || !(event.target instanceof Element)) return
      const selector = event.type === "pointerdown" ? '[role="combobox"]' : '[role="option"]'
      if (event instanceof KeyboardEvent && event.key !== "Enter" && event.key !== " ") return
      const control = event.target.closest(selector)
      if (!(control instanceof HTMLElement) || isOff(control)) return
      if (event.type === "pointerdown") {
        pressed = control
        pressedAt = performance.now()
      }
      playSoundEffect("click")
    }

    document.addEventListener("pointerdown", warmUp, { once: true, passive: true, capture: true })
    document.addEventListener("keydown", warmUp, { once: true, capture: true })
    document.addEventListener("click", handleClick)
    document.addEventListener("pointerdown", handlePress, { passive: true })
    document.addEventListener("pointerup", handlePress, { passive: true })
    document.addEventListener("keydown", handlePress, { passive: true })
    return () => {
      if (idle !== undefined) window.cancelIdleCallback(idle)
      if (timer !== undefined) clearTimeout(timer)
      document.removeEventListener("pointerdown", warmUp, { capture: true })
      document.removeEventListener("keydown", warmUp, { capture: true })
      document.removeEventListener("click", handleClick)
      document.removeEventListener("pointerdown", handlePress)
      document.removeEventListener("pointerup", handlePress)
      document.removeEventListener("keydown", handlePress)
    }
  }, [])

  return null
}
