import { expect, test } from "@playwright/test"
import postgres from "postgres"
import { signInAs } from "./helpers/authkit-session"

test.describe.configure({ mode: "serial" })

test.beforeEach(async ({ context }) => {
  await signInAs(context, "admin@test.dev")
})

/**
 * Both flows below end by deleting what they created, so a clean run leaves nothing. A run
 * that fails halfway does not, and the rows it strands are indistinguishable from real
 * data on the next `/log` render. This sweeps anything matching the E2E prefix regardless
 * of how the test exited.
 *
 * playwright.config.ts refuses to start at all unless DATABASE_URL is a local, disposable
 * database, so this cannot reach production — see tests/setup/assert-disposable-db.ts.
 */
test.afterAll(async () => {
  const url = process.env.DATABASE_URL
  if (!url) return

  const sql = postgres(url, { prepare: false })
  try {
    await sql`delete from log_entries where title like 'E2E Log Entry %'`
    await sql`delete from roadmap_items where title like 'E2E Roadmap Item %'`
  } finally {
    await sql.end()
  }
})

test("log entry: create through the real form, appears on /log, edit, then delete", async ({
  page,
}) => {
  const title = `E2E Log Entry ${Date.now()}`

  await page.goto("/admin/log/new")
  await page.getByLabel("title").fill(title)
  // type defaults to "film" and loggedAt defaults to today — both left alone.
  await page.getByRole("button", { name: "create entry" }).click()
  await expect(page).toHaveURL(/\/admin\/log$/)
  // exact: true — the row's Edit icon link has aria-label "Edit <title>", which
  // getByRole's default fuzzy name matching would otherwise also match.
  await expect(page.getByRole("link", { name: title, exact: true })).toBeVisible()

  // published defaults to true, so it should already be live on the public feed.
  await page.goto("/log")
  await expect(page.getByText(title)).toBeVisible()

  // Edit: rename it through the real PATCH round trip.
  await page.goto("/admin/log")
  await page.getByRole("link", { name: `Edit ${title}` }).click()
  const renamed = `${title} (edited)`
  const titleField = page.getByLabel("title")
  await titleField.fill(renamed)
  await page.getByRole("button", { name: "save changes" }).click()
  await expect(page).toHaveURL(/\/admin\/log$/)
  await expect(page.getByRole("link", { name: renamed, exact: true })).toBeVisible()

  // Delete: confirm through the real dialog, then confirm it's gone.
  await page.getByRole("button", { name: `Delete ${renamed}` }).click()
  await page.getByRole("button", { name: "delete" }).click()
  await expect(page.getByRole("link", { name: renamed, exact: true })).not.toBeVisible()
})

test("roadmap item: create through the real form, appears in the admin list, then delete", async ({
  page,
}) => {
  const title = `E2E Roadmap Item ${Date.now()}`

  await page.goto("/admin/roadmap/new")
  await page.getByLabel("title").fill(title)
  // status defaults to "raw" — deliberately left there; it never renders on /roadmap, so
  // this flow checks the admin round trip, not public visibility.
  await page.getByRole("button", { name: "create item" }).click()
  await expect(page).toHaveURL(/\/admin\/roadmap$/)
  // The row's title is itself a link — getByText would also match the delete dialog's
  // "<title> will be removed for good" description once it opens, and exact: true is
  // needed because the row's Edit icon link is named "Edit <title>".
  await expect(page.getByRole("link", { name: title, exact: true })).toBeVisible()

  await page.getByRole("button", { name: `Delete ${title}` }).click()
  await page.getByRole("button", { name: "delete" }).click()
  await expect(page.getByRole("link", { name: title, exact: true })).not.toBeVisible()
})
