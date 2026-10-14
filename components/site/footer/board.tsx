"use client"

import { HourglassIcon, TrophyIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import { useCallback, useEffect, useState, type RefObject } from "react"
import { Skeleton } from "@/app/components/entrepta/skeleton"
import { BOARD_SIZE, formatMs } from "@/lib/memory/constants"

/**
 * The memory game's board, against /api/v1/memory. The server keeps the time: the page only says
 * a round started, that it ended in so many moves, and, when the time makes the board, a name.
 * A name waits for Anna's approval in /admin/memory; until then only the browser that sent it
 * sees it, marked as waiting.
 */
export type BoardRow = { id: string; name: string; ms: number; moves: number; at: string }
export type Finish = { ms: number; rank: number | null; qualifies: boolean }
export type Mine = { id: string; name: string; ms: number }

export const API = "/api/v1/memory"
const MINE_KEY = "st:memory-mine"

async function send<T>(path: string, body?: unknown): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    return res.ok ? ((await res.json()) as T) : null
  } catch {
    return null
  }
}

export const startRound = () => send<{ id: string }>("/start").then((r) => r?.id ?? null)
export const finishRound = (id: string, moves: number) => send<Finish>("/finish", { id, moves })

// The visitor's own name, kept in this browser so it can show as waiting. A convenience: it can
// come back empty (a private window), and then only the "waiting" row is missing.
function readMine(): Mine | null {
  try {
    const raw = localStorage.getItem(MINE_KEY)
    return raw ? (JSON.parse(raw) as Mine) : null
  } catch {
    return null
  }
}
function writeMine(mine: Mine) {
  try {
    localStorage.setItem(MINE_KEY, JSON.stringify(mine))
  } catch {
    // the name was sent either way
  }
}

/**
 * The board, and a way to read it again. `null` rows: it could not be read. It is read the first
 * time the footer comes near the screen, not with every page: most visits never scroll that far.
 */
export function useBoard(root: RefObject<HTMLElement | null>) {
  const [rows, setRows] = useState<BoardRow[] | null | undefined>(undefined)
  const [mine, setMine] = useState<Mine | null>(null)
  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/board`)
      setRows(res.ok ? ((await res.json()) as { board: BoardRow[] }).board : null)
    } catch {
      setRows(null)
    }
    setMine(readMine())
  }, [])
  useEffect(() => {
    const el = root.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        void load()
      },
      { rootMargin: "200px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [root, load])
  const claimed = (next: Mine) => {
    writeMine(next)
    setMine(next)
  }
  return { rows, mine, load, claimed }
}

export function Board({ rows, mine }: { rows: BoardRow[] | null | undefined; mine: Mine | null }) {
  const t = useTranslations("footer.board")
  // the visitor's name, while it waits, in the place its time would take
  const waiting = mine && rows && !rows.some((row) => row.id === mine.id) ? mine : null
  const list: (BoardRow & { waiting?: boolean })[] = [...(rows ?? [])]
  if (waiting) {
    list.push({ ...waiting, moves: 0, at: "", waiting: true })
    list.sort((a, b) => a.ms - b.ms)
  }

  return (
    <section className="st-ft-board" aria-labelledby="st-ft-board-title">
      <h3
        id="st-ft-board-title"
        className="text-mono-xs m-0 flex items-center gap-2 font-mono tracking-[0.08em] text-[var(--fg-secondary)] uppercase"
      >
        <TrophyIcon aria-hidden size={14} className="text-[var(--fg-brand)]" />
        {t("title")}
      </h3>
      {rows === undefined ? (
        <BoardLoading label={t("loading")} />
      ) : rows === null ? (
        <p className="st-ft-board-empty text-mono-xs font-mono">{t("down")}</p>
      ) : list.length === 0 ? (
        <p className="st-ft-board-empty text-mono-xs font-mono">{t("empty")}</p>
      ) : (
        <ol className="st-ft-board-list">
          {list.slice(0, BOARD_SIZE + 1).map((row, index) => (
            <li
              key={row.id}
              className="st-ft-board-row text-mono-sm font-mono"
              data-mine={row.id === mine?.id || undefined}
              data-waiting={row.waiting || undefined}
            >
              <span className="st-ft-board-pos">{index + 1}</span>
              {/* the name keeps the whole width; "waiting" goes under it, not beside it */}
              <span className="st-ft-board-who">
                <span className="truncate">{row.name}</span>
                {row.waiting ? (
                  <span className="st-ft-board-tag text-mono-xs">
                    <HourglassIcon aria-hidden size={12} />
                    {t("waiting")}
                  </span>
                ) : null}
              </span>
              <span className="st-ft-board-time">{formatMs(row.ms)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

// as wide as names tend to be, so the ghosts do not read as one block
const GHOST_NAMES = ["62%", "48%", "74%", "55%"]

/**
 * The board while it is read: rows of the same height as the real ones, shimmering in one wave,
 * so nothing jumps when the names arrive. The words are for a screen reader.
 */
function BoardLoading({ label }: { label: string }) {
  return (
    <div role="status">
      <span className="sr-only">{label}</span>
      <ol className="st-ft-board-list" aria-hidden>
        {GHOST_NAMES.map((width, index) => (
          <li key={index} className="st-ft-board-row st-ft-board-ghost">
            <Skeleton className="h-3 w-3" delay={index * 0.08} />
            <Skeleton className="h-3" style={{ width }} delay={index * 0.08 + 0.03} />
            <Skeleton className="h-3 w-12" delay={index * 0.08 + 0.06} />
          </li>
        ))}
      </ol>
    </div>
  )
}
