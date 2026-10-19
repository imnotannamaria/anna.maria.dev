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

async function loadAdminWall() {
  const { adminWall } = await import("./admin-wall")
  return adminWall
}

/**
 * `POST /` with an invalid body: an allowed caller stops at zValidator (400) while a rejected
 * one gets the guard's 404, so the two answers can be told apart. See admin-log.test.ts.
 */
function postInvalid(app: Awaited<ReturnType<typeof loadAdminWall>>) {
  return app.request("/", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  })
}

describe("adminWall — the same gate as adminLog", () => {
  it("404s a caller with no session rather than 401/403", async () => {
    withAuth.mockRejectedValue(new Error("no session"))
    expect((await postInvalid(await loadAdminWall())).status).toBe(404)
  })

  it("404s a non-allowlisted signed-in user", async () => {
    process.env.ADMIN_EMAILS = "admin@example.com"
    withAuth.mockResolvedValue({ user: { email: "stranger@example.com" } })
    expect((await postInvalid(await loadAdminWall())).status).toBe(404)
  })

  it("gives two different answers to the identical request, on identity alone", async () => {
    process.env.ADMIN_EMAILS = "admin@example.com"
    const adminWall = await loadAdminWall()

    withAuth.mockResolvedValue({ user: { email: "admin@example.com" } })
    const allowed = await postInvalid(adminWall)

    withAuth.mockResolvedValue({ user: { email: "stranger@example.com" } })
    const rejected = await postInvalid(adminWall)

    expect(allowed.status).toBe(400)
    expect(rejected.status).toBe(404)
  })

  /** Approve, reject, renew and delete are the routes that change what is public. */
  it("guards the routes that decide, not only the one that creates", async () => {
    withAuth.mockRejectedValue(new Error("no session"))
    const adminWall = await loadAdminWall()
    const id = "00000000-0000-4000-8000-000000000000"

    const responses = await Promise.all([
      adminWall.request(`/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      }),
      adminWall.request(`/${id}/renew`, { method: "POST" }),
      adminWall.request(`/${id}`, { method: "DELETE" }),
    ])

    expect(responses.map((r) => r.status)).toEqual([404, 404, 404])
  })
})
