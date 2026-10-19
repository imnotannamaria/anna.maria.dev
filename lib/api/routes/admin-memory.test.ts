import { afterEach, describe, expect, it, vi } from "vitest"

// Same guard and the same mock strategy as admin-log.test.ts.
const withAuth = vi.fn()
vi.mock("@workos-inc/authkit-nextjs", () => ({
  withAuth: (...args: unknown[]) => withAuth(...args),
}))
vi.mock("server-only", () => ({}))

const ORIGINAL_ADMIN_EMAILS = process.env.ADMIN_EMAILS

afterEach(() => {
  vi.mocked(withAuth).mockReset()
  if (ORIGINAL_ADMIN_EMAILS === undefined) delete process.env.ADMIN_EMAILS
  else process.env.ADMIN_EMAILS = ORIGINAL_ADMIN_EMAILS
})

const ID = "00000000-0000-4000-8000-000000000000"

const decideInvalid = async () => {
  const { adminMemory } = await import("./admin-memory")
  return adminMemory.request(`/${ID}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status: "submitted" }),
  })
}

describe("adminMemory — the same gate as adminLog", () => {
  it("404s a caller with no session, on every route", async () => {
    withAuth.mockRejectedValue(new Error("no session"))
    const { adminMemory } = await import("./admin-memory")
    const responses = await Promise.all([
      adminMemory.request(`/${ID}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      }),
      adminMemory.request(`/${ID}`, { method: "DELETE" }),
    ])
    expect(responses.map((r) => r.status)).toEqual([404, 404])
  })

  it("gives two different answers to the identical request, on identity alone", async () => {
    process.env.ADMIN_EMAILS = "admin@example.com"

    withAuth.mockResolvedValue({ user: { email: "admin@example.com" } })
    expect((await decideInvalid()).status).toBe(400)

    withAuth.mockResolvedValue({ user: { email: "stranger@example.com" } })
    expect((await decideInvalid()).status).toBe(404)
  })
})
