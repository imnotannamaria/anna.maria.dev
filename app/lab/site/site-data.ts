export type SiteData = {
  years: number
  email: string
  socials: { github: string; linkedin: string; x: string }

  jobs: {
    org: string
    role: string
    from: number
    until: number
    current?: boolean
    type: "work" | "study"
  }[]
  apps: { name: string; what: string }[]
  stack: { key: string; items: string[] }[]
  posts: {
    slug: string
    title: string
    description: string
    date: string
    tags: string[]

    featured: boolean
  }[]
  projects: {
    slug: string
    title: string
    description: string
    date: string
    tags: string[]

    type: string

    cover: string | null
    featured: boolean
    github: string | null
    live: string | null
  }[]

  log: { type: string; title: string; creator: string | null; loggedAt: string }[] | null
}
