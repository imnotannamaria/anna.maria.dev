"use client"

import { tileClass } from "@/components/site/tile"
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { useRef, useState, type CSSProperties, type PointerEvent } from "react"
import { CardComment, CardFooter, CardHeader, CardLabel } from "@/app/components/entrepta/card"
import { SegmentedControl } from "@/app/components/entrepta/segmented-control"
import { TechBadge } from "@/components/about/tech-badge"
import { EASE_OUT, revealViewport } from "@/lib/motion"
import { MONTHS, axis, period, type Entry } from "./career"

type Mode = "timeline" | "list"

/**
 * Work and study on one axis of years: a bar per period, a line for now, and a line that follows
 * the pointer and names the month under it. Solid is work, hatched is study. Clicking a bar opens
 * what happened then; the switch turns the bars into a full-width list.
 *
 * Motion: the entrance belongs to the chart area, which has a real size, and the bars answer
 * through variants, drawing left to right with a clip-path. Switching modes is `layout` on the
 * bar's button, so the two never fight. The pointer line moves by a transform written straight
 * on the element: nothing re-renders.
 */
export function History({
  entries,
  today,
  careerYears,
}: {
  entries: Entry[]

  today: readonly [number, number, number]
  careerYears: number
}) {
  const reduce = useReducedMotion() ?? false
  const [mode, setMode] = useState<Mode>("timeline")
  const [open, setOpen] = useState(
    entries.find((entry) => entry.current && entry.type === "work")?.id ?? entries[0]?.id,
  )
  const ruler = axis(entries, today)

  const area = useRef<HTMLDivElement>(null)
  const pointer = useRef<HTMLDivElement>(null)
  const pointerMonth = useRef<HTMLSpanElement>(null)

  const follow = (event: PointerEvent<HTMLDivElement>) => {
    const box = area.current?.getBoundingClientRect()
    const line = pointer.current
    if (!box || !line || box.width === 0) return
    const x = Math.min(Math.max(event.clientX - box.left, 0), box.width)
    line.style.transform = `translateX(${x}px)`
    line.dataset.active = ""
    const month = Math.min(Math.floor((x / box.width) * ruler.months), ruler.months - 1)
    if (pointerMonth.current) {
      pointerMonth.current.textContent = `${MONTHS[month % 12]} ${ruler.start + Math.floor(month / 12)}`
    }
  }
  const release = () => {
    if (pointer.current) delete pointer.current.dataset.active
  }

  const line: Variants = reduce
    ? { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0 } } }
    : {
        hidden: { opacity: 0, clipPath: "inset(-8px 100% -8px -8px)" },
        shown: {
          opacity: 1,
          clipPath: "inset(-8px -8px -8px -8px)",
          transition: { duration: 0.7, ease: EASE_OUT },
        },
      }

  return (
    <section className={tileClass(undefined, "st-hist")} data-mode={mode}>
      <CardHeader>
        <CardLabel as="h2" icon={<ClockCounterClockwiseIcon />}>
          work and academic history
        </CardLabel>
        <SegmentedControl
          size="sm"
          aria-label="View"
          className="st-hist-mode"
          options={[
            { value: "timeline", label: "timeline" },
            { value: "list", label: "list" },
          ]}
          value={mode}
          onValueChange={(value) => setMode(value as Mode)}
        />
      </CardHeader>

      <div className="st-hist-roll">
        <motion.div
          ref={area}
          className="st-hist-area"
          style={{ "--years": ruler.years.length } as CSSProperties}
          initial="hidden"
          whileInView="shown"
          viewport={revealViewport}
          variants={{
            hidden: {},

            shown: {
              transition: reduce ? {} : { staggerChildren: 0.1, delayChildren: 0.15 },
            },
          }}
          onPointerMove={follow}
          onPointerLeave={release}
        >
          <div className="st-hist-axis text-mono-xs font-mono" aria-hidden>
            {ruler.years.map((year) => (
              <span key={year}>{year}</span>
            ))}
          </div>

          <div className="st-hist-lines">
            {entries.map((entry) => {
              const { left, width } =
                mode === "timeline" ? ruler.range(entry) : { left: 0, width: 100 }
              const selected = entry.id === open
              return (
                <motion.div key={entry.id} variants={line}>
                  <motion.button
                    type="button"
                    layout={!reduce}
                    transition={{ layout: { type: "spring", stiffness: 260, damping: 30 } }}
                    className="st-hist-bar focus-ring text-mono-sm font-mono"
                    data-type={entry.type}
                    aria-pressed={selected}
                    aria-controls={`hist-${entry.id}`}
                    onClick={() => setOpen(entry.id)}
                    style={{ marginLeft: `${left}%`, width: `${width}%`, borderRadius: 8 }}
                  >
                    <motion.span
                      layout={reduce ? false : "position"}
                      className="shrink-0 font-medium text-[var(--fg-primary)]"
                    >
                      {entry.org}
                    </motion.span>

                    <motion.span
                      layout={reduce ? false : "position"}
                      className="st-hist-role min-w-0 flex-1 truncate text-left text-[var(--fg-secondary)]"
                    >
                      {entry.role}
                    </motion.span>
                    <motion.span
                      layout={reduce ? false : "position"}
                      className="text-mono-xs ml-auto shrink-0 text-[var(--fg-muted)]"
                    >
                      {entry.until ? (
                        period(entry)
                      ) : (
                        <>
                          {entry.from[0]} – <span className="text-[var(--fg-brand-text)]">now</span>
                        </>
                      )}
                    </motion.span>
                  </motion.button>
                </motion.div>
              )
            })}
          </div>

          <div
            className="st-hist-now"
            style={{ left: `${(ruler.now / ruler.months) * 100}%` }}
            aria-hidden
          >
            <span className="text-mono-xs font-mono">now</span>
          </div>

          <div ref={pointer} className="st-hist-pointer" aria-hidden>
            <span ref={pointerMonth} className="text-mono-xs font-mono" />
          </div>
        </motion.div>
      </div>

      <div className="st-hist-detail">
        {entries.map((entry) => (
          <section
            key={entry.id}
            id={`hist-${entry.id}`}
            hidden={entry.id !== open}
            aria-label={`${entry.org}, ${entry.role}`}
          >
            <div className="st-enter st-hist-body">
              <div className="flex min-w-0 flex-col gap-3">
                <h3 className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-heading-lg font-serif text-[var(--fg-primary)]">
                    {entry.org}
                  </span>
                  <span className="text-mono-sm font-mono text-[var(--fg-secondary)]">
                    {entry.role}
                  </span>
                  <span className="text-mono-sm font-mono text-[var(--fg-muted)]">
                    {period(entry, "present")}
                  </span>
                </h3>
                <p className="text-body-md max-w-[70ch] font-sans text-[var(--fg-secondary)]">
                  {entry.text}
                </p>
                {entry.tags.length ? (
                  <ul className="flex flex-wrap gap-1.5" aria-label="Stack">
                    {entry.tags.map((tag) => (
                      <li key={tag}>
                        <TechBadge name={tag} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {entry.stats.length ? (
                <dl className="st-hist-stats">
                  {entry.stats.map((stat) => (
                    <div key={stat.what}>
                      <dt className="text-mono-xs font-mono text-[var(--fg-muted)]">{stat.what}</dt>
                      <dd className="text-heading-lg font-serif text-[var(--fg-primary)]">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </section>
        ))}
      </div>

      <CardFooter>
        <CardComment>solid is work, hatched is academic. click a bar to read it</CardComment>
        <span className="text-[var(--fg-brand-text)]">{careerYears} years in</span>
      </CardFooter>
    </section>
  )
}
