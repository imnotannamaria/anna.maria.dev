import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

/** Points next-intl at where the language and the messages of a page come from. */
const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts")

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
    // Not `inlineCss`, although PageSpeed flags the two stylesheet requests as render-blocking.
    // Measured on the home page, it put the 21 KB gzipped sheet into the HTML three times over
    // (the <style> plus the RSC payload), taking the HTML from 45 KB to 106 KB gzipped — more
    // bytes on the critical path than the request it saves, and again on every navigation.
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
  /**
   * The headers a browser should get from every address, the ones that cannot break a page:
   * no sniffing of a response's type, no framing of the site by another one (the admin and the
   * postcard are actions a framed page could trick someone into), and a Referer that leaves
   * only the origin when a visitor follows a link out. A Content-Security-Policy is not here
   * on purpose: it needs a pass over every script, font and image host the pages use, and a
   * policy written blind blocks one of them.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ]
  },

  async redirects() {
    return [
      // v3 renamed two sections. Permanent, so a crawler carries the old URL's history over.
      { source: "/about", destination: "/person", permanent: true },
      { source: "/blog", destination: "/notes", permanent: true },
      { source: "/blog/:slug", destination: "/notes/:slug", permanent: true },
      // Notes taken down. Their addresses go to the list instead of to a 404.
      ...[
        "accessibility-of-a-hosted-auth-ui",
        "auditing-accessibility-in-a-codebase-that-already-cares",
        "i-build-the-tools-i-wish-existed",
        "spreadsheets-arent-the-problem",
      ].flatMap((slug) => [
        { source: `/notes/${slug}`, destination: "/notes", permanent: true },
        { source: `/pt/notes/${slug}`, destination: "/pt/notes", permanent: true },
      ]),
      {
        source: "/projects/anna-dev-br",
        destination: "/projects/annamaria-app",
        permanent: true,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
