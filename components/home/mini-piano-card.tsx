"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { useReveal } from "@/components/ui/reveal"
import { CardHead } from "@/components/ui/card-parts"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"

// ─── Key geometry ────────────────────────────────────────────────────────────
//
// Two octaves, and the keyboard fills whatever width it is given instead of
// sitting at a fixed 238px with air on both sides. Everything horizontal is a
// fraction of the container, so the same markup works at 500px in the home grid
// and at ~240px once a phone's sidebar has taken its cut.

const WH = 62 // white key height
const BH = 38 // black key height

/** C–B twice, plus the C that closes the second octave. */
const WHITE_NOTES = ["C", "D", "E", "F", "G", "A", "B", "C", "D", "E", "F", "G", "A", "B", "C"]
const N = WHITE_NOTES.length

const KEY_W = `calc(100% / ${N})`
/** A black key is a shade under two thirds of a white one, as on a real board. */
const BLACK_W = `calc(100% / ${N} * 0.62)`

/** Straddles the seam between white key `i` and the next one. */
function blackLeft(i: number): string {
  return `calc(${i + 1} * 100% / ${N} - (100% / ${N} * 0.31))`
}

/** The two-black / three-black grouping, repeated an octave up. */
const BLACK_KEY_DATA: [string, string][] = [
  [blackLeft(0), "C#"],
  [blackLeft(1), "D#"],
  [blackLeft(3), "F#"],
  [blackLeft(4), "G#"],
  [blackLeft(5), "A#"],
  [blackLeft(7), "C#"],
  [blackLeft(8), "D#"],
  [blackLeft(10), "F#"],
  [blackLeft(11), "G#"],
  [blackLeft(12), "A#"],
]

const SOL = 4 // G
const LA = 5 // A
/** The same two notes, second time an octave up, so the idle loop travels the
 *  whole keyboard instead of twitching in the left third of it. */
const SEQ = [SOL, LA, SOL + 7, LA + 7]

// ─── Component ───────────────────────────────────────────────────────────────
export function MiniPianoCard() {
  const { onMouseMove, spotlight } = useSpotlight(340)
  const reveal = useReveal()
  const [pressed, setPressed] = useState<number | null>(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    // Respect reduced-motion: skip the auto-play animation entirely (CSS
    // media queries don't stop JS timers, so this has to be guarded here).
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }
    const t0 = setTimeout(() => setPressed(SEQ[step]), 0)
    const t1 = setTimeout(() => setPressed(null), 460)
    const t2 = setTimeout(() => setStep((s) => (s + 1) % SEQ.length), 680)
    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [step])

  return (
    <Link href="/piano" style={{ textDecoration: "none", display: "block" }}>
      <motion.div className="bento-card group/piano h-full" onMouseMove={onMouseMove} {...reveal}>
        <Spotlight {...spotlight} />

        {/* This was a mac title bar — traffic lights over a chrome-tinted strip
            with its own border — which made the piano the one widget in the
            section wearing a costume. Same head as every other card now. */}
        <CardHead label="piano" meta="// tap to play" />

        {/* Stage */}
        <div
          className="relative rounded-[var(--radius-md)] px-5 pt-4 pb-3"
          style={{ background: "var(--piano-stage)" }}
        >
          {/* Frame */}
          <div
            style={{
              background: "var(--piano-frame)",
              padding: "10px 10px 8px",
              borderRadius: 6,
              border: "1px solid var(--piano-frame-border)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 20px var(--piano-frame-cast)",
            }}
          >
            {/* Keys */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: WH,
                overflow: "hidden",
                borderRadius: "0 0 4px 4px",
                isolation: "isolate",
              }}
            >
              {/* White keys */}
              {WHITE_NOTES.map((note, i) => {
                const isPressed = pressed === i
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: `calc(${i} * 100% / ${N})`,
                      top: 0,
                      width: KEY_W,
                      height: WH,
                      borderRight: i < N - 1 ? "1px solid var(--piano-key-sep)" : "none",
                      borderRadius: "0 0 3px 3px",
                      background: isPressed
                        ? "linear-gradient(180deg, var(--fg-brand-hover) 0%, var(--fg-brand) 100%)"
                        : "var(--piano-white-key)",
                      boxShadow: isPressed
                        ? "inset 0 -3px 0 rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.2)"
                        : "inset 0 -3px 0 rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)",
                      transform: isPressed ? "translateY(2px)" : "none",
                      transformOrigin: "top center",
                      transition: "background 60ms ease, transform 60ms ease, box-shadow 60ms ease",
                      zIndex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      paddingBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        color: isPressed ? "rgba(255,255,255,0.85)" : "var(--piano-key-label)",
                        lineHeight: 1,
                        transition: "color 60ms ease",
                      }}
                    >
                      {note}
                    </span>
                  </div>
                )
              })}

              {/* Black keys */}
              {BLACK_KEY_DATA.map(([left, label], i) => (
                <div
                  key={`${label}-${i}`}
                  style={{
                    position: "absolute",
                    left,
                    top: 0,
                    width: BLACK_W,
                    height: BH,
                    borderRadius: "0 0 3px 3px",
                    border: "1px solid #000",
                    borderTop: "none",
                    background: "var(--piano-black-key)",
                    boxShadow:
                      "0 3px 5px rgba(0,0,0,0.5), inset 0 -2px 0 rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)",
                    zIndex: 2,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    paddingBottom: 4,
                  }}
                >
                  <span
                    className="hidden sm:block"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 7,
                      color: "var(--piano-black-key-label)",
                      textTransform: "uppercase",
                      lineHeight: 1,
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="relative mt-auto flex items-center justify-between font-mono text-[11px]"
          style={{ color: "var(--fg-muted)" }}
        >
          <span>
            <span style={{ opacity: 0.6 }}>{"// "}</span>
            no sound
          </span>
          <span
            className="transition-colors duration-150 group-hover/piano:[color:var(--fg-brand)]"
            style={{ color: "var(--fg-secondary)" }}
          >
            /piano →
          </span>
        </div>
      </motion.div>
    </Link>
  )
}
