"use client"

import { useEffect, useState } from "react"

export type OutlineItem = { id: string; label: string; level: 1 | 2 | 3 }

const PREFIX: Record<1 | 2 | 3, string> = { 1: "#", 2: "##", 3: "###" }

/**
 * Markdown-style outline for /about — mirrors the editor "outline" panel.
 * Sticky on ≥1100px, hidden below. Uses IntersectionObserver to highlight
 * the section currently in view (scrollspy) and scrolls the <main> container
 * on click with a small top offset so headings don't sit flush under the chrome.
 */
export function AboutOutline({ items }: { items: OutlineItem[] }) {
  const [active, setActive] = useState(items[0]?.id)

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        )
        setActive(topmost.target.id)
      },
      { rootMargin: "-12% 0px -70% 0px", threshold: 0 },
    )

    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [items])

  const jump = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    const main = document.querySelector("main")
    if (!el || !main) return
    const top =
      el.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop - 24
    main.scrollTo({ top, behavior: "smooth" })
    setActive(id)
  }

  return (
    <nav
      aria-label="Page outline"
      className="sticky top-0 hidden self-start px-4 py-12 min-[1100px]:block"
      style={{ borderRight: "1px solid var(--border-subtle)" }}
    >
      <h2
        className="mb-3 font-mono text-[10px] font-medium tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-muted)", margin: "0 0 12px" }}
      >
        outline
      </h2>

      <div
        className="mb-4 flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 font-mono text-xs"
        style={{ background: "var(--bg-surface-brand)", color: "var(--fg-primary)" }}
      >
        <span aria-hidden style={{ color: "var(--fg-brand)", fontSize: 9 }}>
          ◆
        </span>
        about.md
      </div>

      <ul className="flex flex-col" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {items.map((item) => {
          const isActive = active === item.id
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => jump(e, item.id)}
                className="flex items-baseline gap-1.5 py-1 font-mono text-xs transition-colors"
                style={{
                  color: isActive ? "var(--fg-primary)" : "var(--fg-secondary)",
                  paddingLeft: item.level === 3 ? 12 : 0,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    color: isActive ? "var(--fg-brand)" : "var(--fg-muted)",
                    flexShrink: 0,
                  }}
                >
                  {PREFIX[item.level]}
                </span>
                {item.label}
              </a>
            </li>
          )
        })}
      </ul>

      <div
        className="mt-8 pt-3 font-mono text-[10px] leading-[1.7]"
        style={{ borderTop: "1px dashed var(--border-subtle)", color: "var(--fg-muted)" }}
      >
        <div>{"// markdown"}</div>
        <div>{"// utf-8"}</div>
      </div>
    </nav>
  )
}
