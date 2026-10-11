import { describe, expect, it } from "vitest"
import { localeFrom, localeOfPath, localePath, nextLocale, routePage, stripLocale } from "./locales"

describe("localeFrom", () => {
  it.each([
    ["pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7", "pt"],
    ["pt-PT", "pt"],
    ["en-US,en;q=0.9", "en"],
    ["en-GB,pt;q=0.9", "en"],
    ["fr-FR,fr;q=0.9,pt;q=0.6,en;q=0.5", "pt"],
    ["es-ES,es;q=0.9", "en"],
    ["en;q=0.4,pt;q=0.9", "pt"],
    ["pt;q=0,en", "en"],
    ["*", "en"],
    ["", "en"],
  ])("reads %s as %s", (header, locale) => {
    expect(localeFrom(undefined, header)).toBe(locale)
  })

  it("falls back to English with no header at all, which is how a crawler arrives", () => {
    expect(localeFrom(undefined, null)).toBe("en")
  })

  it("lets the visitor's own choice win over the browser", () => {
    expect(localeFrom("en", "pt-BR,pt;q=0.9")).toBe("en")
    expect(localeFrom("pt", "en-US")).toBe("pt")
  })

  it("ignores a cookie that is not one of the two languages", () => {
    expect(localeFrom("../../etc", "pt-BR")).toBe("pt")
    expect(localeFrom("fr", null)).toBe("en")
  })
})

describe("stripLocale", () => {
  it.each([
    ["/pt/notes/my-post", "/notes/my-post"],
    ["/en", "/"],
    ["/pt", "/"],
    ["/en/back", "/back"],
    ["/notes", "/notes"],
    ["/", "/"],
    ["/person", "/person"],
    ["/pto", "/pto"],
  ])("%s is %s", (inner, outer) => {
    expect(stripLocale(inner)).toBe(outer)
  })
})

describe("nextLocale", () => {
  it("goes round", () => {
    expect(nextLocale("en")).toBe("pt")
    expect(nextLocale("pt")).toBe("en")
  })
})

describe("localePath", () => {
  it.each([
    ["en", "/", "/"],
    ["en", "/notes/my-post", "/notes/my-post"],
    ["pt", "/", "/pt"],
    ["pt", "/notes/my-post", "/pt/notes/my-post"],
    ["pt", "back", "/pt/back"],
  ] as const)("%s %s is %s", (locale, path, address) => {
    expect(localePath(locale, path)).toBe(address)
  })

  it("is undone by stripLocale, in both languages", () => {
    for (const path of ["/", "/notes", "/projects/entrepta"]) {
      expect(stripLocale(localePath("pt", path))).toBe(path)
      expect(stripLocale(localePath("en", path))).toBe(path)
    }
  })
})

describe("localeOfPath", () => {
  it("reads the language off the first segment, and nothing off a page that has none", () => {
    expect(localeOfPath("/pt/notes")).toBe("pt")
    expect(localeOfPath("/pt")).toBe("pt")
    expect(localeOfPath("/en/notes")).toBe("en")
    expect(localeOfPath("/notes")).toBeNull()
    expect(localeOfPath("/pto")).toBeNull()
  })
})

describe("routePage", () => {
  it("serves Portuguese at /pt, whoever asks", () => {
    expect(routePage("/pt/notes", undefined, "en-US")).toEqual({ kind: "serve" })
    expect(routePage("/pt", "en", null)).toEqual({ kind: "serve" })
  })

  it("serves English at the root, from the copy under /en", () => {
    expect(routePage("/", undefined, "en-US")).toEqual({ kind: "rewrite", to: "/en" })
    expect(routePage("/notes/x", undefined, null)).toEqual({ kind: "rewrite", to: "/en/notes/x" })
  })

  it("gives a crawler, which sends no language, the English page", () => {
    expect(routePage("/projects", undefined, null).kind).toBe("rewrite")
  })

  it("sends a browser that asks for Portuguese to /pt, without making it permanent", () => {
    expect(routePage("/notes", undefined, "pt-BR,pt;q=0.9")).toEqual({
      kind: "redirect",
      to: "/pt/notes",
      permanent: false,
    })
    expect(routePage("/", undefined, "pt-BR")).toEqual({
      kind: "redirect",
      to: "/pt",
      permanent: false,
    })
  })

  it("lets the flag win over the browser, both ways", () => {
    expect(routePage("/notes", "en", "pt-BR").kind).toBe("rewrite")
    expect(routePage("/notes", "pt", "en-US")).toEqual({
      kind: "redirect",
      to: "/pt/notes",
      permanent: false,
    })
  })

  it("has no /en address: it goes to the same page without it, for good", () => {
    expect(routePage("/en/notes", undefined, "pt-BR")).toEqual({
      kind: "redirect",
      to: "/notes",
      permanent: true,
    })
    expect(routePage("/en", undefined, null)).toEqual({
      kind: "redirect",
      to: "/",
      permanent: true,
    })
  })
})
