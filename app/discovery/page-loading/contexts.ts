/**
 * The four sets of props the real `loading.tsx` files pass, in one place so the harness next
 * door can show all of them without four copies.
 *
 * Duplicated from those files on purpose: this whole folder is disposable, and wiring it into
 * production so a throwaway page could import it is exactly backwards.
 */
export const CONTEXTS = {
  home: {
    command: "whoami",
    label: "the page",
    steps: ["connecting to postgres", "reading the log", "counting posts and projects"],
  },
  log: {
    command: "log --all --sort=albums,favorites",
    crumb: "log",
    label: "the log",
    steps: ["connecting to postgres", "reading log_entries", "grouping by type"],
  },
  roadmap: {
    command: "roadmap --all --group=status",
    crumb: "roadmap",
    label: "the roadmap",
    steps: ["connecting to postgres", "reading roadmap_items", "counting by status"],
  },
  admin: {
    command: "log --admin",
    crumb: "admin / log",
    label: "entries",
    steps: ["checking the allowlist", "reading log_entries", "including drafts"],
  },
} as const

export type ContextKey = keyof typeof CONTEXTS
