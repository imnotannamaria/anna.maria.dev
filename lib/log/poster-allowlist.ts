import "server-only"
import { isNotNull } from "drizzle-orm"
import { createDb, dbUrl } from "@/lib/db/client"
import { logEntries } from "./schema"

/**
 * The poster proxy's authorisation check: a poster URL is legitimate exactly when it is a
 * poster URL I saved. Nothing else about it has to be trusted — not the host, not the path.
 *
 * `server-only` because this reaches Postgres. The string helper the cards need is in
 * `poster-src.ts`, deliberately in a different file so a `"use client"` component can
 * import it without pulling this one along.
 */

/** A poster added in the admin should appear without waiting out a stale cache. */
const TTL_MS = 60_000

let cache: { urls: Set<string>; readAt: number } | null = null

async function knownUrls(): Promise<Set<string>> {
  const now = Date.now()
  if (cache && now - cache.readAt < TTL_MS) return cache.urls

  const url = dbUrl()
  if (!url) {
    // No database means no entries, which means no posters to serve. An empty set is the
    // honest answer, and it is also the safe one.
    cache = { urls: new Set(), readAt: now }
    return cache.urls
  }

  const { db } = createDb(url)
  const rows = await db
    .selectDistinct({ posterUrl: logEntries.posterUrl })
    .from(logEntries)
    .where(isNotNull(logEntries.posterUrl))

  cache = { urls: new Set(rows.map((r) => r.posterUrl as string)), readAt: now }
  return cache.urls
}

/**
 * Whether this exact URL is one the log has stored.
 *
 * Exact string match, not a host match: it is the URL that was published, so it is the URL
 * that gets fetched. A host allowlist would let anyone use this server to fetch anything on
 * Wikimedia; this lets them fetch the images already on the page.
 *
 * A miss re-reads once before answering no, so a poster saved seconds ago is not a broken
 * image for up to a minute — the cache exists to keep the common case off the database, not
 * to make new entries wait. A miss is also the only path that pays for it, and a miss is
 * either a new poster or an attempt to use this route as a proxy.
 */
export async function isKnownPosterUrl(candidate: string): Promise<boolean> {
  if ((await knownUrls()).has(candidate)) return true

  cache = null
  return (await knownUrls()).has(candidate)
}
