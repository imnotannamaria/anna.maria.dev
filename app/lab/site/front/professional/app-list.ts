export const APP_LIST = [
  { name: "Warp", what: "terminal" },
  { name: "Claude", what: "ai assistant" },
  { name: "Codex", what: "coding agent" },
  { name: "Cursor", what: "code editor" },
  { name: "Notion", what: "notes and docs" },
  { name: "Google Chrome", what: "browser" },
  { name: "Google Calendar", what: "calendar" },
  { name: "Spotify", what: "music" },
  { name: "Slack", what: "team chat" },
  { name: "Figma", what: "design" },
] as const

export type AppName = (typeof APP_LIST)[number]["name"]
