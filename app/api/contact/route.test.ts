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
  it("stops an address that keeps sending: each message is an email and a unit of quota", async () => {
    send.mockResolvedValue({ error: null })
    const from = (ip: string) =>
      new Request("http://localhost/api/contact", {
        method: "POST",
        headers: { "x-forwarded-for": ip },
        body: JSON.stringify({
          name: "Someone",
          email: "someone@example.com",
          message: "A message long enough to be one.",
        }),
      })
    for (let i = 0; i < 5; i++) expect((await POST(from("203.0.113.9"))).status).toBe(200)
    const sixth = await POST(from("203.0.113.9"))
    expect(sixth.status).toBe(429)
    expect(sixth.headers.get("retry-after")).toMatch(/^\d+$/)
    expect(send).toHaveBeenCalledTimes(5)
    // somebody else is not held back by it
    expect((await POST(from("203.0.113.10"))).status).toBe(200)
  })

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
