import { blog, projects } from "@/.velite"

export function getPublishedPosts() {
  return blog
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getFeaturedProjects() {
  return projects
    .filter((project) => project.published && project.featured)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPublishedProjects() {
  return projects
    .filter((project) => project.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string) {
  return blog.find((post) => post.slug === slug && post.published)
}

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug && project.published)
}
