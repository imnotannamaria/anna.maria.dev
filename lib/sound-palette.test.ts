import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { SOUND_EFFECTS } from "./sound-effects"

const SOUNDS = join(process.cwd(), "public", "sounds")
const manifest = JSON.parse(readFileSync(join(SOUNDS, "manifest.json"), "utf8")) as Record<
  string,
  { prompt: string; model: string; generatedAt: string; plan: string }
>
const effects = Object.entries(SOUND_EFFECTS)

describe("the sound palette", () => {
  it("is three sounds: more were tried and taken out, and a fourth is a decision", () => {
    expect(Object.keys(SOUND_EFFECTS)).toEqual(["click", "success", "error"])
  })

  it("says when each sound plays, and keeps the prompt that made it", () => {
    for (const [name, effect] of effects) {
      expect(effect.moment.length, name).toBeGreaterThan(10)
      expect(effect.prompt.length, name).toBeGreaterThan(20)
      expect(effect.volume, name).toBeGreaterThan(0)
      expect(effect.volume, name).toBeLessThanOrEqual(0.5)
    }
  })

  it("has one file each, and no other file sits in public/sounds", () => {
    const files: string[] = effects.map(([, effect]) => effect.file)
    expect(new Set(files).size).toBe(files.length)
    const present = readdirSync(SOUNDS).filter((name) => /\.(mp3|wav|ogg|m4a)$/.test(name))
    // a file the palette does not know is a sound nobody wrote a prompt, a moment or a source for
    expect(present.filter((name) => !files.includes(name))).toEqual([])
  })

  it("has a recorded source for every file that is there", () => {
    for (const [name, effect] of effects) {
      if (!existsSync(join(SOUNDS, effect.file))) continue
      const entry = manifest[effect.file]
      expect(entry, `${name}: ${effect.file} is not in manifest.json`).toBeDefined()
      expect(entry.prompt, name).toBe(effect.prompt)
      expect(entry.generatedAt, name).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      // the plan decides the license (docs/sound-rights.md), so it is never left unsaid
      expect(entry.plan, name).toMatch(/^(free|paid)$/)
    }
  })

  it("keeps every sound small: a file is loaded in full on the first gesture", () => {
    for (const [name, effect] of effects) {
      const path = join(SOUNDS, effect.file)
      if (existsSync(path)) expect(statSync(path).size, name).toBeLessThan(40 * 1024)
    }
  })
})

/**
 * The click sound is one listener on the document, and it hears what is a button, or says it is
 * one. A control made of something else would be silent without anybody deciding that, so a
 * click handler on anything but a button or a link fails here. Give it a role and the document
 * covers it (see CLICKABLE in components/ui/sound-feedback.ts), make it a button, or say it is
 * silent on purpose with `data-sound="off"`.
 */
describe("what can be clicked", () => {
  const ROOTS = ["components", "app"]
  // entrepta is not this site's to change
  const SKIP = [join("app", "components", "entrepta")]

  const files = (dir: string): string[] =>
    readdirSync(join(process.cwd(), dir), { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name)
      if (SKIP.some((skip) => path.startsWith(skip)) || entry.name === "node_modules") return []
      if (entry.isDirectory()) return files(path)
      return path.endsWith(".tsx") ? [path] : []
    })

  /** Every JSX opening tag, its name and the text up to the `>` that closes it (braces skipped). */
  function tags(source: string): { name: string; text: string }[] {
    const found: { name: string; text: string }[] = []
    for (const match of source.matchAll(/<([A-Za-z][\w.]*)(?=[\s/>])/g)) {
      let depth = 0
      let i = match.index + match[0].length
      for (; i < source.length; i++) {
        const c = source[i]
        if (c === "{") depth++
        else if (c === "}") depth--
        else if (c === ">" && depth === 0 && source[i - 1] !== "=") break
      }
      found.push({ name: match[1], text: source.slice(match.index, i) })
    }
    return found
  }

  it("is a button, a link or a field, or it says what it is", () => {
    const loose: string[] = []
    for (const path of ROOTS.flatMap(files)) {
      for (const { name, text } of tags(readFileSync(join(process.cwd(), path), "utf8"))) {
        if (!/\bonClick\b/.test(text)) continue
        // a plain element (`motion.button` is a button too): a button, a link and a field are
        // fine, anything else needs a role, or to say it is silent on purpose
        const tag = name.split(".").pop() ?? name
        if (
          !/^[a-z]/.test(name) ||
          /^(button|a|form|input|textarea|select|label|summary)$/.test(tag)
        ) {
          continue
        }
        if (/\brole="(button|tab|menuitem|switch|checkbox|radio|option)"/.test(text)) continue
        if (/\bdata-sound="off"/.test(text)) continue
        loose.push(`${path}: <${name}>`)
      }
    }
    expect(loose).toEqual([])
  })
})
