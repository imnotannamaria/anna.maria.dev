import { afterEach, describe, expect, it, vi } from "vitest"

// withAuth is what requireAdminApi calls to find out who's asking. Outside a real Next
// request the real implementation throws (it reaches into next/headers for a cookie that
// isn't there), and requireAdminApi's `.catch()` already reads that as "no user" — so
// rejecting the mock is a faithful stand-in for a signed-out caller.
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

async function loadAdminLog() {
  const { adminLog } = await import("./admin-log")
  return adminLog
}

/**
 * Always `POST /`, and never `GET /` or `PATCH /` — that choice is the whole reason these
 * tests mean anything.
 *
 * adminLog only routes `POST /`, `PATCH /:id` and `DELETE /:id`. A request to any other
 * path/method combination matches no route, so Hono answers **404 from `notFound()`** —
 * the exact status the guard returns when it rejects you. An assertion aimed at an
 * unrouted path therefore passes whether or not `requireAdminApi` is mounted at all, which
 * is how the first version of this file came to pass with the guard deleted.
 *
 * The body is deliberately invalid so an *allowed* caller stops at zValidator with a 400
 * and never reaches `createEntry()` — no database needed. 400-vs-404 is the signal: 400
 * means the gate let someone through, 404 means it turned them away.
 */
function postInvalid(app: Awaited<ReturnType<typeof loadAdminLog>>) {
  return app.request("/", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  })
}

describe("adminLog — the gate turns callers away", () => {
  it("404s a caller with no session, and not 401 or 403", async () => {
    // 404 rather than 403 on purpose: a 403 confirms the route exists, which CLAUDE.md
    // rules out in two separate places.
    withAuth.mockRejectedValue(new Error("not covered by AuthKit middleware"))
    const adminLog = await loadAdminLog()

    const res = await postInvalid(adminLog)

    expect(res.status).toBe(404)
  })

  it("404s a signed-in user who isn't on the allowlist", async () => {
    process.env.ADMIN_EMAILS = "admin@example.com"
    withAuth.mockResolvedValue({ user: { email: "stranger@example.com" } })
    const adminLog = await loadAdminLog()

    const res = await postInvalid(adminLog)

    expect(res.status).toBe(404)
  })

  it("404s a signed-in user when ADMIN_EMAILS is unset — nobody is admin by default", async () => {
    delete process.env.ADMIN_EMAILS
    withAuth.mockResolvedValue({ user: { email: "anyone@example.com" } })
    const adminLog = await loadAdminLog()

    const res = await postInvalid(adminLog)

    expect(res.status).toBe(404)
  })

  it("404s a malformed, wrong-content-type POST before the body is ever parsed", async () => {
    // Middleware order: requireAdminApi is mounted on "*" ahead of jsonBody() on every
    // route. Reversed, this would come back 415 (jsonBody rejecting the missing
    // content-type) instead of 404 — the guard never having run first.
    withAuth.mockRejectedValue(new Error("no session"))
    const adminLog = await loadAdminLog()

    const res = await adminLog.request("/", { method: "POST", body: "{not even valid json" })

    expect(res.status).toBe(404)
  })
})

describe("adminLog — the gate lets admins through", () => {
  it("reaches validation (400, not 404) for an allowlisted admin", async () => {
    process.env.ADMIN_EMAILS = "admin@example.com"
    withAuth.mockResolvedValue({ user: { email: "admin@example.com" } })
    const adminLog = await loadAdminLog()

    const res = await postInvalid(adminLog)

    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("invalid payload")
  })

  it("matches the allowlist case-insensitively", async () => {
    process.env.ADMIN_EMAILS = "admin@example.com"
    withAuth.mockResolvedValue({ user: { email: "Admin@Example.com" } })
    const adminLog = await loadAdminLog()

    const res = await postInvalid(adminLog)

    // 400, not 404 — the allowlist let it through and validation is what rejected it.
    expect(res.status).toBe(400)
  })
})

describe("adminLog — allowed and rejected are actually distinguishable", () => {
  it("gives two different answers to the identical request, on identity alone", async () => {
    // The guard against this whole file going vacuous again: one request shape, two
    // identities, two different statuses. If requireAdminApi were removed, both sides
    // would answer 400 and this fails — which no single-status assertion can promise.
    process.env.ADMIN_EMAILS = "admin@example.com"
    const adminLog = await loadAdminLog()

    withAuth.mockResolvedValue({ user: { email: "admin@example.com" } })
    const allowed = await postInvalid(adminLog)

    withAuth.mockResolvedValue({ user: { email: "stranger@example.com" } })
    const rejected = await postInvalid(adminLog)

    expect(allowed.status).toBe(400)
    expect(rejected.status).toBe(404)
    expect(allowed.status).not.toBe(rejected.status)
  })
})
