import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: [
      // `server-only`'s "default" export condition throws by design, so it can't be
      // imported outside a Next server component. Vitest resolves that condition, which
      // breaks importing anything that starts with `import "server-only"` — including
      // lib/log/mutations.ts, lib/log/poster-allowlist.ts, lib/auth/require-admin.ts, and
      // @workos-inc/authkit-nextjs's own session.js/auth.js. Swap it for a no-op instead of
      // adding "react-server" to resolve.conditions, which would also swap React itself.
      {
        find: /^server-only$/,
        replacement: new URL("./tests/stubs/empty.ts", import.meta.url).pathname,
      },
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["{app,lib,components,hooks}/**/*.test.ts"],
          // "*.test.ts" alone also matches "*.integration.test.ts" — without this
          // exclude, `--project unit` silently picked up the integration suite too and
          // ran it against whatever DATABASE_URL happened to resolve to locally (in one
          // case, a real Postgres on this machine, authenticating as the OS user).
          exclude: ["**/*.integration.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          environment: "node",
          include: ["lib/**/*.integration.test.ts"],
          setupFiles: ["./tests/setup/db.ts"],
          // One shared database — parallel files would truncate each other's rows mid-test.
          fileParallelism: false,
        },
      },
    ],
  },
})
