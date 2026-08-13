import { type APIRequestContext, type BrowserContext, expect, test } from "@playwright/test"
import { signInAs } from "./helpers/authkit-session"

/**
 * The allowlist gate, exercised through real middleware — proxy.ts's authkitProxy runs,
 * requireAdmin()/requireAdminApi genuinely call withAuth(), and withAuth() genuinely
 * verifies the signed token against the local JWKS from global-setup.ts. Nothing here is
 * stubbed past the JWKS host itself.
 */

test("allowlisted email reaches the admin layout", async ({ page, context }) => {
  await signInAs(context, "admin@test.dev") // matches ADMIN_EMAILS in playwright.config.ts
  await page.goto("/admin/log")
  await expect(page.getByRole("navigation", { name: "Admin sections" })).toBeVisible()
})

test("a validly signed session for a non-allowlisted email still 404s", async ({
  page,
  context,
}) => {
  // The point of this case specifically: the signature check passes (it's a real RS256
  // token verified against the real JWKS), so a 404 here proves ADMIN_EMAILS is the thing
  // doing the work — not an accidental reliance on the token being unverifiable.
  await signInAs(context, "stranger@example.com")
  const res = await page.goto("/admin/log")
  expect(res?.status()).toBe(404)
})

test("no session redirects toward sign-in rather than serving the page", async ({ page }) => {
  // authkitProxy's middlewareAuth.enabled bounces a signed-out request before the page
  // ever renders. The redirect target is built from WORKOS_API_HOSTNAME — the same local
  // stand-in JWKS host from global-setup.ts, which has no route for it and answers 404.
  // page.goto()'s response is that *final* response after Playwright follows the
  // redirect, so the meaningful assertion is the URL it lands on, not that status code.
  await page.goto("/admin/log")
  await expect(page).not.toHaveURL(/\/admin\/log$/)
  expect(new URL(page.url()).port).not.toBe("3100") // left the app's own origin entirely
})

/**
 * POST, not GET, and with an invalid body — the same reasoning as admin-log.test.ts.
 * `/api/v1/admin/log` has no GET route at all, so a GET is 404 for everyone including a
 * signed-in admin, and asserting it proves nothing. POST routes, and an invalid body stops
 * an allowed caller at zValidator (400) without writing to the database, so 400-vs-404 is
 * a real signal about identity.
 */
async function postInvalidAsAdminLog(context: BrowserContext, request: APIRequestContext) {
  const cookieHeader = (await context.cookies()).map((c) => `${c.name}=${c.value}`).join("; ")
  return request.post("/api/v1/admin/log", {
    headers: { cookie: cookieHeader, "content-type": "application/json" },
    data: {},
    failOnStatusCode: false,
  })
}

test("the API route turns away a non-allowlisted session with a 404", async ({
  request,
  context,
}) => {
  await signInAs(context, "stranger@example.com")
  const res = await postInvalidAsAdminLog(context, request)
  expect(res.status()).toBe(404)
})

test("the API route lets an allowlisted session reach validation (400, not 404)", async ({
  request,
  context,
}) => {
  // The other half of the pair. Without it, the 404 above could just as easily mean "no
  // such route" as "rejected" — together they prove the allowlist is what decides, on the
  // route guard rather than only on the page.
  await signInAs(context, "admin@test.dev")
  const res = await postInvalidAsAdminLog(context, request)
  expect(res.status()).toBe(400)
})
