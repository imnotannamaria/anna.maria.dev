import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const bytes = (...values: number[]) => new Uint8Array([...values, ...new Array(16).fill(0)])
const ascii = (text: string) => Array.from(text, (c) => c.charCodeAt(0))

describe("sniffImage", () => {
  it("knows the three formats the form can send by their first bytes", async () => {
    const { sniffImage } = await import("./avatar")
    expect(sniffImage(bytes(0xff, 0xd8, 0xff, 0xe0))?.type).toBe("image/jpeg")
    expect(sniffImage(bytes(0x89, 0x50, 0x4e, 0x47))?.type).toBe("image/png")
    expect(sniffImage(bytes(...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WEBP")))?.type).toBe(
      "image/webp",
    )
  })

  /** The header and the file name say whatever the client wants; the bytes do not. */
  it("refuses anything else, whatever it claims to be", async () => {
    const { sniffImage } = await import("./avatar")
    expect(sniffImage(bytes(...ascii("<svg")))).toBeNull()
    expect(sniffImage(bytes(...ascii("GIF89a")))).toBeNull()
    expect(sniffImage(bytes(...ascii("%PDF")))).toBeNull()
    expect(sniffImage(new Uint8Array())).toBeNull()
  })
})
