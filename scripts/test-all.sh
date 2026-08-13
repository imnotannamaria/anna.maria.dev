#!/usr/bin/env bash
#
# Runs every test layer with one command, and does the setup each one needs.
#
# The suites themselves are deliberately strict — they refuse to run against a
# non-local database, and the e2e run refuses to start without a cookie password —
# because both are destructive. That strictness is right, but it left five manual
# steps between "I want to run the tests" and running them. This is those steps.
#
#   npm run test:all              unit, then integration, then e2e
#   npm run test:all -- --keep    leave the database up afterwards (faster to re-run)
#   npm run test:all -- --no-e2e  skip the browser layer and its production build
#
# The database is a throwaway container on port 5433 with a tmpfs data directory,
# so it shares nothing with Supabase and `down` discards it entirely. If one was
# already running when this started, it is left running at the end — this only
# tears down what it brought up.

set -euo pipefail

cd "$(dirname "$0")/.."

COMPOSE="docker compose -f docker-compose.test.yml"
LOCAL_DATABASE_URL="postgresql://postgres:postgres@localhost:5433/postgres"

KEEP_DB=false
RUN_E2E=true
STARTED_DB=false

for arg in "$@"; do
  case "$arg" in
    --keep) KEEP_DB=true ;;
    --no-e2e) RUN_E2E=false ;;
    -h|--help) sed -n '3,18p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown option: $arg (try --help)" >&2; exit 2 ;;
  esac
done

# ── output ────────────────────────────────────────────────────────────────────
# ◆ and // to match the site's own vocabulary. Colour only when attached to a
# terminal, so piping to a file or CI logs stays readable.
if [ -t 1 ]; then
  DIM=$'\033[2m'; BOLD=$'\033[1m'; GREEN=$'\033[32m'; RED=$'\033[31m'; RESET=$'\033[0m'
else
  DIM=""; BOLD=""; GREEN=""; RED=""; RESET=""
fi

step() { printf '\n%s◆%s %s%s%s\n' "$BOLD" "$RESET" "$BOLD" "$1" "$RESET"; }
note() { printf '%s// %s%s\n' "$DIM" "$1" "$RESET"; }
fail() { printf '\n%s✗ %s%s\n' "$RED" "$1" "$RESET" >&2; }

# ── teardown ──────────────────────────────────────────────────────────────────
# A trap, not a line at the end: Ctrl-C halfway through an e2e run should not
# leave a container behind either.
cleanup() {
  if [ "$STARTED_DB" = true ] && [ "$KEEP_DB" = false ]; then
    note "stopping the test database"
    $COMPOSE down >/dev/null 2>&1 || true
  elif [ "$STARTED_DB" = true ]; then
    note "leaving the test database up (--keep) — stop it with: $COMPOSE down"
  fi
}
trap cleanup EXIT

# ── the database ──────────────────────────────────────────────────────────────
step "test database"

if ! docker info >/dev/null 2>&1; then
  fail "Docker isn't running. Start Docker (or OrbStack) and try again."
  echo "   Unit tests need none of this: npm test" >&2
  exit 1
fi

if [ -n "$($COMPOSE ps --status running --quiet postgres 2>/dev/null)" ]; then
  note "already running on :5433, reusing it"
else
  note "starting postgres:17 on :5433"
  # Schema comes from docs/sql/*.sql, mounted at docker-entrypoint-initdb.d and
  # applied in filename order on a fresh data directory — which is every start,
  # since the data directory is tmpfs.
  $COMPOSE up -d --wait >/dev/null 2>&1 || {
    fail "Could not start the test database. Is something else on port 5433?"
    exit 1
  }
  STARTED_DB=true
fi

# Always the local container, even if DATABASE_URL is already exported to
# something else. That is the whole point: this script should never be able to
# point a TRUNCATE at the real database, no matter what is in the shell.
export DATABASE_URL="$LOCAL_DATABASE_URL"

# Seals throwaway admin sessions for the e2e suite. Unrelated to the production
# WORKOS_COOKIE_PASSWORD; generated per-run unless one is already set.
if [ -z "${TEST_WORKOS_COOKIE_PASSWORD:-}" ]; then
  export TEST_WORKOS_COOKIE_PASSWORD="$(openssl rand -base64 32)"
fi

# ── content ───────────────────────────────────────────────────────────────────
# .velite is gitignored and lib/velite-output.test.ts imports it, so a fresh
# clone has nothing to assert against until this runs.
step "building content"
npx velite build >/dev/null
note "velite ok"

# ── the suites ────────────────────────────────────────────────────────────────
step "unit"
npm test

step "integration"
npm run test:integration

if [ "$RUN_E2E" = true ]; then
  step "e2e"
  if ! npx playwright install chromium >/dev/null 2>&1; then
    note "could not install chromium automatically"
    note "run: npx playwright install --with-deps chromium"
  fi
  # Playwright builds and starts the app itself — the slowest part of this script.
  npm run test:e2e
else
  step "e2e"
  note "skipped (--no-e2e)"
fi

printf '\n%s◆ all green%s\n' "$GREEN" "$RESET"
