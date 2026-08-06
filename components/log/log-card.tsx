"use client"

import Image from "next/image"
import { useId, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { CaretDownIcon } from "@phosphor-icons/react"
import { formatLoggedAt } from "@/lib/log/date"
import { starLabel } from "@/lib/log/stars"
import { TYPE_LABEL, type LogEntry } from "@/lib/log/validation"
import { StarRating } from "./star-rating"

/** The "1b" catalog card from docs/log-design.html. */
export function LogCard({ entry }: { entry: LogEntry }) {
  const [open, setOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const panelId = useId()

  const hasNote = Boolean(entry.note)

  return (
    <article
      className="flex gap-3.5 rounded-[14px] border p-3.5 transition-colors"
      style={{
        borderColor: "var(--border-subtle)",
        background: "var(--bg-surface)",
      }}
    >
      <Poster entry={entry} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2">
          <span
            className="inline-flex h-5 items-center rounded-[5px] px-2 font-mono text-[10px] tracking-[0.04em] uppercase"
            style={{
              background: "var(--bg-surface-brand)",
              color: "var(--fg-brand-hover)",
            }}
          >
            {TYPE_LABEL[entry.type]}
          </span>

          <time
            dateTime={entry.loggedAt}
            className="font-mono text-[10px] whitespace-nowrap"
            style={{ color: "var(--fg-muted)" }}
          >
            {formatLoggedAt(entry.loggedAt)}
          </time>
        </div>

        <h3
          className="mt-[9px] font-serif text-xl leading-[1.15] font-normal tracking-[-0.01em]"
          style={{ color: "var(--fg-primary)" }}
        >
          {entry.title}
        </h3>

        {(entry.creator || entry.year) && (
          <div
            className="mt-[3px] truncate font-mono text-[11px]"
            style={{ color: "var(--fg-muted)" }}
          >
            {[entry.creator, entry.year].filter(Boolean).join(" · ")}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
          {entry.rating != null ? (
            <StarRating rating={entry.rating} size={18} />
          ) : (
            <span className="sr-only">{starLabel(entry.rating)}</span>
          )}

          {/* No note means no trigger. Nothing should look interactive unless it is. */}
          {hasNote && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={panelId}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded font-mono text-[10px] transition-colors"
              style={{ color: open ? "var(--fg-secondary)" : "var(--fg-muted)" }}
            >
              {"// note"}
              <CaretDownIcon
                size={10}
                weight="bold"
                aria-hidden
                style={{
                  transition: reduceMotion ? undefined : "transform 160ms ease",
                  transform: open ? "rotate(180deg)" : undefined,
                }}
              />
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {hasNote && open && (
            <motion.div
              id={panelId}
              initial={reduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.2, 0.8, 0.2, 1] }}
              className="overflow-hidden"
            >
              <p
                className="mt-2.5 border-t pt-2.5 font-sans text-[13px] leading-relaxed"
                style={{ borderColor: "var(--border-subtle)", color: "var(--fg-secondary)" }}
              >
                {entry.note}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  )
}

/**
 * Falls back to the type label on a plain surface when there is no poster or the host
 * fails. Choosing the 1b layout was partly about this: the card reads fine without art,
 * so the fallback is a real state rather than an edge case.
 */
function Poster({ entry }: { entry: LogEntry }) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(entry.posterUrl) && !failed

  return (
    <div
      className="relative aspect-[2/3] w-[92px] shrink-0 overflow-hidden rounded-[7px] border"
      style={{ borderColor: "var(--border-subtle)", background: "var(--bg-canvas)" }}
    >
      {showImage ? (
        <Image
          src={entry.posterUrl as string}
          alt=""
          fill
          sizes="92px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="absolute inset-0 grid place-items-center font-mono text-[9px] tracking-[0.06em] uppercase"
          style={{ color: "var(--fg-muted)" }}
          aria-hidden
        >
          {TYPE_LABEL[entry.type]}
        </span>
      )}

      {entry.favorite && (
        <>
          <span
            aria-hidden
            className="absolute top-[5px] right-1.5 text-xs leading-none"
            style={{ color: "var(--fg-brand)", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
          >
            ♥
          </span>
          <span className="sr-only">favorite</span>
        </>
      )}
    </div>
  )
}
