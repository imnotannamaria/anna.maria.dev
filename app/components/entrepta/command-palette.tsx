"use client"

import { MagnifyingGlassIcon } from "@phosphor-icons/react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import * as React from "react"
import { MENU_ROW, MENU_SEPARATOR, OVERLAY_SURFACE } from "@/lib/overlay"
import { cn } from "@/lib/utils"
import { Kbd } from "./kbd"

const CommandDialog = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) => (
  <DialogPrimitive.Root {...props}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn("fixed inset-0 z-50 bg-black/60 backdrop-blur-[4px]", "motion-fade")}
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "max-h-[70vh] w-[calc(100vw-32px)] max-w-[640px]",
          "motion-pop",
        )}
      >
        <DialogPrimitive.Title className="sr-only">Command Palette</DialogPrimitive.Title>
        <DialogPrimitive.Description className="sr-only">
          Search for commands, pages, and components.
        </DialogPrimitive.Description>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
)
CommandDialog.displayName = "CommandDialog"

const Command = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      OVERLAY_SURFACE,
      "flex max-h-[70vh] flex-col overflow-hidden rounded-[var(--radius-lg)]",
      className,
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

interface CommandInputProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> {
  /** Render the `esc` chip that closes the dialog. Default: true. Pass false for a Command outside CommandDialog. */
  showEsc?: boolean
}

const CommandInput = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Input>,
  CommandInputProps
>(({ className, showEsc = true, ...props }, ref) => (
  <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-4">
    <MagnifyingGlassIcon aria-hidden className="shrink-0 text-[var(--fg-muted)]" size={14} />
    <CommandPrimitive.Input
      ref={ref}
      aria-label="Search commands"
      {...props}
      className={cn(
        "flex-1 appearance-none border-0 bg-transparent outline-none",
        "text-mono-md font-mono text-[var(--fg-primary)]",
        "placeholder:text-[var(--fg-muted)]",
        className,
      )}
    />
    {showEsc && (
      <DialogPrimitive.Close asChild>
        <button
          type="button"
          className="focus-ring shrink-0 cursor-pointer rounded-[4px] [&_kbd]:hover:border-[var(--border-strong)] [&_kbd]:hover:text-[var(--fg-primary)]"
          aria-label="Close command palette"
        >
          <Kbd>esc</Kbd>
        </button>
      </DialogPrimitive.Close>
    )}
  </div>
))
CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("flex-1 overflow-x-hidden overflow-y-auto p-1", className)}
    {...props}
  />
))
CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="text-mono-md py-8 text-center font-mono text-[var(--fg-muted)]"
    {...props}
  />
))
CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "[&_[cmdk-group-heading]]:flex [&_[cmdk-group-heading]]:items-center [&_[cmdk-group-heading]]:gap-1.5",
      "[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2.5 [&_[cmdk-group-heading]]:pb-1.5",
      "[&_[cmdk-group-heading]]:text-mono-xs [&_[cmdk-group-heading]]:font-mono",
      "[&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:uppercase",
      "[&_[cmdk-group-heading]]:text-[var(--fg-muted)]",
      // cmdk renders the heading, so the ◆ comes in through ::before
      "[&_[cmdk-group-heading]]:before:[font-size:9px] [&_[cmdk-group-heading]]:before:content-['◆']",
      "[&_[cmdk-group-heading]]:before:text-[var(--fg-brand)]",
      className,
    )}
    {...props}
  />
))
CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator ref={ref} className={cn(MENU_SEPARATOR, className)} {...props} />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

interface CommandItemProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> {
  shortcut?: string
  icon?: React.ReactNode
}

const CommandItem = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Item>,
  CommandItemProps
>(({ className, shortcut, icon, children, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      MENU_ROW,
      "cursor-default",
      // the same highlight as a dropdown row: the brand tint, and the icon turns brand
      "data-[selected=true]:bg-[var(--bg-surface-brand)] data-[selected=true]:text-[var(--fg-primary)]",
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40",
      className,
    )}
    {...props}
  >
    {icon && (
      <span className="flex shrink-0 text-[var(--fg-muted)] transition-colors group-data-[selected=true]/item:text-[var(--fg-brand)]">
        {icon}
      </span>
    )}
    <span className="flex-1 truncate">{children}</span>
    {shortcut && <Kbd variant="plain">{shortcut}</Kbd>}
  </CommandPrimitive.Item>
))
CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandFoot = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // the row wraps and each half does not, so a phone gets the hints on a line of their own
        "flex flex-wrap items-center justify-between gap-x-3 gap-y-1",
        "border-t border-[var(--border-subtle)] px-4 py-2",
        "text-mono-sm font-mono text-[var(--fg-muted)]",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <span className="whitespace-nowrap">
            <span aria-hidden className="opacity-60">
              {"// "}
            </span>
            palette
          </span>
          <span className="flex items-center gap-3 whitespace-nowrap">
            <span className="flex items-center gap-1.5">
              <Kbd>↑↓</Kbd> navigate
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>↵</Kbd> open
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <Kbd>esc</Kbd> close
            </span>
          </span>
        </>
      )}
    </div>
  ),
)
CommandFoot.displayName = "CommandFoot"

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandFoot,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
}
