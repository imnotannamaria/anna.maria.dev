"use client"

/**
 * The `<tbody>` of the roadmap table. Same split and the same reasoning as
 * `log-entry-rows.tsx`: the table stays a Server Component with its `/dist/ssr` icons, and
 * only the rows go client, because only the rows need the optimistic list.
 *
 * Rows fade rather than slide — transforms do not apply to `display: table-row`.
 */

import { useRouter } from "next/navigation"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { PencilSimpleIcon } from "@phosphor-icons/react"
import { toast } from "@/app/components/entrepta/toast"
import { useOptimisticRemoval } from "@/hooks/use-optimistic-removal"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { EASE_OUT, revealViewport, STAGGER_LIMIT } from "@/components/ui/reveal"
import { STATUS_LABEL, type RoadmapItem, type RoadmapStatus } from "@/lib/roadmap/validation"

/** Muted for raw, brand for anything public, success for shipped. */
const STATUS_COLOR: Record<RoadmapStatus, string> = {
  raw: "var(--fg-muted)",
  todo: "var(--fg-secondary)",
  doing: "var(--fg-brand-hover)",
  done: "var(--status-success-fg)",
}

export function RoadmapItemRows({ items }: { items: RoadmapItem[] }) {
  const router = useRouter()
  const reduce = useReducedMotion() ?? false

  const { visible, hide, restore } = useOptimisticRemoval(items)

  /** Hide first, then ask. Every failure path puts the row back explicitly — see
   *  `useOptimisticRemoval` for why nothing does that for us any more. */
  async function remove(id: string, title: string) {
    hide(id)
    try {
      const res = await fetch(`/api/v1/admin/roadmap/${id}`, { method: "DELETE" })
      if (!res.ok) {
        restore(id)
        toast(`could not delete (${res.status})`)
        return
      }
      toast(`deleted "${title}"`)
      router.refresh()
    } catch {
      restore(id)
      toast("network error — nothing was deleted")
    }
  }

  /**
   * The entrance lives on the row, not on the `<tbody>` orchestrating it through variants.
   *
   * It used to: `initial="hidden" whileInView="show"` on the tbody, rows as variant children.
   * That is the arrangement that left `PageOutline` with a rail of invisible links — a
   * container's `whileInView` with `once` is spent after it fires, so a child mounting later
   * resolves `hidden` and is never told to show. In a table that is a row at `opacity: 0`,
   * which reads as missing data rather than as a broken animation. Rare here (creating an entry
   * arrives by navigation, and a delete only ever removes rows) and reachable through an edit
   * that reorders, or a refresh picking up a row written elsewhere.
   *
   * Keying the tbody would have fixed it and broken something better: a new key on every
   * removal means `AnimatePresence` never sees the row leave, and the fade on delete — the
   * whole point of the optimistic list — would not play.
   *
   * The stagger moves onto the row's own transition, which the Cards and motion rules warn
   * about: a delay left on a transition is re-applied by every later interaction. Safe here
   * because a row has exactly two states and the other one, `exit`, carries its own.
   */
  const stagger = reduce || visible.length > STAGGER_LIMIT ? 0 : 0.04
  const enter = (index: number) => ({
    opacity: 1,
    transition: { duration: reduce ? 0 : 0.32, ease: EASE_OUT, delay: index * stagger },
  })
  const leave = { opacity: 0, transition: { duration: reduce ? 0 : 0.18, ease: EASE_OUT } }

  return (
    <tbody>
      {/* No `initial={false}`: the rows own their entrance now, so suppressing it on the first
          pass would mean the table never animates in at all. */}
      <AnimatePresence>
        {visible.map((item, i) => (
          <motion.tr
            key={item.id}
            initial={{ opacity: 0 }}
            whileInView={enter(i)}
            viewport={revealViewport}
            exit={leave}
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <td className="text-mono-sm px-2 py-3 font-mono whitespace-nowrap">
              <span style={{ color: STATUS_COLOR[item.status] }}>{STATUS_LABEL[item.status]}</span>
            </td>

            <td className="max-w-70 min-w-40 px-2 py-3">
              <Link
                href={`/admin/roadmap/${item.id}`}
                className="text-mono-md block truncate font-mono hover:underline"
                style={{ color: "var(--fg-primary)" }}
              >
                {item.title}
              </Link>
              {item.blurb && (
                <span
                  className="text-mono-sm block truncate font-mono"
                  style={{ color: "var(--fg-muted)" }}
                >
                  {item.blurb}
                </span>
              )}
            </td>

            <td
              className="text-mono-sm px-2 py-3 font-mono whitespace-nowrap"
              style={{ color: "var(--fg-muted)" }}
            >
              {item.position}
            </td>

            <td
              className="text-mono-sm max-w-50 px-2 py-3 font-mono"
              style={{ color: "var(--fg-muted)" }}
            >
              <span className="block truncate">{item.planUrl ?? "—"}</span>
            </td>

            <td
              className="text-mono-sm px-2 py-3 font-mono whitespace-nowrap"
              style={{ color: "var(--fg-muted)" }}
            >
              {item.shippedAt ? <time dateTime={item.shippedAt}>{item.shippedAt}</time> : "—"}
            </td>

            <td className="px-2 py-3 text-right whitespace-nowrap">
              <div className="flex items-center justify-end gap-1">
                <Link
                  href={`/admin/roadmap/${item.id}`}
                  aria-label={`Edit ${item.title}`}
                  title="Edit"
                  className="grid h-8 w-8 place-items-center rounded-md transition-colors hover:bg-(--bg-hover-soft)"
                  style={{ color: "var(--fg-muted)" }}
                >
                  <PencilSimpleIcon size={15} aria-hidden />
                </Link>
                <DeleteDialog
                  noun="item"
                  title={item.title}
                  onConfirm={() => remove(item.id, item.title)}
                />
              </div>
            </td>
          </motion.tr>
        ))}
      </AnimatePresence>
    </tbody>
  )
}
