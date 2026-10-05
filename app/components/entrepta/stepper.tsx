import { CheckIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr"
import * as React from "react"
import { Diamond } from "./diamond"
import { cn } from "@/lib/utils"

export interface StepperStep {
  id: string
  label: React.ReactNode
  /** A line under the label: what the step asks for. */
  description?: React.ReactNode
}

type StepState = "complete" | "current" | "error" | "upcoming"

const LABELS = {
  complete: "completed",
  current: "current step",
  error: "needs attention",
  upcoming: "not started",
}

interface StepperProps extends Omit<React.OlHTMLAttributes<HTMLOListElement>, "children"> {
  steps: readonly StepperStep[]
  /** The id of the step in progress. */
  current: string
  /** Ids of the steps done. Defaults to every step before the current one. */
  completed?: readonly string[]
  /** Ids of the steps that need attention. It wins over completed. */
  errored?: readonly string[]
  orientation?: "horizontal" | "vertical"
  /** The state words screen readers hear after each label. */
  labels?: Partial<typeof LABELS>
}

/**
 * Where someone is in a flow of a few steps: onboarding, a setup, an import.
 * An ordered list, the current step marked for screen readers and with the
 * ◆, each step's state in words. Below 640px a horizontal stepper keeps only
 * the current step's label in view; the others stay for screen readers.
 */
const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(
  (
    {
      steps,
      current,
      completed,
      errored = [],
      orientation = "horizontal",
      labels: labelsProp,
      className,
      ...props
    },
    ref,
  ) => {
    const labels = { ...LABELS, ...labelsProp }
    const currentIndex = Math.max(
      steps.findIndex((step) => step.id === current),
      0,
    )
    const stateOf = (step: StepperStep, index: number): StepState => {
      if (errored.includes(step.id)) return "error"
      if (step.id === current) return "current"
      const done = completed ? completed.includes(step.id) : index < currentIndex
      return done ? "complete" : "upcoming"
    }
    const vertical = orientation === "vertical"

    return (
      <ol
        ref={ref}
        data-orientation={orientation}
        className={cn("m-0 flex list-none p-0", vertical ? "flex-col" : "items-start", className)}
        {...props}
      >
        {steps.map((step, index) => {
          const state = stateOf(step, index)
          const last = index === steps.length - 1
          // the line to the next step fills once this one is done
          const filled = state === "complete"
          return (
            <li
              key={step.id}
              aria-current={state === "current" ? "step" : undefined}
              data-state={state}
              className={cn(
                "relative flex min-w-0",
                vertical ? "gap-3 pb-6 last:pb-0" : "flex-1 flex-col gap-2 last:flex-none",
              )}
            >
              <div
                className={cn("flex items-center", vertical ? "flex-col self-stretch" : "w-full")}
              >
                <Marker state={state} index={index} />
                {last ? null : (
                  <span
                    aria-hidden
                    className={cn(
                      "rounded-full bg-[var(--border-subtle)]",
                      vertical ? "mt-2 w-px flex-1" : "mx-2 h-px flex-1",
                      filled && "bg-[var(--border-brand-strong)]",
                      "transition-colors duration-[var(--motion-slow)]",
                    )}
                  />
                )}
              </div>
              <div
                className={cn(
                  "flex min-w-0 flex-col gap-0.5 font-mono",
                  !vertical && "pr-3",
                  // a phone keeps the current label only; the rest stay for screen readers
                  !vertical && state !== "current" && "max-sm:sr-only",
                  vertical && "pt-1",
                )}
              >
                <span
                  className={cn(
                    "text-mono-sm",
                    state === "current" ? "text-[var(--fg-primary)]" : "text-[var(--fg-secondary)]",
                    state === "error" && "text-[var(--status-error-fg)]",
                  )}
                >
                  {step.label}
                  <span className="sr-only">, {labels[state]}</span>
                </span>
                {step.description ? (
                  <span className="text-mono-xs text-[var(--fg-muted)]">{step.description}</span>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    )
  },
)
Stepper.displayName = "Stepper"

function Marker({ state, index }: { state: StepState; index: number }) {
  return (
    <span
      aria-hidden
      className={cn(
        "text-mono-xs grid size-7 shrink-0 place-items-center rounded-full border font-mono tabular-nums",
        "transition-[background-color,border-color,box-shadow] duration-[var(--motion-slow)]",
        state === "complete" &&
          "border-[var(--fg-brand)] bg-[var(--fg-brand)] text-[var(--fg-on-brand)]",
        state === "current" &&
          "border-[var(--fg-brand)] bg-[var(--bg-surface-brand)] text-[var(--fg-brand)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--fg-brand)_14%,transparent)]",
        state === "error" &&
          "border-[var(--status-error)] bg-[var(--status-error-soft)] text-[var(--status-error-fg)]",
        state === "upcoming" &&
          "border-[var(--border-strong)] bg-[var(--bg-field)] text-[var(--fg-muted)]",
      )}
    >
      {state === "complete" ? (
        <CheckIcon size={12} weight="bold" />
      ) : state === "error" ? (
        <WarningIcon size={12} weight="bold" />
      ) : state === "current" ? (
        <Diamond size={10} />
      ) : (
        index + 1
      )}
    </span>
  )
}

export { Stepper }
export type { StepperProps }
