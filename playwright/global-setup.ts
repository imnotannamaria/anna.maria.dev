import { createServer } from "node:http"
import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { exportJWK, exportPKCS8, generateKeyPair } from "jose"

/**
 * A local stand-in for WorkOS's JWKS endpoint, so Playwright's admin tests can sign a
 * session that AuthKit's real middleware genuinely verifies — RS256, same code path as
 * production — instead of bypassing verification. See "What the first draft of this plan
 * got wrong" in docs/tests-plan.md for why a bypass doesn't work here: proxy.ts runs
 * `authkitProxy` with `middlewareAuth.enabled`, which calls
 * `jwtVerify(accessToken, createRemoteJWKSet(new URL(getJwksUrl(clientId))))`, and
 * `getJwksUrl()` is `${baseURL}/sso/jwks/${clientId}` — `baseURL` built from
 * WORKOS_API_HOSTNAME/HTTPS/PORT, which webServer.env points here.
 *
 * The private key is written to disk so tests/e2e/helpers/authkit-session.ts (running in a
 * separate process — Playwright's test runner, not this setup process) can sign with it.
 */
export const JWKS_PORT = 9797
export const CLIENT_ID = "client_test"
// __dirname, not import.meta.url — Playwright transpiles config/setup files to CommonJS
// by default (this repo has no "type": "module" in package.json), and import.meta throws
// there.
export const PRIVATE_KEY_PATH = join(__dirname, ".private-key.pem")

export default async function globalSetup() {
  const { publicKey, privateKey } = await generateKeyPair("RS256", { extractable: true })
  const jwk = { ...(await exportJWK(publicKey)), alg: "RS256", use: "sig", kid: "test-key" }

  const server = createServer((req, res) => {
    if (req.url === `/sso/jwks/${CLIENT_ID}`) {
      res.writeHead(200, { "content-type": "application/json" })
      res.end(JSON.stringify({ keys: [jwk] }))
      return
    }
    res.writeHead(404).end()
  })

  await new Promise<void>((resolve) => server.listen(JWKS_PORT, resolve))
  writeFileSync(PRIVATE_KEY_PATH, await exportPKCS8(privateKey))

  return async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()))
  }
}
