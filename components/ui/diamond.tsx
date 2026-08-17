/**
 * `◆`, the brand mark, as it appears inline before a label — card heads, field labels, the
 * outline rail, the wristkit panel, the piano toolbar.
 *
 * It was eleven copies of the same three-line span, differing only in whether the author
 * wrote `aria-hidden` or `aria-hidden="true"` and whether the size was 9 or 10. The tenth
 * copy had drifted: `page-outline.tsx` was missing `aria-hidden` entirely, so a screen
 * reader read "black diamond suit" before the file name. That is what the second and third
 * copy of anything eventually cost.
 *
 * The size stays a number rather than a step on the type scale on purpose. This is a glyph
 * matched optically to the text beside it, not a role — see the note on the scale in
 * CLAUDE.md. 9px sits beside `text-mono-xs`, 10px beside `text-mono-sm`.
 */
export function Diamond({
  size = 9,
  style,
}: {
  size?: 9 | 10
  /** Only for layout the call site owns: `marginRight`, `flexShrink`, `lineHeight`. */
  style?: React.CSSProperties
}) {
  return (
    <span aria-hidden="true" style={{ color: "var(--fg-brand)", fontSize: size, ...style }}>
      ◆
    </span>
  )
}
