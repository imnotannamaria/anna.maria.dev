-- wristkit — the raw sample table behind the home page activity card.
-- Mirrors lib/wristkit/schema.ts; keep both in step.
--
-- Unlike 001 and 003, this file is a **transcription, not a migration**. The table was
-- created by hand in Supabase before docs/sql/ was the source of truth, so production has
-- had it for a long time and this was written afterwards, from lib/wristkit/schema.ts, so
-- the schema can be stood up from this repo alone — which is what the integration tests in
-- docs/tests-plan.md need to build a disposable database.
--
-- That makes it the one file here you should NOT expect to do anything useful against
-- production: `create table if not exists` is a no-op there, and anything inside the
-- CREATE TABLE body is silently skipped along with it. So this file must never be the
-- place a new constraint is introduced — the table would gain it in test and never in
-- production, and nothing would report the divergence. Constraints go in their own
-- `alter table` file, run deliberately.
--
-- It briefly had exactly that mistake: a `check (metric in (...))` that neither
-- lib/wristkit/schema.ts nor production has. Removed. Ingest only ever writes 'kcal',
-- 'exercise_minutes' and 'steps', and zod is what enforces it — see
-- lib/wristkit/validation.ts and lib/api/routes/wristkit.ts.
--
-- On uq_sample_dedupe: it does NOT currently dedupe anything. Ingest never sets user_id
-- (lib/api/routes/wristkit.ts writes metric, value, unit, recorded_at and source), so it
-- is NULL on every row, and Postgres treats NULLs as distinct in a unique index. The
-- index is transcribed here because production has it, not because it is doing a job.
-- Making retries actually idempotent means setting user_id, or `nulls not distinct` — a
-- deliberate change, not something to slip in here.

create table if not exists wristkit_samples (
  id            bigserial primary key,
  user_id       uuid,
  metric        text not null,
  value         numeric not null,
  unit          text not null,
  recorded_at   timestamptz not null,
  source        text,
  ingested_at   timestamptz not null default now()
);

create index        if not exists idx_metric_recorded      on wristkit_samples (metric, recorded_at);
create index        if not exists idx_user_metric_recorded on wristkit_samples (user_id, metric, recorded_at);
create unique index if not exists uq_sample_dedupe          on wristkit_samples (user_id, metric, recorded_at);
