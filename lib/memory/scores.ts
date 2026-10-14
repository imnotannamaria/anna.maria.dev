import "server-only"
import { and, asc, count, desc, eq, gt, gte, inArray, lt, sql } from "drizzle-orm"
import { createDb, dbUrl } from "@/lib/db/client"
import { isUuid } from "@/lib/format"
import { BOARD_SIZE, CLAIM_TTL_MS, MIN_MS, ROUND_TTL_MS, type MemoryStatus } from "./constants"
import { memoryScores } from "./schema"

/** Null without a database: the game still plays, with no board. */
function db() {
  const url = dbUrl()
  return url ? createDb(url).db : null
}

const ago = (ms: number) => new Date(Date.now() - ms)

export type BoardRow = { id: string; name: string; ms: number; moves: number; at: string }

export type MemoryScore = BoardRow & { status: MemoryStatus }

/**
 * A new round, the moment the first card turns. Rounds nobody finished or named for a day go at
 * the same time, so the table holds the board and not every visit.
 */
export async function startRound(): Promise<string | null> {
  const conn = db()
  if (!conn) return null
  await conn
    .delete(memoryScores)
    .where(
      and(
        inArray(memoryScores.status, ["playing", "finished"]),
        lt(memoryScores.startedAt, ago(24 * 60 * 60 * 1000)),
      ),
    )
  const [row] = await conn.insert(memoryScores).values({}).returning({ id: memoryScores.id })
  return row.id
}

/** Where a time would land on the board today: 1 is first. */
async function rankOf(ms: number): Promise<number> {
  const conn = db()
  if (!conn) return Infinity
  const [{ faster }] = await conn
    .select({ faster: count() })
    .from(memoryScores)
    .where(and(eq(memoryScores.status, "approved"), lt(memoryScores.ms, ms)))
  return faster + 1
}

/**
 * The last pair. The time is taken here, from the row's start to now, in one UPDATE whose `where`
 * is the whole check: this round, still playing, not abandoned. Returns null when it was not open.
 */
export async function finishRound(id: string, moves: number) {
  const conn = db()
  if (!conn || !isUuid(id)) return null
  const [row] = await conn
    .update(memoryScores)
    .set({
      status: "finished",
      finishedAt: sql`now()`,
      moves,
      ms: sql`greatest(1, (extract(epoch from now() - ${memoryScores.startedAt}) * 1000)::int)`,
    })
    .where(
      and(
        eq(memoryScores.id, id),
        eq(memoryScores.status, "playing"),
        gt(memoryScores.startedAt, ago(ROUND_TTL_MS)),
      ),
    )
    .returning({ ms: memoryScores.ms })
  if (!row?.ms) return null
  const rank = row.ms < MIN_MS ? Infinity : await rankOf(row.ms)
  return { ms: row.ms, rank: Number.isFinite(rank) ? rank : null, qualifies: rank <= BOARD_SIZE }
}

/**
 * A name for a finished round whose time makes the board. It waits for Anna; nothing a visitor
 * sends is shown before she approves it. Returns null when the round cannot take a name.
 */
export async function claimRound(id: string, name: string) {
  const conn = db()
  if (!conn || !isUuid(id)) return null
  const [round] = await conn
    .select({ ms: memoryScores.ms, moves: memoryScores.moves })
    .from(memoryScores)
    .where(
      and(
        eq(memoryScores.id, id),
        eq(memoryScores.status, "finished"),
        gt(memoryScores.finishedAt, ago(CLAIM_TTL_MS)),
        gte(memoryScores.ms, MIN_MS),
      ),
    )
  if (!round?.ms) return null
  const rank = await rankOf(round.ms)
  if (rank > BOARD_SIZE) return null
  const [row] = await conn
    .update(memoryScores)
    .set({ status: "submitted", name, submittedAt: sql`now()` })
    .where(and(eq(memoryScores.id, id), eq(memoryScores.status, "finished")))
    .returning({ id: memoryScores.id })
  return row ? { id: row.id, name, ms: round.ms, moves: round.moves ?? 0, rank } : null
}

/** The board: approved, fastest first, the earlier name first on a tie. */
export async function getBoard(): Promise<BoardRow[]> {
  const conn = db()
  if (!conn) return []
  const rows = await conn
    .select()
    .from(memoryScores)
    .where(eq(memoryScores.status, "approved"))
    .orderBy(asc(memoryScores.ms), asc(memoryScores.submittedAt))
    .limit(BOARD_SIZE)
  return rows.map(toRow)
}

/** Everything with a name, for the admin: waiting first, then the board, then the rejected. */
export async function getNamedScores(): Promise<MemoryScore[]> {
  const conn = db()
  if (!conn) return []
  const rows = await conn
    .select()
    .from(memoryScores)
    .where(inArray(memoryScores.status, ["submitted", "approved", "rejected"]))
    .orderBy(
      sql`case ${memoryScores.status} when 'submitted' then 0 when 'approved' then 1 else 2 end`,
      asc(memoryScores.ms),
      desc(memoryScores.submittedAt),
    )
  return rows.map((row) => ({ ...toRow(row), status: row.status as MemoryStatus }))
}

export async function decideScore(id: string, status: "approved" | "rejected") {
  const conn = db()
  if (!conn || !isUuid(id)) return null
  const [row] = await conn
    .update(memoryScores)
    .set({ status, decidedAt: sql`now()` })
    .where(
      and(
        eq(memoryScores.id, id),
        inArray(memoryScores.status, ["submitted", "approved", "rejected"]),
      ),
    )
    .returning({ id: memoryScores.id, status: memoryScores.status })
  return row ?? null
}

export async function deleteScore(id: string) {
  const conn = db()
  if (!conn || !isUuid(id)) return null
  const [row] = await conn
    .delete(memoryScores)
    .where(eq(memoryScores.id, id))
    .returning({ id: memoryScores.id })
  return row ?? null
}

function toRow(row: typeof memoryScores.$inferSelect): BoardRow {
  return {
    id: row.id,
    name: row.name ?? "",
    ms: row.ms ?? 0,
    moves: row.moves ?? 0,
    at: (row.submittedAt ?? row.startedAt).toISOString(),
  }
}
