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
    <div
      className="relative flex items-center justify-between gap-3 font-mono text-[11px] tracking-[0.08em] uppercase"
      style={{ color: "var(--fg-secondary)" }}
    >
      <Label
        id={id}
        className="inline-flex items-center gap-1.5"
        style={isHeading ? { margin: 0, fontSize: "inherit", fontWeight: "inherit" } : undefined}
      >
        <span aria-hidden="true" style={{ color: "var(--fg-brand)", fontSize: 10 }}>
          ◆
        </span>
        {label}
      </Label>
      {meta && <span style={{ color: "var(--fg-muted)" }}>{meta}</span>}
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
    <div
      className={cn(
        "relative mt-auto flex items-center justify-between gap-3 font-mono text-[11px]",
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
    default: { bg: "rgba(255,255,255,0.06)", fg: "var(--fg-secondary)" },
    "brand-soft": { bg: "var(--bg-surface-brand)", fg: "var(--fg-brand-hover)" },
    "success-soft": { bg: "var(--status-success-soft)", fg: "var(--status-success-fg)" },
  }
  const { bg, fg } = styles[variant]
  return (
    <span
      className="inline-flex h-[22px] items-center rounded-[var(--radius-sm)] px-2 font-mono text-[11px] font-medium"
      style={{ background: bg, color: fg }}
    >
      {children}
    </span>
  )
}
