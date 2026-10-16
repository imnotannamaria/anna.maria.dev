import { describe, expect, it } from "vitest"
import { CAREER } from "@/components/site/professional/career"
import { EMPLOYERS } from "./career"

/**
 * The career on "Anna, the professional" is the source of where I have worked, and the invite
 * form's company picker reads `EMPLOYERS`. A new job there with no entry here fails this, so it
 * shows up in the picker.
 */
describe("EMPLOYERS", () => {
  it("lists every company in the career, in the same order", () => {
    const worked = CAREER.filter((entry) => entry.type === "work").map((entry) => entry.id)
    expect(worked.length).toBeGreaterThan(0)
    expect(EMPLOYERS.map((employer) => employer.org)).toEqual(worked)
  })
})
