import Link from "next/link"
import { createMetadata } from "@/lib/metadata"
import { PianoStudio } from "./piano-studio"
import { PageOutline, type OutlineItem } from "@/components/chrome/page-outline"
import {
  DisplayH2,
  DocLabel,
  Em,
  Kbd,
  Prose,
  Section,
  Strong,
} from "@/components/chrome/page-parts"

export const metadata = createMetadata({
  title: "Piano",
  description: "An offline, two-octave piano built with the Web Audio API — play it or watch it.",
  path: "/piano",
})

const outline: OutlineItem[] = [
  { id: "piano", label: "piano", level: 1 },
  { id: "keyboard", label: "keyboard", level: 2 },
  { id: "songs", label: "songs", level: 2 },
  { id: "controls", label: "key mapping", level: 2 },
]

// ─── Key mapping reference data ───────────────────────────────────────────────

type KeyLine = { kbd: string; note: string; hint?: string }

const OCTAVE_4_WHITE: KeyLine[] = [
  { kbd: "Z", note: "C4", hint: "do" },
  { kbd: "X", note: "D4", hint: "re" },
  { kbd: "C", note: "E4", hint: "mi" },
  { kbd: "V", note: "F4", hint: "fa" },
  { kbd: "B", note: "G4", hint: "sol" },
  { kbd: "N", note: "A4", hint: "la · 440 hz" },
  { kbd: "M", note: "B4", hint: "si" },
]
const OCTAVE_4_BLACK: KeyLine[] = [
  { kbd: "S", note: "C#4" },
  { kbd: "D", note: "D#4" },
  { kbd: "G", note: "F#4" },
  { kbd: "H", note: "G#4" },
  { kbd: "J", note: "A#4" },
]
const OCTAVE_5_WHITE: KeyLine[] = [
  { kbd: "Q", note: "C5", hint: "middle-C +1" },
  { kbd: "W", note: "D5" },
  { kbd: "E", note: "E5" },
  { kbd: "R", note: "F5" },
  { kbd: "T", note: "G5" },
  { kbd: "Y", note: "A5" },
  { kbd: "U", note: "B5" },
]
const OCTAVE_5_BLACK: KeyLine[] = [
  { kbd: "2", note: "C#5" },
  { kbd: "3", note: "D#5" },
  { kbd: "5", note: "F#5" },
  { kbd: "6", note: "G#5" },
  { kbd: "7", note: "A#5" },
]

function KeymapGroup({ title, lines }: { title: string; lines: KeyLine[] }) {
  return (
    <>
      <h3
        className="mb-2 font-mono text-[11px] font-medium tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-brand)" }}
      >
        <span aria-hidden>◆ </span>
        {title}
      </h3>
      <div className="flex flex-col">
        {lines.map((line, i) => (
          <div
            key={line.kbd}
            className="grid grid-cols-[40px_1fr] items-baseline gap-3 py-1"
            style={{ borderTop: i === 0 ? "none" : "1px dashed var(--border-subtle)" }}
          >
            <span
              className="rounded-[3px] border px-1.5 py-0.5 text-center font-mono text-[11px] uppercase"
              style={{
                color: "var(--fg-primary)",
                background: "var(--bg-canvas)",
                borderColor: "var(--border-strong)",
              }}
            >
              {line.kbd}
            </span>
            <span className="font-mono text-[12px]" style={{ color: "var(--fg-secondary)" }}>
              <Em>{line.note}</Em>
              {line.hint ? ` · ${line.hint}` : ""}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PianoPage() {
  return (
    <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 min-[1100px]:grid-cols-[200px_minmax(0,1fr)]">
      <PageOutline
        items={outline}
        file="piano.tsx"
        footer={
          <>
            <div className="flex items-center justify-between">
              <span>{"// keys"}</span>
              <span style={{ color: "var(--fg-brand)", fontFamily: "var(--font-serif)" }}>
                <em>24</em>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>{"// range"}</span>
              <span>C4 — B5</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{"// audio"}</span>
              <span
                className="inline-flex items-center gap-1"
                style={{ color: "var(--status-success-fg)" }}
              >
                <span
                  aria-hidden
                  className="inline-block size-1.5 rounded-full"
                  style={{ background: "var(--status-success)" }}
                />
                web
              </span>
            </div>
          </>
        }
      />

      <div className="min-w-0">
        <div className="mx-auto max-w-[880px] px-5 py-12 sm:px-8 lg:px-12">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-8 font-mono text-xs"
            style={{ color: "var(--fg-muted)" }}
          >
            <Link href="/" className="transition-colors hover:text-[color:var(--fg-primary)]">
              ~
            </Link>
            <span aria-hidden style={{ opacity: 0.5, margin: "0 6px" }}>
              /
            </span>
            <span style={{ color: "var(--fg-primary)" }}>piano.tsx</span>
          </nav>

          {/* ══════════ HERO ══════════ */}
          <Section id="piano" first>
            <DocLabel level="#">piano</DocLabel>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                fontSize: "clamp(56px, 8vw, 92px)",
                lineHeight: 0.98,
                letterSpacing: "-0.02em",
                color: "var(--fg-primary)",
                margin: "0 0 16px",
              }}
            >
              Tap to <Em>play.</Em>
            </h1>
            <p
              className="text-[17px] leading-[1.65]"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--fg-secondary)",
                maxWidth: "56ch",
              }}
            >
              An offline piano across <Em>two</Em> octaves. Click the keys, use your physical
              keyboard, or trigger one of the songs below. The bottom row <Kbd>Z</Kbd>–<Kbd>M</Kbd>{" "}
              plays <Strong>C4–B4</Strong>, the top row <Kbd>Q</Kbd>–<Kbd>U</Kbd> plays{" "}
              <Strong>C5–B5</Strong>.
            </p>
          </Section>

          {/* ══════════ KEYBOARD + SONGS (interactive) ══════════ */}
          <PianoStudio />

          {/* ══════════ KEY MAPPING ══════════ */}
          <Section id="controls">
            <DocLabel level="##">key mapping</DocLabel>
            <DisplayH2 size={36} margin="0 0 8px">
              Where every <Em>note</Em> lives.
            </DisplayH2>
            <Prose>
              Two QWERTY rows, one per octave. Black keys sit above their white-key neighbours,
              exactly like a real piano.
            </Prose>

            <div
              className="rounded-[var(--radius-lg)] border p-6"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
            >
              <div className="grid grid-cols-1 gap-6 min-[821px]:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <KeymapGroup title="octave 4 · white" lines={OCTAVE_4_WHITE} />
                  <div className="mt-2">
                    <KeymapGroup title="octave 4 · black" lines={OCTAVE_4_BLACK} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <KeymapGroup title="octave 5 · white" lines={OCTAVE_5_WHITE} />
                  <div className="mt-2">
                    <KeymapGroup title="octave 5 · black" lines={OCTAVE_5_BLACK} />
                  </div>
                </div>
              </div>

              <div
                className="mt-6 pt-3 font-mono text-[11px]"
                style={{ borderTop: "1px dashed var(--border-subtle)", color: "var(--fg-muted)" }}
              >
                {"// "}triangle fundamental + additive harmonics · adsr envelope · sustain extends
                release from 1.2s to 3.4s
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
