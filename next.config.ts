import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /**
   * `import { siReact, siHono, … } from "simple-icons"` reaches the barrel file, and that
   * barrel re-exports roughly three thousand icons. Tree-shaking is supposed to drop the
   * rest, but it can only do that after parsing every one of those re-exports, and it gives
   * up entirely on anything it cannot prove side-effect-free. Lighthouse measured 347ms of
   * script evaluation for `node_modules_simple-icons_index_mjs` on the home page — the page
   * with the site's worst blocking time.
   *
   * This tells Next to rewrite those named imports into direct deep imports at build time,
   * so the module graph only ever contains the ~36 icons lib/stack.ts actually names. Same
   * source, no import-site change; it is a compiler instruction, not a refactor.
   */
  experimental: {
    optimizePackageImports: ["simple-icons", "@phosphor-icons/react"],
  },

  images: {
    // No `localPatterns` here on purpose. The default is `[{ pathname: "/**", search: "" }]`,
    // which already matches /api/v1/poster/<token> — that is exactly why the token is a path
    // segment and not `?u=`, and the constraint is explained where it is enforced, in
    // lib/log/poster-src.ts. Spelling the default out again was config that changed nothing.
    //
    // Still only github.com, and /log posters still do not need an entry — but for a
    // different reason than before. They used to render through a plain <img> to avoid
    // this list; they now render through next/image pointed at /api/v1/poster, which is a
    // local path, so Next optimises them without any host appearing here. A poster can
    // still come from anywhere with no config edit. See lib/api/routes/poster.ts.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/**",
      },
    ],
  },

  /**
   * A project's route is its filename, so renaming the MDX renames the URL — and the old one
   * stops existing without anything on the page, in the build output or in the sitemap saying
   * so. `anna-dev-br.mdx` became `annamaria-app.mdx` when the domain moved, which retired
   * `/projects/anna-dev-br` from under every link already pointing at it.
   *
   * Permanent, because the move is: 308 tells a crawler to carry the old URL's history over to
   * the new one rather than treating it as a page that died and a page that appeared.
   *
   * Every future rename of a `content/` file needs a line here for the same reason.
   */
  async redirects() {
    return [
      {
        source: "/projects/anna-dev-br",
        destination: "/projects/annamaria-app",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
