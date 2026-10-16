import { afterEach, describe, expect, it, vi } from "vitest"

// require-admin.ts imports withAuth from @workos-inc/authkit-nextjs, whose real module
// pulls in next/cache and next/headers — resolvable inside a Next server, not inside
// Vitest's node environment. Mocking the package means the real implementation never
// loads. isAdminEmail()/adminEmails() don't call withAuth() at all, so the mock is never
// exercised — it exists only to make the module importable.
vi.mock("@workos-inc/authkit-nextjs", () => ({ withAuth: vi.fn() }))

const { isAdmin, isAdminEmail } = await import("./require-admin")

const ORIGINAL_ADMIN_EMAILS = process.env.ADMIN_EMAILS

afterEach(() => {
  if (ORIGINAL_ADMIN_EMAILS === undefined) delete process.env.ADMIN_EMAILS
  else process.env.ADMIN_EMAILS = ORIGINAL_ADMIN_EMAILS
})

describe("isAdminEmail", () => {
  it("matches case-insensitively against a lowercase allowlist", () => {
    process.env.ADMIN_EMAILS = "anna@example.com"
    expect(isAdminEmail("Anna@Example.com")).toBe(true)
  })

  it("tolerates whitespace around entries in ADMIN_EMAILS", () => {
    process.env.ADMIN_EMAILS = " anna@example.com , bob@example.com "
    expect(isAdminEmail("bob@example.com")).toBe(true)
  })

  it("denies everyone when ADMIN_EMAILS is unset", () => {
    delete process.env.ADMIN_EMAILS
    expect(isAdminEmail("anna@example.com")).toBe(false)
  })

  it("denies everyone when ADMIN_EMAILS is empty", () => {
    process.env.ADMIN_EMAILS = ""
    expect(isAdminEmail("anna@example.com")).toBe(false)
  })

  it("rejects an email not on the allowlist", () => {
    process.env.ADMIN_EMAILS = "anna@example.com"
    expect(isAdminEmail("stranger@example.com")).toBe(false)
  })

  it("does not throw on null or undefined", () => {
    process.env.ADMIN_EMAILS = "anna@example.com"
    expect(isAdminEmail(null)).toBe(false)
    expect(isAdminEmail(undefined)).toBe(false)
  })
})

describe("isAdmin", () => {
  it("lets in an allowlisted email that WorkOS has verified, or does not say either way", () => {
    process.env.ADMIN_EMAILS = "admin@example.com"
    expect(isAdmin({ email: "admin@example.com", emailVerified: true })).toBe(true)
    // an older user object has no such field: not a reason to lock the owner out
    expect(isAdmin({ email: "admin@example.com" })).toBe(true)
  })

  it("refuses an allowlisted address that WorkOS marks as not verified", () => {
    process.env.ADMIN_EMAILS = "admin@example.com"
    expect(isAdmin({ email: "admin@example.com", emailVerified: false })).toBe(false)
  })

  it("refuses everyone else, and no one at all", () => {
    process.env.ADMIN_EMAILS = "admin@example.com"
    expect(isAdmin({ email: "stranger@example.com", emailVerified: true })).toBe(false)
    expect(isAdmin(null)).toBe(false)
    expect(isAdmin(undefined)).toBe(false)
  })
})
