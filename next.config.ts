import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // Only for next/image. /log posters render through a plain <img> precisely so they
    // do not need an entry here — a poster can come from any host without a config edit.
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
