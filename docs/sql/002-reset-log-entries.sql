-- Wipes every log entry so the table can be refilled from /admin/log.
--
-- The table, indexes, constraints and trigger all survive — only rows go. Run
-- 001-log-entries.sql first if the table does not exist yet.
--
-- There is no undo. Check the count before you commit to it.

-- 1. What is about to be lost.
select count(*) as rows_now from log_entries;

-- 2. Delete everything.
delete from log_entries;

-- 3. Confirm. Should be 0.
select count(*) as rows_after from log_entries;
