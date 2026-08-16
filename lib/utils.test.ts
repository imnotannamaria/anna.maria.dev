import { describe, expect, it } from "vitest"
import { cn } from "./utils"

describe("cn", () => {
  it("keeps a semantic font size alongside a text colour", () => {
    expect(cn("text-mono-md", "text-[var(--fg-secondary)]")).toBe(
      "text-mono-md text-[var(--fg-secondary)]",
    )
  })

  it("lets a semantic font-size override Tailwind's default step", () => {
    expect(cn("text-xs", "text-mono-xs")).toBe("text-mono-xs")
  })
})
