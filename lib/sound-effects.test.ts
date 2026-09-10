import { describe, expect, it } from "vitest"
import { SOUND_EFFECTS, soundEffectSrc } from "@/lib/sound-effects"

describe("sound effects", () => {
  it("keeps generated UI sounds short and served from local static paths", () => {
    for (const [name, effect] of Object.entries(SOUND_EFFECTS)) {
      expect(effect.durationSeconds).toBeGreaterThanOrEqual(0.5)
      expect(effect.durationSeconds).toBeLessThanOrEqual(1)
      expect(effect.promptInfluence).toBeGreaterThanOrEqual(0)
      expect(effect.promptInfluence).toBeLessThanOrEqual(1)
      expect(soundEffectSrc(name as keyof typeof SOUND_EFFECTS)).toBe(`/sounds/${effect.file}`)
    }
  })
})
