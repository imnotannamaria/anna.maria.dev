import { readFileSync } from "node:fs"
import type { BrowserContext } from "@playwright/test"
import { sealData } from "iron-session"
import { SignJWT, importPKCS8 } from "jose"
import { PRIVATE_KEY_PATH } from "../../../playwright/global-setup"

/**
 * Seals a WorkOS AuthKit session cookie the way `encryptSession()` does in
 * @workos-inc/authkit-nextjs's session.js — same iron-session call, same `ttl: 0` (without
 * it, `unsealData` applies its own 14-day default instead of AuthKit's own session
 * lifetime rules).
 *
 * The access token is signed RS256 with the private half of the keypair
 * playwright/global-setup.ts published at the local JWKS. `verifyAccessToken()` in
 * session.js calls `jwtVerify()` against that same endpoint, so this makes AuthKit's real
 * middleware genuinely pass — nothing about the verification step is stubbed.
 */
export async function signInAs(context: BrowserContext, email: string) {
  const cookiePassword = process.env.TEST_WORKOS_COOKIE_PASSWORD
  if (!cookiePassword) throw new Error("TEST_WORKOS_COOKIE_PASSWORD must be set for e2e tests")

  const privateKey = await importPKCS8(readFileSync(PRIVATE_KEY_PATH, "utf8"), "RS256")

  const accessToken = await new SignJWT({ sid: "session_test", org_id: "org_test" })
    .setProtectedHeader({ alg: "RS256", kid: "test-key" })
    .setIssuedAt()
    .setExpirationTime("2h") // well clear of the 60s refresh buffer session.js checks
    .sign(privateKey)

  const value = await sealData(
    {
      accessToken,
      refreshToken: "rt_test",
      user: {
        id: "user_test",
        email,
        emailVerified: true,
        object: "user",
        firstName: null,
        lastName: null,
        profilePictureUrl: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
    },
    { password: cookiePassword, ttl: 0 },
  )

  await context.addCookies([
    { name: "wos-session", value, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" },
  ])
}
