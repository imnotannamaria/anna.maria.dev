import { cn } from "@/lib/utils"

interface InlineArrowProps {
  direction?: "left" | "right"
  className?: string
}

export function InlineArrow({ direction = "right", className }: InlineArrowProps) {
  const isLeft = direction === "left"
  const glyph = isLeft ? "←" : "→"

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex h-[1em] w-[1.1em] overflow-hidden align-middle",
        className,
      )}
    >
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-250 ease-out group-hover:opacity-0",
          isLeft
            ? "translate-x-0 group-hover:-translate-x-2"
            : "translate-x-0 group-hover:translate-x-2",
        )}
      >
        {glyph}
      </span>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-250 ease-out group-hover:opacity-100",
          isLeft
            ? "translate-x-2 group-hover:translate-x-0"
            : "-translate-x-2 group-hover:translate-x-0",
        )}
      >
        {glyph}
      </span>
    </span>
  )
}
