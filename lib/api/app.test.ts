import { describe, expect, it, vi } from "vitest"

// app.ts mounts adminLog/adminRoadmap, which import withAuth from @workos-inc/authkit-nextjs.
// The real module reaches for next/cache, which only resolves inside a Next server — see
// the same mock in admin-log.test.ts.
vi.mock("@workos-inc/authkit-nextjs", () => ({
  withAuth: vi.fn().mockRejectedValue(new Error("no session")),
}))

describe("app — onError / notFound", () => {
  it("answers an unknown route with a generic 404 JSON body", async () => {
    const { app } = await import("./app")
    const res = await app.request("/api/v1/does-not-exist")
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: "not_found" })
  })

  it("onError never leaks a stack trace or the underlying error message", async () => {
    // Hono's router freezes its matcher after the first request, so adding a route to
    // the already-used `app` from the previous test would throw. A fresh module instance
    // (vi.resetModules) hasn't matched anything yet, so a probe route can still be added
    // before the first request exercises the real onError handler.
    vi.resetModules()
    const { app } = await import("./app")
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})

    // app is basePath("/api/v1") already, so routes are registered relative to that —
    // registering "/api/v1/__throws-for-test" here would double the prefix and 404.
    app.get("/__throws-for-test", () => {
      throw new Error("something with a secret connection string in it")
    })
    const res = await app.request("/api/v1/__throws-for-test")
    const body = await res.text()

    expect(res.status).toBe(500)
    expect(body).not.toContain("secret connection string")
    expect(JSON.parse(body)).toEqual({ error: "internal_error" })

    spy.mockRestore()
  })
})
