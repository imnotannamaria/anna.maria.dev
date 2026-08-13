import { beforeEach, describe, expect, it, vi } from "vitest"

// The route's authorization check ("is this URL one I saved") is Phase 3's job, against
// a real DB — poster-allowlist.ts is tested there. Here it's mocked so these tests can
// isolate the route's own logic: the SSRF guard, redirect handling, and response shaping.
vi.mock("@/lib/log/poster-allowlist", () => ({ isKnownPosterUrl: vi.fn() }))

import { poster } from "./poster"
import { encodePosterToken } from "@/lib/log/poster-src"
import { isKnownPosterUrl } from "@/lib/log/poster-allowlist"

const knownUrl = vi.mocked(isKnownPosterUrl)

function imageResponse(body: BodyInit = new Uint8Array([1, 2, 3]).buffer) {
  return new Response(body, { status: 200, headers: { "content-type": "image/jpeg" } })
}

beforeEach(() => {
  knownUrl.mockReset()
  vi.unstubAllGlobals()
})

async function request(url: string) {
  return poster.request(`/${encodePosterToken(url)}`)
}

describe("poster route — SSRF guard (isFetchableUrl / isBlockedHost)", () => {
  it.each([
    ["plain http", "http://example.com/x.jpg"],
    ["localhost", "https://localhost/x.jpg"],
    ["a .localhost suffix", "https://foo.localhost/x.jpg"],
    ["IPv6 loopback", "https://[::1]/x.jpg"],
    ["0.0.0.0", "https://0.0.0.0/x.jpg"],
    ["127.x loopback", "https://127.0.0.1/x.jpg"],
    ["10.x private", "https://10.1.2.3/x.jpg"],
    ["172.16-31.x private", "https://172.20.0.1/x.jpg"],
    ["192.168.x private", "https://192.168.1.1/x.jpg"],
    ["169.254.169.254 — the cloud metadata endpoint", "https://169.254.169.254/x.jpg"],
  ])("rejects %s with 400, before ever checking the allowlist", async (_label, url) => {
    const res = await request(url)
    expect(res.status).toBe(400)
    expect(knownUrl).not.toHaveBeenCalled()
  })

  it("does not block a public https host that merely starts with a private octet", async () => {
    // 172.32.x.x is outside the 172.16-31 private range — a regex that matched "172."
    // rather than the number would wrongly block this.
    knownUrl.mockResolvedValue(false)
    const res = await request("https://172.32.0.1/x.jpg")
    expect(res.status).toBe(404) // rejected by the allowlist, not the host check
  })
})

describe("poster route — authorization", () => {
  it("404s a well-formed https URL that isn't in the allowlist", async () => {
    knownUrl.mockResolvedValue(false)
    const res = await request("https://example.com/unsaved.jpg")
    expect(res.status).toBe(404)
  })

  it("400s a token that doesn't decode to a URL at all", async () => {
    const res = await poster.request("/not-valid-base64!!")
    expect(res.status).toBe(400)
  })
})

describe("poster route — fetch and redirect handling", () => {
  // Each case uses a distinct URL so its base64 token — and therefore its rate-limit
  // bucket, keyed on the token — never collides with another test's, per the module-scope
  // state warning in docs/tests-plan.md.
  it("streams back a known image with the right headers", async () => {
    knownUrl.mockResolvedValue(true)
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(imageResponse()))

    const res = await request("https://example.com/known-1.jpg")

    expect(res.status).toBe(200)
    expect(res.headers.get("content-type")).toBe("image/jpeg")
    expect(res.headers.get("cache-control")).toContain("immutable")
  })

  it("follows exactly one redirect to a safe host", async () => {
    knownUrl.mockResolvedValue(true)
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, { status: 302, headers: { location: "https://cdn.example.com/x.jpg" } }),
      )
      .mockResolvedValueOnce(imageResponse())
    vi.stubGlobal("fetch", fetchMock)

    const res = await request("https://example.com/known-2.jpg")

    expect(res.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("refuses a redirect to a blocked address, so a re-registered host can't be used to reach it", async () => {
    knownUrl.mockResolvedValue(true)
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 302,
          headers: { location: "http://169.254.169.254/latest/meta-data" },
        }),
      ),
    )

    const res = await request("https://example.com/known-3.jpg")

    expect(res.status).toBe(502)
  })

  it("refuses a second redirect hop", async () => {
    knownUrl.mockResolvedValue(true)
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, {
          status: 302,
          headers: { location: "https://hop1.example.com/x.jpg" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(null, {
          status: 302,
          headers: { location: "https://hop2.example.com/x.jpg" },
        }),
      )
    vi.stubGlobal("fetch", fetchMock)

    const res = await request("https://example.com/known-4.jpg")

    expect(res.status).toBe(502)
    expect(fetchMock).toHaveBeenCalledTimes(2) // start + one allowed hop, no third call
  })

  it("415s a non-image content-type", async () => {
    knownUrl.mockResolvedValue(true)
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("<html></html>", { status: 200, headers: { "content-type": "text/html" } }),
        ),
    )

    const res = await request("https://example.com/known-5.jpg")

    expect(res.status).toBe(415)
  })

  it("413s when content-length claims more than the max", async () => {
    knownUrl.mockResolvedValue(true)
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(new Uint8Array(10).buffer, {
          status: 200,
          headers: { "content-type": "image/jpeg", "content-length": String(9 * 1024 * 1024) },
        }),
      ),
    )

    const res = await request("https://example.com/known-6.jpg")

    expect(res.status).toBe(413)
  })

  it("413s a body that exceeds the max despite an honest-looking content-length", async () => {
    // The route buffers rather than trusting the header — this is the case that check
    // exists for: a small declared length, a larger actual body.
    knownUrl.mockResolvedValue(true)
    const bigBody = new Uint8Array(9 * 1024 * 1024).buffer
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(bigBody, {
          status: 200,
          headers: { "content-type": "image/jpeg", "content-length": "100" },
        }),
      ),
    )

    const res = await request("https://example.com/known-7.jpg")

    expect(res.status).toBe(413)
  })

  it("502s when the upstream fetch throws", async () => {
    knownUrl.mockResolvedValue(true)
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")))

    const res = await request("https://example.com/known-8.jpg")

    expect(res.status).toBe(502)
  })
})
