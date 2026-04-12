import { blog, projects } from "@/.velite"

function stripPrefix(slug: string) {
  return slug.split("/").slice(1).join("/")
}

export function getPublishedPosts() {
  return blog
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((post) => ({ ...post, slug: stripPrefix(post.slug) }))
}

export function getFeaturedProjects() {
  return projects
    .filter((project) => project.published && project.featured)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((project) => ({ ...project, slug: stripPrefix(project.slug) }))
}

export function getPublishedProjects() {
  return projects
    .filter((project) => project.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((project) => ({ ...project, slug: stripPrefix(project.slug) }))
}

export function getPostBySlug(slug: string) {
  return blog
    .filter((post) => post.published)
    .map((post) => ({ ...post, slug: stripPrefix(post.slug) }))
    .find((post) => post.slug === slug)
}

export function getProjectBySlug(slug: string) {
  return projects
    .filter((project) => project.published)
    .map((project) => ({ ...project, slug: stripPrefix(project.slug) }))
    .find((project) => project.slug === slug)
}
