"use client"

/**
 * One component, and a row of pills to put it in each state it can be in.
 *
 * Pills rather than the frames side by side. At 375px there are 319px once the sidebar has
 * taken its cut and these cards are drawn at ~500px, so laying them out in a row means a
 * horizontal scroller of interactive widgets where every off-screen card is still in the tab
 * order. The site already has a vocabulary for "pick one of these" — `FilterPill`, on four
 * pages — and reusing it means this reads as the same site.
 *
 * The frame is only mounted once it has been near the viewport. Two of these demos are the
 * heaviest things in the repo (React Flow, a Web Audio piano) and seven live cards on one page
 * is otherwise seven chunks fetched on load.
 */

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { FilterPill } from "@/components/ui/url-filter"
import { EASE_OUT } from "@/components/ui/reveal"
import { CardLoading } from "@/components/ui/card-states"
import { renderDemo } from "./demos"
import type { CardStateKind } from "@/lib/showcase/state"

export function StateCarousel({
  slug,
  name,
  states,
  minHeight = 220,
}: {
  slug: string
  name: string
  states: readonly CardStateKind[]
  /** Reserved while the frame is out of view and between states, so nothing below shifts. */
  minHeight?: number
}) {
  const [active, setActive] = useState<CardStateKind>(states[0])
  const [near, setNear] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion() ?? false

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true)
          observer.disconnect()
        }
      },
      // A generous margin so the chunk is in flight before the card is actually read.
      { rootMargin: "400px 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div>
      {/* One state is not a choice. A card with a single honest state gets no pills rather
          than a row of one, which would imply there is something else to see. */}
      {states.length > 1 && (
        <div role="group" aria-label={`${name} — states`} className="mb-3 flex flex-wrap gap-2">
          {states.map((kind) => (
            <FilterPill
              key={kind}
              label={kind}
              active={active === kind}
              onClick={() => setActive(kind)}
            />
          ))}
        </div>
      )}

      <figure className="m-0" ref={ref} style={{ minHeight }}>
        {near ? (
          <AnimatePresence mode="wait" initial={false}>
            {/* Keyed on the state, so switching crossfades rather than snapping. This is not an
                entrance — the card's own useReveal already ran once when it mounted — so it is
                AnimatePresence rather than whileInView, and it asks useReducedMotion itself
                because the global reset only reaches CSS. */}
            <motion.div
              key={active}
              initial={{ opacity: reduce ? 1 : 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: reduce ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.18, ease: EASE_OUT }}
            >
              {renderDemo(slug, active)}
            </motion.div>
          </AnimatePresence>
        ) : (
          <CardLoading label={name} rows={0} minHeight={minHeight} />
        )}

        <figcaption className="sr-only">{`${name}, shown in its "${active}" state`}</figcaption>
      </figure>
    </div>
  )
}
