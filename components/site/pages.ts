/** The pages of the Front, in sidebar order. Text only, so server files can read it. */
export const PAGES = [
  {
    id: "home",
    label: "Home",
    title: "Home",
    tagline: "Where it all starts.",
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
    tagline: "What I write down.",
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

/** The address of a screen. A note and a project carry their slug: `post:my-post`. */
export function hrefOf(screen: ScreenId): string {
  if (screen === "home") return "/"
  const [type, slug] = screen.split(":")
  if (type === "post") return `/notes/${slug}`
  if (type === "project") return `/projects/${slug}`
  return `/${type}`
}

/** The screen an address shows, or null when it is not a page of the Front (/back, /ai). */
export function screenOf(pathname: string): ScreenId | null {
  if (pathname === "/") return "home"
  const [, first, slug] = pathname.split("/")
  if (first === "notes" && slug) return `post:${slug}`
  if (first === "projects" && slug) return `project:${slug}`
  if (first === "log" || first === "admin") return first
  return PAGES.some((page) => page.id === first) ? (first as PageId) : null
}

/** The page of the sidebar a screen belongs to: itself, or the page it is reached from. */
export function listedPageOf(screen: ScreenId): PageId | null {
  const inner = innerPageOf(screen)
  return inner ? inner.parent : (screen as PageId)
}
