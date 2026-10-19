"use client"

import { CheckIcon, CopyIcon, EyeIcon, EyeSlashIcon, WarningIcon } from "@phosphor-icons/react"
import * as React from "react"
import { useCopy } from "@/hooks/use-copy"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { inputFieldClass, inputWrapperVariants } from "./input"

const LABELS = {
  copy: "Copy",
  copied: "Copied",
  copyFailed: "Could not copy",
  reveal: "Show",
  hide: "Hide",
}

interface SecretFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The secret: an API key, a token, a recovery code. */
  value: string
  /** What it is, for the copy button's name: "API key" makes it "Copy API key". */
  name: string
  /** Show it as dots, keeping the prefix and the last four, with a button to reveal it. */
  mask?: boolean
  /**
   * It no longer works. The copy button goes, and the message and the action,
   * such as a button to make a new one, take its place.
   */
  expired?: { message: React.ReactNode; action?: React.ReactNode } | null
  /** The field's own id, for a Field or a label. */
  id?: string
  labels?: Partial<typeof LABELS>
}

/** `sk_live_••••••••4f2a`: the prefix up to its last `_`, the dots, the last four. */
function maskSecret(value: string): string {
  const cut = value.lastIndexOf("_") + 1
  const prefix = cut > 0 && cut < value.length - 4 ? value.slice(0, cut) : ""
  const tail = value.length > 8 ? value.slice(-4) : ""
  return `${prefix}${"•".repeat(8)}${tail}`
}

/**
 * A secret to copy once: an API key, a token. Read only and in mono, masked
 * until asked, with a copy button named after what it copies. "Copied" is
 * said out loud, politely, and a copy that failed says so instead of
 * pretending.
 */
const SecretField = React.forwardRef<HTMLDivElement, SecretFieldProps>(
  (
    { value, name, mask = true, expired = null, id, labels: labelsProp, className, ...props },
    ref,
  ) => {
    const labels = { ...LABELS, ...labelsProp }
    const { state, copy } = useCopy()
    const [shown, setShown] = React.useState(!mask)
    const status = state === "copied" ? labels.copied : state === "error" ? labels.copyFailed : ""

    return (
      <div ref={ref} className={cn("flex w-full min-w-0 flex-col gap-2", className)} {...props}>
        <div
          className={cn(
            inputWrapperVariants({ size: "md", state: expired ? "error" : "default" }),
            "pr-1",
          )}
        >
          <input
            id={id}
            readOnly
            // the real value only when shown, so a masked secret is not in the DOM to copy by hand
            value={shown ? value : maskSecret(value)}
            aria-label={name}
            spellCheck={false}
            autoComplete="off"
            className={cn(
              inputFieldClass,
              "min-w-0 font-mono tracking-wide tabular-nums",
              expired && "text-[var(--fg-muted)] line-through",
            )}
            onFocus={(event) => shown && event.currentTarget.select()}
          />
          {mask ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 shrink-0"
              aria-label={`${shown ? labels.hide : labels.reveal} ${name}`}
              aria-pressed={shown}
              onClick={() => setShown((s) => !s)}
            >
              {shown ? <EyeSlashIcon aria-hidden size={16} /> : <EyeIcon aria-hidden size={16} />}
            </Button>
          ) : null}
          {expired ? null : (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn(
                "size-8 shrink-0",
                state === "copied" && "text-[var(--status-success-fg)]",
                state === "error" && "text-[var(--status-error-fg)]",
              )}
              aria-label={`${labels.copy} ${name}`}
              onClick={() => copy(value)}
            >
              {state === "copied" ? (
                <CheckIcon aria-hidden size={16} weight="bold" />
              ) : (
                <CopyIcon aria-hidden size={16} />
              )}
            </Button>
          )}
        </div>
        {/* said once, politely, after the click */}
        <span aria-live="polite" className="sr-only">
          {status}
        </span>
        {expired ? (
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <p className="text-mono-sm m-0 flex min-w-0 items-center gap-1.5 font-mono text-[var(--status-error-fg)]">
              <WarningIcon aria-hidden size={14} weight="bold" className="shrink-0" />
              {expired.message}
            </p>
            {expired.action}
          </div>
        ) : null}
      </div>
    )
  },
)
SecretField.displayName = "SecretField"

export { maskSecret, SecretField }
export type { SecretFieldProps }
