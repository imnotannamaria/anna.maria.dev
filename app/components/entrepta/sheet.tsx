"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"
import { OVERLAY_SURFACE } from "@/lib/overlay"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { DialogCloseButton, DialogDescription, DialogOverlay, DialogTitle } from "./dialog"

interface SheetContextValue {
  confirming: boolean
  keepEditing: () => void
  discard: () => void
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

interface SheetProps extends Omit<
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>,
  "modal"
> {
  /** Unsaved changes. Closing asks first, inside the sheet, instead of throwing them away. */
  dirty?: boolean
}

/**
 * A panel from the edge of the screen, to create or edit something without
 * losing the list, the filters and the scroll behind it. A Dialog in the middle
 * hides what the person was looking at.
 */
function Sheet({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  dirty = false,
  children,
}: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const controlled = openProp !== undefined
  const open = controlled ? openProp : uncontrolledOpen
  const [confirming, setConfirming] = React.useState(false)

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!controlled) setUncontrolledOpen(next)
      if (!next) setConfirming(false)
      onOpenChange?.(next)
    },
    [controlled, onOpenChange],
  )

  // Esc, a click outside and the × all arrive here. With changes, they ask.
  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next && dirty) {
        setConfirming(true)
        return
      }
      setOpen(next)
    },
    [dirty, setOpen],
  )

  const context = React.useMemo(
    () => ({
      confirming,
      keepEditing: () => setConfirming(false),
      discard: () => setOpen(false),
    }),
    [confirming, setOpen],
  )

  return (
    <SheetContext.Provider value={context}>
      <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        {children}
      </DialogPrimitive.Root>
    </SheetContext.Provider>
  )
}

const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close

const sheetVariants = cva([OVERLAY_SURFACE, "motion-sheet fixed z-50 flex flex-col outline-none"], {
  variants: {
    side: {
      // From 640px up. Below it a side panel would fill the screen, so it
      // comes up from the bottom like the bottom sheet.
      right: [
        "inset-x-0 bottom-0 max-h-[90dvh] rounded-t-[var(--radius-lg)] [--sheet-from:translateY(100%)]",
        "sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:h-dvh sm:max-h-none",
        "sm:rounded-none sm:rounded-l-[var(--radius-lg)] sm:[--sheet-from:translateX(100%)]",
      ],
      bottom: [
        "inset-x-0 bottom-0 max-h-[90dvh] rounded-t-[var(--radius-lg)] [--sheet-from:translateY(100%)]",
        "sm:mx-auto",
      ],
    },
    size: {
      // of the containing block: the viewport, or the element given as `container`
      sm: "sm:w-[min(360px,100%)]",
      md: "sm:w-[min(480px,100%)]",
      lg: "sm:w-[min(640px,100%)]",
    },
  },
  defaultVariants: { side: "right", size: "md" },
})

interface SheetContentProps
  extends
    Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, "title">,
    VariantProps<typeof sheetVariants> {
  /** The sheet's name, and its heading. Required: a sheet with no name is a mystery to a screen reader. */
  title: React.ReactNode
  description?: React.ReactNode
  /** Actions pinned to the bottom, such as Cancel and Save. */
  footer?: React.ReactNode
  /** The question shown when closing with changes. */
  discardPrompt?: React.ReactNode
  keepLabel?: string
  discardLabel?: string
  /**
   * Where it renders, instead of the end of the body: a device frame in a
   * preview, a shadow root. Give that element a transform, such as
   * `transform-gpu`, so the sheet and its backdrop are fixed to it.
   */
  container?: HTMLElement | null
}

const SheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(
  (
    {
      title,
      description,
      footer,
      side,
      size,
      discardPrompt = "Discard your changes?",
      keepLabel = "Keep editing",
      discardLabel = "Discard",
      container,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const sheet = React.useContext(SheetContext)
    const confirming = sheet?.confirming ?? false
    return (
      <DialogPrimitive.Portal container={container}>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(sheetVariants({ side, size }), className)}
          {...(description ? {} : { "aria-describedby": undefined })}
          {...props}
        >
          <div className="flex flex-col gap-1.5 border-b border-[var(--border-subtle)] px-6 pt-5 pr-12 pb-4">
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer || confirming ? (
            <div className="border-t border-[var(--border-subtle)] px-6 pt-4 pb-[max(16px,env(safe-area-inset-bottom))]">
              {confirming && sheet ? (
                <DiscardConfirm
                  prompt={discardPrompt}
                  keepLabel={keepLabel}
                  discardLabel={discardLabel}
                  onKeep={sheet.keepEditing}
                  onDiscard={sheet.discard}
                />
              ) : (
                <div className="flex flex-wrap items-center justify-end gap-2">{footer}</div>
              )}
            </div>
          ) : null}
          <DialogCloseButton />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    )
  },
)
SheetContent.displayName = "SheetContent"

function DiscardConfirm({
  prompt,
  keepLabel,
  discardLabel,
  onKeep,
  onDiscard,
}: {
  prompt: React.ReactNode
  keepLabel: string
  discardLabel: string
  onKeep: () => void
  onDiscard: () => void
}) {
  const keepRef = React.useRef<HTMLButtonElement>(null)
  // The safe choice gets the focus, so a second Esc or Enter keeps the work.
  React.useEffect(() => keepRef.current?.focus(), [])
  return (
    <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
      <p
        role="alert"
        className="text-mono-sm m-0 min-w-0 flex-1 basis-40 font-mono text-[var(--fg-primary)]"
      >
        {prompt}
      </p>
      <div className="flex shrink-0 gap-2">
        <Button ref={keepRef} variant="ghost" size="sm" onClick={onKeep}>
          {keepLabel}
        </Button>
        <Button variant="secondary" size="sm" onClick={onDiscard}>
          {discardLabel}
        </Button>
      </div>
    </div>
  )
}

export { Sheet, SheetClose, SheetContent, SheetTrigger, sheetVariants }
export type { SheetContentProps, SheetProps }
