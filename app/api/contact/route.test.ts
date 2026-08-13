import { afterEach, describe, expect, it, vi } from "vitest"

const send = vi.fn()
vi.mock("resend", () => ({
  Resend: class {
    emails = { send }
  },
}))

import { POST } from "./route"

function req(body: unknown) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

afterEach(() => {
  send.mockReset()
})

describe("POST /api/contact", () => {
  it("honeypot: a filled 'website' field returns success without ever calling Resend", async () => {
    const res = await POST(
      req({ website: "https://spam.example", name: "x", email: "x@x.com", message: "x" }),
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(send).not.toHaveBeenCalled()
  })

  it("400s invalid JSON", async () => {
    const badReq = new Request("http://localhost/api/contact", {
      method: "POST",
      body: "{not json",
    })
    const res = await POST(badReq)
    expect(res.status).toBe(400)
    expect(send).not.toHaveBeenCalled()
  })

  it("400s a payload that fails schema validation, with fieldErrors", async () => {
    const res = await POST(req({ name: "", email: "not-an-email", message: "short" }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.fieldErrors).toBeDefined()
    expect(send).not.toHaveBeenCalled()
  })

  it("sends through Resend on a valid payload", async () => {
    send.mockResolvedValue({ data: { id: "email_1" }, error: null })
    const res = await POST(
      req({ name: "Anna", email: "anna@example.com", message: "Hello there!" }),
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(send).toHaveBeenCalledTimes(1)
    expect(send.mock.calls[0][0]).toMatchObject({ replyTo: "anna@example.com" })
  })

  it("500s with a generic message when Resend errors, leaking nothing from the provider", async () => {
    send.mockResolvedValue({ data: null, error: { message: "api key revoked, account #12345" } })
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})

    const res = await POST(
      req({ name: "Anna", email: "anna@example.com", message: "Hello there!" }),
    )
    const body = await res.text()

    expect(res.status).toBe(500)
    expect(body).not.toContain("api key revoked")
    expect(body).not.toContain("12345")

    spy.mockRestore()
  })
})
