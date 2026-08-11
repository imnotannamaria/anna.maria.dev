/**
 * A cover, drawn in code from nothing but a slug.
 *
 * Two inputs: the slug, which seeds a deterministic layout — so the same entry gets the same
 * cover on the server and the client, and it never flickers on hydration — and `--fg-brand`
 * through `color-mix`, so every cover follows the theme with no hardcoded colour anywhere.
 *
 * `/blog` uses it for every post, and deliberately has no `cover` field: a file per post is
 * recurring work, and every post written before the field existed would sit without one.
 * `/projects` is the other way round — those get real images — and falls back here for the
 * ones that don't have one yet, so the grid never has a hole in it.
 *
 * Three variants, chosen per call. `minimap` is the default: it is the thing seen from far
 * away, which is the metaphor the rest of the site is built on.
 */

const BRAND = "var(--fg-brand)"

/** LCG. Deterministic, cheap, and enough for a bar width. */
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** FNV-1a over the slug. Same string, same cover, forever. */
function seedOf(slug: string) {
  let h = 2166136261
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export type CoverVariant = "minimap" | "aura" | "grid"

export function GeneratedCover({
  slug,
  title,
  variant = "minimap",
  className,
}: {
  slug: string
  title: string
  variant?: CoverVariant
  className?: string
}) {
  const seed = seedOf(slug)

  return (
    <div
      aria-hidden
      className={className}
      style={{ position: "relative", overflow: "hidden", background: "var(--bg-canvas)" }}
    >
      {variant === "minimap" && <Minimap seed={seed} />}
      {variant === "aura" && <Aura seed={seed} title={title} />}
      {variant === "grid" && <Grid seed={seed} />}
    </div>
  )
}

/**
 * The editor's minimap. The bars are not the real prose — reading the MDX per card would
 * cost a file read for decoration — they are a deterministic stand-in for its shape.
 */
function Minimap({ seed }: { seed: number }) {
  const next = rng(seed)
  const rows = Array.from({ length: 16 }, () => ({
    indent: Math.floor(next() * 3),
    width: 18 + next() * 62,
    brand: next() > 0.72,
  }))

  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-[3px] px-[10%] py-[8%]">
      {rows.map((row, i) => (
        <span
          key={i}
          style={{
            height: 2.5,
            borderRadius: 2,
            marginLeft: `${row.indent * 7}%`,
            width: `${row.width}%`,
            background: row.brand
              ? `color-mix(in srgb, ${BRAND} 55%, transparent)`
              : "color-mix(in srgb, var(--fg-primary) 13%, transparent)",
          }}
        />
      ))}
      {/* Fades the ends, so the minimap doesn't read as a list that stops. */}
      <span
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, var(--bg-canvas), transparent 22%, transparent 78%, var(--bg-canvas))",
        }}
      />
    </div>
  )
}

/** Light and the title's initial. The least "editor" of the three, and the one that survives smallest. */
function Aura({ seed, title }: { seed: number; title: string }) {
  const next = rng(seed)
  const x = 20 + next() * 60
  const y = 15 + next() * 55
  const angle = Math.floor(next() * 360)

  return (
    <>
      <span
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 110% at ${x}% ${y}%, color-mix(in srgb, ${BRAND} 45%, transparent), transparent 68%),
                       linear-gradient(${angle}deg, color-mix(in srgb, ${BRAND} 16%, transparent), transparent 70%)`,
        }}
      />
      <span
        className="absolute inset-0 grid place-items-center"
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: "clamp(28px, 42%, 96px)",
          lineHeight: 1,
          color: "color-mix(in srgb, var(--fg-primary) 22%, transparent)",
        }}
      >
        {title.trim().charAt(0).toUpperCase()}
      </span>
    </>
  )
}

/** A dot grid with a brand band across it. The quietest, and the one that competes least with the title. */
function Grid({ seed }: { seed: number }) {
  const next = rng(seed)
  const angle = Math.floor(next() * 60) + 100

  return (
    <>
      <span
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in srgb, var(--fg-primary) 16%, transparent) 1px, transparent 1px)",
          backgroundSize: "11px 11px",
        }}
      />
      <span
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${angle}deg, color-mix(in srgb, ${BRAND} 38%, transparent), transparent 55%)`,
        }}
      />
    </>
  )
}
