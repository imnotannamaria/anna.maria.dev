import { expect, test } from "@playwright/test"

/**
 * What a crawler reads. Every test here uses `request`, which fetches the raw HTML and runs no
 * JavaScript: the same thing a crawler sees, and something a `page.goto()` assertion could not
 * tell apart from "rendered after hydration ran". No browser is started for this file.
 *
 * The bug it was first written for: `useSearchParams` on a statically rendered route makes the
 * nearest Suspense boundary emit its fallback during prerender, and every card went missing from
 * the HTML of the one page whose job is listing posts.
 */

/**
 * React escapes `&`, `<`, `>` and quotes in text, so a title containing any of them appears in
 * the HTML in escaped form, and a raw `toContain(title)` would fail on a page that is correct.
 */
function asRenderedText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#x27;")
    .replace(/"/g, "&quot;")
}

type Doc = { slug: string; title: string; published?: boolean }
const isPortuguese = (doc: Doc) => doc.slug.split("/")[1] === "pt"

for (const [collection, address] of [
  ["blog", "/notes"],
  ["projects", "/projects"],
] as const) {
  for (const locale of ["en", "pt"] as const) {
    const path = locale === "pt" ? `/pt${address}` : address
    test(`every published title is in the server HTML of ${path}`, async ({ request }) => {
      const html = await (await request.get(path)).text()
      const docs = ((await import("../../.velite"))[collection] as Doc[]).filter(
        (doc) => doc.published !== false && isPortuguese(doc) === (locale === "pt"),
      )
      expect(docs.length).toBeGreaterThan(0)
      for (const doc of docs) {
        expect(html, `"${doc.title}" missing from ${path}`).toContain(asRenderedText(doc.title))
      }
    })
  }
}

test("a page names itself and its twin in the other language", async ({ request }) => {
  const html = await (await request.get("/notes")).text()
  expect(html).toMatch(/<link rel="canonical" href="[^"]+\/notes"/)
  expect(html).toMatch(/hrefLang="en" href="[^"]+\/notes"/)
  expect(html).toMatch(/hrefLang="pt-BR" href="[^"]+\/pt\/notes"/)
  expect(html).toMatch(/hrefLang="x-default" href="[^"]+\/notes"/)

  const portuguese = await (await request.get("/pt/notes")).text()
  expect(portuguese).toMatch(/<html[^>]* lang="pt-BR"/)
  expect(portuguese).toMatch(/<link rel="canonical" href="[^"]+\/pt\/notes"/)
})

test.describe("the language of an address", () => {
  const once = { maxRedirects: 0 }

  test("English is at the root, and a crawler, which asks for no language, gets it", async ({
    request,
  }) => {
    const res = await request.get("/", once)
    expect(res.status()).toBe(200)
    expect(await res.text()).toMatch(/<html[^>]* lang="en"/)
  })

  test("a browser that asks for Portuguese is sent to /pt, and not for good", async ({
    request,
  }) => {
    const res = await request.get("/notes", {
      ...once,
      headers: { "accept-language": "pt-BR,pt;q=0.9,en;q=0.5" },
    })
    // 307: it depends on who is asking, so it must never be remembered for the next visitor
    expect(res.status()).toBe(307)
    expect(res.headers().location).toMatch(/\/pt\/notes$/)
  })

  test("the flag's choice wins over the browser's language", async ({ request }) => {
    const res = await request.get("/notes", {
      ...once,
      headers: { "accept-language": "pt-BR", cookie: "site-lang=en" },
    })
    expect(res.status()).toBe(200)
  })

  test("/en is not an address of the site", async ({ request }) => {
    const res = await request.get("/en/notes", once)
    expect(res.status()).toBe(308)
    expect(res.headers().location).toMatch(/\/notes$/)
    expect(res.headers().location).not.toMatch(/\/en\//)
  })
})

test.describe("addresses of the old site", () => {
  const once = { maxRedirects: 0 }

  for (const [from, to] of [
    ["/blog", "/notes"],
    ["/about", "/person"],
  ]) {
    test(`${from} moved to ${to} for good`, async ({ request }) => {
      const res = await request.get(from, once)
      expect(res.status()).toBe(308)
      expect(res.headers().location).toMatch(new RegExp(`${to}$`))
    })
  }

  for (const gone of ["/roadmap", "/piano", "/components"]) {
    test(`${gone} answers only to say it was removed, and asks not to be indexed`, async ({
      request,
    }) => {
      const res = await request.get(gone)
      expect(res.status()).toBe(200)
      expect(await res.text()).toMatch(/<meta name="robots" content="noindex[^"]*"/)
    })
  }

  test("an address that never existed is a 404, inside the site", async ({ request }) => {
    const res = await request.get("/nope-not-a-page")
    expect(res.status()).toBe(404)
  })
})
