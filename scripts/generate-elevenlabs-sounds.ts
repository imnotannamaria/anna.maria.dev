import { constants } from "node:fs"
import { access, mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { SOUND_EFFECTS } from "../lib/sound-effects"

const OUTPUT_DIR = join("public", "sounds")
// Where each file came from: the prompt, the model and the day. Written by this script.
const MANIFEST = join(OUTPUT_DIR, "manifest.json")
const MODEL = "eleven_text_to_sound_v2"
const FORCE = process.argv.includes("--force")
const requestedEffects = process.argv.slice(2).filter((argument) => argument !== "--force")

const allEffectNames = Object.keys(SOUND_EFFECTS) as Array<keyof typeof SOUND_EFFECTS>
const unknownEffects = requestedEffects.filter(
  (name) => !allEffectNames.includes(name as keyof typeof SOUND_EFFECTS),
)

if (unknownEffects.length > 0) {
  throw new Error(
    `Unknown sound effect: ${unknownEffects.join(", ")}. Use one of: ${allEffectNames.join(", ")}`,
  )
}

const effectsToGenerate = requestedEffects.length
  ? (requestedEffects as Array<keyof typeof SOUND_EFFECTS>)
  : allEffectNames

/** Standalone scripts do not get Next's env loading, so support the local dev convention. */
async function loadEnv() {
  try {
    for (const line of (await readFile(".env.local", "utf8")).split("\n")) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "")
      }
    }
  } catch {
    // It is also valid to export ELEVENLABS_API_KEY before invoking this script.
  }
}

async function exists(path: string) {
  try {
    await access(path, constants.F_OK)
    return true
  } catch {
    return false
  }
}

/** Keeps `manifest.json`: one entry per sound, rewritten when the sound is generated again. */
async function record(name: keyof typeof SOUND_EFFECTS) {
  const effect = SOUND_EFFECTS[name]
  let manifest: Record<string, unknown> = {}
  try {
    manifest = JSON.parse(await readFile(MANIFEST, "utf8")) as Record<string, unknown>
  } catch {
    // the first sound makes the file
  }
  manifest[effect.file] = {
    prompt: effect.prompt,
    model: MODEL,
    promptInfluence: effect.promptInfluence,
    durationSeconds: effect.durationSeconds,
    generatedAt: new Date().toISOString().slice(0, 10),
    // the plan of the ElevenLabs account at the time, which only a person can know
    plan: process.env.ELEVENLABS_PLAN ?? "unknown",
  }
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`)
}

async function generate(name: keyof typeof SOUND_EFFECTS, apiKey: string) {
  const effect = SOUND_EFFECTS[name]
  const target = join(OUTPUT_DIR, effect.file)

  if (!FORCE && (await exists(target))) {
    console.log(`skip ${effect.file} (already exists; pass --force to replace it)`)
    return
  }

  const response = await fetch(
    "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_22050_32",
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: effect.prompt,
        duration_seconds: effect.durationSeconds,
        prompt_influence: effect.promptInfluence,
        model_id: MODEL,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`${name}: ElevenLabs returned ${response.status} — ${await response.text()}`)
  }

  const audio = Buffer.from(await response.arrayBuffer())
  await writeFile(target, audio)
  await record(name)
  const cost = response.headers.get("character-cost")
  console.log(
    `generated ${effect.file} (${Math.ceil(audio.byteLength / 1024)} KB${cost ? `; ${cost} credits` : ""})`,
  )
}

async function main() {
  await loadEnv()
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set")

  await mkdir(OUTPUT_DIR, { recursive: true })
  for (const name of effectsToGenerate) {
    await generate(name, apiKey)
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
