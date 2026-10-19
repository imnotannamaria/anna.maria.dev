-- The roadmap left the site in v3: the page, the admin and the API are gone, and /roadmap only
-- says so. This removes its table.
--
-- DESTRUCTIVE: it deletes every roadmap item for good. Run it only when nothing in that table is
-- wanted any more. The original text of the items is still in the git history, in
-- scripts/seed-roadmap.ts.

drop table if exists roadmap_items;
