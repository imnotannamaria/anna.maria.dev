import { cva } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** A height past which the table scrolls in its box, with the header held at the top. */
  maxHeight?: number | string
  /** The scrolling box, for a virtualizer to measure. */
  containerRef?: React.Ref<HTMLDivElement>
}

/**
 * A real `<table>`: the markup a DataTable renders, and what a plain table of
 * figures needs. It scrolls sideways inside its own box on a phone instead of
 * squeezing its columns, and the header stays in view while it scrolls down.
 * No state, so a server component can render it.
 */
const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, maxHeight, containerRef, children, ...props }, ref) => (
    <div
      ref={containerRef}
      className="relative w-full overflow-auto rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-card)]"
      style={maxHeight === undefined ? undefined : { maxHeight }}
    >
      <table
        ref={ref}
        className={cn("text-mono-sm w-full caption-bottom border-collapse font-mono", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  ),
)
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "sticky top-0 z-[1] bg-[var(--bg-card)] shadow-[inset_0_-1px_0_var(--border-subtle)]",
      className,
    )}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&>tr:last-child]:border-b-0", className)} {...props} />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-[var(--border-subtle)] bg-[var(--bg-hover-soft)] text-[var(--fg-primary)]",
      className,
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-[var(--border-subtle)] transition-colors duration-[var(--motion-fast)]",
        "hover:bg-[var(--bg-hover-soft)] data-[state=selected]:bg-[var(--bg-surface-brand)]",
        className,
      )}
      {...props}
    />
  ),
)
TableRow.displayName = "TableRow"

// Numbers sit on the right in tabular figures, so a column of them lines up.
const cellVariants = cva("px-3 align-middle whitespace-nowrap tabular-nums", {
  variants: {
    align: {
      start: "text-left",
      center: "text-center",
      end: "text-right",
    },
  },
  defaultVariants: { align: "start" },
})

type Align = "start" | "center" | "end"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  Omit<React.ThHTMLAttributes<HTMLTableCellElement>, "align"> & { align?: Align }
>(({ className, align, scope = "col", ...props }, ref) => (
  <th
    ref={ref}
    scope={scope}
    className={cn(
      cellVariants({ align }),
      "text-mono-xs h-9 font-normal tracking-[0.08em] text-[var(--fg-muted)] uppercase",
      className,
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "align"> & { align?: Align }
>(({ className, align, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(cellVariants({ align }), "h-10 text-[var(--fg-secondary)]", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("text-mono-xs px-3 py-2.5 text-left text-[var(--fg-muted)]", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  cellVariants,
}
export type { TableProps }
