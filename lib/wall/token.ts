import "server-only"
import { createHash, randomBytes } from "node:crypto"

/**
 * An invite token: 32 random bytes, base64url, 43 characters. Only its sha256 is stored, so
 * a leaked table does not hand anyone a working link.
 */
export function generateToken(): string {
  return randomBytes(32).toString("base64url")
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

/** Cheap shape check before any query: a URL can hold anything. */
export function isTokenShape(value: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(value)
}
