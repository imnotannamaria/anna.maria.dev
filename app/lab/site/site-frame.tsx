"use client"

import { MoonIcon, SunIcon } from "@phosphor-icons/react"
import {
  createContext,
  useContext,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react"
import { SegmentedControl } from "@/app/components/entrepta/segmented-control"
import { Sidebar, type SidebarGroup } from "@/app/components/entrepta/sidebar"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useMode } from "@/hooks/use-mode"
import { NAV_ROW_IDLE } from "@/lib/nav"
import { cn } from "@/lib/utils"
import { Abimaela, pet } from "./abimaela/abimaela"
import { ICON } from "./front/icons"
import { PAGES, innerPageOf, type PageId, type ScreenId } from "./front/pages"
import { Footer } from "./front/footer/footer"

/**
 * The frame of the new site: the sidebar, the Front / Back / IA switcher, the cat, and the page
 * in between. All three parts stay mounted and only one shows, so the terminal session and the
 * chat survive a trip to the other side. Screens are state here, not routes: that changes when
 * the prototype is migrated.
 */
export type Part = "front" | "back" | "ia"

const PARTS: { value: Part; label: string }[] = [
  { value: "front", label: "Front" },
  { value: "back", label: "Back" },
  { value: "ia", label: "IA" },
]

const NAV: SidebarGroup[] = [PAGES.slice(0, 1), PAGES.slice(1)].map((group) => ({
  items: group.map((page) => ({
    id: page.id,
    label: page.label,
    href: `#${page.id}`,
    icon: ICON[page.id],
  })),
}))

const NavCtx = createContext<(id: string) => void>(() => {})

export function useNavigate(): (id: ScreenId) => void {
  return useContext(NavCtx)
}

function SidebarLink({
  href,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const navigate = useContext(NavCtx)
  return (
    <a
      {...rest}
      href={href}
      onClick={(event) => {
        event.preventDefault()
        navigate(href.slice(1))
      }}
    />
  )
}

function BrandMark({ compact }: { compact: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 100 100" width={28} height={28} aria-hidden className="shrink-0">
        <defs>
          <linearGradient id="st-brand" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: "var(--fg-brand-hover)" }} />
            <stop
              offset="1"
              style={{ stopColor: "color-mix(in srgb, var(--fg-brand) 55%, #09090b)" }}
            />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="26" fill="url(#st-brand)" />
        <text
          x="50"
          y="67.25"
          textAnchor="middle"
          fill="var(--zinc-50)"
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: "72px",
          }}
        >
          a
        </text>
      </svg>
      {compact ? null : (
        <span className="flex min-w-0 flex-col font-mono leading-tight">
          <span className="text-mono-sm truncate text-[var(--fg-primary)]">Anna Maria</span>
          <span className="text-mono-xs truncate text-[var(--fg-muted)]">software engineer</span>
        </span>
      )}
    </span>
  )
}

function ModeButton({ compact }: { compact: boolean }) {
  const { mode, toggleMode } = useMode()
  const label = mode === "dark" ? "Light mode" : "Dark mode"
  return (
    <button
      type="button"
      aria-label={compact ? label : undefined}
      onClick={toggleMode}
      className={cn(
        "focus-ring flex cursor-pointer items-center transition-colors",
        compact
          ? "size-9 justify-center rounded-[var(--radius-md)]"
          : "text-mono-sm h-8 w-full gap-2.5 rounded-[var(--radius-sm)] px-2.5 font-mono",
        NAV_ROW_IDLE,
      )}
    >
      {mode === "dark" ? (
        <SunIcon aria-hidden size={compact ? 18 : 16} className="shrink-0" />
      ) : (
        <MoonIcon aria-hidden size={compact ? 18 : 16} className="shrink-0" />
      )}
      {compact ? null : <span className="truncate">{label}</span>}
    </button>
  )
}

export function SiteFrame({
  pages,
  back,
  ia,
}: {
  pages: Record<ScreenId, ReactNode>
  back: ReactNode
  ia: ReactNode
}) {
  const [part, setPart] = useState<Part>("front")
  const [page, setPage] = useState<ScreenId>("home")

  const [atFooter, setAtFooter] = useState(false)

  const front = useRef<HTMLDivElement>(null)

  const iconsOnly = useMediaQuery("(max-width: 767px)")

  const switchTo = (to: Part) => {
    if (to === part) return
    setPart(to)
    pet.notify(to)
  }

  const navigate = (id: string) => {
    if (part === "front" && id === page) return
    setPart("front")
    setPage(id as ScreenId)

    front.current?.scrollTo({ top: 0 })
    pet.notify("page")
  }

  const inner = innerPageOf(page)

  const listedPage: PageId | null = inner ? inner.parent : (page as PageId)

  const parts: Record<Part, ReactNode> = {
    front: (
      <div key={page} className="st-enter" data-page={page}>
        {pages[page] ?? pages[listedPage ?? "home"]}

        {listedPage ? <Footer page={listedPage} onGo={navigate} onVisible={setAtFooter} /> : null}
      </div>
    ),
    back,
    ia,
  }

  return (
    <NavCtx.Provider value={navigate}>
      <div className="st">
        <Sidebar
          variant={iconsOnly ? "rail" : "labeled"}
          collapsible={!iconsOnly}
          storageKey="lab:site:sidebar"
          onCollapsedChange={(closed) => {
            if (closed) pet.notify("sidebar")
          }}
          groups={NAV}
          active={part === "front" ? (listedPage ?? undefined) : undefined}
          label="Site"
          linkComponent={SidebarLink}
          logo={({ collapsed }) => <BrandMark compact={collapsed} />}
          footer={({ collapsed }) => <ModeButton compact={collapsed} />}
        />

        <div className="st-main" data-at-footer={(part === "front" && atFooter) || undefined}>
          {PARTS.map(({ value }) => (
            <div
              key={value}
              ref={value === "front" ? front : undefined}
              className="st-page st-enter"
              data-part={value}
              hidden={value !== part}
            >
              {parts[value]}
            </div>
          ))}

          <nav className="st-switcher" aria-label="Side of the site">
            <SegmentedControl
              aria-label="Side of the site"
              options={PARTS}
              value={part}
              onValueChange={(value) => switchTo(value as Part)}
            />
          </nav>

          <Abimaela />
        </div>
      </div>
    </NavCtx.Provider>
  )
}
