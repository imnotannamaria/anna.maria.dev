import type { ReactNode } from "react"

export function PageHeader({
  icon,
  label,
  count,
  children,
}: {
  icon: ReactNode

  label: ReactNode
  count?: number | string
  children?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-4">
      <h1 className="text-mono-sm flex items-center gap-2 font-mono tracking-[0.08em] text-[var(--fg-secondary)] uppercase">
        <span className="text-[var(--fg-brand)]">{icon}</span>
        {label}
        {count === undefined ? null : <span className="text-[var(--fg-muted)]">· {count}</span>}
      </h1>
      {children ? <p className="st-lede font-serif">{children}</p> : null}
    </header>
  )
}
