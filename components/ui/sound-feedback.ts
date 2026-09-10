"use client"

import { useEffect } from "react"
import { soundEffectSrc, type SoundEffectName } from "@/lib/sound-effects"

/**
 * Sound is supplementary feedback, never the only confirmation of an action. Keeping this
 * tiny helper at the call site also means the site has no audio provider, SDK, or telemetry.
 *
 * One Audio element per effect, reused across calls. A rapid double-click replaying the same
 * clip restarts it from zero instead of layering a second concurrent instance on top.
 */
const audioPool = new Map<SoundEffectName, HTMLAudioElement>()

export async function tryPlaySoundEffect(effect: SoundEffectName): Promise<boolean> {
  try {
    let audio = audioPool.get(effect)
    if (!audio) {
      audio = new Audio(soundEffectSrc(effect))
      audio.volume = effect === "error" ? 0.1 : 0.14
      audioPool.set(effect, audio)
    }
    audio.currentTime = 0
    await audio.play()
    return true
  } catch {
    // Audio is optional progressive enhancement. In environments without Audio, stay silent.
    return false
  }
}

export function playSoundEffect(effect: SoundEffectName) {
  void tryPlaySoundEffect(effect)
}

/** Plays a sound once when a state screen becomes visible (404s and error boundaries). */
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

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  return null
}
