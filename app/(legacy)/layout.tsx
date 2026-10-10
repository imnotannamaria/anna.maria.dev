import { Titlebar } from "@/components/chrome/titlebar"
import { Sidebar } from "@/components/chrome/sidebar"
import { StatusBar, StatusBarItem, StatusBarSeparator } from "@/app/components/entrepta/status-bar"
import { ThemeSwitcher } from "@/app/components/entrepta/theme-switcher"
import { THEMES } from "@/lib/site-config"

/**
 * The editor chrome of the site before v3: titlebar, icon sidebar and status bar. It lives on
 * only around the pages that have not moved to the new frame (roadmap, piano, components and the
 * admin), and goes away with them.
 */
export default function LegacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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

      <ThemeSwitcher themes={THEMES} defaultTheme="entrepta" position="bottom-right" />
    </>
  )
}
