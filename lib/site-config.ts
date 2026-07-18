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
