"use client"

import { pet } from "@/components/site/abimaela/abimaela"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { WALL_REACTIONS, type ReactionCounts, type WallReaction } from "@/lib/wall/constants"
import "@/components/site/person/favorites.css"

const KEY = "wall:reacted"

/** What this browser has reacted with, per letter. The server keeps counts, not people. */
function readPicks(): Record<string, WallReaction[]> {
  try {
    const stored = JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as unknown
    return stored && typeof stored === "object" ? (stored as Record<string, WallReaction[]>) : {}
  } catch {
    return {}
  }
}
function writePicks(id: string, picks: WallReaction[]) {
  try {
    const all = readPicks()
    if (picks.length) all[id] = picks
    else delete all[id]
    window.localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    // storage is off: the pick lasts for this page
  }
}

/**
 * The reactions under a letter: the buttons of "emojis & gifs I overuse" on the person page,
 * with the same flight when one is picked, and counts that are real. A click moves the count
 * at once and tells the server; if the server says no, it moves back. Each reaction waits
 * for its pending write before accepting another toggle, including clicks before a render.
 *
 * `readOnly` is for a letter that is not on the wall yet (the invite's preview, the admin):
 * the counts show and nothing can be clicked.
 */
export function Reactions({
  id,
  who,
  counts: initial,
  readOnly = false,
}: {
  id: string
  who: string
  counts: ReactionCounts
  readOnly?: boolean
}) {
  const t = useTranslations("wall")
  const [counts, setCounts] = useState(initial)
  const [mine, setMine] = useState<WallReaction[]>([])
  const [flights, setFlights] = useState<Record<string, number>>({})
  // what this browser has picked, for the code below that runs between two renders
  const picks = useRef<WallReaction[]>([])
  const pending = useRef(new Set<WallReaction>())
  const [busy, setBusy] = useState<WallReaction[]>([])

  // after mount, so the server's HTML and the first paint agree
  useEffect(() => {
    if (readOnly) return
    const stored = readPicks()[id] ?? []
    picks.current = stored
    setMine(stored)
  }, [id, readOnly])

  const choose = (next: WallReaction[]) => {
    picks.current = next
    setMine(next)
    writePicks(id, next)
  }
  // the count of one reaction, and only that one: another click's number is not this reply's to set
  const setCount = (reaction: WallReaction, count: number) =>
    setCounts((now) => ({ ...now, [reaction]: Math.max(0, count) }))

  /**
   * The click moves the count at once; the reply only confirms it, and only for the reaction
   * that was clicked. Taking every count from a reply would undo a click on another reaction
   * that is still on its way.
   */
  const toggle = (reaction: WallReaction) => {
    if (readOnly || pending.current.has(reaction)) return
    pending.current.add(reaction)
    setBusy([...pending.current])
    const previousCount = counts[reaction]
    const on = !picks.current.includes(reaction)
    choose(on ? [...picks.current, reaction] : picks.current.filter((pick) => pick !== reaction))
    setCounts((now) => ({ ...now, [reaction]: Math.max(0, now[reaction] + (on ? 1 : -1)) }))
    if (on) pet.notify("react")
    if (on) setFlights((now) => ({ ...now, [reaction]: (now[reaction] ?? 0) + 1 }))

    const send = async () => {
      try {
        const res = await fetch(`/api/v1/wall/${id}/react`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reaction, on }),
        })
        if (!res.ok) throw new Error(String(res.status))
        const body = (await res.json()) as { reactions?: ReactionCounts }
        if (body.reactions) {
          setCount(reaction, body.reactions[reaction])
        }
      } catch {
        choose(
          on ? picks.current.filter((pick) => pick !== reaction) : [...picks.current, reaction],
        )
        setCount(reaction, previousCount)
      } finally {
        pending.current.delete(reaction)
        setBusy([...pending.current])
      }
    }
    void send()
  }

  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={t("reactionsTo", { name: who })}>
      {WALL_REACTIONS.map(({ id: reaction, emoji }) => {
        const on = mine.includes(reaction)
        const count = counts[reaction]
        return (
          <li key={reaction}>
            <button
              type="button"
              className="st-reaction focus-ring text-mono-xs font-mono"
              aria-label={t("reactionCount", { reaction: t(`reactions.${reaction}`), count })}
              aria-pressed={on}
              disabled={readOnly}
              aria-busy={busy.includes(reaction) || undefined}
              onClick={() => toggle(reaction)}
            >
              <span aria-hidden className="st-reaction-emoji">
                {emoji}
              </span>
              <span aria-hidden className="tabular-nums">
                {count}
              </span>
              {flights[reaction] ? (
                <span key={flights[reaction]} aria-hidden className="st-reaction-flight">
                  {emoji}
                </span>
              ) : null}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
