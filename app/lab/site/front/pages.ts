/** The pages of the Front, in sidebar order. Text only, so server files can read it. */
export const PAGES = [
  {
    id: "home",
    label: "Home",
    title: "Home",
    tagline: "A bento grid of widgets, each one a door to a page. Built last.",
  },
  {
    id: "person",
    label: "Anna, the person",
    title: "Anna, the person",
    tagline: "Who I am when the editor is closed.",
  },
  {
    id: "professional",
    label: "Anna, the professional",
    title: "Anna, the professional",
    tagline: "Where I have worked, and what I work with.",
  },
  {
    id: "notes",
    label: "Notes",
    title: "Notes",
    tagline: "The blog.",
  },
  {
    id: "projects",
    label: "Projects",
    title: "Projects",
    tagline: "What I have built.",
  },
  {
    id: "wall-of-love",
    label: "Wall of love",
    title: "Wall of love",
    tagline: "Kind words, by invitation.",
  },
  {
    id: "contact",
    label: "Contact",
    title: "Contact",
    tagline: "How to reach me.",
  },
] as const

export type PageId = (typeof PAGES)[number]["id"]

export const INNER_PAGES = [
  { id: "log", label: "Log", parent: "person" },
  { id: "post", label: "A note, open", parent: "notes" },
  { id: "project", label: "A project, open", parent: "projects" },
  { id: "admin", label: "Admin", parent: null },
] as const

export type InnerPageId = (typeof INNER_PAGES)[number]["id"]

export type ScreenId = PageId | "log" | "admin" | `post:${string}` | `project:${string}`

export function innerPageOf(screen: string) {
  const type = screen.split(":")[0]
  return INNER_PAGES.find((inner) => inner.id === type)
}
