"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "motion/react"
import { SunIcon, MoonIcon, ListBulletsIcon, XIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { PianoButton, PianoModal } from "@/components/ui/piano-modal"

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/projects", label: "Projects" },
  { href: "/uses", label: "Uses" },
  { href: "/contact", label: "Contact" },
]

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="text-text-secondary hover:bg-bg-elevated hover:text-text-primary relative flex size-9 items-center justify-center overflow-hidden rounded-lg transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={resolvedTheme}
          initial={{ rotate: -45, opacity: 0, scale: 0.7 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 45, opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
          className="flex items-center justify-center"
        >
          {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + "/")

  return (
    <Link
      href={href}
      className={cn(
        "group relative text-sm font-medium transition-colors duration-150",
        isActive ? "text-indigo-400" : "text-text-secondary hover:text-text-primary",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 text-xs text-indigo-400 select-none",
          "opacity-0 transition-all duration-200",
          "group-hover:-translate-y-0.5 group-hover:opacity-100",
          isActive && "opacity-100",
        )}
        aria-hidden="true"
      >
        ♩
      </span>
      {label}
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

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          scrolled ? "bg-bg-surface/90 backdrop-blur-md" : "bg-transparent",
        )}
      >
        <nav className="mx-auto flex h-14 max-w-275 items-center justify-between px-5">
          <Link
            href="/"
            className="font-mono text-sm font-bold text-indigo-500 transition-opacity hover:opacity-80"
          >
            am
          </Link>

          <ul className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <NavLink {...link} />
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-1 md:flex">
            <PianoButton onClick={() => setPianoOpen((v) => !v)} active={pianoOpen} />
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

              <div className="border-border mt-auto border-t pt-6">
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
