import * as React from "react"
import { cn } from "@/lib/utils"
import { Reveal } from "./reveal"

// Written out whole, so Tailwind finds every class in the source.
const SM_COL = [
  "",
  "sm:col-span-1",
  "sm:col-span-2",
  "sm:col-span-3",
  "sm:col-span-4",
  "sm:col-span-5",
  "sm:col-span-6",
] as const
const LG_COL = [
  "",
  "lg:col-span-1",
  "lg:col-span-2",
  "lg:col-span-3",
  "lg:col-span-4",
  "lg:col-span-5",
  "lg:col-span-6",
  "lg:col-span-7",
  "lg:col-span-8",
  "lg:col-span-9",
  "lg:col-span-10",
  "lg:col-span-11",
  "lg:col-span-12",
] as const
const SM_ROW = ["", "sm:row-span-1", "sm:row-span-2", "sm:row-span-3", "sm:row-span-4"] as const
const LG_ROW = ["", "lg:row-span-1", "lg:row-span-2", "lg:row-span-3", "lg:row-span-4"] as const

type SmCols = 1 | 2 | 3 | 4 | 5 | 6
type LgCols = SmCols | 7 | 8 | 9 | 10 | 11 | 12
type Rows = 1 | 2 | 3 | 4

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * A dashboard of tiles on the 12 column grid: one column on a phone, 6 from
 * 640px, 12 from 1024px. Rows are at least 120px; set `--bento-row` to
 * change that. The tiles keep the order they have in the markup, which is
 * the order they are read in, and enter one after another.
 */
const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(
  ({ className, children, ...props }, ref) => {
    let index = 0
    const items = React.Children.map(children, (child) => {
      if (!React.isValidElement<BentoItemProps>(child) || child.type !== BentoItem) return child
      const own = index++
      return child.props.index === undefined ? React.cloneElement(child, { index: own }) : child
    })
    return (
      <div
        ref={ref}
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-6 lg:grid-cols-12 lg:gap-6",
          "auto-rows-[minmax(var(--bento-row,120px),auto)]",
          className,
        )}
        {...props}
      >
        {items}
      </div>
    )
  },
)
BentoGrid.displayName = "BentoGrid"

interface BentoItemProps {
  /** Columns from 640px (of 6) and from 1024px (of 12). One column below 640px. */
  colSpan?: { sm?: SmCols; lg?: LgCols }
  /** Rows from 640px, or per breakpoint. A single column needs none. */
  rowSpan?: Rows | { sm?: Rows; lg?: Rows }
  /** Its place in the entrance. BentoGrid counts them for you. */
  index?: number
  /** Rise and fade in once on screen. Off for a tile that must not wait. */
  reveal?: boolean
  className?: string
  children?: React.ReactNode
}

/**
 * A tile. It is a size container, so what is inside can respond to the tile's
 * width with `@sm:` and friends, not the window's: the same Metric can sit in
 * a wide tile and a narrow one. Put a Card inside for the surface.
 */
function BentoItem({
  colSpan = { sm: 3, lg: 4 },
  rowSpan,
  index = 0,
  reveal = true,
  className,
  children,
}: BentoItemProps) {
  const rows = typeof rowSpan === "number" ? { sm: rowSpan } : (rowSpan ?? {})
  const classes = cn(
    "@container flex min-w-0 flex-col [&>*]:flex-1",
    SM_COL[colSpan.sm ?? 6],
    LG_COL[colSpan.lg ?? 12],
    rows.sm ? SM_ROW[rows.sm] : null,
    rows.lg ? LG_ROW[rows.lg] : null,
    className,
  )
  if (!reveal) return <div className={classes}>{children}</div>
  return (
    <Reveal index={index} className={classes}>
      {children}
    </Reveal>
  )
}

export { BentoGrid, BentoItem }
export type { BentoGridProps, BentoItemProps }
