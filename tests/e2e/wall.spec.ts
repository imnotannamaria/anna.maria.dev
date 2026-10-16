import { expect, test } from "@playwright/test"
import postgres from "postgres"
import { cookieHeaderFor } from "./helpers/authkit-session"

/**
 * A letter's whole trip, through the same addresses the admin and the invite form call: invited,
 * written, waiting, approved, on the wall, reacted to. Requests only, no browser: what is under
 * test is the chain of routes and what each one lets through, not the form.
 */
const NAME = `E2E Wall ${Date.now()}`

test.describe.configure({ mode: "serial" })

test.afterAll(async () => {
  const url = process.env.DATABASE_URL
  if (!url) return
  const sql = postgres(url, { prepare: false })
  try {
    await sql`delete from wall_testimonials where name like 'E2E Wall %'`
  } finally {
    await sql.end()
  }
})

test("an invite becomes a letter on the wall, once, and only after it is approved", async ({
  request,
}) => {
  const admin = { cookie: await cookieHeaderFor("admin@test.dev") }

  // a stranger cannot make an invite
  const refused = await request.post("/api/v1/admin/wall", {
    headers: { cookie: await cookieHeaderFor("stranger@example.com") },
    data: { name: NAME, company: "Test Co", note: "", formLang: "en" },
  })
  expect(refused.status()).toBe(404)

  const created = await request.post("/api/v1/admin/wall", {
    headers: admin,
    data: { name: NAME, company: "Test Co", note: "", formLang: "en" },
  })
  expect(created.status()).toBe(201)
  const { id, url } = (await created.json()) as { id: string; url: string }
  const token = url.split("/invite/")[1]
  expect(token).toBeTruthy()

  // the link opens the form, and a made-up one does not
  expect((await request.get(`/invite/${token}`)).status()).toBe(200)
  const fake = await request.post(`/api/v1/invite/${"0".repeat(token.length)}`, {
    multipart: { name: NAME },
  })
  expect(fake.status()).toBe(404)

  const letter = {
    name: NAME,
    company: "Test Co",
    role: "Tester",
    linkedin: "",
    lang: "en",
    message: "She wrote the tests first, and then the thing the tests were about.",
  }
  // a letter the schema refuses says which fields, and uses up nothing
  const short = await request.post(`/api/v1/invite/${token}`, {
    multipart: { ...letter, message: "too short" },
  })
  expect(short.status()).toBe(400)
  expect(((await short.json()) as { fields: string[] }).fields).toEqual(["message"])

  expect((await request.post(`/api/v1/invite/${token}`, { multipart: letter })).status()).toBe(201)
  // one letter per link
  expect((await request.post(`/api/v1/invite/${token}`, { multipart: letter })).status()).toBe(409)

  // written is not published
  expect(await (await request.get("/wall-of-love")).text()).not.toContain(NAME)
  const early = await request.post(`/api/v1/wall/${id}/react`, {
    data: { reaction: "heart", on: true },
  })
  expect(early.status()).toBe(404)

  const approved = await request.patch(`/api/v1/admin/wall/${id}`, {
    headers: admin,
    data: { status: "approved" },
  })
  expect(approved.status()).toBe(200)

  // on the wall, in both languages, in the HTML the server sends
  expect(await (await request.get("/wall-of-love")).text()).toContain(NAME)
  expect(await (await request.get("/pt/wall-of-love")).text()).toContain(NAME)

  const reacted = await request.post(`/api/v1/wall/${id}/react`, {
    data: { reaction: "heart", on: true },
  })
  expect(reacted.status()).toBe(200)
  expect(((await reacted.json()) as { reactions: { heart: number } }).reactions.heart).toBe(1)
  // the reaction that left the wall is refused
  const thumbs = await request.post(`/api/v1/wall/${id}/react`, {
    data: { reaction: "up", on: true },
  })
  expect(thumbs.status()).toBe(400)

  expect((await request.delete(`/api/v1/admin/wall/${id}`, { headers: admin })).status()).toBe(200)
  expect(await (await request.get("/wall-of-love")).text()).not.toContain(NAME)
})
