import { createHash } from "node:crypto"
import { createDb, dbUrl } from "@/lib/db/client"
import { DAILY_CAP_MICRO, MIN_GAP_SECONDS, PER_VISITOR } from "./limits"

export type Refusal = "visitor" | "slow" | "budget" | "unavailable"
export type Admission = { ok: true; day: string } | { ok: false; reason: Refusal }

/**
 * Who is asking, without keeping who: a hash of the address, the day and a secret. The day is
 * in it so the same person is a different string tomorrow.
 */
export function visitorOf(ip: string, salt: string, day = new Date().toISOString().slice(0, 10)) {
  return createHash("sha256").update(`${day}|${ip}|${salt}`).digest("hex")
}

/**
 * Lets one question through, or says why not. Both checks are a single conditional write, so
 * two requests racing cannot both pass the last slot.
 *
 * With no database it refuses: a chat with no cap is the one thing this must never be.
 */
export async function admit(visitor: string, reserve: number): Promise<Admission> {
  const url = dbUrl()
  if (!url) return { ok: false, reason: "unavailable" }
  const { sql } = createDb(url)

  const seen = await sql`
    insert into ai_visitors (day, visitor, requests, last_at)
    values (current_date, ${visitor}, 1, now())
    on conflict (day, visitor) do update
      set requests = ai_visitors.requests + 1, last_at = now()
      where ai_visitors.requests < ${PER_VISITOR}
        and ai_visitors.last_at < now() - make_interval(secs => ${MIN_GAP_SECONDS})
    returning requests`
  if (seen.length === 0) {
    const [row] = await sql`
      select requests from ai_visitors where day = current_date and visitor = ${visitor}`
    return { ok: false, reason: row && row.requests >= PER_VISITOR ? "visitor" : "slow" }
  }

  const spent = await sql`
    insert into ai_usage (day, requests, micro_usd)
    values (current_date, 1, ${reserve})
    on conflict (day) do update
      set requests = ai_usage.requests + 1, micro_usd = ai_usage.micro_usd + ${reserve}
      where ai_usage.micro_usd + ${reserve} <= ${DAILY_CAP_MICRO}
    returning day::text as day`
  return spent.length === 0
    ? { ok: false, reason: "budget" }
    : { ok: true, day: spent[0].day as string }
}

let warmed = false

/**
 * Opens the connection pool before the first question needs it: a cold connection is a TLS
 * handshake to the pooler on top of the two writes in `admit`. Once per instance, so a page
 * that is opened a thousand times does not query a thousand times.
 */
export async function warm(): Promise<void> {
  const url = dbUrl()
  if (warmed || !url) return
  warmed = true
  await createDb(url).sql`select 1`.catch(() => {
    warmed = false
  })
}

/** After the answer: swap what was set aside for what it really cost. */
export async function settle(day: string, reserve: number, actual: number): Promise<void> {
  const url = dbUrl()
  if (!url) return
  const { sql } = createDb(url)
  await sql`
    update ai_usage set micro_usd = greatest(micro_usd - ${reserve} + ${actual}, 0)
    where day = ${day}::date`
}
