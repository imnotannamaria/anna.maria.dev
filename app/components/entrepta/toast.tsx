"use client"

import { CheckIcon, CircleNotchIcon, InfoIcon, WarningIcon, XIcon } from "@phosphor-icons/react"
import { Toaster as Sonner } from "sonner"
import { OVERLAY_SURFACE } from "@/lib/overlay"
import { cn } from "@/lib/utils"

type ToasterProps = React.ComponentProps<typeof Sonner>

/**
 * Sonner, unstyled, dressed in entrepta. Each status sets one tone: a glow in
 * the corner and a tinted icon tile. No colored edge: the icon carries the
 * status, and its shape tells the four apart without color.
 */
const toastClass = cn(
  OVERLAY_SURFACE,
  "group/toast relative flex w-[var(--width)] items-start gap-3 overflow-hidden",
  "rounded-[var(--radius-md)] p-3.5 pr-10 font-mono",
  // replaces the sheen's brand glow with the status tone
  "[background-image:radial-gradient(140%_120%_at_0%_0%,var(--toast-glow,var(--sheen-tint)),transparent_55%)]",
  "data-[type=success]:[--toast-glow:color-mix(in_srgb,var(--status-success)_12%,transparent)]",
  "data-[type=error]:[--toast-glow:color-mix(in_srgb,var(--status-error)_12%,transparent)]",
  "data-[type=warning]:[--toast-glow:color-mix(in_srgb,var(--status-warning)_12%,transparent)]",
  "data-[type=info]:[--toast-glow:color-mix(in_srgb,var(--status-info)_12%,transparent)]",
  // stacked toasts behind the front one show only their surface, as sonner's own style does
  "[&>*]:transition-opacity data-[expanded=false]:data-[front=false]:[&>*]:opacity-0",
)

const iconClass = cn(
  "grid size-6 shrink-0 place-items-center rounded-[var(--radius-sm)]",
  "bg-[var(--bg-hover-strong)] text-[var(--fg-secondary)]",
  "group-data-[type=success]/toast:bg-[var(--status-success-soft)] group-data-[type=success]/toast:text-[var(--status-success-fg)]",
  "group-data-[type=error]/toast:bg-[var(--status-error-soft)] group-data-[type=error]/toast:text-[var(--status-error-fg)]",
  "group-data-[type=warning]/toast:bg-[var(--status-warning-soft)] group-data-[type=warning]/toast:text-[var(--status-warning-fg)]",
  "group-data-[type=info]/toast:bg-[var(--status-info-soft)] group-data-[type=info]/toast:text-[var(--status-info-fg)]",
)

const Toaster = ({ toastOptions, icons, ...props }: ToasterProps) => (
  <Sonner
    closeButton
    icons={{
      success: <CheckIcon aria-hidden size={13} weight="bold" />,
      error: <XIcon aria-hidden size={13} weight="bold" />,
      warning: <WarningIcon aria-hidden size={13} weight="bold" />,
      info: <InfoIcon aria-hidden size={13} weight="bold" />,
      loading: <CircleNotchIcon aria-hidden size={13} className="animate-spin" />,
      close: <XIcon aria-hidden size={12} />,
      ...icons,
    }}
    toastOptions={{
      unstyled: true,
      ...toastOptions,
      classNames: {
        toast: toastClass,
        icon: iconClass,
        content: "flex min-w-0 flex-1 flex-col gap-1 pt-0.5",
        title: "text-mono-md font-medium text-[var(--fg-primary)]",
        description: "font-sans text-mono-sm text-[var(--fg-secondary)]",
        actionButton: cn(
          "focus-ring mt-2 self-start rounded-[var(--radius-sm)] border border-[var(--border-strong)]",
          "px-2.5 py-1 font-mono text-mono-sm text-[var(--fg-primary)]",
          "transition-colors hover:border-[var(--fg-muted)] hover:bg-[var(--bg-hover-soft)]",
        ),
        cancelButton: cn(
          "focus-ring mt-2 self-start rounded-[var(--radius-sm)] px-2.5 py-1",
          "font-mono text-mono-sm text-[var(--fg-muted)] hover:text-[var(--fg-primary)]",
        ),
        closeButton: cn(
          "focus-ring absolute top-3 right-3 grid size-6 place-items-center rounded-[var(--radius-sm)]",
          "text-[var(--fg-muted)] opacity-0 transition-[opacity,background-color,color]",
          "group-hover/toast:opacity-100 focus-visible:opacity-100",
          "hover:bg-[var(--bg-hover-strong)] hover:text-[var(--fg-primary)]",
        ),
        ...toastOptions?.classNames,
      },
    }}
    {...props}
  />
)

export { Toaster }
export { toast } from "sonner"
