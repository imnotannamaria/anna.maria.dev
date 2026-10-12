import type { Locale } from "@/lib/i18n/locales"
import type { LogEntry } from "./validation"

/**
 * An entry as a page in `locale` shows it: the Portuguese title and note take the place of the
 * English where they exist, and the English stays where they do not. Most titles are a name
 * (an album, a game) and have no translation to have.
 *
 * The same idea as `inLocale` for the notes and the projects (lib/velite.ts): the rest of the
 * entry is one thing in every language.
 */
export function inLocale(entry: LogEntry, locale: Locale): LogEntry {
  if (locale !== "pt") return entry
  return { ...entry, title: entry.titlePt ?? entry.title, note: entry.notePt ?? entry.note }
}

/** A list of entries in `locale`. Null stays null: it means the database did not answer. */
export function entriesIn(entries: LogEntry[] | null, locale: Locale): LogEntry[] | null {
  return entries && entries.map((entry) => inLocale(entry, locale))
}
