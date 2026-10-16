-- /wall-of-love: reactions on a letter.
-- Run this in the Supabase SQL editor, after 004. Mirrored in lib/wall/schema.ts.
--
-- One jsonb column on the letter itself, a count per reaction: {"heart": 3, "clap": 1}. The
-- reactions are a fixed list of three (lib/wall/constants.ts), so there is no table of them and
-- no join to read the wall.
--
-- Who reacted is not stored. A visitor's own picks live in their browser, and the route that
-- counts is rate limited: it is a kindness counter, not a vote, and a row per visitor would mean
-- keeping an identifier for everyone who clicked a heart.

alter table wall_testimonials
  add column if not exists reactions jsonb not null default '{}'::jsonb;
