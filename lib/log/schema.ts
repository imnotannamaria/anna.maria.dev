import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

/**
 * Mirrors docs/sql/001-log-entries.sql. The CHECK constraints live only in the database —
 * drizzle has no way to express them here, so zod in lib/log/validation.ts is what stops
 * bad values before they reach Postgres.
 */
export const logEntries = pgTable(
  "log_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    type: text("type").notNull(),
    title: text("title").notNull(),
    creator: text("creator"),
    year: integer("year"),
    // Comes back as a string. queries.ts converts it; nothing else should see the raw row.
    rating: numeric("rating"),
    favorite: boolean("favorite").notNull().default(false),
    note: text("note"),
    posterUrl: text("poster_url"),
    externalUrl: text("external_url"),
    // Comes back as "YYYY-MM-DD", which is what the UI wants anyway.
    loggedAt: date("logged_at").notNull(),
    published: boolean("published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex("uq_log_slug").on(t.slug),
    loggedAtIdx: index("idx_log_logged_at").on(t.loggedAt),
    typeDateIdx: index("idx_log_type_date").on(t.type, t.loggedAt),
  }),
)
