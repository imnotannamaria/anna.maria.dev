import {
  bigserial,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

export const samples = pgTable(
  "wristkit_samples",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: uuid("user_id"),
    metric: text("metric").notNull(),
    value: numeric("value").notNull(),
    unit: text("unit").notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    source: text("source"),
    ingestedAt: timestamp("ingested_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    metricRecordedIdx: index("idx_metric_recorded").on(t.metric, t.recordedAt),
    userMetricRecordedIdx: index("idx_user_metric_recorded").on(t.userId, t.metric, t.recordedAt),
    sampleDedupeIdx: uniqueIndex("uq_sample_dedupe").on(t.userId, t.metric, t.recordedAt),
  }),
)
