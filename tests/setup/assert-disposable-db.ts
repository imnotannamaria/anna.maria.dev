const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"])

/**
 * Refuses to let a test run touch a database that isn't demonstrably disposable.
 *
 * Both test suites that reach Postgres are destructive: the integration setup TRUNCATEs
 * `log_entries`, `roadmap_items` and `wristkit_samples` between every test, and the e2e
 * CRUD spec creates and deletes real rows through the real API. Neither has an undo, and
 * `.env.local` holds a production connection string that a single `source` or a stale
 * shell export would put in `DATABASE_URL`.
 *
 * Hostname is the check because it is the one thing that cannot be true by accident:
 * Supabase is never on localhost, and the throwaway container always is. `ALLOW_NONLOCAL_TEST_DB`
 * exists for the case of a remote *test* database, and is deliberately awkward enough that
 * nobody sets it without meaning to.
 */
export function assertDisposableDatabase(url: string, operation: string): void {
  let hostname: string
  try {
    hostname = new URL(url).hostname
  } catch {
    throw new Error(`DATABASE_URL is not a valid URL, refusing to run ${operation} against it.`)
  }

  if (LOCAL_HOSTS.has(hostname)) return
  if (process.env.ALLOW_NONLOCAL_TEST_DB === "true") return

  throw new Error(
    `Refusing to run ${operation} against a non-local database (host: ${hostname}).\n\n` +
      "Tests here are destructive and there is no undo. Point DATABASE_URL at the throwaway " +
      "container:\n\n" +
      "  docker compose -f docker-compose.test.yml up -d\n" +
      "  export DATABASE_URL=postgresql://postgres:postgres@localhost:5433/postgres\n\n" +
      "If this really is a disposable remote test database, set ALLOW_NONLOCAL_TEST_DB=true.",
  )
}
