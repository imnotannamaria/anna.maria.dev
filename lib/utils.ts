import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * The font-size steps declared in `globals.css`. Without them tailwind-merge
 * reads `text-mono-sm` as a text color and drops it when a color class such as
 * `text-[var(--fg-muted)]` sits in the same `cn()` call.
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
   * tailwind-merge lets a font size evict an earlier `leading-*`, a Tailwind v3
   * rule. In v4 `leading-*` wins in CSS whatever the order, so the merge would
   * delete the class that was going to win.
   */
  override: { conflictingClassGroups: { "font-size": [] } },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
