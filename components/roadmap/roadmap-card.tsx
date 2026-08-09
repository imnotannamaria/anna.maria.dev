"use client"

/**
 * PROTÓTIPO / DISCOVERY — um item do roadmap.
 *
 * É um `.bento-card` como qualquer outro card do site: `CardHead` em cima,
 * `CardFoot` embaixo, `Badge` pro status, spotlight seguindo o cursor e o lift
 * do `.featured-card`. O que é só do roadmap mora em `.rm-item`: a barra de
 * accent na borda esquerda e o estado de marcado.
 */

import { motion, useReducedMotion } from "motion/react"
import { Badge, CardFoot, CardHead } from "@/components/ui/card-parts"
import { EASE_OUT, revealViewport } from "@/components/ui/reveal"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { ROADMAP_STATUS, type RoadmapItem, type RoadmapStatus } from "@/lib/roadmap-data"
import { RoadmapCheckbox } from "./roadmap-checkbox"

const BADGE_VARIANT: Record<RoadmapStatus, "default" | "brand-soft" | "success-soft"> = {
  todo: "default",
  doing: "brand-soft",
  done: "success-soft",
}

export function RoadmapItemCard({
  item,
  status,
  checked,
  onToggle,
  index,
  delay = 0,
  /** Prefixo do layoutId — dialog e board são duas instâncias, não podem colidir. */
  surface,
}: {
  item: RoadmapItem
  status: RoadmapStatus
  checked: boolean
  onToggle: () => void
  index: number
  delay?: number
  surface: string
}) {
  const reduce = useReducedMotion() ?? false
  const { onMouseMove, spotlight } = useSpotlight(320)
  const meta = ROADMAP_STATUS[status]

  return (
    /* `layoutId`: marcar um item o desmonta daqui e o monta na outra coluna, e a
       Motion faz o card *voar* entre as duas posições em vez de piscar. */
    <motion.li
      layout
      layoutId={`${surface}-${item.id}`}
      transition={reduce ? { duration: 0 } : { layout: { duration: 0.45, ease: EASE_OUT } }}
      className="bento-card featured-card rm-item"
      data-status={status}
      data-checked={checked}
      onMouseMove={onMouseMove}
    >
      <Spotlight {...spotlight} />

      {/* A entrada mora aqui dentro: o transform do <li> é da layout animation,
          e dois donos no mesmo canal brigam. */}
      <motion.div
        className="relative flex flex-col gap-3"
        initial={{ opacity: 0, y: reduce ? 0 : 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={revealViewport}
        transition={{ duration: reduce ? 0 : 0.45, ease: EASE_OUT, delay: reduce ? 0 : delay }}
      >
        {/* O heading é o título do item, não o status — por isso CardHead fica
            como span e o <h3> mora embaixo, junto do checkbox. */}
        <CardHead label={meta.label} meta={String(index + 1).padStart(2, "0")} />

        <div className="flex items-start gap-3">
          <span className="mt-0.5">
            <RoadmapCheckbox
              checked={checked}
              indeterminate={status === "doing"}
              onChange={onToggle}
              label={`${item.title} — ${meta.label}`}
            />
          </span>
          <h3 className="rm-title">{item.title}</h3>
        </div>

        <p className="rm-blurb">{item.blurb}</p>

        <CardFoot comment={item.plan ?? `roadmap/${status}`}>
          <Badge variant={BADGE_VARIANT[status]}>{meta.mark}</Badge>
        </CardFoot>
      </motion.div>
    </motion.li>
  )
}
