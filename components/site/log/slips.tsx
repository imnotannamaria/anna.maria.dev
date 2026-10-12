"use client"

import { ArrowSquareOutIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { buttonVariants } from "@/app/components/entrepta/button-variants"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/app/components/entrepta/dialog"
import { Reveal } from "@/app/components/entrepta/reveal"
import { tileClass } from "@/components/site/tile"
import type { LogEntry } from "@/lib/log/validation"
import { LogCover, Note, who } from "./catalog"
import "@/components/site/dialog.css"

/**
 * The entries as slips, and the one that is open. A slip shows four lines of the note; the
 * dialog shows all of it, a bigger cover and the way out to wherever the entry lives.
 *
 * The whole slip opens it, through a button stretched over the card. The link to wherever the
 * entry lives is inside the dialog, so a click on a card never leaves the site.
 */
export function Slips({ items }: { items: LogEntry[] }) {
  const t = useTranslations("log")
  const [open, setOpen] = useState<LogEntry | null>(null)
  // what the dialog draws while it closes: the entry stays until the exit is over
  const [last, setLast] = useState<LogEntry | null>(null)
  const shown = open ?? last

  return (
    <>
      <ul className="st-lg-grid" data-drawing="slips">
        {items.map((entry, index) => (
          <li key={entry.id}>
            <Reveal index={index} step={0.04} className="flex flex-1">
              <article className={tileClass({ size: "sm" }, "st-lg-slip")}>
                <button
                  type="button"
                  className="focus-ring absolute inset-0 z-[1] cursor-pointer rounded-[var(--radius-md)]"
                  aria-label={t("open", { title: entry.title })}
                  aria-haspopup="dialog"
                  onClick={() => {
                    setOpen(entry)
                    setLast(entry)
                  }}
                />
                <LogCover entry={entry} sizes="96px" />
                <div className="flex min-w-0 flex-col gap-1.5">
                  <h3 className="text-heading-md font-serif text-[var(--fg-primary)]">
                    {entry.title}
                  </h3>
                  <p className="text-mono-xs font-mono text-[var(--fg-muted)]">{who(entry)}</p>
                  <Note entry={entry} />
                  {entry.note ? (
                    <p className="text-body-md mt-1 line-clamp-4 font-serif text-[var(--fg-secondary)] italic">
                      &ldquo;{entry.note}&rdquo;
                    </p>
                  ) : null}
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>

      <Dialog open={open !== null} onOpenChange={(next) => (next ? undefined : setOpen(null))}>
        <DialogContent className="st-dialog st-lg-entry max-w-xl">
          {shown ? (
            <>
              <div className="st-lg-entry-head">
                <LogCover entry={shown} sizes="140px" />
                <div className="flex min-w-0 flex-col gap-2">
                  <p className="text-mono-xs font-mono tracking-[0.08em] text-[var(--fg-muted)] uppercase">
                    {t(`type.${shown.type}`)}
                  </p>
                  <DialogTitle>{shown.title}</DialogTitle>
                  <p className="text-mono-sm font-mono text-[var(--fg-muted)]">{who(shown)}</p>
                  <Note entry={shown} size={16} />
                </div>
              </div>

              {shown.note ? (
                <DialogDescription className="text-body-lg font-serif text-[var(--fg-secondary)] italic">
                  &ldquo;{shown.note}&rdquo;
                </DialogDescription>
              ) : (
                <DialogDescription className="sr-only">{who(shown)}</DialogDescription>
              )}

              {shown.externalUrl ? (
                <a
                  href={shown.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-sound="click"
                  className={buttonVariants({
                    variant: "secondary",
                    size: "sm",
                    className: "self-start",
                  })}
                >
                  {t("openLink", { site: siteOf(shown.externalUrl) })}
                  <ArrowSquareOutIcon aria-hidden size={14} weight="bold" />
                </a>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

/** `open.spotify.com` from the address, so the button says where it goes. */
function siteOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}
