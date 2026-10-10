"use client"

import { Pushpin } from "@/components/site/tape"
import { tileClass } from "@/components/site/tile"
import { EnvelopeSimpleOpenIcon, LinkedinLogoIcon } from "@phosphor-icons/react"
import type { CSSProperties } from "react"
import { Avatar } from "@/app/components/entrepta/avatar"
import {
  CardComment,
  CardFooter,
  CardHeader,
  CardLabel,
  CardMeta,
} from "@/app/components/entrepta/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/entrepta/dialog"
import { Reveal } from "@/app/components/entrepta/reveal"
import type { Letter } from "./letters"

const LONG = 320
const ANGLES = [-1.3, 0.9, -0.6, 1.4, -1, 0.7]

function Who({ letter, large = false }: { letter: Letter; large?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={letter.name} src={letter.photo} size={large ? "lg" : "md"} />
      <div className="min-w-0">
        <p className="text-mono-sm truncate font-mono font-medium text-[var(--fg-primary)]">
          {letter.name}
        </p>
        <p className="text-mono-xs truncate font-mono text-[var(--fg-muted)]">
          {[letter.role, letter.company].filter(Boolean).join(" · ")}
        </p>
      </div>
    </div>
  )
}

function Linkedin({ letter }: { letter: Letter }) {
  if (!letter.linkedin) return null
  return (
    <a
      href={letter.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      className="st-wl-linkedin focus-ring"
      aria-label={`${letter.name} on LinkedIn`}
    >
      <LinkedinLogoIcon aria-hidden size={16} weight="fill" />
    </a>
  )
}

export function Mural({ letters }: { letters: Letter[] }) {
  return (
    <ul className="st-wl-mural">
      {letters.map((letter, index) => {
        const paragraphs = letter.text.split(/\n\s*\n/)
        const long = letter.text.length > LONG
        return (
          <li key={letter.id}>
            <Reveal index={index}>
              <article
                className="st-wl-letter"
                style={{ "--tilt": `${ANGLES[index % ANGLES.length]}deg` } as CSSProperties}
              >
                <Pushpin />
                <div className={tileClass({ size: "sm" }, "st-wl-sheet")}>
                  <Who letter={letter} />
                  <blockquote
                    className="st-wl-text text-body-md font-sans"
                    data-cut={long || undefined}
                  >
                    {paragraphs.map((paragraph) => (
                      <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                    ))}
                  </blockquote>
                  {long || letter.linkedin ? (
                    <div className="flex items-center justify-between gap-3">
                      {long ? (
                        <Dialog>
                          <DialogTrigger className="st-wl-open focus-ring text-mono-sm font-mono">
                            read the whole letter
                          </DialogTrigger>

                          <DialogContent className="st-wl-dialog max-w-2xl">
                            <Pushpin />
                            <DialogTitle className="sr-only">
                              A letter from {letter.name}
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                              {[letter.role, letter.company].filter(Boolean).join(", ")}
                            </DialogDescription>
                            <CardHeader className="pr-8">
                              <CardLabel icon={<EnvelopeSimpleOpenIcon />}>letter</CardLabel>
                              <CardMeta>
                                {index + 1} of {letters.length}
                              </CardMeta>
                            </CardHeader>
                            <Who letter={letter} large />
                            <blockquote className="st-wl-text st-wl-scroll text-body-lg font-sans">
                              {paragraphs.map((paragraph) => (
                                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                              ))}
                            </blockquote>
                            <CardFooter className="border-t border-dashed border-[var(--border-subtle)] pt-3">
                              <CardComment>kind words, by invitation</CardComment>
                              <Linkedin letter={letter} />
                            </CardFooter>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <span />
                      )}
                      <Linkedin letter={letter} />
                    </div>
                  ) : null}
                </div>
              </article>
            </Reveal>
          </li>
        )
      })}
    </ul>
  )
}
