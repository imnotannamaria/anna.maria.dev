import { useSyncExternalStore } from "react"

/**
 * Whether the site is muted: the choice of the speaker button in the header, kept across
 * visits. One switch for every sound the site makes on its own, the clicks and the playlist.
 */
const KEY = "site:muted"
const listeners = new Set<() => void>()

export function isMuted(): boolean {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(KEY) === "1"
  } catch {
    return false
  }
}

export function setMuted(muted: boolean) {
  try {
    if (muted) window.localStorage.setItem(KEY, "1")
    else window.localStorage.removeItem(KEY)
  } catch {
    // storage is off: the choice lasts for this page, through the listeners below
  }
  current = muted
  listeners.forEach((listener) => listener())
}

// what the listeners read, so a browser with storage off still follows the button
let current: boolean | null = null
const read = () => current ?? isMuted()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

/** The switch, for a component. On the server and on the first paint it is off. */
export function useMuted(): boolean {
  return useSyncExternalStore(subscribe, read, () => false)
}

/** The switch, for code that is not a component. */
export const muted = read
