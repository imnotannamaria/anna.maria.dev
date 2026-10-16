import { index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core"

/**
 * Mirrors docs/sql/004-wall-testimonials.sql. The CHECK constraints live only in the
 * database; zod in lib/wall/validation.ts is what stops bad values before they reach it.
 */
export const wallTestimonials = pgTable(
  "wall_testimonials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    status: text("status").notNull().default("invited"),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    note: text("note"),
    formLang: text("form_lang").notNull().default("pt-BR"),
    name: text("name").notNull(),
    company: text("company").notNull(),
    role: text("role"),
    linkedinUrl: text("linkedin_url"),
    message: text("message"),
    lang: text("lang"),
    avatarUrl: text("avatar_url"),
    /** A count per reaction. See docs/sql/006-wall-reactions.sql. */
    reactions: jsonb("reactions").$type<Record<string, number>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    tokenHashIdx: uniqueIndex("uq_wall_token_hash").on(t.tokenHash),
    statusIdx: index("idx_wall_status").on(t.status, t.decidedAt),
  }),
)
