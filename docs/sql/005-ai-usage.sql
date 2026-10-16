-- /ai — what the chat spends, and how often each visitor asks.
-- Run this in the Supabase SQL editor. The limits that read these live in lib/ai/limits.ts.
--
-- Two counters, both per UTC day, both tiny:
--
--   ai_usage     one row a day: how many answers, and what they cost. The daily cap is checked
--                and reserved here in one statement, so two requests racing cannot both squeeze
--                under it.
--   ai_visitors  one row per visitor a day. The visitor is a salted hash of the IP and the day:
--                no address is stored, and yesterday's hash cannot be matched to today's.
--
-- Money is in micro-dollars (millionths), as an integer: a float would drift, and a cap that
-- drifts is not a cap.

create table if not exists ai_usage (
  day        date primary key,
  requests   integer not null default 0,
  micro_usd  bigint  not null default 0
);

create table if not exists ai_visitors (
  day       date        not null,
  visitor   text        not null,
  requests  integer     not null default 0,
  last_at   timestamptz not null default now(),
  primary key (day, visitor)
);
