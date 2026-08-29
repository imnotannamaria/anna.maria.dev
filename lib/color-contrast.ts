/**
 * WCAG contrast, computed rather than remembered.
 *
 * `app/globals.css` carries a hand-measured twelve-row table for `--fg-brand-on-tint`. That was
 * real work and it stays where it is — what must not happen is a second copy of those numbers
 * pasted onto a page, because a copied measurement goes stale the day a theme's brand hex moves
 * and nothing fails to tell you. So the tokens section computes its own, live, for whichever
 * theme and mode is active.
 *
 * Pure arithmetic on numbers, with no DOM in it, which is what lets it be unit tested in the
 * node project alongside everything else.
 */

export type Rgba = { r: number; g: number; b: number; a: number }

/**
 * Parses what `getComputedStyle` actually hands back for a colour: `rgb(r, g, b)`,
 * `rgb(r g b / a)`, and the same with `rgba`. Not a general CSS colour parser — it only ever
 * sees the output of the engine, which is always one of those forms.
 */
export function parseRgb(value: string): Rgba | null {
  // The `rgb(`/`rgba(` prefix is not decoration. Scraping numbers out of any string means
  // `color-mix(in srgb, #7c6bff 35%, transparent)` parses to a colour built from the digits of
  // the hex — quietly wrong instead of loudly absent, on exactly the input this sees when the
  // caller forgot to read the token through a probe element. Anchoring it makes that a null.
  const body = /^rgba?\(([^)]*)\)$/i.exec(value.trim())
  if (!body) return null

  const nums = body[1].match(/-?[\d.]+%?/g)
  if (!nums || nums.length < 3) return null

  const channel = (raw: string) => {
    const n = Number.parseFloat(raw)
    return raw.endsWith("%") ? (n / 100) * 255 : n
  }

  const alphaRaw = nums[3]
  const a = alphaRaw
    ? alphaRaw.endsWith("%")
      ? Number.parseFloat(alphaRaw) / 100
      : Number.parseFloat(alphaRaw)
    : 1

  return { r: channel(nums[0]), g: channel(nums[1]), b: channel(nums[2]), a }
}

/**
 * Straight-alpha compositing: what a translucent colour actually looks like over what is
 * behind it.
 *
 * This is the part a naive contrast check gets wrong. `--fg-brand-on-tint` is ink on a
 * `--bg-surface-brand` fill, and that fill is the brand at 8–15% *over the canvas* — a third
 * colour that is neither of them. Measuring the ink against the raw canvas gives a number that
 * contradicts the measured table in `globals.css`, which says in as many words that it was
 * "measured against the composited pill background".
 */
export function composite(fg: Rgba, bg: Rgba): Rgba {
  const a = fg.a + bg.a * (1 - fg.a)
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 }
  const mix = (f: number, b: number) => (f * fg.a + b * bg.a * (1 - fg.a)) / a
  return { r: mix(fg.r, bg.r), g: mix(fg.g, bg.g), b: mix(fg.b, bg.b), a }
}

/** Flattens a stack of layers, front to back. The last one has to be opaque. */
export function flatten(layers: Rgba[]): Rgba {
  return layers.reduce((over, under) => composite(over, under))
}

/** WCAG 2.x relative luminance. The 0.03928 threshold and 2.4 exponent are from the spec. */
function luminance({ r, g, b }: Rgba): number {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/**
 * The ratio between two opaque colours, 1 to 21. Composite anything translucent first — a
 * ratio computed against a colour with alpha in it is meaningless.
 */
export function contrastRatio(a: Rgba, b: Rgba): number {
  const la = luminance(a)
  const lb = luminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/** AA is 4.5 for body text and 3 for large text; AAA is 7. */
export function wcagGrade(ratio: number, large = false): "AAA" | "AA" | "fail" {
  if (ratio >= 7) return "AAA"
  if (ratio >= (large ? 3 : 4.5)) return "AA"
  return "fail"
}
