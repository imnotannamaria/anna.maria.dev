import { CheckIcon, InfoIcon, WarningIcon, XIcon } from "@phosphor-icons/react/dist/ssr"
import { cva } from "class-variance-authority"
import * as React from "react"
import { DISMISS_BUTTON } from "@/lib/overlay"
import { cn } from "@/lib/utils"
import { IconTile } from "./icon-tile"

type Tone = "info" | "success" | "warning" | "error"

// The status replaces the brand in the corner glow; the rest is the card's finish.
const alertVariants = cva(
  [
    "sheen relative flex items-start gap-3 overflow-hidden rounded-[var(--radius-md)] p-3.5",
    "border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]",
  ],
  {
    variants: {
      tone: {
        info: "[--sheen-tint:color-mix(in_srgb,var(--status-info)_12%,transparent)]",
        success: "[--sheen-tint:color-mix(in_srgb,var(--status-success)_12%,transparent)]",
        warning: "[--sheen-tint:color-mix(in_srgb,var(--status-warning)_12%,transparent)]",
        error: "[--sheen-tint:color-mix(in_srgb,var(--status-error)_12%,transparent)]",
      },
    },
    defaultVariants: { tone: "info" },
  },
)

// Each status has its own shape, so the four tell apart without color.
const ICON = { info: InfoIcon, success: CheckIcon, warning: WarningIcon, error: XIcon } as const

interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  tone?: Tone
  /** One line: what happened. */
  title?: React.ReactNode
  /** The detail and the next step. */
  children?: React.ReactNode
  /** An ArrowLink or a Button. */
  action?: React.ReactNode
  /** Only for a notice that can be put away. */
  onDismiss?: () => void
  dismissLabel?: string
}

/**
 * A notice that stays on the page until it is dealt with: partial data, a
 * connection that needs attention, rows that could not be read. A Toast
 * leaves on its own and a ChromeMessage takes the page. An error that needs
 * action is announced at once; the rest waits its turn. No colored edge: the
 * status is in the icon tile.
 */
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      tone = "info",
      title,
      children,
      action,
      onDismiss,
      dismissLabel = "Dismiss",
      className,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      role={tone === "error" ? "alert" : "status"}
      className={cn(alertVariants({ tone }), onDismiss && "pr-10", className)}
      {...props}
    >
      <IconTile icon={ICON[tone]} color={tone} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
        {title ? (
          <p className="text-mono-md m-0 font-mono text-[var(--fg-primary)]">{title}</p>
        ) : null}
        {children ? (
          <div className="text-body-md font-sans text-[var(--fg-secondary)]">{children}</div>
        ) : null}
        {action ? <div className="mt-1.5 flex flex-wrap gap-2">{action}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          aria-label={dismissLabel}
          onClick={onDismiss}
          className={cn(DISMISS_BUTTON, "transition-colors")}
        >
          <XIcon aria-hidden size={12} />
        </button>
      ) : null}
    </div>
  ),
)
Alert.displayName = "Alert"

export { Alert, alertVariants }
export type { AlertProps }
