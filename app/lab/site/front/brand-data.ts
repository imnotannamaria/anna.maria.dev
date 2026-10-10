import * as icons from "simple-icons"

export type FoundBrand = { path: string; color: string }

const clear = (text: string) => text.toLowerCase().replace(/[^a-z0-9+#]/g, "")

const byName = new Map<string, FoundBrand>()
for (const icon of Object.values(icons)) {
  if (typeof icon !== "object" || icon === null || !("path" in icon)) continue
  const brand = { path: icon.path, color: icon.hex }

  byName.set(clear(icon.slug), brand)
  if (!byName.has(clear(icon.title))) byName.set(clear(icon.title), brand)
}

const ALIASES: Record<string, string> = {
  next: "nextdotjs",
  nextjs: "nextdotjs",
  node: "nodedotjs",
  nodejs: "nodedotjs",
  tailwind: "tailwindcss",
  postgres: "postgresql",
  reactemail: "resend",
  reactnative: "react",
  wasm: "webassembly",
  ts: "typescript",
  js: "javascript",
}

export function findBrand(name: string): FoundBrand | null {
  const key = clear(name)
  return byName.get(ALIASES[key] ?? key) ?? null
}
