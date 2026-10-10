import { cn } from "@/lib/utils"
import "./tape.css"

/** A strip of tape across the top edge of whatever it is placed in. Decoration only. */
export function Tape({ className }: { className?: string }) {
  return <span aria-hidden className={cn("st-tape", className)} />
}

/** A pushpin at the top of a sheet. Decoration only. */
export function Pushpin({ className }: { className?: string }) {
  return <span aria-hidden className={cn("st-pushpin", className)} />
}
