export const APP_LIST = [
  { name: "Dia", what: "ai browser" },
  { name: "Ghostty", what: "terminal" },
  { name: "Claude", what: "ai assistant" },
  { name: "Codex", what: "coding agent" },
  { name: "Cursor", what: "code editor" },
  { name: "Notion", what: "notes and docs" },
  { name: "Google Chrome", what: "browser" },
  { name: "OrbStack", what: "containers" },
  { name: "Google Calendar", what: "calendar" },
  { name: "Spotify", what: "music" },
  { name: "Raycast", what: "launcher" },
  { name: "Granola", what: "meeting notes" },
  { name: "Slack", what: "team chat" },
] as const

export type AppName = (typeof APP_LIST)[number]["name"]
