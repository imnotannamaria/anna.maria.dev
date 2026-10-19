import { Inter, JetBrains_Mono, Newsreader } from "next/font/google"

// Self-hosted via next/font — no render-blocking @import, no Google Fonts request.
const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
  fallback: ["Times New Roman", "serif"],
})

const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  fallback: ["-apple-system", "system-ui", "sans-serif"],
})

// Upright only. Every italic on the site is the serif, and the mono italic was a preloaded
// font file on every page that nothing rendered.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  fallback: ["SF Mono", "Menlo", "monospace"],
})

/** The three font variables, for the `<html>` of the root layout and of the global error. */
export const fontVariables = `${serif.variable} ${sans.variable} ${mono.variable}`
