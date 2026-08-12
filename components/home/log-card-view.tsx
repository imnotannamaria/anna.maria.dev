"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import { ArrowLink } from "@/components/ui/arrow-link"
import { StarRating } from "@/components/log/star-rating"
import { RollingNumber, useRollOnHover } from "@/components/ui/rolling-number"
import { EASE_OUT, revealViewport } from "@/components/ui/reveal"
import { CardHead } from "@/components/ui/card-parts"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { cn } from "@/lib/utils"
import { posterSrc } from "@/lib/log/poster-src"
import { TYPE_LABEL, TYPE_PLURAL, type LogEntry, type LogType } from "@/lib/log/validation"

export function LogCardView({
  shelf,
  stats,
  byType,
  total,
}: {
  shelf: LogEntry[]
  stats: { label: string; value: number }[]
  byType: { type: LogType; count: number }[]
  total: number
}) {
  const [active, setActive] = useState(0)
  const reduce = useReducedMotion() ?? false
  const { onMouseMove, spotlight } = useSpotlight(720)

  const hero = shelf[Math.min(active, shelf.length - 1)]

  return (
    <div className="bento-card" onMouseMove={onMouseMove}>
      <Spotlight {...spotlight} />

      <CardHead
        label="log"
        meta={
          <span style={{ color: "var(--fg-brand)" }}>
            <ArrowLink href="/log" className="text-[11px] text-(--fg-brand)">
              open the log
            </ArrowLink>
          </span>
        }
      />

      <p
        className="relative font-serif text-xl leading-none"
        style={{ color: "var(--fg-primary)", margin: 0 }}
      >
        A few{" "}
        <em className="italic" style={{ color: "var(--fg-brand)" }}>
          favourites
        </em>
      </p>

      <div className="relative flex flex-1 flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
        <div className="flex min-w-0 flex-col gap-4 lg:w-[46%]">
          <Hero entry={hero} reduce={reduce} />

          <div className="flex flex-wrap gap-2">
            {shelf.map((entry, i) => (
              <button
                key={entry.id}
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                // The button is the hit area and it holds still; the cover
                // inside it is what lifts. Putting the lift here would move the
                // target out from under the cursor and flicker.
                className="group/thumb relative rounded-[9px] p-0.5 outline-none"
              >
                <span className="sr-only">Show {entry.title}</span>
                {/* The ring travels with the cover instead of staying on the
                    button. Hovering a thumb both selects it and lifts it by 2px,
                    so a ring drawn on the static hit area ended up with no gap
                    above the poster and a double gap below — the selection
                    looked mis-centred exactly while you were pointing at it. */}
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-0 rounded-[9px] border",
                    "transition-[transform,border-color] duration-200 ease-out",
                    "group-hover/thumb:-translate-y-0.5 group-focus-visible/thumb:-translate-y-0.5",
                  )}
                  style={{ borderColor: i === active ? "var(--fg-brand)" : "transparent" }}
                />
                <Thumb entry={entry} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {stats.map((s, i) => (
              <StatTile key={s.label} label={s.label} value={s.value} index={i} reduce={reduce} />
            ))}
          </div>

          <TypeBreakdown byType={byType} total={total} reduce={reduce} />
        </div>
      </div>
    </div>
  )
}

/** The entry currently in front: poster, who made it, how it landed. */
function Hero({ entry, reduce }: { entry: LogEntry; reduce: boolean }) {
  return (
    /* `whileInView`, not `animate`, like every other entrance here — the card
       sits well below the fold, and `key` remounting this on every selection
       satisfies the observer on the first frame, so the crossfade between
       entries is unchanged. */
    <motion.div
      key={entry.id}
      className="flex gap-4"
      initial={{ opacity: 0, y: reduce ? 0 : 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={revealViewport}
      transition={{ duration: reduce ? 0 : 0.28, ease: EASE_OUT }}
    >
      <div
        className="relative aspect-2/3 w-24 shrink-0 overflow-hidden rounded-lg border sm:w-28"
        style={{ borderColor: "var(--border-subtle)", background: "var(--bg-canvas)" }}
      >
        {entry.posterUrl ? (
          // Through the proxy, same as the /log card — the home page hotlinked these too,
          // so it was handing visitors the same third-party cookies. See
          // lib/api/routes/poster.ts. The box is w-24 / sm:w-28, hence the two-branch sizes.
          <Image
            src={posterSrc(entry.posterUrl)}
            alt=""
            fill
            sizes="(min-width: 640px) 112px, 96px"
            className="object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="absolute inset-0 grid place-items-center font-mono text-[10px] uppercase"
            style={{ color: "var(--fg-muted)" }}
          >
            {TYPE_LABEL[entry.type]}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <span
          className="font-mono text-[10px] tracking-[0.08em] uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          {TYPE_LABEL[entry.type]}
        </span>

        <p
          className="font-serif text-xl leading-tight"
          style={{ color: "var(--fg-primary)", margin: 0 }}
        >
          {entry.title}
        </p>

        {(entry.creator || entry.year) && (
          <p className="font-mono text-[11px]" style={{ color: "var(--fg-secondary)", margin: 0 }}>
            {[entry.creator, entry.year].filter(Boolean).join(" · ")}
          </p>
        )}

        <div className="flex items-center gap-2">
          {entry.rating != null && <StarRating rating={entry.rating} size={12} />}
          {entry.favorite && (
            <>
              <span aria-hidden style={{ color: "var(--fg-brand)", fontSize: 13 }}>
                ♥
              </span>
              <span className="sr-only">favorite</span>
            </>
          )}
        </div>

        {/* The note only exists on some entries, and it is the most human thing in
            the table — a line about why it landed. When there is one, it gets to
            be here rather than staying buried behind a click on /log. */}
        {entry.note && (
          <p
            className="mt-0.5 line-clamp-3 text-[13px] leading-relaxed"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--fg-secondary)",
              borderLeft: "2px solid var(--border-brand)",
              paddingLeft: 10,
              margin: 0,
            }}
          >
            {entry.note}
          </p>
        )}
      </div>
    </motion.div>
  )
}

/** One cover in the strip under the hero. */
function Thumb({ entry }: { entry: LogEntry }) {
  return (
    <span
      className={cn(
        "relative block aspect-2/3 w-12 overflow-hidden rounded-[7px] border",
        "transition-transform duration-200 ease-out",
        // Focus as well as hover: tabbing the strip already swaps the hero, so
        // the cover should answer a keyboard the same way it answers a pointer.
        "group-hover/thumb:-translate-y-0.5 group-focus-visible/thumb:-translate-y-0.5",
      )}
      style={{ borderColor: "var(--border-subtle)", background: "var(--bg-canvas)" }}
    >
      {entry.posterUrl ? (
        // Through the proxy, like the hero above it. w-12, so 48px.
        <Image src={posterSrc(entry.posterUrl)} alt="" fill sizes="48px" className="object-cover" />
      ) : (
        <span
          aria-hidden
          className="absolute inset-0 grid place-items-center font-mono text-[8px] uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          {TYPE_LABEL[entry.type]}
        </span>
      )}
      {entry.favorite && (
        <span
          aria-hidden
          className="absolute top-0.5 right-1 leading-none"
          style={{
            color: "var(--fg-brand)",
            fontSize: 11,
            textShadow: "0 1px 3px rgba(0,0,0,0.6)",
          }}
        >
          ♥
        </span>
      )}
    </span>
  )
}

/**
 * The type split. It used to be an 8px bar with a legend under it, tucked at the
 * bottom of a column with a hole in the middle of it — so it takes the room now:
 * one row per type, each with its own bar, count, and share of the whole.
 *
 * Each shade is the brand colour mixed further into the canvas, so the ramp
 * follows whichever of the six themes is active instead of pinning six literal
 * colours.
 */
function TypeBreakdown({
  byType,
  total,
  reduce,
}: {
  byType: { type: LogType; count: number }[]
  total: number
  reduce: boolean
}) {
  if (byType.length === 0) return null

  const shade = (i: number) =>
    `color-mix(in srgb, var(--fg-brand) ${100 - i * 13}%, var(--bg-canvas))`
  const widest = Math.max(...byType.map((t) => t.count))

  return (
    /*
     * The trigger sits on this container and reaches the bars through variants.
     *
     * Putting `whileInView` on the bars themselves looked right and did nothing:
     * they start at `scaleX: 0`, an element with no width has no area, and an
     * IntersectionObserver asked for 60% of no area never fires. Every bar sat
     * at zero and the whole chart read as empty grey track.
     */
    <motion.div
      className="flex flex-1 flex-col justify-center gap-2.5"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
    >
      {byType.map((t, i) => (
        <div key={t.type} className="group/row flex items-center gap-3">
          <span
            className="w-16 shrink-0 font-mono text-[10px] tracking-[0.06em] transition-colors duration-200 group-hover/row:text-(--fg-brand)"
            style={{ color: "var(--fg-secondary)" }}
          >
            {TYPE_PLURAL[t.type]}
          </span>

          <span
            className="relative h-2.5 flex-1 overflow-hidden rounded-full"
            style={{ background: "var(--border-subtle)" }}
          >
            <motion.span
              className="absolute inset-y-0 left-0 block w-full rounded-full"
              style={{ background: shade(i), originX: 0 }}
              variants={{
                hidden: { scaleX: 0 },
                show: {
                  scaleX: t.count / widest,
                  transition: {
                    duration: reduce ? 0 : 0.7,
                    ease: EASE_OUT,
                    delay: reduce ? 0 : 0.1 + i * 0.08,
                  },
                },
              }}
            />
          </span>

          <span
            className="w-16 shrink-0 text-right font-mono text-[10px]"
            style={{ color: "var(--fg-muted)" }}
          >
            <span style={{ color: "var(--fg-secondary)" }}>{t.count}</span>
            <span aria-hidden className="mx-1 opacity-40">
              ·
            </span>
            {Math.round((t.count / total) * 100)}%
          </span>
        </div>
      ))}
    </motion.div>
  )
}

/**
 * One counter. The number rolls in when the tile is first scrolled to, and
 * rolls a full turn on hover, the same language the profile card's stats use.
 */
function StatTile({
  label,
  value,
  index,
  reduce,
}: {
  label: string
  value: number
  index: number
  reduce: boolean
}) {
  const roll = useRollOnHover(reduce ? 0 : 0.35 + index * 0.07)

  return (
    <motion.div
      className="group/tile relative cursor-default overflow-hidden rounded-lg border px-3 py-2.5 transition-colors duration-200"
      style={{ borderColor: "var(--border-subtle)" }}
      initial={{ opacity: 0, y: reduce ? 0 : 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: reduce ? 0 : 0.4, ease: EASE_OUT, delay: reduce ? 0 : index * 0.07 }}
      {...roll.handlers}
    >
      <div
        className="mb-1 font-mono text-[10px] tracking-[0.08em] uppercase transition-colors duration-200 group-hover/tile:text-(--fg-brand)"
        style={{ color: "var(--fg-muted)" }}
      >
        {label}
      </div>
      <RollingNumber
        value={value}
        cycle={roll.cycle}
        delay={roll.delay}
        height={30}
        className="font-serif italic"
        style={{
          fontSize: 26,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: "var(--fg-brand)",
        }}
      />
      <span
        aria-hidden
        className="absolute inset-x-3 bottom-0 h-px origin-left scale-x-0 transition-transform duration-300 group-hover/tile:scale-x-100"
        style={{ background: "var(--fg-brand)" }}
      />
    </motion.div>
  )
}
