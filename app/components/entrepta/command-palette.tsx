"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"
import * as React from "react"
import { cn } from "@/lib/utils"

const CommandDialog = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) => (
  <DialogPrimitive.Root {...props}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-[4px]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "duration-200",
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "max-h-[70vh] w-[calc(100vw-32px)] max-w-[640px]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-100",
          "data-[state=open]:slide-in-from-bottom-2",
          "duration-200 ease-out",
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
    /**
     * `--bg-overlay`, not `--bg-surface`. The latter is zinc-900, which was right when cards
     * were zinc-900 too; once `--bg-card` moved to near-black this became the one large grey
     * panel on the site and read as a different product.
     *
     * This was briefly `data-surface="dark"` — the scope globals.css defines for IDE chrome
     * "regardless of page mode" — and that is exactly what was wrong with it: it pinned the
     * panel dark while the page was light. A token that resolves per mode does the same job
     * in dark and stays reactive in light.
     */
    className={cn(
      "flex max-h-[70vh] flex-col overflow-hidden",
      "border border-[var(--border-strong)] bg-[var(--bg-overlay)]",
      "rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)]",
      className,
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

interface CommandInputProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> {
  /** Render the `esc` kbd chip on the right side of the input. Default: true. */
  showEsc?: boolean
}

const CommandInput = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Input>,
  CommandInputProps
>(({ className, showEsc = true, ...props }, ref) => (
  <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-4">
    <Search
      aria-hidden
      className="shrink-0 text-[var(--fg-muted)]"
      style={{ width: 14, height: 14, strokeWidth: 1.5 }}
    />
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
          className={cn(
            "inline-flex shrink-0 items-center justify-center",
            "h-5 rounded-[4px] px-1.5",
            "text-mono-sm font-mono text-[var(--fg-muted)]",
            "border border-[var(--border-subtle)]",
            "hover:border-[var(--border-strong)] hover:text-[var(--fg-primary)]",
            "transition-colors duration-150",
          )}
          aria-label="Close command palette"
        >
          esc
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
    className={cn("flex-1 overflow-x-hidden overflow-y-auto p-2", className)}
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
      // `◆ ` before the label, the way CardHead and the sidebar open every other heading
      // on the site. cmdk owns this element, so it is reached with a `before:` rather than
      // by wrapping something it renders.
      "[&_[cmdk-group-heading]]:before:mr-1.5 [&_[cmdk-group-heading]]:before:content-['◆']",
      "[&_[cmdk-group-heading]]:before:text-[var(--fg-brand)]",
      "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-2",
      "[&_[cmdk-group-heading]]:text-mono-xs [&_[cmdk-group-heading]]:font-mono",
      "[&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:uppercase",
      "[&_[cmdk-group-heading]]:text-[var(--fg-muted)]",
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
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-2 my-1 h-px bg-[var(--border-subtle)]", className)}
    {...props}
  />
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
      "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2",
      "text-mono-md font-mono text-[var(--fg-secondary)]",
      "cursor-default select-none",
      "transition-colors duration-150",
      "data-[selected=true]:bg-[var(--bg-surface-brand)] data-[selected=true]:text-[var(--fg-primary)]",
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40",
      className,
    )}
    {...props}
  >
    {icon && <span className="shrink-0 text-[var(--fg-muted)]">{icon}</span>}
    <span className="flex-1">{children}</span>
    {shortcut && (
      <span className="text-mono-sm font-mono tracking-[0.04em] text-[var(--fg-muted)]">
        {shortcut}
      </span>
    )}
  </CommandPrimitive.Item>
))
CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandFoot = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Same contract as CardHead: the row wraps, the halves don't. The hint string is
        // 38 characters of mono, so on a phone it needs the whole line to itself rather
        // than breaking into "↑↓ to" / "navigate".
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
            <span aria-hidden style={{ opacity: 0.6 }}>
              {"// "}
            </span>
            palette
          </span>
          <span className="whitespace-nowrap">⌘K to close · ↑↓ to navigate · ↵ to go</span>
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
