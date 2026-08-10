"use client"

/**
 * One roadmap item.
 *
 * It is a `.bento-card` like every other card on the site: `CardHead` on top, `CardFoot`
 * at the bottom, a `Badge` for the status and the spotlight that trails the cursor.
 * `.rm-item` adds what is the roadmap's own — the accent bar on the left edge, the light
 * that runs the border on hover, and the shipped treatment.
 *
 * Not `.featured-card`, which is the only card hover on the site that lifts. `layout` here
 * means Motion owns this element's `transform` and writes it inline the moment a filter
 * moves the card, so the CSS lift would quietly stop happening after the first click. The
 * hover is the light and the shadow instead, and those are properties nobody else claims.
 */

import { motion, useReducedMotion } from "motion/react"
import { Badge, CardFoot, CardHead } from "@/components/ui/card-parts"
import { EASE_OUT, revealViewport } from "@/components/ui/reveal"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import {
  STATUS_LABEL,
  STATUS_MARK,
  type PublicStatus,
  type RoadmapItem,
} from "@/lib/roadmap/validation"
import { RoadmapMark } from "./roadmap-mark"

const BADGE_VARIANT: Record<PublicStatus, "default" | "brand-soft" | "success-soft"> = {
  todo: "default",
  doing: "brand-soft",
  done: "success-soft",
}

export function RoadmapItemCard({
  item,
  index,
  delay = 0,
}: {
  item: RoadmapItem
  index: number
  delay?: number
}) {
  const reduce = useReducedMotion() ?? false
  const { onMouseMove, spotlight } = useSpotlight(320)
  const status = item.status as PublicStatus

  return (
    /* `layoutId` is what makes a card travel when the filter changes instead of blinking
       out of one place and into another. */
    <motion.li
      layout
      layoutId={`rm-${item.id}`}
      transition={reduce ? { duration: 0 } : { layout: { duration: 0.45, ease: EASE_OUT } }}
      className="bento-card rm-item"
      data-status={status}
      id={`item-${item.slug}`}
      onMouseMove={onMouseMove}
    >
      <Spotlight {...spotlight} />

      {/* The entrance lives on an inner element: the <li>'s transform belongs to the
          layout animation, and two owners on one channel fight. */}
      <motion.div
        className="relative flex flex-col gap-3"
        initial={{ opacity: 0, y: reduce ? 0 : 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={revealViewport}
        transition={{ duration: reduce ? 0 : 0.45, ease: EASE_OUT, delay: reduce ? 0 : delay }}
      >
        {/* The heading is the item's title, not its status — so CardHead stays a span and
            the <h3> sits below it, next to the mark. The status is announced here, once:
            the mark and the badge below are both decoration. The ordinal is an index within
            a column, which is a fact about the layout and not about the item. */}
        <CardHead
          label={STATUS_LABEL[status]}
          meta={<span aria-hidden>{String(index + 1).padStart(2, "0")}</span>}
        />

        <div className="flex items-start gap-3">
          <span className="mt-0.5">
            <RoadmapMark status={status} />
          </span>
          <h3 className="rm-title">{item.title}</h3>
        </div>

        {item.blurb && <p className="rm-blurb">{item.blurb}</p>}

        <CardFoot comment={item.planUrl ?? `roadmap/${status}`}>
          <Badge variant={BADGE_VARIANT[status]}>
            <span aria-hidden>{STATUS_MARK[status]}</span>
          </Badge>
        </CardFoot>
      </motion.div>
    </motion.li>
  )
}
