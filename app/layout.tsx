import type { Metadata } from "next"
import { Newsreader, Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeScript } from "@/app/components/entrepta/theme-switcher"
import { Toaster } from "@/app/components/entrepta/toast"
import { TooltipProvider } from "@/app/components/entrepta/tooltip"
import { ButtonSoundFeedback } from "@/components/ui/sound-feedback"
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
        <TooltipProvider>{children}</TooltipProvider>

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
