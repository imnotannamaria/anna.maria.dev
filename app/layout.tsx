import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Titlebar } from "@/components/chrome/titlebar"
import { Sidebar } from "@/components/chrome/sidebar"
import { StatusBar, StatusBarItem, StatusBarSeparator } from "@/app/components/entrepta/status-bar"
import { ThemeScript } from "@/app/components/entrepta/theme-switcher"
import { ThemeSwitcher } from "@/app/components/entrepta/theme-switcher"
import { Toaster } from "@/app/components/entrepta/toast"
import "./globals.css"

const THEMES = [
  { id: "entrepta", label: "entrepta", color: "#7c6bff", lightColor: "#6b5bff" },
  { id: "blossom", label: "blossom", color: "#cc2e36", lightColor: "#b02028" },
  { id: "marmalade", label: "marmalade", color: "#ff8213", lightColor: "#e06800" },
  { id: "julia", label: "julia", color: "#e85a8a", lightColor: "#cc3a6a" },
  { id: "ivy", label: "ivy", color: "#35a365", lightColor: "#258a50" },
  { id: "bosco", label: "bosco", color: "#2563eb", lightColor: "#1d4ed8" },
] as const

export const metadata: Metadata = {
  title: {
    default: "Anna Maria",
    template: "%s · Anna Maria",
  },
  description: "Full-stack Software Engineer with 5 years shipping web products.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          skip to content
        </a>

        {/* Editor chrome — fixed full-viewport grid */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            gridTemplateRows: "40px 1fr 28px",
            gridTemplateColumns: "minmax(0, 1fr)",
          }}
        >
          <Titlebar />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "56px minmax(0, 1fr)",
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            <Sidebar />
            <main
              id="main-content"
              tabIndex={-1}
              style={{ minWidth: 0, overflowX: "hidden", overflowY: "auto", outline: "none" }}
            >
              {children}
            </main>
          </div>

          <StatusBar
            style={{
              position: "relative",
              bottom: "auto",
              left: "auto",
              right: "auto",
              zIndex: "auto",
            }}
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
                    className="rounded-[3px] px-1.5 py-px text-[10px]"
                    style={{ border: "1px solid rgba(255,255,255,0.3)" }}
                  >
                    ⌘K
                  </kbd>
                  <span aria-hidden className="opacity-60">
                    /
                  </span>
                  <kbd
                    className="rounded-[3px] px-1.5 py-px text-[10px]"
                    style={{ border: "1px solid rgba(255,255,255,0.3)" }}
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

        <ThemeSwitcher themes={THEMES} defaultTheme="entrepta" position="bottom-right" />

        <Toaster position="top-center" />

        <Analytics />
      </body>
    </html>
  )
}
