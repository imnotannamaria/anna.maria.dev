"use client"

import { CheckIcon, CopyIcon } from "@phosphor-icons/react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { revealViewport } from "@/lib/motion"

export type DockItem = {
  name: string
  what: string
  icon: ReactNode

  href?: string

  copy?: string
}

export function Dock({ items, label }: { items: DockItem[]; label: string }) {
  const reduce = useReducedMotion() ?? false
  const [active, setActive] = useState(0)

  const [copied, setCopied] = useState<number | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const item = items[Math.min(active, items.length - 1)]

  useEffect(() => () => clearTimeout(hideTimer.current), [])

  const copy = async (index: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(index)
      setActive(index)
      clearTimeout(hideTimer.current)
      hideTimer.current = setTimeout(() => setCopied(null), 1800)
    } catch {
      // No clipboard permission: the link is still there to open.
    }
  }

  const rise: Variants = reduce
    ? { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0 } } }
    : {
        hidden: { opacity: 0, y: 14, scale: 0.7 },
        shown: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: "spring", stiffness: 420, damping: 26 },
        },
      }

  return (
    <>
      <div className="flex justify-center pt-3">
        <motion.ul
          className="st-dock"
          aria-label={label}
          initial="hidden"
          whileInView="shown"
          viewport={revealViewport}
          variants={{
            hidden: {},

            shown: { transition: reduce ? {} : { staggerChildren: 0.035 } },
          }}
        >
          {items.map((entry, index) => (
            <motion.li key={entry.name} variants={rise}>
              {entry.href ? (
                <a
                  href={entry.href}
                  target={entry.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="st-app focus-ring"
                  aria-label={`${entry.name}: ${entry.what}`}
                  onPointerEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                >
                  <span className="st-app-icon">{entry.icon}</span>
                </a>
              ) : (
                <button
                  type="button"
                  className="st-app focus-ring"
                  aria-label={`${entry.name}: ${entry.what}`}
                  onPointerEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                >
                  <span className="st-app-icon">{entry.icon}</span>
                </button>
              )}
              {entry.copy ? (
                <button
                  type="button"
                  className="st-app-copy focus-ring"
                  data-copied={copied === index || undefined}
                  aria-label={`Copy ${entry.name}: ${entry.copy}`}
                  onClick={() => copy(index, entry.copy ?? "")}
                >
                  {copied === index ? (
                    <CheckIcon aria-hidden size={12} weight="bold" />
                  ) : (
                    <CopyIcon aria-hidden size={12} />
                  )}
                </button>
              ) : null}
            </motion.li>
          ))}
        </motion.ul>
      </div>
      {item ? (
        <p
          key={`${item.name}${copied === active ? "-copied" : ""}`}
          className="st-enter text-mono-sm min-w-0 truncate text-center font-mono"
        >
          <span className="text-[var(--fg-primary)]">{item.name}</span>
          <span className="ml-2.5 text-[var(--fg-muted)]">{item.what}</span>
          {copied === active ? (
            <span className="ml-2.5 text-[var(--status-success-fg)]" role="status">
              copied
            </span>
          ) : null}
        </p>
      ) : null}
    </>
  )
}

export function Plate({
  tone = "light",
  rear,
  children,
}: {
  tone?: "light" | "dark"

  rear?: string
  children: ReactNode
}) {
  return (
    <span
      className="st-plate"
      data-tone={rear ? "dark" : tone}
      style={rear ? { background: rear } : undefined}
    >
      {children}
    </span>
  )
}
