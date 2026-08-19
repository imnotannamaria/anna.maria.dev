// ─── Site config — single source for identity, contact & socials ─────────────

import { CAREER_START_DATE } from "@/lib/experience"

export const siteConfig = {
  name: "Anna Maria",
  email: "anna.maria.dev.br@gmail.com",
  githubUser: "imnotannamaria",
  careerStart: CAREER_START_DATE,
  socials: {
    github: "https://github.com/imnotannamaria",
    linkedin: "https://linkedin.com/in/imnotannamaria",
    x: "https://x.com/annamariadevbr",
  },
} as const

export type SiteConfig = typeof siteConfig

/**
 * The colour themes, and the single source of how many there are.
 *
 * These lived in `app/layout.tsx` beside the `<ThemeSwitcher>` that consumes them, which was
 * fine until something other than the layout needed to know: `/components` prints the count in
 * its header, and a page importing from a layout file to read a constant is a worse arrangement
 * than the constant living with the rest of the site's identity.
 *
 * Only `--fg-brand` and its derivatives change between them — see the theme blocks at the
 * bottom of `app/globals.css`. A new theme needs a `--fg-on-brand` and a `--fg-brand-on-tint`
 * measured alongside it, because neither can be derived.
 */
export const THEMES = [
  { id: "entrepta", label: "entrepta", color: "#7c6bff", lightColor: "#6b5bff" },
  { id: "blossom", label: "blossom", color: "#cc2e36", lightColor: "#b02028" },
  { id: "marmalade", label: "marmalade", color: "#ff8213", lightColor: "#e06800" },
  { id: "julia", label: "julia", color: "#e85a8a", lightColor: "#cc3a6a" },
  { id: "ivy", label: "ivy", color: "#35a365", lightColor: "#258a50" },
  { id: "bosco", label: "bosco", color: "#2563eb", lightColor: "#1d4ed8" },
] as const
