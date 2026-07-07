"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

// ─── Key dimensions ──────────────────────────────────────────────────────────
const WW = 28 // white key width
const WH = 62 // white key height (compact)
const GK = 2 // gap between white keys
const ST = WW + GK // stride = 30px
const BW = 18 // black key width
const BH = 38 // black key height

const TOTAL_W = 8 * ST - GK // 238px

// White key labels (one octave C–B + C above)
const WHITE_NOTES = ["C", "D", "E", "F", "G", "A", "B", "C"]

// center between white[i] and white[i+1] = i*ST + (WW+ST)/2
function blackKeyLeft(i: number): number {
  return i * ST + (WW + ST) / 2 - BW / 2
}

const BLACK_KEY_DATA: [number, string][] = [
  [blackKeyLeft(0), "C#"],
  [blackKeyLeft(1), "D#"],
  [blackKeyLeft(3), "F#"],
  [blackKeyLeft(4), "G#"],
  [blackKeyLeft(5), "A#"],
]

const SOL = 4 // G
const LA = 5 // A
const SEQ = [SOL, LA, SOL, LA]

// ─── Component ───────────────────────────────────────────────────────────────
export function MiniPianoCard() {
  const [pressed, setPressed] = useState<number | null>(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
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
      <div
        className="group/piano relative overflow-hidden rounded-2xl border hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:[background:var(--bg-surface-elevated)]"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-strong)",
          transition:
            "transform 200ms var(--ease-out), box-shadow 200ms var(--ease-out), background 200ms var(--ease-out)",
        }}
      >
        {/* Toolbar */}
        <div
          className="flex items-center gap-3 border-b px-4 py-2.5"
          style={{
            borderColor: "var(--border-subtle)",
            background: "rgba(0,0,0,0.25)",
          }}
        >
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <span
              className="block h-2.5 w-2.5 rounded-full opacity-60"
              style={{ background: "#f43f5e" }}
            />
            <span
              className="block h-2.5 w-2.5 rounded-full opacity-60"
              style={{ background: "#f59e0b" }}
            />
            <span
              className="block h-2.5 w-2.5 rounded-full opacity-60"
              style={{ background: "#10b981" }}
            />
          </div>
          {/* Label */}
          <span
            className="font-mono text-[11px] tracking-[0.08em] uppercase"
            style={{ color: "var(--fg-secondary)" }}
          >
            <span style={{ color: "var(--fg-brand)", marginRight: 5, fontSize: 9 }}>◆</span>
            piano
          </span>
          <div className="flex-1" />
          {/* Hint */}
          <span className="font-mono text-[10px]" style={{ color: "var(--fg-muted)" }}>
            {"// tap to play"}
          </span>
        </div>

        {/* Stage */}
        <div
          className="px-5 pt-4 pb-3"
          style={{ background: "linear-gradient(180deg, #0a0a10 0%, #131320 100%)" }}
        >
          {/* Frame */}
          <div
            style={{
              background: "linear-gradient(180deg, #1a1a24 0%, #0a0a10 100%)",
              padding: "10px 10px 8px",
              borderRadius: 6,
              border: "1px solid #2a2a3a",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 20px rgba(0,0,0,0.5)",
            }}
          >
            {/* Keys */}
            <div
              style={{
                position: "relative",
                width: TOTAL_W,
                height: WH,
                margin: "0 auto",
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
                      left: i * ST,
                      top: 0,
                      width: WW,
                      height: WH,
                      borderRight: i < 7 ? "1px solid #b9b2a5" : "none",
                      borderRadius: "0 0 3px 3px",
                      background: isPressed
                        ? "linear-gradient(180deg, #a597ff 0%, #7c6bff 100%)"
                        : "linear-gradient(180deg, #f5f1e8 0%, #ddd8cc 100%)",
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
                        color: isPressed ? "rgba(255,255,255,0.85)" : "#888583",
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
              {BLACK_KEY_DATA.map(([leftPx, label]) => (
                <div
                  key={label}
                  style={{
                    position: "absolute",
                    left: leftPx,
                    top: 0,
                    width: BW,
                    height: BH,
                    borderRadius: "0 0 3px 3px",
                    border: "1px solid #000",
                    borderTop: "none",
                    background: "linear-gradient(180deg, #2a2a30 0%, #0a0a12 60%, #1a1a24 100%)",
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
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 7,
                      color: "#6b6b80",
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

        {/* Bottom hint */}
        <div
          className="flex items-center justify-between px-4 py-2.5 font-mono text-[10px]"
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
      </div>
    </Link>
  )
}
