"use client"

/** PROTÓTIPO / DISCOVERY — o board: card de progresso + três colunas de cards. */

import { ROADMAP_STATUS, type RoadmapStatus } from "@/lib/roadmap-data"
import { RoadmapItemCard } from "./roadmap-card"
import { RoadmapProgressCard } from "./roadmap-progress"
import { useRoadmapState } from "./use-roadmap-state"

const COLUMNS: RoadmapStatus[] = ["todo", "doing", "done"]

export function RoadmapBoard() {
  const { grouped, counts, isChecked, toggle, doneCount, total } = useRoadmapState()

  return (
    <>
      <div className="mb-5">
        <RoadmapProgressCard counts={counts} doneCount={doneCount} total={total} />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {COLUMNS.map((status, col) => {
          const items = grouped[status]
          const meta = ROADMAP_STATUS[status]

          return (
            <section key={status} className="flex min-w-0 flex-col gap-4">
              <div
                className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.08em] uppercase"
                style={{ color: "var(--fg-secondary)" }}
              >
                <span
                  className="rm-dot"
                  aria-hidden
                  data-live={status === "doing"}
                  data-muted={status === "done"}
                />
                <h2 className="m-0 text-[11px] font-normal tracking-[0.08em] uppercase">
                  {meta.label}
                </h2>
                <span
                  className="h-px flex-1"
                  style={{ background: "var(--border-subtle)" }}
                  aria-hidden
                />
                <span
                  className="inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-[var(--radius-sm)] px-1.5 text-[11px]"
                  style={{ background: "rgba(255,255,255,0.06)", color: "var(--fg-muted)" }}
                >
                  {items.length}
                </span>
              </div>

              {/* Uma coluna vazia ainda é informação: diz que nada está parado ali. */}
              {items.length === 0 && (
                <p
                  className="m-0 rounded-[var(--radius-md)] border border-dashed px-4 py-8 text-center font-mono text-[11px]"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--fg-muted)" }}
                >
                  nothing here
                </p>
              )}

              {/* py-1: o card levanta 2px no hover e projeta sombra. Sem folga,
                  a lista corta a borda de cima do primeiro card. */}
              <ul className="m-0 flex list-none flex-col gap-4 p-0 py-1">
                {items.map((item, i) => (
                  <RoadmapItemCard
                    key={item.id}
                    surface="rm-board"
                    item={item}
                    status={status}
                    index={i}
                    checked={isChecked(item.id)}
                    onToggle={() => toggle(item.id)}
                    delay={col * 0.06 + i * 0.05}
                  />
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </>
  )
}
