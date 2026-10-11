import { describe, expect, it } from "vitest"
import { PAGES, hrefOf, listedPageOf, screenOf } from "./pages"

describe("hrefOf and screenOf", () => {
  it("round-trips every page of the sidebar", () => {
    for (const page of PAGES) expect(screenOf(hrefOf(page.id))).toBe(page.id)
  })

  it("puts the home at the root", () => {
    expect(hrefOf("home")).toBe("/")
    expect(screenOf("/")).toBe("home")
  })

  it("carries the slug of a note and of a project", () => {
    expect(hrefOf("post:my-post")).toBe("/notes/my-post")
    expect(screenOf("/notes/my-post")).toBe("post:my-post")
    expect(hrefOf("project:wristkit")).toBe("/projects/wristkit")
    expect(screenOf("/projects/wristkit")).toBe("project:wristkit")
  })

  it("has no screen for the other two sides, or for an address it does not know", () => {
    expect(screenOf("/back")).toBeNull()
    expect(screenOf("/ai")).toBeNull()
    expect(screenOf("/invite/abc")).toBeNull()
    expect(screenOf("/nope")).toBeNull()
  })
})

describe("listedPageOf", () => {
  it("lights the page an inner screen is reached from", () => {
    expect(listedPageOf("post:my-post")).toBe("notes")
    expect(listedPageOf("project:wristkit")).toBe("projects")
    expect(listedPageOf("log")).toBe("person")
  })

  it("is the page itself for a page of the sidebar, and nothing for the admin", () => {
    expect(listedPageOf("contact")).toBe("contact")
    expect(listedPageOf("admin")).toBeNull()
  })
})
