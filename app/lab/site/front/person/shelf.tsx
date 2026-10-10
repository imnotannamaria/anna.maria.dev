"use client"

import { BooksIcon } from "@phosphor-icons/react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import Image from "next/image"
import { useState } from "react"
import { ArrowLink } from "@/app/components/entrepta/arrow-link"
import {
  CardFooter,
  CardHeader,
  CardLabel,
  CardMeta,
  cardVariants,
} from "@/app/components/entrepta/card"
import { SegmentedControl } from "@/app/components/entrepta/segmented-control"
import { StarRating } from "@/components/log/star-rating"
import { TYPE_PLURAL, type LogType } from "@/lib/log/constants"
import { posterSrc } from "@/lib/log/poster-src"
import type { LogEntry } from "@/lib/log/validation"
import { revealViewport } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { ScreenLink } from "../screen-link"

const TYPES = 4
const COVERS = 14

export function Shelf({ entries }: { entries: LogEntry[] | null }) {
  const reduce = useReducedMotion() ?? false

  const groups = new Map<LogType, LogEntry[]>()
  for (const entry of entries ?? []) {
    groups.set(entry.type, [...(groups.get(entry.type) ?? []), entry])
  }
  const types = [...groups.keys()].slice(0, TYPES)

  const [type, setType] = useState<LogType | undefined>(types[0])
  const items = (type ? groups.get(type) : undefined) ?? []
  const [inHand, setInHand] = useState<LogEntry | null>(items[0] ?? null)

  const cover: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : -16, rotate: reduce ? 0 : -5 },
    shown: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 24 },
    },
  }

  return (
    <section className={cn(cardVariants({ size: "sm" }), "st-card h-full")}>
      <CardHeader>
        <CardLabel as="h2" icon={<BooksIcon />}>
          log
        </CardLabel>
        {types.length > 1 ? (
          <SegmentedControl
            size="sm"
            aria-label="Kind"
            className="st-shelf-types"
            options={types.map((t) => ({ value: t, label: TYPE_PLURAL[t] }))}
            value={type}
            onValueChange={(value) => {
              const picked = value as LogType
              setType(picked)
              setInHand(groups.get(picked)?.[0] ?? null)
            }}
          />
        ) : (
          <CardMeta>{entries ? `${entries.length} finished` : "offline"}</CardMeta>
        )}
      </CardHeader>

      {items.length === 0 ? (
        <p className="text-body-md flex-1 font-sans text-[var(--fg-secondary)]">
          {entries === null
            ? "The log lives in Postgres, and Postgres did not answer just now."
            : "Nothing logged yet."}
        </p>
      ) : (
        <motion.ul
          key={type}
          className="st-spines"
          initial="hidden"
          whileInView="shown"
          viewport={revealViewport}
          variants={{
            hidden: {},

            shown: { transition: reduce ? {} : { staggerChildren: 0.04 } },
          }}
        >
          {items.slice(0, COVERS).map((item) => (
            <motion.li
              key={item.id}
              variants={cover}
              className="st-spine"
              data-type={item.type}
              data-in-hand={item.id === inHand?.id || undefined}
              onPointerEnter={() => setInHand(item)}
            >
              <button
                type="button"
                className="st-spine-button focus-ring"
                aria-label={`${item.title}${item.creator ? `, ${item.creator}` : ""}`}
                aria-pressed={item.id === inHand?.id}
                onFocus={() => setInHand(item)}
              >
                {item.type === "music" ? <span aria-hidden className="st-spine-disc" /> : null}
                <span className="st-spine-cover">
                  {item.posterUrl ? (
                    <Image
                      src={posterSrc(item.posterUrl)}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-mono-xs p-1 font-mono">{item.title}</span>
                  )}
                </span>
                {item.favorite ? (
                  <span aria-hidden className="st-spine-heart">
                    ♥
                  </span>
                ) : null}
              </button>
            </motion.li>
          ))}
        </motion.ul>
      )}

      {inHand ? (
        <CardFooter className="flex-nowrap">
          <p key={inHand.id} className="st-enter min-w-0 flex-1 truncate">
            <span className="text-heading-md font-serif text-[var(--fg-primary)]">
              {inHand.title}
            </span>
            <span className="ml-2.5">
              {[inHand.creator, inHand.year].filter(Boolean).join(" · ")}
            </span>
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <StarRating rating={inHand.rating} size={14} />
            {inHand.favorite ? (
              <span className="text-[var(--fg-brand)]">
                <span aria-hidden>♥</span>
                <span className="sr-only">favourite</span>
              </span>
            ) : null}
            <ArrowLink asChild>
              <ScreenLink to="log">the log</ScreenLink>
            </ArrowLink>
          </div>
        </CardFooter>
      ) : null}
    </section>
  )
}
