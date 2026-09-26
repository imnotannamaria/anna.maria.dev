import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * The custom font-size steps declared in `app/globals.css`.
 *
 * tailwind-merge cannot infer that `text-mono-sm` is a font size: without
 * registering the scale it treats the class as a text colour and can discard
 * it when a real colour token is present in the same `cn()` call.
 */
const TYPE_SCALE = [
  "display-xl",
  "display-lg",
  "display-md",
  "heading-lg",
  "heading-md",
  "body-lg",
  "body-md",
  "mono-md",
  "mono-sm",
  "mono-xs",
]

const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: TYPE_SCALE }] } },
  /**
   * Registering the scale above also switches on tailwind-merge's
   * `font-size` → `leading` conflict, which is a Tailwind v3 assumption: back
   * then `text-lg` carried a line-height, so a later font size legitimately
   * beat an earlier `leading-*`. In v4 `leading-*` sets `--tw-leading` and the
   * font-size utility reads it, so the leading wins in CSS whatever the order —
   * and the rule was deleting a class that would have won. It cost the
   * `leading-none` in `Badge`'s cva base, removed by the size its `size`
   * variant appends afterwards.
   */
  override: { conflictingClassGroups: { "font-size": [] } },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
