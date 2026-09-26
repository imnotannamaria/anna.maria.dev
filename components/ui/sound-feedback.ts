"use client"

import { useEffect } from "react"
import { SOUND_EFFECTS, soundEffectSrc, type SoundEffectName } from "@/lib/sound-effects"

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
 * The AudioContext is created only after the page has had a user gesture. One made before that
 * starts suspended and logs a console warning, which is noise on every page load for nothing.
 */

const EFFECTS = Object.keys(SOUND_EFFECTS) as SoundEffectName[]
const VOLUME: Record<SoundEffectName, number> = { click: 0.14, success: 0.14, error: 0.1 }

let context: AudioContext | null = null
const bytes = new Map<SoundEffectName, Promise<ArrayBuffer | null>>()
const buffers = new Map<SoundEffectName, Promise<AudioBuffer | null>>()
/** The node each effect is playing, so a rapid second click restarts it instead of layering. */
const playing = new Map<SoundEffectName, AudioBufferSourceNode>()

function fetchBytes(effect: SoundEffectName): Promise<ArrayBuffer | null> {
  let request = bytes.get(effect)
  if (!request) {
    request = fetch(soundEffectSrc(effect))
      .then((response) => (response.ok ? response.arrayBuffer() : null))
      .catch(() => null)
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
    buffers.set(effect, buffer)
  }
  return buffer
}

export async function tryPlaySoundEffect(effect: SoundEffectName): Promise<boolean> {
  try {
    const ctx = audioContext()
    if (!ctx) return false
    // Called from a click, this is what unlocks audio on iOS. `!== "running"` rather than
    // `=== "suspended"`: Safari parks the context as "interrupted" after the tab has been in
    // the background. A source started while the context resumes plays as soon as it runs.
    if (ctx.state !== "running") void ctx.resume()

    const buffer = await decoded(effect)
    if (!buffer) return false

    try {
      playing.get(effect)?.stop()
    } catch {
      // Already finished.
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const gain = ctx.createGain()
    gain.gain.value = VOLUME[effect]
    source.connect(gain).connect(ctx.destination)
    source.onended = () => {
      if (playing.get(effect) === source) playing.delete(effect)
    }
    source.start()
    playing.set(effect, source)
    return true
  } catch {
    // Audio is optional progressive enhancement. Where it fails, stay silent.
    return false
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

/**
 * The site uses real buttons for interactive controls, so one document-level listener covers
 * the chrome, filters, dialogs and forms without teaching each component about audio. Controls
 * inside `[data-sound="off"]` opt out — the piano already makes the sound the button represents.
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

    function handleClick(event: MouseEvent) {
      if (!event.isTrusted || !(event.target instanceof Element)) return

      const button = event.target.closest('button, [data-sound="click"]')
      if (
        !(button instanceof HTMLElement) ||
        (button instanceof HTMLButtonElement && button.disabled) ||
        button.getAttribute("aria-disabled") === "true" ||
        button.closest('[data-sound="off"]')
      ) {
        return
      }

      playSoundEffect("click")
    }

    document.addEventListener("pointerdown", warmUp, { once: true, passive: true, capture: true })
    document.addEventListener("keydown", warmUp, { once: true, capture: true })
    document.addEventListener("click", handleClick)
    return () => {
      if (idle !== undefined) window.cancelIdleCallback(idle)
      if (timer !== undefined) clearTimeout(timer)
      document.removeEventListener("pointerdown", warmUp, { capture: true })
      document.removeEventListener("keydown", warmUp, { capture: true })
      document.removeEventListener("click", handleClick)
    }
  }, [])

  return null
}
