import { cn } from "@/lib/utils"

/**
 * The shared surface for the site's full-page status screens — the 404 and every error
 * boundary. A mono `$ command` header, an optional terminal-output line, a serif title, a
 * `//` note, optional extra body, and an action.
 *
 * It exists because there were five hand-copies of this exact shape — the four `error.tsx`
 * pages and `not-found.tsx` — whose only real differences were the command string, the
 * title and the note. That is the duplication the standardization rule warns about; this is
 * the one place it now lives.
 *
 * Presentational and hook-free on purpose, so both a server component (`not-found.tsx`) and
 * a client one (`ChromeError`) can render into it. The container className is a prop rather
 * than baked in, because each page keeps its own width — `/log` is narrower than `/roadmap`,
 * and `/admin` sits inside a layout that already constrains it.
 */
export function ChromeMessage({
  command,
  accent = "brand",
  output,
  title,
  note,
  action,
  className,
  children,
}: {
  command: string
  /** Colour of the `$` prompt: errors run red, everything else brand. */
  accent?: "brand" | "error"
  /** A terminal-output line between the prompt and the title — the 404's `cat: … No such file`. */
  output?: string
  title: string
  note: string
  action?: React.ReactNode
  className?: string
  /** Extra body between the note and the action — the admin error's digest line. */
  children?: React.ReactNode
}) {
  const prompt = accent === "error" ? "var(--status-error-fg)" : "var(--fg-brand)"

  return (
    <div
      className={cn(
        "mx-auto flex min-h-[60vh] max-w-[1280px] flex-col px-4 py-6 sm:px-6 md:px-8 lg:px-12 lg:py-8",
        className,
      )}
    >
      <div
        className="mb-3 font-mono text-xs tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-muted)" }}
      >
        <span style={{ color: prompt }}>$</span> {command}
      </div>

      {output && (
        <p className="text-mono-md m-0 font-mono" style={{ color: "var(--fg-muted)" }}>
          {output}
        </p>
      )}

      <h1
        className={cn(
          "text-display-md font-serif leading-none font-normal tracking-[-0.02em]",
          output && "mt-4",
        )}
        style={{ color: "var(--fg-primary)" }}
      >
        {title}
      </h1>

      <p className="text-mono-md mt-4 font-mono" style={{ color: "var(--fg-muted)" }}>
        {note}
      </p>

      {children}

      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
