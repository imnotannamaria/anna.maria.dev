"use client"

import { LinkedinLogoIcon, PaperPlaneTiltIcon } from "@phosphor-icons/react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useEffect, useRef, useState, type FormEvent } from "react"
import { siGithub, siGmail, siX } from "simple-icons"
import { Button } from "@/app/components/entrepta/button"
import { Cat } from "@/components/site/abimaela/abimaela"
import { Dock, type DockItem } from "@/components/site/dock"
import { Plate } from "@/components/site/plate"

/**
 * The contact form as a postcard, and the channels as a dock. Nothing is sent yet: submitting
 * only plays the "posted" ending. Wire it to /api/contact (Resend) before it is published, and
 * keep the error ending for a real failure.
 */
export type Channels = { email: string; github: string; linkedin: string; x: string }

type Phase = "writing" | "sending" | "sent" | "error"

const WAIT = 1100

function Glyph({ path, color }: { path: string; color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d={path} />
    </svg>
  )
}

export function dockChannels(channels: Channels): DockItem[] {
  const stripProtocol = (url: string) => url.replace(/^https?:\/\//, "")
  return [
    {
      name: "Email",
      what: channels.email,
      href: `mailto:${channels.email}`,
      copy: channels.email,

      icon: (
        <Plate>
          <Glyph path={siGmail.path} color={`#${siGmail.hex}`} />
        </Plate>
      ),
    },
    {
      name: "LinkedIn",
      what: stripProtocol(channels.linkedin),
      href: channels.linkedin,
      copy: channels.linkedin,
      icon: (
        <Plate background="#0a66c2">
          <LinkedinLogoIcon aria-hidden weight="fill" />
        </Plate>
      ),
    },
    {
      name: "GitHub",
      what: stripProtocol(channels.github),
      href: channels.github,
      copy: channels.github,
      icon: (
        <Plate>
          <Glyph path={siGithub.path} color={`#${siGithub.hex}`} />
        </Plate>
      ),
    },
    {
      name: "X",
      what: stripProtocol(channels.x),
      href: channels.x,
      copy: channels.x,
      icon: (
        <Plate tone="dark">
          <Glyph path={siX.path} color="#ffffff" />
        </Plate>
      ),
    },
  ]
}

/**
 * The card has four phases: writing, sending, sent and error. Sending stamps the postmark and
 * flies the card away; sent shows a receipt with a drawn check; error shakes the card and stamps
 * "return to sender". The error ending has no trigger yet, because nothing is sent: it is here
 * for when the form is wired to the API.
 */
export function Postcard({ channels }: { channels: Channels }) {
  const reduce = useReducedMotion() ?? false
  const [phase, setPhase] = useState<Phase>("writing")
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const send = (final: "sent" | "error") => {
    clearTimeout(timer.current)
    setPhase("sending")
    timer.current = setTimeout(() => setPhase(final), WAIT)
  }
  const onSend = (event: FormEvent) => {
    event.preventDefault()
    send("sent")
  }
  const stamped = phase !== "writing"

  const animate =
    phase === "error" && !reduce
      ? { opacity: 1, y: 0, x: [0, -14, 13, -10, 9, -5, 4, 0] }
      : phase === "sending" && !reduce
        ? { opacity: 1, x: 0, y: [0, 3, 0] }
        : { opacity: 1, x: 0, y: 0 }
  const transition = reduce
    ? { duration: 0 }
    : phase === "error"
      ? { duration: 0.55, ease: "easeInOut" as const }
      : phase === "sending"
        ? { duration: 0.28, delay: 0.14 }
        : { type: "spring" as const, stiffness: 260, damping: 24 }

  return (
    <div className="flex flex-col gap-8">
      <div className="st-ct-stage">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "sent" ? (
            <motion.div
              key="receipt"
              className="st-ct-receipt"
              role="status"
              initial={{ opacity: 0, y: reduce ? 0 : 28, scale: reduce ? 1 : 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={
                reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 22 }
              }
            >
              <svg viewBox="0 0 96 96" className="st-ct-seen" aria-hidden>
                <circle cx="48" cy="48" r="44" />
                <circle cx="48" cy="48" r="34" />
                <motion.path
                  d="M32 49l11 11 22-24"
                  initial={{ pathLength: reduce ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.25 }}
                />
              </svg>
              <p className="text-display-md font-serif text-[var(--fg-primary)]">Posted.</p>
              <p className="text-body-md font-sans text-[var(--fg-secondary)]">
                Thanks for writing.
              </p>
              <Button variant="secondary" onClick={() => setPhase("writing")}>
                write another one
              </Button>
            </motion.div>
          ) : (
            <motion.form
              key="card"
              onSubmit={onSend}
              className="st-ct-postal"
              data-phase={phase}
              initial={{ opacity: 0, y: reduce ? 0 : 20 }}
              animate={animate}
              transition={transition}
              exit={
                reduce
                  ? { opacity: 0, transition: { duration: 0 } }
                  : {
                      x: [0, -22, 260],
                      y: [0, 6, -190],
                      rotate: [0, -2.5, 11],
                      scale: [1, 1, 0.9],
                      opacity: [1, 1, 0],
                      transition: {
                        duration: 0.66,
                        times: [0, 0.3, 1],
                        ease: ["easeOut", "easeIn"],
                      },
                    }
              }
            >
              <p aria-hidden className="st-ct-title text-mono-xs font-mono">
                post card
              </p>

              <div className="st-ct-front">
                <label
                  htmlFor="postal-message"
                  className="text-mono-xs font-mono tracking-widest text-[var(--fg-muted)] uppercase"
                >
                  greetings from wherever you are
                </label>
                <textarea
                  id="postal-message"
                  name="message"
                  placeholder="a postcard is short. so is this side."
                  required
                  className="st-ct-message font-serif"
                  onInput={() => {
                    if (phase === "error") setPhase("writing")
                  }}
                />
              </div>

              <div className="st-ct-back">
                <div className="st-ct-corner" aria-hidden>
                  {stamped ? (
                    <motion.svg
                      viewBox="0 0 150 76"
                      className="st-ct-postmark"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.9, rotate: -22 }}
                      animate={{ opacity: 0.8, scale: 1, rotate: -9 }}
                      transition={
                        reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 20 }
                      }
                    >
                      <circle cx="38" cy="38" r="34" />
                      <circle cx="38" cy="38" r="24" />
                      <path d="M76 22q9-7 18 0t18 0 18 0 18 0M76 38q9-7 18 0t18 0 18 0 18 0M76 54q9-7 18 0t18 0 18 0 18 0" />
                      <text x="38" y="35" textAnchor="middle">
                        TAMANDARÉ
                      </text>
                      <text x="38" y="47" textAnchor="middle">
                        PE · BR
                      </text>
                    </motion.svg>
                  ) : null}

                  <span className="st-ct-stamp">
                    <span>
                      <Cat height={52} />
                    </span>
                    <small className="font-mono">brasil</small>
                  </span>
                </div>

                <p className="st-ct-address">
                  <span className="text-mono-xs font-mono tracking-widest text-[var(--fg-muted)] uppercase">
                    to
                  </span>
                  <span className="text-heading-lg font-serif text-[var(--fg-primary)]">
                    Anna Maria
                  </span>
                  <span className="text-mono-sm font-mono text-[var(--fg-secondary)]">
                    Tamandaré, Pernambuco
                  </span>
                  <span className="text-mono-sm font-mono text-[var(--fg-secondary)]">Brazil</span>
                </p>

                <div className="st-ct-sender">
                  <span className="text-mono-xs font-mono tracking-widest text-[var(--fg-muted)] uppercase">
                    from
                  </span>
                  <input
                    name="name"
                    aria-label="Your name"
                    placeholder="your name"
                    required
                    className="text-mono-md font-mono"
                  />
                  <input
                    name="email"
                    type="email"
                    aria-label="Your email"
                    placeholder="your email, so I can answer"
                    required
                    className="text-mono-md font-mono"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-mono-sm min-h-5 font-mono" role="status">
                    {phase === "error" ? (
                      <span className="text-[var(--status-error-fg)]">
                        it came back. your message is still here.
                      </span>
                    ) : null}
                  </p>
                  <Button type="submit" loading={phase === "sending"}>
                    {phase === "error" ? "try again" : "post it"}
                    <PaperPlaneTiltIcon aria-hidden size={15} weight="bold" />
                  </Button>
                </div>
              </div>

              <AnimatePresence>
                {phase === "error" ? (
                  <motion.span
                    key="returned"
                    aria-hidden
                    className="st-ct-returned font-mono"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 2.4, rotate: -24 }}
                    animate={{ opacity: 1, scale: 1, rotate: -11 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 460, damping: 17, delay: 0.3 }
                    }
                  >
                    return to sender
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-mono-xs text-center font-mono tracking-widest text-[var(--fg-muted)] uppercase">
          or find me here
        </h2>
        <Dock label="Channels" items={dockChannels(channels)} />
      </div>
    </div>
  )
}
