-- /log — the entries table.
-- Run this in the Supabase SQL editor. Mirrored in lib/log/schema.ts; keep both in step.
--
-- Two choices differ from wristkit_samples on purpose:
--
--   logged_at is a date, not a timestamptz. The page only ever shows day/month/year and
--   sorts by day. A timestamp would introduce a timezone bug (an entry logged at 9pm on
--   the 28th rendering as the 27th) and buy nothing back.
--
--   type is text with a CHECK, not a pgEnum. This repo has no migrations, so a real enum
--   would mean a manual ALTER TYPE against production every time a new kind of thing gets
--   logged. Text plus a CHECK is a one-line edit in two places.

create table if not exists log_entries (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null,
  type          text not null,
  title         text not null,
  creator       text,
  year          integer,
  rating        numeric(2, 1),
  favorite      boolean not null default false,
  note          text,
  poster_url    text,
  external_url  text,
  logged_at     date not null,
  published     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint log_type_valid check (
    type in ('film', 'series', 'book', 'music', 'podcast', 'game')
  ),

  -- 0.5 to 5, half steps only. The right side rejects 4.3 while allowing 4.5.
  constraint log_rating_valid check (
    rating is null
    or (rating >= 0.5 and rating <= 5 and (rating * 2) = floor(rating * 2))
  ),

  constraint log_year_valid check (year is null or (year >= 1800 and year <= 2200))
);

create unique index if not exists uq_log_slug       on log_entries (slug);
create index        if not exists idx_log_logged_at on log_entries (logged_at desc);
create index        if not exists idx_log_type_date on log_entries (type, logged_at desc);

-- updated_at does not maintain itself in Postgres, and the admin is not the only thing
-- that will ever write here. A trigger is more reliable than remembering.
create or replace function log_entries_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_log_entries_updated_at on log_entries;
create trigger trg_log_entries_updated_at
  before update on log_entries
  for each row
  execute function log_entries_touch_updated_at();
