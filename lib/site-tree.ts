// ─── The tree — the site's own routes, as a file tree ────────────────────────
//
// Hand-written on purpose. Walking the App Router would produce a tree that can't
// answer the editorial questions: whether /admin belongs here (it doesn't), what
// order the branches go in, what blog/[slug] becomes. Every one of those is a
// choice, so they live here as data instead of being inferred and then overridden.
//
// This file stays free of velite and database imports. The shape is static, the
// numbers arrive at render — see `buildSiteTree`, which the home page calls with
// data it has already fetched for other cards.

/** How many real entries a content folder shows before the "more" row. */
const CHILDREN_SHOWN = 3

type CountKey = "posts" | "projects" | "log"

/** Which content list fills a folder's children, if any. */
type ChildSource = "posts" | "projects"

type TreeNode = {
  /** Rendered label. Folders end in "/", files carry an extension. */
  name: string
  kind: "folder" | "file"
  href?: string
  /** Number shown on the right, and the noun a screen reader hears after it. */
  countKey?: CountKey
  countNoun?: string
  /** Dimmed, with a lock. Not a link, not focusable. Nothing uses this yet — the
   *  contributions page in the roadmap is what it's here for. */
  locked?: boolean
  children?: TreeNode[]
  childSource?: ChildSource
  defaultOpen?: boolean
}

const SITE_TREE: TreeNode[] = [
  {
    name: "annamaria.app/",
    kind: "folder",
    defaultOpen: true,
    children: [
      { name: "about.md", kind: "file", href: "/about" },
      {
        // Opens with the card. A tree that arrives fully collapsed is a list of
        // six words — you have to work before it shows you anything. One branch
        // open demonstrates what the thing does without being asked.
        name: "blog/",
        kind: "folder",
        href: "/blog",
        countKey: "posts",
        countNoun: "posts",
        childSource: "posts",
        defaultOpen: true,
      },
      {
        name: "projects/",
        kind: "folder",
        href: "/projects",
        countKey: "projects",
        countNoun: "projects",
        childSource: "projects",
      },
      { name: "log.tsx", kind: "file", href: "/log", countKey: "log", countNoun: "entries" },
      { name: "piano.tsx", kind: "file", href: "/piano" },
      { name: "contact.tsx", kind: "file", href: "/contact" },
    ],
  },
]

// ─── Resolved tree — what the component actually renders ─────────────────────

export type SiteTreeItem = {
  /** Stable identity for the open/closed set. Built from the ancestors' names. */
  path: string
  name: string
  /** "more" is the `… N more` row at the end of a truncated folder. */
  kind: "folder" | "file" | "more"
  href?: string
  count?: number
  countNoun?: string
  /** Extra context for assistive tech — a post's real title behind its filename. */
  hint?: string
  locked?: boolean
  defaultOpen?: boolean
  children?: SiteTreeItem[]
}

type Doc = { slug: string; title: string }

export type SiteTreeData = {
  posts: Doc[]
  projects: Doc[]
  /** Published log entries, or null when there is no number to show — the
   *  database being unreachable is not the same claim as "zero entries", and a
   *  confident 0 would be a lie. Either way the row still links to /log. */
  logCount: number | null
}

/** `folder/child` — names are unique per level, so this is enough to be a key. */
function join(parent: string, name: string) {
  return parent ? `${parent}/${name}` : name
}

function docChildren(docs: Doc[], parent: string, ext: string, href: string): SiteTreeItem[] {
  const shown: SiteTreeItem[] = docs.slice(0, CHILDREN_SHOWN).map((doc) => ({
    path: join(parent, doc.slug),
    name: `${doc.slug}${ext}`,
    kind: "file",
    href: `${href}/${doc.slug}`,
    hint: doc.title,
  }))

  const rest = docs.length - shown.length
  if (rest > 0) {
    shown.push({
      path: join(parent, "__more"),
      name: `… ${rest} more`,
      kind: "more",
      href,
    })
  }

  return shown
}

function resolve(node: TreeNode, parent: string, data: SiteTreeData): SiteTreeItem {
  const path = join(parent, node.name)
  const counts: Record<CountKey, number | null> = {
    posts: data.posts.length,
    projects: data.projects.length,
    log: data.logCount,
  }

  let children: SiteTreeItem[] | undefined
  if (node.childSource === "posts") {
    children = docChildren(data.posts, path, ".mdx", "/blog")
  } else if (node.childSource === "projects") {
    children = docChildren(data.projects, path, ".mdx", "/projects")
  } else if (node.children) {
    children = node.children.map((child) => resolve(child, path, data))
  }

  return {
    path,
    name: node.name,
    kind: node.kind,
    href: node.locked ? undefined : node.href,
    count: node.countKey ? (counts[node.countKey] ?? undefined) : undefined,
    countNoun: node.countNoun,
    locked: node.locked,
    defaultOpen: node.defaultOpen,
    children,
  }
}

export function buildSiteTree(data: SiteTreeData): SiteTreeItem[] {
  return SITE_TREE.map((node) => resolve(node, "", data))
}

/** Distinct routes the tree links to, for the card's header meta. Static only —
 *  it shouldn't tick up every time a blog post is published. */
export function siteTreeRouteCount(): number {
  const routes = new Set<string>()
  const walk = (nodes: TreeNode[]) => {
    for (const node of nodes) {
      if (node.href && !node.locked) routes.add(node.href)
      if (node.children) walk(node.children)
    }
  }
  walk(SITE_TREE)
  return routes.size
}

/** Paths that start expanded. Seeds the component's state on the server, so the
 *  first paint matches the markup. */
export function defaultOpenPaths(items: SiteTreeItem[]): string[] {
  const open: string[] = []
  const walk = (nodes: SiteTreeItem[]) => {
    for (const node of nodes) {
      if (node.defaultOpen) open.push(node.path)
      if (node.children) walk(node.children)
    }
  }
  walk(items)
  return open
}
