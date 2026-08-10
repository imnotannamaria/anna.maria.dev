import {
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

/**
 * Mirrors docs/sql/003-roadmap-items.sql. The CHECK constraints live only in the database —
 * drizzle has no way to express them here, so zod in lib/roadmap/validation.ts is what
 * stops bad values before they reach Postgres.
 */
export const roadmapItems = pgTable(
  "roadmap_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    blurb: text("blurb"),
    status: text("status").notNull().default("raw"),
    position: integer("position").notNull().default(0),
    planUrl: text("plan_url"),
    // Comes back as "YYYY-MM-DD", which is the shape the UI wants anyway.
    shippedAt: date("shipped_at"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex("uq_roadmap_slug").on(t.slug),
    statusPosIdx: index("idx_roadmap_status_pos").on(t.status, t.position),
    shippedAtIdx: index("idx_roadmap_shipped_at").on(t.shippedAt),
  }),
)
