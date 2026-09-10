/**
 * The source of truth for the small, deliberately local sound palette.
 *
 * These prompts are consumed only by `scripts/generate-elevenlabs-sounds.ts`.
 * The browser receives the resulting MP3s from `/public`, never an ElevenLabs key,
 * SDK, or runtime API request.
 */
export const SOUND_EFFECTS = {
  click: {
    file: "click.mp3",
    durationSeconds: 0.5,
    promptInfluence: 0.65,
    prompt:
      "A single soft mechanical keyboard key press for a calm code editor interface, muted and tactile, very short, no voice, no music, no reverb",
  },
  success: {
    file: "success.mp3",
    durationSeconds: 0.7,
    promptInfluence: 0.7,
    prompt:
      "A cheerful bright UI success sound: three tiny ascending sparkling synth notes with a clean shimmering finish, joyful and polished for a code editor interface, very short, no voice, no ambient music, no percussion",
  },
  error: {
    file: "error.mp3",
    durationSeconds: 0.6,
    promptInfluence: 0.7,
    prompt:
      "A soft, low, muted UI warning tone for a code editor interface, brief and helpful, not alarming, no voice, no music, no percussion",
  },
} as const

export type SoundEffectName = keyof typeof SOUND_EFFECTS

export function soundEffectSrc(effect: SoundEffectName) {
  return `/sounds/${SOUND_EFFECTS[effect].file}`
}
