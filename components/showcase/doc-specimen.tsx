"use client"

/**
 * The specimen at the top of a component's doc page.
 *
 * The same two pieces the index uses — a state list beside a staged demo — so clicking through
 * from `/components` is not a change of language. It owns the active state because the list and
 * the stage are siblings in this layout rather than one containing the other.
 *
 * The list sits on the left at ≥720px and above the stage below it. The doc column is 760px, so
 * there is less room here than on the index and the meta column is narrower to match.
 */

import { useState } from "react"
import { DemoStage, StateList } from "./demo-viewer"
import { defaultState, type CardStateKind } from "@/lib/showcase/state"

export function DocSpecimen({
  slug,
  name,
  states,
}: {
  slug: string
  name: string
  states: readonly CardStateKind[]
}) {
  const [active, setActive] = useState<CardStateKind>(defaultState(states))

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-3 min-[720px]:grid-cols-[minmax(0,150px)_minmax(0,1fr)]">
      <div className="min-w-0">
        <span
          className="text-mono-xs mb-2 block font-mono tracking-[0.08em] uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          states
        </span>
        <StateList states={states} active={active} onSelect={setActive} label={name} />
      </div>

      <DemoStage slug={slug} name={name} active={active} className="min-w-0" />
    </div>
  )
}
