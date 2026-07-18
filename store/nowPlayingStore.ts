import { create } from "zustand"
import type { SimplifiedTrack } from "@/lib/spotify"

type Status = "idle" | "loading" | "playing" | "error" | "empty"

type NowPlayingState = {
  tracks: SimplifiedTrack[]
  currentIndex: number
  elapsedMs: number
  status: Status
  load: () => Promise<void>
  tick: () => void
}

export const useNowPlayingStore = create<NowPlayingState>((set, get) => ({
  tracks: [],
  currentIndex: 0,
  elapsedMs: 0,
  status: "idle",

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
    const { tracks, currentIndex, elapsedMs } = get()
    if (tracks.length === 0) return

    const current = tracks[currentIndex]
    const next = elapsedMs + 1000

    if (next >= current.durationMs) {
      set({
        elapsedMs: 0,
        currentIndex: (currentIndex + 1) % tracks.length,
      })
    } else {
      set({ elapsedMs: next })
    }
  },
}))
