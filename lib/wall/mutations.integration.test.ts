import postgres from "postgres"
import { describe, expect, it } from "vitest"
import {
  createInvite,
  decide,
  deleteEntry,
  react,
  renewInvite,
  submitTestimonial,
} from "./mutations"
import { getApprovedTestimonials, getEntryById, getInviteByToken } from "./queries"
import type { SubmissionInput } from "./validation"

const written: SubmissionInput = {
  name: "Marina Duarte",
  company: "Lumen Pay",
  role: "Engineering Manager",
  linkedin: "",
  lang: "pt-BR",
  message: "A Anna entrou num projeto atrasado e em duas semanas tínhamos um plano.",
}

async function invite() {
  return createInvite({ name: "Marina", company: "CESAR", note: "oi", formLang: "pt-BR" })
}

/** Moves an invite's expiry into the past, the way the days passing would. */
async function expire(id: string) {
  const sql = postgres(process.env.DATABASE_URL as string, { prepare: false })
  try {
    await sql`update wall_testimonials set expires_at = now() - interval '1 minute' where id = ${id}`
  } finally {
    await sql.end()
  }
}

describe("an invite, from link to wall", () => {
  it("opens, takes one testimonial, waits for review, and only shows once approved", async () => {
    const { id, token } = await invite()
    expect((await getInviteByToken(token)).state).toBe("open")

    const row = await submitTestimonial(token, written, null)
    expect(row?.name).toBe("Marina Duarte")
    expect((await getEntryById(id))?.status).toBe("submitted")
    expect(await getApprovedTestimonials()).toEqual([])

    await decide(id, "approved")
    const wall = await getApprovedTestimonials()
    expect(wall.map((t) => t.name)).toEqual(["Marina Duarte"])
    expect(wall[0].month).toMatch(/^\d{4}-\d{2}$/)

    await decide(id, "rejected")
    expect(await getApprovedTestimonials()).toEqual([])
  })

  it("lists the wall oldest first, like a channel", async () => {
    const first = await invite()
    const second = await invite()
    await submitTestimonial(first.token, { ...written, name: "First Person" }, null)
    await submitTestimonial(second.token, { ...written, name: "Second Person" }, null)
    // approved in the opposite order they were written: the order that counts is the decision's
    await decide(second.id, "approved")
    await decide(first.id, "approved")
    expect((await getApprovedTestimonials()).map((t) => t.name)).toEqual([
      "Second Person",
      "First Person",
    ])
  })

  it("takes one testimonial per link, not two", async () => {
    const { token } = await invite()
    expect(await submitTestimonial(token, written, null)).not.toBeNull()
    expect(
      await submitTestimonial(token, { ...written, message: "a second one, later" }, null),
    ).toBeNull()
    expect((await getInviteByToken(token)).state).toBe("used")
  })

  it("refuses an expired link, and a renewed one works where the old one no longer does", async () => {
    const { id, token } = await invite()
    await expire(id)

    expect((await getInviteByToken(token)).state).toBe("expired")
    expect(await submitTestimonial(token, written, null)).toBeNull()

    const renewed = await renewInvite(id)
    expect(renewed).not.toBeNull()
    expect((await getInviteByToken(token)).state).toBe("missing")
    expect((await getInviteByToken(renewed!.token)).state).toBe("open")
    expect(await submitTestimonial(renewed!.token, written, null)).not.toBeNull()
  })

  it("cannot approve what nobody has written", async () => {
    const { id } = await invite()
    expect(await decide(id, "approved")).toBeNull()
    expect((await getEntryById(id))?.status).toBe("invited")
  })

  it("does not renew a link that was already used", async () => {
    const { id, token } = await invite()
    await submitTestimonial(token, written, null)
    expect(await renewInvite(id)).toBeNull()
  })

  it("stores blank optional fields as null and hands back the photo on delete", async () => {
    const { id, token } = await invite()
    await submitTestimonial(
      token,
      { ...written, role: "", linkedin: "" },
      "https://example.public.blob.vercel-storage.com/wall/avatars/x.jpg",
    )
    const entry = await getEntryById(id)
    expect(entry?.role).toBeNull()
    expect(entry?.linkedinUrl).toBeNull()

    const deleted = await deleteEntry(id)
    expect(deleted?.avatarUrl).toContain("/wall/avatars/")
    expect(await getEntryById(id)).toBeNull()
  })
})

describe("reactions", () => {
  const zero = { heart: 0, clap: 0, party: 0 }

  it("counts on a letter that is on the wall, and shows on the wall", async () => {
    const { id, token } = await invite()
    await submitTestimonial(token, written, null)
    await decide(id, "approved")
    expect((await getApprovedTestimonials())[0].reactions).toEqual(zero)

    expect(await react(id, "heart", true)).toEqual({ ...zero, heart: 1 })
    expect(await react(id, "clap", true)).toEqual({ ...zero, heart: 1, clap: 1 })
    expect((await getApprovedTestimonials())[0].reactions).toEqual({ ...zero, heart: 1, clap: 1 })
  })

  it("takes a reaction back, and never goes below zero", async () => {
    const { id, token } = await invite()
    await submitTestimonial(token, written, null)
    await decide(id, "approved")
    await react(id, "clap", true)
    expect(await react(id, "clap", false)).toEqual(zero)
    expect(await react(id, "clap", false)).toEqual(zero)
  })

  it("loses no click when several land at once", async () => {
    const { id, token } = await invite()
    await submitTestimonial(token, written, null)
    await decide(id, "approved")
    await Promise.all(Array.from({ length: 12 }, () => react(id, "party", true)))
    expect((await getApprovedTestimonials())[0].reactions.party).toBe(12)
  })

  it("does not count on a letter that is not on the wall, or on no letter", async () => {
    const { id, token } = await invite()
    await submitTestimonial(token, written, null)
    expect(await react(id, "heart", true)).toBeNull()
    expect(await react("not-a-uuid", "heart", true)).toBeNull()
  })
})
