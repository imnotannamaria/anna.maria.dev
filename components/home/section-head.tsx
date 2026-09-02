/**
 * `$ whoami`, `$ ls ./work --featured`, `$ cat ./off-the-clock` — the rule that opens every
 * section of the home page.
 *
 * It was a local in `app/(home)/page.tsx` until the grid discovery needed to draw the same
 * sections around a different arrangement of cards. Two copies of a section header is how a
 * page starts inventing its own header rhythm, which is the exact thing the Standardization
 * check is looking for — so it moved here instead of being pasted.
 */
export function SectHead({
  id,
  cmd,
  meta,
  as = "h2",
}: {
  id: string
  cmd: string
  meta?: React.ReactNode
  as?: "h2" | "span"
}) {
  const Label = as
  return (
    <div
      className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-dashed pb-3"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <Label
        id={id}
        className="text-mono-sm font-mono font-normal"
        style={
          as === "h2"
            ? { margin: 0, color: "var(--fg-secondary)" }
            : { color: "var(--fg-secondary)" }
        }
      >
        <span aria-hidden="true" style={{ color: "var(--fg-brand)" }}>
          ${" "}
        </span>
        {cmd}
      </Label>
      {meta && (
        <span
          className="text-mono-sm font-mono tracking-[0.08em] uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          {meta}
        </span>
      )}
    </div>
  )
}
