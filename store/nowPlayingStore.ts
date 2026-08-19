import { create } from "zustand"
import type { SimplifiedTrack } from "@/lib/spotify"

type Status = "idle" | "loading" | "playing" | "error" | "empty"

type NowPlayingState = {
  tracks: SimplifiedTrack[]
  currentIndex: number
  elapsedMs: number
  status: Status
  /**
   * Whether the record is turning. Separate from `status`, which is about whether the data
   * arrived — a loaded playlist sitting paused is `status: "playing"`, `running: false`, and
   * collapsing the two would mean a paused card could not tell itself apart from a broken one.
   */
  running: boolean
  load: () => Promise<void>
  tick: () => void
  toggle: () => void
  next: () => void
  prev: () => void
  /** Playback position, set from the <audio> element when a preview is actually playing. */
  setElapsed: (ms: number) => void
}

export const useNowPlayingStore = create<NowPlayingState>((set, get) => ({
  tracks: [],
  currentIndex: 0,
  elapsedMs: 0,
  status: "idle",
  // Starts turning on its own — the card has always animated on arrival, and a record that
  // needs a click before it does anything reads as broken in a bento grid nobody clicked into.
  running: true,

  load: async () => {
    set({ status: "loading" })
    try {
      const res = await fetch("/api/now-playing")
      if (!res.ok) throw new Error("fetch failed")
      const tracks: SimplifiedTrack[] = await res.json()
      if (!Array.isArray(tracks) || tracks.length === 0) {
        set({ status: "empty", tracks: [] })
        return
      }
      set({ tracks, status: "playing", currentIndex: 0, elapsedMs: 0 })
    } catch {
      set({ status: "error" })
    }
  },

  tick: () => {
    const { tracks, currentIndex, elapsedMs, running } = get()
    if (tracks.length === 0 || !running) return

    const current = tracks[currentIndex]
    const next = elapsedMs + 1000

    if (next >= current.durationMs) {
      set({ elapsedMs: 0, currentIndex: (currentIndex + 1) % tracks.length })
    } else {
      set({ elapsedMs: next })
    }
  },

  toggle: () => set((s) => ({ running: !s.running })),

  // Wrap in both directions, so the controls are never dead ends at the edges of the list.
  next: () =>
    set((s) => ({
      currentIndex: s.tracks.length === 0 ? 0 : (s.currentIndex + 1) % s.tracks.length,
      elapsedMs: 0,
    })),

  prev: () =>
    set((s) => ({
      currentIndex:
        s.tracks.length === 0 ? 0 : (s.currentIndex - 1 + s.tracks.length) % s.tracks.length,
      elapsedMs: 0,
    })),

  setElapsed: (ms) => set({ elapsedMs: ms }),
}))
