import postgres from "postgres"
import { describe, expect, it } from "vitest"
import { BOARD_SIZE, MAX_PENDING } from "./constants"
import {
  claimRound,
  decideScore,
  deleteScore,
  finishRound,
  getBoard,
  getNamedScores,
  startRound,
} from "./scores"

/** Moves a round's start into the past, the way playing for that long would. */
async function startedAgo(id: string, ago: string) {
  const sql = postgres(process.env.DATABASE_URL as string, { prepare: false })
  try {
    await sql`update memory_scores set started_at = now() - ${ago}::interval where id = ${id}`
  } finally {
    await sql.end()
  }
}

async function clean() {
  const sql = postgres(process.env.DATABASE_URL as string, { prepare: false })
  try {
    await sql`delete from memory_scores`
  } finally {
    await sql.end()
  }
}

/** A round played for `seconds`, named and approved. */
async function onBoard(name: string, seconds: number) {
  const id = (await startRound()) as string
  await startedAgo(id, `${seconds} seconds`)
  await finishRound(id, 12)
  await claimRound(id, name)
  await decideScore(id, "approved")
  return id
}

/** A claimed name, not decided: it waits in the queue. */
async function pending(name: string) {
  const id = (await startRound()) as string
  await startedAgo(id, "30 seconds")
  await finishRound(id, 12)
  return { id, claimed: await claimRound(id, name) }
}

describe("the memory board", () => {
  it("times a round on the server, not on the page", async () => {
    await clean()
    const id = (await startRound()) as string
    await startedAgo(id, "40 seconds")
    const result = await finishRound(id, 14)
    expect(result?.ms).toBeGreaterThanOrEqual(40_000)
    expect(result?.ms).toBeLessThan(45_000)
    expect(result).toMatchObject({ rank: 1, qualifies: true })
  })

  it("finishes a round once", async () => {
    const id = (await startRound()) as string
    await startedAgo(id, "30 seconds")
    expect(await finishRound(id, 12)).not.toBeNull()
    expect(await finishRound(id, 12)).toBeNull()
  })

  it("refuses an abandoned round and a time no hand could make", async () => {
    const old = (await startRound()) as string
    await startedAgo(old, "2 hours")
    expect(await finishRound(old, 12)).toBeNull()

    const quick = (await startRound()) as string
    const result = await finishRound(quick, 8)
    expect(result).toMatchObject({ qualifies: false, rank: null })
    expect(await claimRound(quick, "Robô")).toBeNull()
  })

  it("keeps a name off the board until it is approved", async () => {
    await clean()
    const id = (await startRound()) as string
    await startedAgo(id, "50 seconds")
    await finishRound(id, 16)
    expect(await claimRound(id, "Marina")).not.toBeNull()
    // a round takes one name
    expect(await claimRound(id, "Outra")).toBeNull()

    expect(await getBoard()).toEqual([])
    expect((await getNamedScores()).map((s) => [s.name, s.status])).toEqual([
      ["Marina", "submitted"],
    ])

    await decideScore(id, "approved")
    expect((await getBoard()).map((row) => row.name)).toEqual(["Marina"])

    await deleteScore(id)
    expect(await getBoard()).toEqual([])
  })

  it("is the ten fastest, fastest first, and a slower time gets no form", async () => {
    await clean()
    for (let i = 0; i < BOARD_SIZE; i++) await onBoard(`P${i}`, 20 + i)
    const board = await getBoard()
    expect(board.map((row) => row.name)).toEqual(
      Array.from({ length: BOARD_SIZE }, (_, i) => `P${i}`),
    )

    const slow = (await startRound()) as string
    await startedAgo(slow, "90 seconds")
    expect(await finishRound(slow, 20)).toMatchObject({ qualifies: false, rank: 11 })
    expect(await claimRound(slow, "Lenta")).toBeNull()

    const fast = (await startRound()) as string
    await startedAgo(fast, "10 seconds")
    expect(await finishRound(fast, 9)).toMatchObject({ qualifies: true, rank: 1 })
    await clean()
  })

  it("stops queueing names once enough are waiting, and takes them again when some are decided", async () => {
    await clean()
    const first: string[] = []
    for (let i = 0; i < MAX_PENDING; i++) {
      const { id, claimed } = await pending(`Fila${i}`)
      expect(claimed).not.toBeNull()
      first.push(id)
    }
    // the queue is full: another name, however good its time, is turned away
    const over = await pending("De mais")
    expect(over.claimed).toBeNull()
    // the admin decides one, and there is room again
    await decideScore(first[0], "rejected")
    expect((await pending("Cabe agora")).claimed).not.toBeNull()
    await clean()
  })

  it("does not take a name after the window, even when the round was read inside it", async () => {
    await clean()
    const id = (await startRound()) as string
    await startedAgo(id, "40 minutes")
    // finished_at is when the last pair was reported: push it past the claim window
    const sql = postgres(process.env.DATABASE_URL as string, { prepare: false })
    try {
      await finishRound(id, 12)
      await sql`update memory_scores set finished_at = now() - interval '31 minutes' where id = ${id}`
    } finally {
      await sql.end()
    }
    expect(await claimRound(id, "Atrasada")).toBeNull()
    await clean()
  })
})
