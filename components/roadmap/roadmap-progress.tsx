"use client"

/**
 * PROTÓTIPO / DISCOVERY — o card de progresso.
 *
 * Também um `.bento-card`: cabeça, corpo, pé. O corpo é um stepper — as três
 * colunas viram etapas, e a etapa que está viva pulsa.
 */

import { motion, useReducedMotion } from "motion/react"
import { CardFoot, CardHead } from "@/components/ui/card-parts"
import { revealViewport, useReveal } from "@/components/ui/reveal"
import { RollingNumber, useRollOnHover } from "@/components/ui/rolling-number"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { ROADMAP_STATUS, type RoadmapStatus } from "@/lib/roadmap-data"

const STEPS: RoadmapStatus[] = ["todo", "doing", "done"]

export function RoadmapProgressCard({
  counts,
  doneCount,
  total,
  /** No dialog o card já entrou junto com o modal; lá a entrada é dispensável. */
  animateIn = true,
}: {
  counts: Record<RoadmapStatus, number>
  doneCount: number
  total: number
  animateIn?: boolean
}) {
  const reduce = useReducedMotion() ?? false
  const { onMouseMove, spotlight } = useSpotlight(420)
  const reveal = useReveal(0)
  const roll = useRollOnHover(0.3)
  const pct = total === 0 ? 0 : doneCount / total

  return (
    <motion.div className="bento-card" onMouseMove={onMouseMove} {...(animateIn ? reveal : {})}>
      <Spotlight {...spotlight} />

      <CardHead label="progress" meta={`${Math.round(pct * 100)}% shipped`} />

      <div className="relative flex flex-wrap items-center gap-4">
        <span
          className="flex items-baseline gap-1 font-mono text-[28px] leading-none"
          style={{ color: "var(--fg-primary)" }}
          {...roll.handlers}
        >
          <RollingNumber value={doneCount} cycle={roll.cycle} delay={roll.delay} height={30} />
          <span className="text-lg" style={{ color: "var(--fg-muted)" }}>
            /{total}
          </span>
        </span>

        {/* Escala, não redimensiona: largura reflui layout, transform não. */}
        <div className="rm-progress min-w-[160px] flex-1">
          <motion.div
            className="rm-progress-fill"
            style={{ width: "100%", transformOrigin: "left" }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: pct }}
            viewport={revealViewport}
            transition={
              reduce ? { duration: 0 } : { type: "spring", stiffness: 110, damping: 20, mass: 0.9 }
            }
          />
        </div>
      </div>

      {/* O stepper. Cada etapa carrega sua contagem; a que está viva pulsa. */}
      <div className="relative flex flex-wrap items-center gap-x-3 gap-y-2">
        {STEPS.map((status, i) => {
          const meta = ROADMAP_STATUS[status]
          const state = status === "done" ? "done" : status === "doing" ? "live" : "idle"

          return (
            <div key={status} className="rm-step" data-state={state}>
              <span className="rm-step-mark" aria-hidden>
                {status === "done" ? "✓" : counts[status]}
              </span>
              <span
                className="font-mono text-[11px] tracking-[0.08em] whitespace-nowrap uppercase"
                style={{ color: state === "idle" ? "var(--fg-muted)" : "var(--fg-secondary)" }}
              >
                {meta.label}
                <span className="sr-only">: {counts[status]} items</span>
              </span>
              {i < STEPS.length - 1 && <span className="rm-step-rule" aria-hidden />}
            </div>
          )
        })}
      </div>

      <CardFoot comment="ROADMAP.md">
        <span style={{ color: "var(--fg-brand)" }}>◆</span>
      </CardFoot>
    </motion.div>
  )
}
