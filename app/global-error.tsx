"use client"

import { ThemeScript } from "@/app/components/entrepta/theme-switcher"
import { ScreenError } from "@/components/site/frame/screen-state"
import { fontVariables } from "./fonts"
import "./globals.css"

/**
 * The root layout itself failed, so this brings its own html and body, with the same fonts and
 * the same light or dark mode the visitor had.
 */
export default function GlobalError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en" suppressHydrationWarning className={fontVariables}>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ScreenError {...props} />
      </body>
    </html>
  )
}
