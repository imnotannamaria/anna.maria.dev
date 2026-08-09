"use client"

/** PROTÓTIPO / DISCOVERY — tab vertical no sidebar que abre a listagem. */

import Link from "next/link"
import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogLabel,
  DialogTitle,
} from "@/app/components/entrepta/dialog"
import { ROADMAP_STATUS, type RoadmapStatus } from "@/lib/roadmap-data"
import { RoadmapItemCard } from "./roadmap-card"
import { RoadmapProgressCard } from "./roadmap-progress"
import { useRoadmapState } from "./use-roadmap-state"

const ORDER: RoadmapStatus[] = ["doing", "todo", "done"]

export function RoadmapTab() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="rm-tab mt-auto mb-1 self-end"
      >
        <span aria-hidden className="rm-tab-diamond">
          ◆
        </span>
        Roadmap
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[86vh] w-[calc(100vw-24px)] max-w-[880px] flex-col !gap-0 overflow-hidden !p-0">
          <RoadmapDialogBody onNavigate={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}

function RoadmapDialogBody({ onNavigate }: { onNavigate: () => void }) {
  const { grouped, counts, isChecked, toggle, doneCount, total } = useRoadmapState()
  const reduce = useReducedMotion() ?? false

  return (
    <>
      <div
        className="flex flex-col gap-2 border-b px-6 pt-6 pb-5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <DialogHeader className="gap-1.5">
          <DialogLabel>ROADMAP.md</DialogLabel>
          <DialogTitle>
            What&apos;s <em>next</em>
          </DialogTitle>
          <DialogDescription>
            Ideias soltas pro site. Nada aqui tem data e nem tudo vai existir — um item é um
            pensamento que eu não quis perder.
          </DialogDescription>
        </DialogHeader>
      </div>

      {/* `animate`, não `whileInView`: isto monta junto com o modal, não entra
          por scroll — o observer não é a pergunta certa aqui. */}
      <motion.div
        className="flex flex-col gap-7 overflow-y-auto px-6 py-6"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.04 } } }}
      >
        <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>
          <RoadmapProgressCard
            counts={counts}
            doneCount={doneCount}
            total={total}
            animateIn={false}
          />
        </motion.div>

        {ORDER.map((status) => {
          const items = grouped[status]
          const meta = ROADMAP_STATUS[status]
          if (items.length === 0) return null

          return (
            <motion.section layout key={status} className="flex flex-col gap-3">
              <motion.div
                layout
                className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.08em] uppercase"
                style={{ color: "var(--fg-secondary)" }}
              >
                <span
                  className="rm-dot"
                  aria-hidden
                  data-live={status === "doing"}
                  data-muted={status === "done"}
                />
                <h4 className="m-0 text-[11px] font-normal tracking-[0.08em] uppercase">
                  {meta.label}
                </h4>
                <span
                  className="h-px flex-1"
                  style={{ background: "var(--border-subtle)" }}
                  aria-hidden
                />
                <span style={{ color: "var(--fg-muted)" }}>{items.length}</span>
              </motion.div>

              {/* Grid, não lista corrida: dois cards por linha é o que faz isto
                  ler como bento e não como um bloco de texto. */}
              <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 py-1 sm:grid-cols-2">
                {items.map((item, i) => (
                  <RoadmapItemCard
                    key={item.id}
                    surface="rm-dialog"
                    item={item}
                    status={status}
                    index={i}
                    checked={isChecked(item.id)}
                    onToggle={() => toggle(item.id)}
                  />
                ))}
              </ul>
            </motion.section>
          )
        })}
      </motion.div>

      <div
        className="flex items-center justify-between border-t px-6 py-3.5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <span className="font-mono text-[11px]" style={{ color: "var(--fg-muted)" }}>
          <span style={{ opacity: 0.6 }}>{"// "}</span>
          marcar aqui não salva nada, é protótipo
        </span>
        <Link
          href="/roadmap"
          onClick={onNavigate}
          className="group inline-flex items-center gap-1.5 font-mono text-[11px] no-underline"
          style={{ color: "var(--fg-brand)" }}
        >
          open the board
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </>
  )
}
