import { Hono } from "hono"
import { describe, expect, it } from "vitest"
import { jsonBody } from "./json-body"

const app = new Hono()
app.post("/", jsonBody({ maxBytes: 100 }), (c) => c.json({ ok: true }))

const post = (headers: Record<string, string>, body = "{}") =>
  app.request("/", { method: "POST", headers, body })

describe("jsonBody", () => {
  it("accepts application/json, with or without a charset", async () => {
    expect((await post({ "content-type": "application/json" })).status).toBe(200)
    expect((await post({ "content-type": "application/json; charset=utf-8" })).status).toBe(200)
    expect((await post({ "content-type": "Application/JSON" })).status).toBe(200)
  })

  it("refuses a header that only mentions it: a form can send those without a preflight", async () => {
    expect((await post({ "content-type": "text/plain;x=application/json" })).status).toBe(415)
    expect((await post({ "content-type": "application/jsonp" })).status).toBe(415)
    expect((await post({})).status).toBe(415)
  })

  it("refuses a declared body that is too large", async () => {
    const res = await post({ "content-type": "application/json", "content-length": "101" })
    expect(res.status).toBe(413)
  })
})
