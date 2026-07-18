"use client"

import { useRouter, useSearchParams } from "next/navigation"

type Tag = { name: string; count: number }

export function TagFilter({ tags, total }: { tags: Tag[]; total: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get("tag")

  function select(tag: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (!tag || active === tag) {
      params.delete("tag")
    } else {
      params.set("tag", tag)
    }
    const qs = params.toString()
    router.push(qs ? `/blog?${qs}` : "/blog", { scroll: false })
  }

  return (
    <div className="mb-8 flex flex-wrap items-center gap-2 font-mono text-xs">
      <span
        className="mr-1 text-[10px] tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-brand)" }}
      >
        $ filter --by=
      </span>

      <Chip label="all" count={total} active={!active} onClick={() => select(null)} />
      {tags.map((tag) => (
        <Chip
          key={tag.name}
          label={tag.name}
          count={tag.count}
          active={active === tag.name}
          onClick={() => select(tag.name)}
        />
      ))}
    </div>
  )
}

function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] border px-3 font-mono text-xs font-medium transition-colors"
      aria-pressed={active}
      style={{
        borderColor: active ? "var(--fg-brand)" : "var(--border-subtle)",
        background: active ? "var(--bg-surface-brand)" : "transparent",
        color: active ? "var(--fg-brand-hover)" : "var(--fg-secondary)",
      }}
    >
      {label}
      <span
        className="text-[11px]"
        style={{ color: active ? "var(--fg-brand)" : "var(--fg-muted)" }}
      >
        {count}
      </span>
    </button>
  )
}
