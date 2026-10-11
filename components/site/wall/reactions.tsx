"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
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
 * at once and tells the server; if the server says no, it moves back.
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

  // after mount, so the server's HTML and the first paint agree
  useEffect(() => {
    if (!readOnly) setMine(readPicks()[id] ?? [])
  }, [id, readOnly])

  const toggle = async (reaction: WallReaction) => {
    const on = !mine.includes(reaction)
    const before = { counts, mine }
    const picks = on ? [...mine, reaction] : mine.filter((pick) => pick !== reaction)
    setMine(picks)
    setCounts({ ...counts, [reaction]: Math.max(0, counts[reaction] + (on ? 1 : -1)) })
    if (on) setFlights((now) => ({ ...now, [reaction]: (now[reaction] ?? 0) + 1 }))
    writePicks(id, picks)

    try {
      const res = await fetch(`/api/v1/wall/${id}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction, on }),
      })
      if (!res.ok) throw new Error(String(res.status))
      const body = (await res.json()) as { reactions?: ReactionCounts }
      if (body.reactions) setCounts(body.reactions)
    } catch {
      setMine(before.mine)
      setCounts(before.counts)
      writePicks(id, before.mine)
    }
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
              onClick={() => void toggle(reaction)}
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
