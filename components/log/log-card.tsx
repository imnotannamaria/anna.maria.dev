"use client"

import { useId, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ArrowUpRightIcon, CaretDownIcon } from "@phosphor-icons/react"
import { CardFoot, CardHead } from "@/components/ui/card-parts"
import { useReveal } from "@/components/ui/reveal"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { cn } from "@/lib/utils"
import { formatLoggedAt } from "@/lib/log/date"
import { posterSrc } from "@/lib/log/poster-src"
import { starLabel } from "@/lib/log/stars"
import { TYPE_LABEL, type LogEntry } from "@/lib/log/validation"
import { StarRating } from "./star-rating"

/**
 * The "1b" catalog card from docs/log-design.html, on the shared surface.
 *
 * It used to draw its own `rounded-[14px] border p-3.5` with its own hover, which is how it
 * ended up the one card on the site that didn't react like the others. It is `.bento-card`
 * now — plus `.bento-card-sm`, because 24px of padding on a 320px tile in a poster grid is
 * most of the tile, and a density modifier is cheaper than a second card.
 */
export function LogCard({ entry, index = 0 }: { entry: LogEntry; index?: number }) {
  const [open, setOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const panelId = useId()
  const { onMouseMove, spotlight } = useSpotlight(280)
  const reveal = useReveal(Math.min(index, 6) * 0.04)

  const hasNote = Boolean(entry.note)
  const link = entry.externalUrl

  return (
    <motion.article
      className={cn(
        "bento-card bento-card-sm group",
        link && "hover:border-(--border-brand-strong)",
      )}
      onMouseMove={onMouseMove}
      {...reveal}
    >
      <Spotlight {...spotlight} />

      {/* Stretched link: it sits above the content so the whole card is clickable, and
          the note trigger is lifted above it again. Without an external URL there is no
          link at all, so no pointer cursor and nothing to tab to. */}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${entry.title} — opens in a new tab`}
          className="absolute inset-0 z-10 rounded-[var(--radius-lg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--fg-brand)"
        />
      )}

      {/* `relative` so it paints above the spotlight — a sibling in normal flow is painted
          before an absolutely positioned one, and the glow would wash over the text. */}
      <div className="relative flex gap-3.5">
        <Poster entry={entry} />

        <div className="flex min-w-0 flex-1 flex-col">
          <CardHead
            label={TYPE_LABEL[entry.type]}
            meta={
              <time dateTime={entry.loggedAt} className="whitespace-nowrap">
                {formatLoggedAt(entry.loggedAt)}
              </time>
            }
          />

          <h3
            className="mt-[9px] font-serif text-xl leading-[1.15] font-normal tracking-[-0.01em]"
            style={{ color: "var(--fg-primary)" }}
          >
            {entry.title}
            {link && (
              <ArrowUpRightIcon
                size={13}
                weight="bold"
                aria-hidden
                className="ml-1.5 inline-block align-middle opacity-0 transition-opacity group-hover:opacity-100"
                style={{ color: "var(--fg-brand)" }}
              />
            )}
          </h3>

          {(entry.creator || entry.year) && (
            <div
              className="text-mono-sm mt-[3px] truncate font-mono"
              style={{ color: "var(--fg-muted)" }}
            >
              {[entry.creator, entry.year].filter(Boolean).join(" · ")}
            </div>
          )}

          {/* Wraps rather than squeezing: at 375px the text column is only ~200px, and
              five 18px stars plus the trigger do not always share a line. */}
          <CardFoot className="flex-wrap gap-x-2 gap-y-1 pt-2.5">
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
                // z-20 keeps it above the stretched link, so the note still toggles.
                //
                // `py-[5px] -my-[5px]` is the whole point of the pair: 10px mono type gives
                // a 15px-tall target, and WCAG 2.5.8 wants 24. The padding grows the hit
                // area to 25px and the negative margin gives it straight back to the layout,
                // so the CardFoot row keeps the height it had — which matters here, because
                // that row is `flex-wrap` and a taller button would push the stars onto a
                // line of their own at 375px.
                className="text-mono-xs relative z-20 -my-[5px] inline-flex shrink-0 cursor-pointer items-center gap-1 rounded py-[5px] font-mono transition-colors"
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
          </CardFoot>
        </div>
      </div>

      {/* Outside the text column on purpose. Nested beside the poster the note gets about
          200px on a phone, which is roughly 25 characters a line. Full card width instead. */}
      <AnimatePresence initial={false}>
        {hasNote && open && (
          <motion.div
            id={panelId}
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            // Above the stretched link too, so the note text stays selectable.
            className="relative z-20 overflow-hidden"
          >
            <p
              className="text-mono-md mt-3 border-t pt-3 font-sans leading-relaxed"
              style={{ borderColor: "var(--border-subtle)", color: "var(--fg-secondary)" }}
            >
              {entry.note}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
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
        // next/image, via the proxy — and the proxy is what makes that possible without
        // giving anything up. `posterSrc` returns a local path, so no poster host has to
        // appear in remotePatterns, which was the reason this used to be a plain <img>.
        //
        // What that plain <img> was costing: 2.7 MB of oversized bytes on this page (one
        // poster was 1791×2704 at 1.79 MB, drawn 92px wide) and eleven third-party cookies
        // from the hosts it hotlinked. See lib/api/routes/poster.ts.
        //
        // `sizes` is the fixed 92px of the box above, so Next serves the 128px variant and
        // a 256px one for retina, instead of whatever the upstream happened to store.
        <Image
          src={posterSrc(entry.posterUrl as string)}
          alt=""
          fill
          sizes="92px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="text-mono-xs absolute inset-0 grid place-items-center font-mono tracking-[0.06em] uppercase"
          style={{ color: "var(--fg-muted)" }}
          aria-hidden
        >
          {TYPE_LABEL[entry.type]}
        </span>
      )}

      {entry.favorite && (
        <>
          {/* Same 18px as the stars, so the two brand marks on a card read as one weight. */}
          <span
            aria-hidden
            className="absolute top-1 right-1.5 leading-none"
            style={{
              color: "var(--fg-brand)",
              fontSize: 18,
              textShadow: "0 1px 3px rgba(0,0,0,0.6)",
            }}
          >
            ♥
          </span>
          <span className="sr-only">favorite</span>
        </>
      )}
    </div>
  )
}
