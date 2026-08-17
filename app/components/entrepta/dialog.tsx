"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import * as React from "react"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-[4px]",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "duration-200",
      className,
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
        "flex flex-col gap-4",
        "w-[calc(100vw-32px)] max-w-md",
        "border border-[var(--border-strong)] bg-[var(--bg-surface)]",
        "rounded-[var(--radius-lg)] p-6",
        "shadow-[0_24px_48px_rgba(0,0,0,0.6)]",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "duration-200 ease-out",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        aria-label="Close"
        className={cn(
          "absolute top-3 right-3 inline-flex items-center justify-center",
          "h-7 w-7 rounded-[var(--radius-sm)]",
          "text-[var(--fg-muted)] hover:bg-[var(--bg-hover-soft)] hover:text-[var(--fg-primary)]",
          "transition-colors duration-150",
          "focus-visible:[outline:2px_solid_var(--fg-brand)] focus-visible:outline-offset-2 focus-visible:outline-none",
        )}
      >
        <X aria-hidden style={{ width: 14, height: 14, strokeWidth: 1.5 }} />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-2 pr-8", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center justify-end gap-2 pt-5",
      "-mx-6 mt-2 border-t border-[var(--border-subtle)] px-6",
      className,
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-heading-lg m-0 font-serif leading-snug font-normal text-[var(--fg-primary)]",
      "[&_em]:text-[var(--fg-brand)] [&_em]:italic",
      className,
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-body-md m-0 font-sans leading-relaxed text-[var(--fg-secondary)]",
      className,
    )}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

/** Optional meta strip (file path / version / status) shown above the title. */
const DialogLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5",
        "text-mono-sm font-mono tracking-[0.08em] text-[var(--fg-secondary)] uppercase",
        className,
      )}
      {...props}
    >
      <span aria-hidden className="text-mono-xs leading-none text-[var(--fg-brand)]">
        ◆
      </span>
      {children}
    </div>
  ),
)
DialogLabel.displayName = "DialogLabel"

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogLabel,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
