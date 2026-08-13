import { afterEach, describe, expect, it, vi } from "vitest"

// Same guard and the same mock strategy as admin-log.test.ts.
const withAuth = vi.fn()
vi.mock("@workos-inc/authkit-nextjs", () => ({
  withAuth: (...args: unknown[]) => withAuth(...args),
}))

const ORIGINAL_ADMIN_EMAILS = process.env.ADMIN_EMAILS

afterEach(() => {
  vi.mocked(withAuth).mockReset()
  if (ORIGINAL_ADMIN_EMAILS === undefined) delete process.env.ADMIN_EMAILS
  else process.env.ADMIN_EMAILS = ORIGINAL_ADMIN_EMAILS
})

async function loadAdminRoadmap() {
  const { adminRoadmap } = await import("./admin-roadmap")
  return adminRoadmap
}

/**
 * `POST /` with an invalid body, for the reason spelled out at length in
 * admin-log.test.ts: an allowed caller stops at zValidator (400) while a rejected one gets
 * the guard's 404, so the two are distinguishable.
 *
 * This file previously used `DELETE /some-id`, which routes fine but then fails
 * `isUuid()` inside `deleteItem()` and returns 404 anyway — the same status as rejection.
 * All three tests here passed with the guard removed entirely.
 */
function postInvalid(app: Awaited<ReturnType<typeof loadAdminRoadmap>>) {
  return app.request("/", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  })
}

describe("adminRoadmap — the same gate as adminLog", () => {
  it("404s a caller with no session rather than 401/403", async () => {
    withAuth.mockRejectedValue(new Error("no session"))
    const adminRoadmap = await loadAdminRoadmap()

    const res = await postInvalid(adminRoadmap)

    expect(res.status).toBe(404)
  })

  it("404s a non-allowlisted signed-in user", async () => {
    process.env.ADMIN_EMAILS = "admin@example.com"
    withAuth.mockResolvedValue({ user: { email: "stranger@example.com" } })
    const adminRoadmap = await loadAdminRoadmap()

    const res = await postInvalid(adminRoadmap)

    expect(res.status).toBe(404)
  })

  it("404s a signed-in user when ADMIN_EMAILS is unset", async () => {
    delete process.env.ADMIN_EMAILS
    withAuth.mockResolvedValue({ user: { email: "anyone@example.com" } })
    const adminRoadmap = await loadAdminRoadmap()

    const res = await postInvalid(adminRoadmap)

    expect(res.status).toBe(404)
  })

  it("gives two different answers to the identical request, on identity alone", async () => {
    process.env.ADMIN_EMAILS = "admin@example.com"
    const adminRoadmap = await loadAdminRoadmap()

    withAuth.mockResolvedValue({ user: { email: "admin@example.com" } })
    const allowed = await postInvalid(adminRoadmap)

    withAuth.mockResolvedValue({ user: { email: "stranger@example.com" } })
    const rejected = await postInvalid(adminRoadmap)

    expect(allowed.status).toBe(400)
    expect(rejected.status).toBe(404)
  })
})
