import { defineConfig } from "@playwright/test"
import { CLIENT_ID, JWKS_PORT } from "./playwright/global-setup"
import { assertDisposableDatabase } from "./tests/setup/assert-disposable-db"

const PORT = 3100 // off the dev-server default so this can run alongside `npm run dev`

// admin-crud.spec.ts writes and deletes real rows through the real API, so the e2e run is
// destructive in the same way the integration run is — and needs the same guard. Checked
// here at config load, before a browser or a build is started.
const DATABASE_URL = process.env.DATABASE_URL ?? ""
if (DATABASE_URL) assertDisposableDatabase(DATABASE_URL, "the e2e suite")

if (!process.env.TEST_WORKOS_COOKIE_PASSWORD) {
  // AuthKit throws "You must provide a valid cookie password that is at least 32
  // characters" from deep inside the Next server otherwise — a failure that points nowhere
  // near the cause. Say it here instead, where the fix is obvious.
  throw new Error(
    "e2e tests need TEST_WORKOS_COOKIE_PASSWORD (32+ chars) to seal throwaway admin " +
      "sessions. Generate one with: export TEST_WORKOS_COOKIE_PASSWORD=$(openssl rand -base64 32)",
  )
}

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./playwright/global-setup.ts",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    // `build` is `velite build && next build`. Playwright starts the server itself so the
    // JWKS host/port below are only ever wired to a throwaway build, never a dev session.
    command: `npm run build && PORT=${PORT} npm start`,
    url: `http://localhost:${PORT}`,
    timeout: 180_000,
    reuseExistingServer: false,
    env: {
      // Points the WorkOS SDK's baseURL (protocol://hostname:port) at the local JWKS
      // server from global-setup.ts, instead of the real WorkOS API. See the comment
      // there for the exact call chain this satisfies.
      WORKOS_API_HOSTNAME: "localhost",
      WORKOS_API_HTTPS: "false",
      WORKOS_API_PORT: String(JWKS_PORT),
      WORKOS_CLIENT_ID: CLIENT_ID,
      WORKOS_API_KEY: "sk_test_not_a_real_key",
      WORKOS_COOKIE_PASSWORD: process.env.TEST_WORKOS_COOKIE_PASSWORD,
      NEXT_PUBLIC_WORKOS_REDIRECT_URI: `http://localhost:${PORT}/api/auth/callback`,
      ADMIN_EMAILS: "admin@test.dev",
      DATABASE_URL,
      NEXT_PUBLIC_BASE_URL: `http://localhost:${PORT}`,
    },
  },
})
