"use client"

import { useSyncExternalStore } from "react"
import { NextIntlClientProvider } from "next-intl"
import { HTML_LANG, localeOfPath } from "@/lib/i18n/locales"
import { state as en } from "@/messages/en.json"
import { state as pt } from "@/messages/pt.json"
import { ThemeScript } from "@/app/components/entrepta/theme-switcher"
import { ScreenError } from "@/components/site/frame/screen-state"
import { fontVariables } from "./fonts"
import "./globals.css"

const subscribe = () => () => {}
const browserLocale = () => localeOfPath(window.location.pathname) ?? "en"
const serverLocale = () => "en" as const

/**
 * The root layout itself failed, so this brings its own html and body, with the same fonts and
 * the same light or dark mode the visitor had.
 */
export default function GlobalError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const locale = useSyncExternalStore(subscribe, browserLocale, serverLocale)
  return (
    <html lang={HTML_LANG[locale]} suppressHydrationWarning className={fontVariables}>
      <head>
        <ThemeScript />
      </head>
      <body>
        <NextIntlClientProvider
          locale={locale}
          messages={{ state: locale === "pt" ? pt : en }}
          timeZone="UTC"
        >
          <ScreenError {...props} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
