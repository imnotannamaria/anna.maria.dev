-- /wall-of-love — invites and the testimonials they become.
-- Run this in the Supabase SQL editor. Mirrored in lib/wall/schema.ts; keep both in step.
--
-- One row is one person, from invite to wall. An invite and the testimonial written through
-- it are one-to-one and share every field the person can correct (name, company), so two
-- tables would only add a join. `status` walks it:
--
--   invited    a link exists; nothing written yet. Expired is derived from expires_at.
--   submitted  written, waiting for review. Never shown on the site.
--   approved   on the wall.
--   rejected   not on the wall: declined, or taken down after approval.
--
-- Only the token's sha256 is stored. The link is shown once, when the invite is created or
-- renewed; a lost link is renewed, not recovered.
--
-- status and both language columns are text with a CHECK, like the other tables here: this
-- repo has no migrations, and an enum would mean an ALTER TYPE against production.

create table if not exists wall_testimonials (
  id            uuid primary key default gen_random_uuid(),
  status        text not null default 'invited',
  token_hash    text not null,
  expires_at    timestamptz not null,
  note          text,
  form_lang     text not null default 'pt-BR',
  name          text not null,
  company       text not null,
  role          text,
  linkedin_url  text,
  message       text,
  lang          text,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  submitted_at  timestamptz,
  decided_at    timestamptz,
  updated_at    timestamptz not null default now(),

  constraint wall_status_valid check (
    status in ('invited', 'submitted', 'approved', 'rejected')
  ),
  constraint wall_form_lang_valid check (form_lang in ('pt-BR', 'en')),
  constraint wall_lang_valid check (lang is null or lang in ('pt-BR', 'en')),
  constraint wall_message_length check (message is null or char_length(message) <= 3000),

  -- Anything past `invited` was written, so it has words and a language. Enforced here so no
  -- admin action can approve an empty row.
  constraint wall_written check (
    status = 'invited' or (message is not null and lang is not null and submitted_at is not null)
  ),

  -- These become hrefs and image sources. https only, so a stored value can never be a
  -- `javascript:` URL, whatever the API in front of this lets through.
  constraint wall_linkedin_https check (linkedin_url is null or linkedin_url like 'https://%'),
  constraint wall_avatar_https check (avatar_url is null or avatar_url like 'https://%')
);

create unique index if not exists uq_wall_token_hash   on wall_testimonials (token_hash);
create index        if not exists idx_wall_status       on wall_testimonials (status, decided_at desc);

create or replace function wall_testimonials_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_wall_testimonials_updated_at on wall_testimonials;
create trigger trg_wall_testimonials_updated_at
  before update on wall_testimonials
  for each row
  execute function wall_testimonials_touch_updated_at();
