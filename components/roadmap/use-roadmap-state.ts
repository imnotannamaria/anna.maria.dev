"use client"

/**
 * PROTÓTIPO / DISCOVERY — o estado de "o que já saiu" vive na memória do
 * componente. Marcar um item aqui não persiste em lugar nenhum; é só pra sentir
 * a interação. Na versão de verdade isso vem do md, do Velite ou do Postgres.
 */

import { useMemo, useState } from "react"
import { ROADMAP_ITEMS, type RoadmapItem, type RoadmapStatus } from "@/lib/roadmap-data"

export function useRoadmapState() {
  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(ROADMAP_ITEMS.filter((i) => i.status === "done").map((i) => i.id)),
  )

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const grouped = useMemo(() => {
    const out: Record<RoadmapStatus, RoadmapItem[]> = { todo: [], doing: [], done: [] }
    for (const item of ROADMAP_ITEMS) {
      // Desmarcar algo que já tinha saído devolve pro topo da fila.
      const status: RoadmapStatus = checked.has(item.id)
        ? "done"
        : item.status === "done"
          ? "todo"
          : item.status
      out[status].push(item)
    }
    return out
  }, [checked])

  const counts: Record<RoadmapStatus, number> = {
    todo: grouped.todo.length,
    doing: grouped.doing.length,
    done: grouped.done.length,
  }

  return {
    grouped,
    counts,
    isChecked: (id: string) => checked.has(id),
    toggle,
    doneCount: checked.size,
    total: ROADMAP_ITEMS.length,
  }
}
