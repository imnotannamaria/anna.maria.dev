import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * Every form on the site is validated by a zod schema, and by nothing else. The browser's own
 * validation (`required`, `type="email"` and friends) answers first when it is left on: a bubble
 * in the browser's language and style, before the schema is asked anything. The contact postcard
 * shipped that way, with a schema nobody ever reached on an empty field.
 */
const ROOTS = [
  "components/site",
  "components/wall",
  "components/admin",
  "app/admin",
  "app/[locale]",
]
const files = (dir: string): string[] =>
  readdirSync(join(process.cwd(), dir), { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
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

const sources = ROOTS.flatMap(files).map((path) => {
  const source = readFileSync(join(process.cwd(), path), "utf8")
  return { path, source, tags: tags(source) }
})
// a form with fields: one that only runs a server action (sign out) has nothing to validate
const forms = sources.flatMap(({ path, source, tags }) =>
  tags
    .filter(({ name, text }) => /^(motion\.)?form$/.test(name) && !/\baction=/.test(text))
    .map(({ text }) => ({ path, source, text })),
)

describe("the forms", () => {
  it("are found: the scan is looking at something", () => {
    expect(forms.length).toBeGreaterThanOrEqual(6)
  })

  it("switch the browser's validation off", () => {
    expect(
      forms.filter(({ text }) => !/\bnoValidate\b/.test(text)).map(({ path }) => path),
    ).toEqual([])
  })

  it("are checked by a zod schema", () => {
    expect(
      forms
        .filter(({ source }) => !/\.safeParse\(|zodResolver\(/.test(source))
        .map(({ path }) => path),
    ).toEqual([])
  })

  it("leave no native constraint on a field", () => {
    const native: string[] = []
    for (const { path, tags } of sources) {
      for (const { name, text } of tags) {
        if (!/^(input|textarea|select|Input|Textarea)$/.test(name)) continue
        // `aria-required` is fine: it tells a screen reader, and stops nothing. So are `min`,
        // `max` and `step` on a number field: with `noValidate` they only shape the control
        if (/(?<![-\w])(required|pattern|minLength)(?=[\s=/>])/.test(text)) {
          native.push(`${path}: <${name}>`)
        }
      }
    }
    expect(native).toEqual([])
  })
})
