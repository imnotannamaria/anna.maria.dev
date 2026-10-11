import { Analytics } from "@vercel/analytics/next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations } from "next-intl/server"
import { ThemeScript } from "@/app/components/entrepta/theme-switcher"
import { Toaster } from "@/app/components/entrepta/toast"
import { TooltipProvider } from "@/app/components/entrepta/tooltip"
import { ButtonSoundFeedback } from "@/components/ui/sound-feedback"
import { HTML_LANG, type Locale } from "@/lib/i18n/locales"
import { fontVariables } from "./fonts"
import "./globals.css"

/**
 * The document every page is drawn in: fonts, the mode script, the providers and the toaster.
 * There are two root layouts, the site's (one per language) and the admin's, and both are this.
 */
export async function RootShell({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  const t = await getTranslations({ locale, namespace: "frame" })
  // every client component reads its words from here
  const messages = await getMessages({ locale })
  return (
    <html lang={HTML_LANG[locale]} suppressHydrationWarning className={fontVariables}>
      <head>
        <ThemeScript />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          {t("skip")}
        </a>

        {/* One provider for every tooltip on the site, so moving from one to the next skips the
            delay. The sidebar brings its own, nested, with a longer one for the rail. */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <TooltipProvider>{children}</TooltipProvider>
        </NextIntlClientProvider>

        {/* Bottom centre, where it covers nothing. Below 600px Sonner goes full width, so it
            rises above the phone's bar instead of over it. */}
        <Toaster
          position="bottom-center"
          offset={{ bottom: 48 }}
          mobileOffset={{ bottom: 96, left: 16, right: 16 }}
        />
        <ButtonSoundFeedback />

        {/* Vercel-only — the insights script 404s (and floods the console) off-platform */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  )
}
