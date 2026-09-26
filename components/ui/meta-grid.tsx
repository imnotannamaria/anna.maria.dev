import { cardVariants } from "@/app/components/entrepta/card"
import type React from "react"
import { cn } from "@/lib/utils"

/**
 * The published/read/words strip under a post or project title.
 *
 * It was written twice, identically, once in each `[slug]/page.tsx` — and both drew their own
 * surface: `rounded-[var(--radius-lg)] border p-4` painted `--bg-surface`, which by convention
 * is the token for what sits *above* a card, not for a card. The same box `/piano`'s key map
 * used to be. It is entrepta's Card now, at `size="sm"`, with `grid` because this is four columns —
 * the same pattern the piano song rows use.
 */
export function MetaGrid({ children }: { children: React.ReactNode }) {
  return (
    // Container queries, not viewport ones. On a case study this sits in a 760px column and
    // four columns is right; on a component doc one of the cells is a repo path, and at a wide
    // viewport the four-column rule fired anyway and broke `tree-card.tsx` across two lines
    // mid-word. Asking the box is the question that was always meant.
    // The `@container` is the outer div, never the grid itself: `container-type` establishes a
    // query container for an element's *descendants*, so `@sm:` on the same node would resolve
    // against an ancestor container instead — i.e. against nothing.
    <div className="@container">
      <dl
        className={cn(
          cardVariants({ size: "sm" }),
          "grid grid-cols-1 gap-3 @sm:grid-cols-2 @2xl:grid-cols-4",
        )}
      >
        {children}
      </dl>
    </div>
  )
}

export function MetaCol({
  label,
  value,
  span,
}: {
  label: string
  value: React.ReactNode
  /** Takes the full row. For a value that is long and unbreakable, like a file path. */
  span?: boolean
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-0.5", span && "@sm:col-span-2 @2xl:col-span-4")}>
      <dt
        className="text-mono-xs font-mono tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-muted)" }}
      >
        {label}
      </dt>
      {/* ReactNode rather than string: a case study passes a date, a component doc passes a
          row of badges. A string is still a ReactNode, so every existing call site is
          unchanged. */}
      <dd className="text-mono-md font-mono" style={{ color: "var(--fg-primary)", margin: 0 }}>
        {value}
      </dd>
    </div>
  )
}
