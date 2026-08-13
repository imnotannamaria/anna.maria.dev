import { expect, test } from "@playwright/test"

/**
 * The bug this guards against: `useSearchParams` on a statically rendered route makes the
 * nearest Suspense boundary emit its fallback during prerender, so every card is missing
 * from the HTML a crawler reads — this actually happened on /blog. The fix,
 * `useUrlFilter` (components/ui/url-filter.tsx), reads the URL through
 * `useSyncExternalStore` instead, whose server snapshot is always null so nothing is
 * filtered out of the server render.
 *
 * `request.get()` fetches raw HTML with no JavaScript execution — the same thing a
 * crawler sees — which a `page.goto()` assertion could not tell apart from "rendered after
 * hydration ran".
 */

/**
 * React escapes `&`, `<` and `>` in text nodes, so a title containing any of them appears
 * in the HTML in escaped form and a raw `toContain(title)` would fail on a page that is
 * perfectly correct. (Apostrophes are left alone in text nodes, which is why
 * "Spreadsheets aren't the problem" passes today — but relying on that is one post title
 * away from a confusing red build.)
 */
function asRenderedText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

test("every published post title is present in /blog's server-rendered HTML", async ({
  request,
}) => {
  const res = await request.get("/blog")
  const html = await res.text()

  const { blog } = await import("../../.velite")
  const published = blog.filter((p: { published: boolean }) => p.published)
  expect(published.length).toBeGreaterThan(0)

  for (const post of published) {
    expect(html, `"${post.title}" missing from /blog's server HTML`).toContain(
      asRenderedText(post.title),
    )
  }
})

test("every published project title is present in /projects's server-rendered HTML", async ({
  request,
}) => {
  const res = await request.get("/projects")
  const html = await res.text()

  const { projects } = await import("../../.velite")
  const published = projects.filter((p: { published: boolean }) => p.published)
  expect(published.length).toBeGreaterThan(0)

  for (const project of published) {
    expect(html, `"${project.title}" missing from /projects's server HTML`).toContain(
      asRenderedText(project.title),
    )
  }
})
