import type { ReactNode } from "react"
import "./plate.css"

/** The rounded white (or dark) plate a brand mark sits on: an app icon, a sticker, a folder tab. */
export function Plate({
  tone = "light",
  background,
  children,
}: {
  tone?: "light" | "dark"

  background?: string
  children: ReactNode
}) {
  return (
    <span
      className="st-plate"
      data-tone={background ? "dark" : tone}
      style={background ? { background: background } : undefined}
    >
      {children}
    </span>
  )
}
