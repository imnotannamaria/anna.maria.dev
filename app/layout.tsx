import type { Metadata } from "next"
import { Newsreader, Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Titlebar } from "@/components/chrome/titlebar"
import { Sidebar } from "@/components/chrome/sidebar"
import { StatusBar, StatusBarItem, StatusBarSeparator } from "@/app/components/entrepta/status-bar"
import { ThemeScript } from "@/app/components/entrepta/theme-switcher"
import { ThemeSwitcher } from "@/app/components/entrepta/theme-switcher"
import { Toaster } from "@/app/components/entrepta/toast"
import { TooltipProvider } from "@/app/components/entrepta/tooltip"
import { ButtonSoundFeedback } from "@/components/ui/sound-feedback"
import { THEMES } from "@/lib/site-config"
import { calcYearsOfExp } from "@/lib/experience"
import "./globals.css"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://annamaria.app"

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

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Anna Maria",
    template: "%s · Anna Maria",
  },
  description: `I build things end to end, from the UI and the front, web or mobile, to shipping. About ${calcYearsOfExp()} years in.`,
  openGraph: {
    siteName: "Anna Maria",
    locale: "en_US",
    type: "website",
    url: baseUrl,
    images: [
      {
        url: "/images/og-cover.png",
        width: 1200,
        height: 630,
        alt: "Anna Maria — Full-stack Software Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/og-cover.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          skip to content
        </a>

        {/* One provider for every tooltip on the site, so moving from one to the next skips the
            delay. The sidebar brings its own, nested, with a longer one for the rail. */}
        <TooltipProvider>
          {/* Editor chrome — fixed full-viewport grid. Titlebar 40px, content, status bar 28px. */}
          <div className="fixed inset-0 grid grid-cols-[minmax(0,1fr)] grid-rows-[40px_1fr_28px]">
            <Titlebar />

            <div className="grid min-w-0 grid-cols-[56px_minmax(0,1fr)] overflow-hidden">
              <Sidebar />
              <main
                id="main-content"
                tabIndex={-1}
                className="min-w-0 overflow-x-hidden overflow-y-auto outline-none"
              >
                {children}
              </main>
            </div>

            {/* `static` makes it the last row of the editor grid rather than pinned to the viewport. */}
            <StatusBar
              position="static"
              left={
                <>
                  <StatusBarItem>◆ annamaria.app</StatusBarItem>
                  <StatusBarSeparator />
                  <StatusBarItem>main ✓</StatusBarItem>
                </>
              }
              right={
                <>
                  <StatusBarItem className="gap-1.5">
                    <kbd
                      className="text-mono-xs rounded-[3px] px-1.5 py-px"
                      style={{
                        border: "1px solid color-mix(in srgb, var(--fg-on-brand) 30%, transparent)",
                      }}
                    >
                      ⌘K
                    </kbd>
                    <span aria-hidden className="opacity-60">
                      /
                    </span>
                    <kbd
                      className="text-mono-xs rounded-[3px] px-1.5 py-px"
                      style={{
                        border: "1px solid color-mix(in srgb, var(--fg-on-brand) 30%, transparent)",
                      }}
                    >
                      Ctrl K
                    </kbd>
                    <span className="opacity-80">palette</span>
                  </StatusBarItem>
                  <StatusBarSeparator />
                  <StatusBarItem>UTF-8</StatusBarItem>
                  <StatusBarSeparator />
                  <StatusBarItem>TypeScript</StatusBarItem>
                </>
              }
            />
          </div>
        </TooltipProvider>

        <ThemeSwitcher themes={THEMES} defaultTheme="entrepta" position="bottom-right" />

        {/* Bottom centre, where it covers nothing: at the top it sat over the titlebar tabs.
            48px clears the 28px status bar with the same gap the theme switcher keeps; below
            600px Sonner goes full width, so it rises above the switcher instead of over it. */}
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
