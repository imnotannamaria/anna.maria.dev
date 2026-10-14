-- The memory game in the footer: rounds, their times, and the board of the ten best.
-- Run this in the Supabase SQL editor, after 008 (or after 007, if 008 was skipped). Mirrored in
-- lib/memory/schema.ts; keep both in step.
--
-- One row is one round. The server keeps the time, not the browser: a round starts with a row
-- (the first card turned) and ends when the page reports the last pair, and the time is the
-- difference between the two, taken here. A visitor can report a round finished early, never
-- one faster than the clock on this side says it was. `status` walks it:
--
--   playing    started, not finished. Deleted after a day.
--   finished   finished, with a time. A name can be added for half an hour, if the time makes
--              the board. Deleted after a day if no name comes.
--   submitted  a name, waiting for Anna. Never shown on the site.
--   approved   on the board.
--   rejected   not on the board.
--
-- No identifier of the visitor is kept: no address, no cookie. The rate limits on the routes are
-- what keep a script from filling the table.

create table if not exists memory_scores (
  id            uuid primary key default gen_random_uuid(),
  status        text not null default 'playing',
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  ms            integer,
  moves         integer,
  name          text,
  submitted_at  timestamptz,
  decided_at    timestamptz,

  constraint memory_status_valid check (
    status in ('playing', 'finished', 'submitted', 'approved', 'rejected')
  ),
  constraint memory_finished check (
    status = 'playing' or (finished_at is not null and ms is not null and moves is not null)
  ),
  constraint memory_named check (
    status in ('playing', 'finished') or (name is not null and submitted_at is not null)
  ),
  constraint memory_name_length check (name is null or char_length(name) between 1 and 24),
  constraint memory_moves_valid check (moves is null or moves between 8 and 1000),
  constraint memory_ms_valid check (ms is null or ms > 0)
);

create index if not exists idx_memory_board on memory_scores (status, ms, submitted_at);
create index if not exists idx_memory_open  on memory_scores (started_at)
  where status in ('playing', 'finished');
