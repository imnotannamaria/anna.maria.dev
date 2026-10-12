-- /log in two languages.
--
-- An entry's title and note are written in English, the site's first language. These two
-- columns hold the Portuguese of each, and both are optional: an entry with no translation shows
-- its English on /pt/log, which is right for most titles (an album, a game, a book kept in its
-- original name) and wrong only for the ones that have a name of their own in Portuguese.
--
-- Columns and not a table of translations: there are two languages, the pair is always read
-- together with the row, and a join would buy nothing. A third language is a third pair.
--
-- The creator, the year and the rest are not translated: they are names and numbers.

alter table log_entries
  add column if not exists title_pt text,
  add column if not exists note_pt text;
