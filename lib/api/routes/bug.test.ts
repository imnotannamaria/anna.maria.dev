import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
const send = vi.fn()
vi.mock("resend", () => ({
  Resend: class {
    emails = { send }
  },
}))
const put = vi.fn()
vi.mock("@vercel/blob", () => ({ put: (...args: unknown[]) => put(...args), del: vi.fn() }))

import { bug } from "./bug"

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])
const good = {
  name: "Ada",
  email: "",
  description: "The folder does not pin on my phone.",
  page: "/projects",
}

let ip = 0
function post(fields: Record<string, string | File>) {
  const body = new FormData()
  for (const [key, value] of Object.entries(fields)) body.set(key, value)
  // a new address each time, so the rate limit never decides a test
  return bug.request("/", {
    method: "POST",
    body,
    headers: { "x-forwarded-for": `198.51.100.${(ip += 1)}` },
  })
}

beforeEach(() => {
  vi.stubEnv("RESEND_API_KEY", "re_test")
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", "blob_test")
  send.mockReset().mockResolvedValue({ error: null })
  put.mockReset().mockResolvedValue({ url: "https://blob.example/bugs/x.png" })
})
afterEach(() => vi.unstubAllEnvs())

describe("POST /bug", () => {
  it("sends the report, with no reply address when no email was left", async () => {
    const res = await post(good)
    expect(res.status).toBe(201)
    const sent = send.mock.calls[0][0]
    expect(sent.subject).toBe("Bug report from Ada")
    expect(sent.replyTo).toBeUndefined()
  })

  it("answers to the email when there is one", async () => {
    await post({ ...good, email: "ada@example.com" })
    expect(send.mock.calls[0][0].replyTo).toBe("ada@example.com")
  })

  it.each([
    ["no name", { ...good, name: " " }, "name"],
    ["a bad email", { ...good, email: "not-an-email" }, "email"],
    ["a description too short to act on", { ...good, description: "broken" }, "description"],
    ["a page that is not a path", { ...good, page: "https://evil.example" }, "page"],
  ])("refuses %s, and sends nothing", async (_name, fields, field) => {
    const res = await post(fields)
    expect(res.status).toBe(400)
    expect(Object.keys(((await res.json()) as { fields: object }).fields)).toContain(field)
    expect(send).not.toHaveBeenCalled()
  })

  it("stores a real image and links it", async () => {
    const res = await post({
      ...good,
      attachment: new File([PNG], "shot.png", { type: "image/png" }),
    })
    expect(res.status).toBe(201)
    expect(put.mock.calls[0][0]).toMatch(/^bugs\/[0-9a-f-]{36}\.png$/)
  })

  it("refuses a file that only claims to be an image", async () => {
    const fake = new File(["<script>alert(1)</script>"], "shot.png", { type: "image/png" })
    const res = await post({ ...good, attachment: fake })
    expect(res.status).toBe(400)
    expect(put).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })

  it("still sends the report when the image cannot be stored", async () => {
    put.mockRejectedValue(new Error("blob down"))
    vi.spyOn(console, "error").mockImplementation(() => {})
    const res = await post({ ...good, attachment: new File([PNG], "shot.png") })
    expect(res.status).toBe(201)
    expect(send).toHaveBeenCalled()
  })

  it("pretends to succeed for a bot that fills the hidden field", async () => {
    const res = await post({ ...good, website: "https://spam.example" })
    expect(res.status).toBe(201)
    expect(send).not.toHaveBeenCalled()
  })

  it("refuses anything that is not a form, and says so when email is not set up", async () => {
    const json = await bug.request("/", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    })
    expect(json.status).toBe(415)
    vi.stubEnv("RESEND_API_KEY", "")
    expect((await post(good)).status).toBe(503)
  })

  it("leaks nothing when the mail provider fails", async () => {
    send.mockResolvedValue({ error: { message: "secret provider detail" } })
    vi.spyOn(console, "error").mockImplementation(() => {})
    const res = await post(good)
    expect(res.status).toBe(502)
    expect(await res.text()).not.toContain("secret")
  })
})
