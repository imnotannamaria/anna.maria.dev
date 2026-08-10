-- /roadmap — the items table.
-- Run this in the Supabase SQL editor. Mirrored in lib/roadmap/schema.ts; keep both in step.
--
-- This table replaces ROADMAP.md. That file was the holding pen for raw ideas, so the
-- holding pen has to survive the move: `raw` is the default status and is filtered out of
-- every public query. An idea costs one field to capture and never shows up until it is
-- promoted, which is what the file did by not being published anywhere.
--
-- status is text with a CHECK, not a pgEnum, for the same reason log_entries.type is:
-- this repo has no migrations, and a real enum would mean an ALTER TYPE against production
-- to add a column to a board.
--
-- position is an integer rather than a fractional rank. Reordering is admin-only and the
-- lists are short; renumbering a column of ten rows is cheaper than explaining a float.

create table if not exists roadmap_items (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null,
  title       text not null,
  blurb       text,
  status      text not null default 'raw',
  position    integer not null default 0,
  plan_url    text,
  shipped_at  date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint roadmap_status_valid check (
    status in ('raw', 'todo', 'doing', 'done')
  ),

  -- shipped_at only means something for a shipped item. Enforced here so no amount of
  -- API or form editing can leave a "to do" item claiming a ship date.
  constraint roadmap_shipped_at_valid check (
    shipped_at is null or status = 'done'
  )
);

create unique index if not exists uq_roadmap_slug            on roadmap_items (slug);
create index        if not exists idx_roadmap_status_pos     on roadmap_items (status, position);
create index        if not exists idx_roadmap_shipped_at     on roadmap_items (shipped_at desc);

-- Same trigger as log_entries: updated_at does not maintain itself, and the admin will not
-- be the only thing that ever writes here.
create or replace function roadmap_items_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_roadmap_items_updated_at on roadmap_items;
create trigger trg_roadmap_items_updated_at
  before update on roadmap_items
  for each row
  execute function roadmap_items_touch_updated_at();
