import { LOG_TYPES, TYPE_PLURAL } from "@/lib/log/validation"

/** The stat boxes under the header. "logged" first, then one per type that has entries. */
export function LogStats({ counts, total }: { counts: Record<string, number>; total: number }) {
  const stats = [
    { label: "logged", value: total },
    ...LOG_TYPES.filter((t) => (counts[t] ?? 0) > 0).map((t) => ({
      label: TYPE_PLURAL[t],
      value: counts[t] ?? 0,
    })),
  ]

  return (
    <dl className="mt-5 flex flex-wrap gap-2">
      {stats.map((s) => (
        <div
          key={s.label}
          className="min-w-[76px] rounded-md border px-3 py-2"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <dt
            className="mb-[5px] font-mono text-[10px] tracking-[0.08em] uppercase"
            style={{ color: "var(--fg-muted)" }}
          >
            {s.label}
          </dt>
          <dd
            className="font-serif text-[26px] leading-none tracking-[-0.02em] italic"
            style={{ color: "var(--fg-brand)" }}
          >
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
