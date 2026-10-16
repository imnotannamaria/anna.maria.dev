import { APP_LIST } from "@/components/site/professional/app-list"
import { CAREER, period } from "@/components/site/professional/career"
import { calcYearsOfExp } from "@/lib/experience"
import { siteConfig } from "@/lib/site-config"
import { STACK_GROUPS } from "@/lib/stack"
import { getPublishedPosts, getPublishedProjects } from "@/lib/velite"

/**
 * Everything the model is allowed to know, as plain text: the same facts the pages show. It is
 * built the same way on every call, so the provider can cache it and each question pays for the
 * question, not for this.
 *
 * Summaries only, never a post's full text: the whole thing has to stay around four thousand
 * tokens (lib/ai/context.test.ts holds it to that).
 */
export function siteContext(): string {
  const posts = getPublishedPosts()
  const projects = getPublishedProjects()

  return [
    "ABOUT ANNA",
    `Anna Maria is a full-stack software engineer from Pernambuco, Brazil. She has about ${calcYearsOfExp()} years of experience and builds things end to end, from the UI and the front, web or mobile, to shipping.`,
    "Outside work: she is not much for talking about herself, so she built her site as a playground, and the /person page says a lot about her. Her cat is called Abimaela, and is the cat in the corner of the site.",
    "",
    "WORK AND STUDY (page: /professional)",
    ...CAREER.map(
      (entry) =>
        `- ${entry.org} (${entry.type}), ${entry.role}, ${period(entry, "present")}. ${entry.text}`,
    ),
    "",
    "STACK (page: /professional)",
    ...STACK_GROUPS.map((group) => `- ${group.key}: ${group.items.join(", ")}`),
    `- apps she works in: ${APP_LIST.map((app) => app.name).join(", ")}`,
    "",
    "PROJECTS (page: /projects)",
    ...projects.map(
      (project) =>
        `- ${project.title} (${project.kind === "library" ? "open source" : project.kind}, ${project.date.slice(0, 4)}): ${project.description} Tags: ${project.tags.join(", ")}. Page: /projects/${project.slug}`,
    ),
    "",
    "NOTES, HER BLOG (page: /notes)",
    ...posts.map(
      (post) => `- "${post.title}" (${post.date}): ${post.description} Page: /notes/${post.slug}`,
    ),
    "",
    "OTHER PAGES",
    "- /person: who she is outside work, with photos, a playlist and what she has been watching and reading.",
    "- /log: everything she finishes: films, series, books, albums, podcasts and games.",
    "- /wall-of-love: letters from people she has worked with, by invitation.",
    "- /contact: a form to write to her.",
    "- /back: this site as a terminal. /ai: this chat.",
    "",
    "CONTACT (page: /contact)",
    `- email: ${siteConfig.email}`,
    ...Object.entries(siteConfig.socials).map(([name, url]) => `- ${name}: ${url}`),
  ].join("\n")
}
