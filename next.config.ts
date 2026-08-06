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
}

export default nextConfig
