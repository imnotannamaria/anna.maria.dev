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

  // A font size must not evict an earlier `leading-*`. In Tailwind v4 the
  // leading wins in CSS whatever the order, so dropping it here would make
  // `cn()` disagree with the browser. `Badge` is the real case: `leading-none`
  // sits in its cva base, before the size its `size` variant appends.
  it("keeps a leading that comes before a font size", () => {
    expect(cn("leading-none", "text-mono-sm")).toBe("leading-none text-mono-sm")
    expect(cn("leading-none", "text-sm")).toBe("leading-none text-sm")
  })
})
