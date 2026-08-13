import { describe, expect, it } from "vitest"
import { contactSchema } from "./contact-schema"

function base() {
  return { name: "Anna", email: "anna@example.com", message: "Hello, this is a real message." }
}

describe("contactSchema", () => {
  it("accepts a well-formed submission", () => {
    expect(contactSchema.safeParse(base()).success).toBe(true)
  })

  it("rejects an empty name", () => {
    expect(contactSchema.safeParse({ ...base(), name: "" }).success).toBe(false)
  })

  it("rejects a malformed email", () => {
    expect(contactSchema.safeParse({ ...base(), email: "not-an-email" }).success).toBe(false)
  })

  it("rejects a message under 10 characters", () => {
    expect(contactSchema.safeParse({ ...base(), message: "short" }).success).toBe(false)
  })

  it("rejects a message over 5000 characters", () => {
    expect(contactSchema.safeParse({ ...base(), message: "a".repeat(5001) }).success).toBe(false)
  })

  it("trims whitespace from name and message", () => {
    const result = contactSchema.safeParse({ ...base(), name: "  Anna  " })
    expect(result.success && result.data.name).toBe("Anna")
  })
})
