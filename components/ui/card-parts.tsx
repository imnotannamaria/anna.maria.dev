import { cn } from "@/lib/utils"

/**
 * The bits every home card shares. They lived as locals in app/page.tsx until
 * the work section moved into components of its own and three files needed them.
 */

export function CardHead({
  label,
  meta,
  as = "span",
  id,
}: {
  label: string
  meta?: React.ReactNode
  as?: "span" | "h2" | "h3"
  id?: string
}) {
  const Label = as
  const isHeading = as !== "span"
  return (
    // The row wraps, and each half refuses to. Both are short strings written in code, so
    // the failure mode worth designing for is the two of them together not fitting: label
    // on one line and meta on the next reads fine, while letting each half break where it
    // likes gives you "FEATURED / POST" beside "JUNE 8, 2026 · / 3 MIN". It used to fit at
    // 11px and stopped at 12px, which is the same as saying it never had a contract.
    <div
      className="text-mono-sm relative flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-mono tracking-[0.08em] uppercase"
      style={{ color: "var(--fg-secondary)" }}
    >
      <Label
        id={id}
        className="inline-flex items-center gap-1.5 whitespace-nowrap"
        style={isHeading ? { margin: 0, fontSize: "inherit", fontWeight: "inherit" } : undefined}
      >
        <span aria-hidden="true" style={{ color: "var(--fg-brand)", fontSize: 10 }}>
          ◆
        </span>
        {label}
      </Label>
      {meta && (
        <span className="whitespace-nowrap" style={{ color: "var(--fg-muted)" }}>
          {meta}
        </span>
      )}
    </div>
  )
}

export function CardFoot({
  comment,
  children,
  className,
}: {
  comment?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    // `flex-wrap` is the default because three cards had already added it by hand — log,
    // post and project — which is the signal that it belongs to the piece and not to them.
    // The comment half is deliberately allowed to break: unlike CardHead's label it can be
    // data (`roadmap-card` passes `item.planUrl`), and a long URL should wrap rather than
    // run out of a card that clips.
    <div
      className={cn(
        "text-mono-sm relative mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-mono",
        className,
      )}
      style={{ color: "var(--fg-muted)" }}
    >
      {comment && (
        <span>
          <span style={{ opacity: 0.6 }}>{"// "}</span>
          {comment}
        </span>
      )}
      {children}
    </div>
  )
}

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode
  variant?: "default" | "brand-soft" | "success-soft"
}) {
  const styles: Record<string, { bg: string; fg: string }> = {
    default: { bg: "var(--bg-hover-soft)", fg: "var(--fg-secondary)" },
    "brand-soft": { bg: "var(--bg-surface-brand)", fg: "var(--fg-brand-hover)" },
    "success-soft": { bg: "var(--status-success-soft)", fg: "var(--status-success-fg)" },
  }
  const { bg, fg } = styles[variant]
  return (
    <span
      className="text-mono-sm inline-flex h-[22px] items-center rounded-[var(--radius-sm)] px-2 font-mono font-medium"
      style={{ background: bg, color: fg }}
    >
      {children}
    </span>
  )
}
