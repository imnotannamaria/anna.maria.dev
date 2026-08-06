import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // KEEP IN SYNC with POSTER_HOSTS in lib/log/validation.ts. next/image throws at
    // runtime for an unlisted host, so the zod check is what keeps a bad paste in the
    // admin from becoming a broken page in production.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "image.tmdb.org", pathname: "/**" },
      { protocol: "https", hostname: "covers.openlibrary.org", pathname: "/**" },
      { protocol: "https", hostname: "i.scdn.co", pathname: "/**" },
      { protocol: "https", hostname: "image-cdn-ak.spotifycdn.com", pathname: "/**" },
    ],
  },
}

export default nextConfig
