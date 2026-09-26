import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"

const promptVariants = cva("", {
  variants: {
    accent: {
      brand: "text-[var(--fg-brand)]",
      error: "text-[var(--status-error-fg)]",
    },
  },
  defaultVariants: { accent: "brand" },
})

export interface ChromeMessageProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">, VariantProps<typeof promptVariants> {
  /** The command that "ran": `cat ./missing-page`. */
  command: string
  /** A line of terminal output under the command: `cat: ./missing-page: No such file`. */
  output?: string
  title: React.ReactNode
  note: React.ReactNode
  /** A link or button back to safety. */
  action?: React.ReactNode
}

/**
 * The surface for full-page status screens: 404s and error boundaries. A
 * `$ command`, an optional output line, a serif title, a note and an action.
 * Children render between the note and the action.
 *
 * No hooks, so a server component can render it. An error boundary is a client
 * component that renders it too.
 */
const ChromeMessage = React.forwardRef<HTMLDivElement, ChromeMessageProps>(
  ({ className, command, accent, output, title, note, action, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mx-auto flex min-h-[60vh] w-full max-w-[1280px] flex-col px-4 py-6 sm:px-6 lg:px-12 lg:py-8",
        className,
      )}
      {...props}
    >
      <div className="text-mono-sm mb-3 font-mono tracking-[0.08em] text-[var(--fg-muted)] uppercase">
        <span aria-hidden className={promptVariants({ accent })}>
          $
        </span>{" "}
        {command}
      </div>

      {output && <p className="text-mono-md m-0 font-mono text-[var(--fg-muted)]">{output}</p>}

      <h1
        className={cn(
          "text-display-md m-0 font-serif leading-none font-normal text-[var(--fg-primary)]",
          output && "mt-4",
        )}
      >
        {title}
      </h1>

      <p className="text-mono-md mt-4 mb-0 font-mono text-[var(--fg-muted)]">{note}</p>

      {children}

      {action && <div className="mt-6">{action}</div>}
    </div>
  ),
)
ChromeMessage.displayName = "ChromeMessage"

export { ChromeMessage }
