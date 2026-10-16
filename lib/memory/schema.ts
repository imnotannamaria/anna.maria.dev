import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

/**
 * Mirrors docs/sql/009-memory-scores.sql. The CHECK constraints live only in the database; zod in
 * lib/memory/validation.ts is what stops bad values before they reach it.
 */
export const memoryScores = pgTable(
  "memory_scores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    status: text("status").notNull().default("playing"),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    ms: integer("ms"),
    moves: integer("moves"),
    name: text("name"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
  },
  (t) => ({
    boardIdx: index("idx_memory_board").on(t.status, t.ms, t.submittedAt),
  }),
)
