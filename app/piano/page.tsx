import Link from "next/link"
import { createMetadata } from "@/lib/metadata"
import { PianoStudio } from "./piano-studio"
import { PageOutline, type OutlineItem } from "@/components/chrome/page-outline"
import { KeymapCard, type KeyLine } from "@/components/piano/keymap-card"
import { Reveal } from "@/components/ui/reveal"
import { TypeIn } from "@/components/ui/type-in"
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

const KEYMAP_GROUPS = [
  { title: "octave 4 · white", lines: OCTAVE_4_WHITE, foot: "bottom row · C4–B4" },
  { title: "octave 4 · black", lines: OCTAVE_4_BLACK, foot: "sharps, above their neighbours" },
  { title: "octave 5 · white", lines: OCTAVE_5_WHITE, foot: "top row · C5–B5" },
  { title: "octave 5 · black", lines: OCTAVE_5_BLACK, foot: "sharps, above their neighbours" },
]

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
            <TypeIn
              as="h1"
              text="Tap to play."
              emphasis="play."
              speed={0.045}
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                fontSize: "clamp(56px, 8vw, 92px)",
                lineHeight: 0.98,
                letterSpacing: "-0.02em",
                color: "var(--fg-primary)",
                margin: "0 0 16px",
                display: "block",
              }}
            />
            <Reveal delay={0.5}>
              <p
                className="m-0 text-[17px] leading-[1.65]"
                style={{
                  fontFamily: "var(--font-sans)",
                  color: "var(--fg-secondary)",
                  maxWidth: "56ch",
                }}
              >
                An offline piano across <Em>two</Em> octaves. Click the keys, use your physical
                keyboard, or trigger one of the songs below. The bottom row <Kbd>Z</Kbd>–
                <Kbd>M</Kbd> plays <Strong>C4–B4</Strong>, the top row <Kbd>Q</Kbd>–<Kbd>U</Kbd>{" "}
                plays <Strong>C5–B5</Strong>.
              </p>
            </Reveal>
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

            {/* Four cards, not one box. The box was `rounded-[var(--radius-lg)] border p-6`
                written by hand — and it painted itself `--bg-surface`, which by convention is
                for what sits *above* a card (dropdowns, dialogs, code blocks), not for the
                card. Four groups in four `.bento-card` also read better than four groups
                sharing one frame. */}
            <div className="grid grid-cols-1 gap-4 min-[821px]:grid-cols-2">
              {KEYMAP_GROUPS.map((group, i) => (
                <KeymapCard
                  key={group.title}
                  title={group.title}
                  lines={group.lines}
                  foot={group.foot}
                  index={i}
                />
              ))}
            </div>

            <p className="mt-6 font-mono text-[11px]" style={{ color: "var(--fg-muted)" }}>
              <span aria-hidden style={{ opacity: 0.7 }}>
                {"// "}
              </span>
              triangle fundamental + additive harmonics · adsr envelope · sustain extends release
              from 1.2s to 3.4s
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}
