"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { SunIcon, MoonIcon, ListBulletsIcon, XIcon, WaveSineIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { PianoButton, PianoModal } from "@/components/ui/piano-modal"

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/projects", label: "Projects" },
  { href: "/contributions", label: "Contributions" },
  { href: "/uses", label: "Uses" },
  { href: "/contact", label: "Contact" },
]

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useHydrated()
  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="text-text-secondary hover:bg-bg-elevated hover:text-text-primary relative flex size-9 items-center justify-center overflow-hidden rounded-lg transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mounted ? resolvedTheme : "theme-placeholder"}
          initial={{ rotate: -45, opacity: 0, scale: 0.7 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 45, opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
          className="flex items-center justify-center"
        >
          {!mounted ? (
            <span aria-hidden="true" className="bg-text-secondary/30 block size-4 rounded-full" />
          ) : isDark ? (
            <SunIcon size={16} />
          ) : (
            <MoonIcon size={16} />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + "/")
  const shouldReduceMotion = useReducedMotion()
  const [isHovered, setIsHovered] = useState(false)
  const showIndicator = isActive || isHovered
  const barHeights = [
    [0.45, 0.95, 0.55, 0.8, 0.45],
    [0.75, 0.4, 1, 0.5, 0.75],
    [0.35, 0.7, 0.45, 0.9, 0.35],
  ]

  return (
    <Link
      href={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative inline-flex pb-4 text-sm font-medium transition-colors duration-150",
        isActive ? "text-indigo-400" : "text-text-secondary hover:text-text-primary",
      )}
    >
      {label}

      <span
        className={cn(
          "pointer-events-none absolute inset-x-0 -bottom-0.5 flex justify-center transition-opacity duration-200",
          showIndicator ? "opacity-100" : "opacity-0",
        )}
        aria-hidden="true"
      >
        <span className="border-border/60 bg-bg-surface/80 flex h-4 items-end gap-1 rounded-full border px-2 py-1 backdrop-blur-sm">
          {barHeights.map((heights, index) => (
            <motion.span
              key={index}
              className={cn(
                "w-0.75 rounded-full bg-indigo-400",
                isActive ? "shadow-[0_0_10px_rgba(129,140,248,0.35)]" : "",
              )}
              initial={false}
              animate={
                shouldReduceMotion
                  ? { height: `${Math.round(heights[0] * 8)}px`, opacity: showIndicator ? 1 : 0.65 }
                  : showIndicator
                    ? { height: heights.map((value) => `${Math.round(value * 8)}px`), opacity: 1 }
                    : { height: "3px", opacity: 0.65 }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0.15 }
                  : {
                      duration: 1.15,
                      repeat: showIndicator ? Number.POSITIVE_INFINITY : 0,
                      ease: "easeInOut",
                      delay: index * 0.08,
                    }
              }
            />
          ))}
        </span>
      </span>
    </Link>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pianoOpen, setPianoOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16)
    handler()
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "p") return
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      event.preventDefault()
      setPianoOpen((value) => !value)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          scrolled ? "bg-bg-surface/90 backdrop-blur-md" : "bg-transparent",
        )}
      >
        <nav className="mx-auto flex h-14 max-w-275 items-center justify-between px-5">
          <Link href="/" aria-label="Home" className="transition-opacity hover:opacity-80">
            <span className="flex size-8 items-center justify-center rounded-lg bg-white">
              <WaveSineIcon size={18} className="text-indigo-600" aria-hidden="true" />
            </span>
          </Link>

          <ul className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <NavLink {...link} />
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-1 md:flex">
            <PianoButton onClick={() => setPianoOpen((v) => !v)} active={pianoOpen} pulse />
            <ThemeToggle />
          </div>

          <button
            className="text-text-secondary hover:bg-bg-elevated flex size-9 items-center justify-center rounded-lg transition-colors md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <XIcon size={18} /> : <ListBulletsIcon size={18} />}
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              className="border-border bg-bg-surface fixed top-0 right-0 z-50 flex h-full w-72 flex-col gap-1 border-l p-6 pt-20"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
                    pathname === link.href || pathname.startsWith(link.href + "/")
                      ? "bg-bg-elevated text-text-primary"
                      : "",
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-border mt-auto flex items-center gap-2 border-t pt-6">
                <PianoButton onClick={() => setPianoOpen((v) => !v)} active={pianoOpen} />
                <ThemeToggle />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <PianoModal open={pianoOpen} onClose={() => setPianoOpen(false)} />
    </>
  )
}
