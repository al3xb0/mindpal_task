import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rickandmortyapi.com',
      },
    ],
    // Cache optimised images on the server for 24 h.
    // Each unique avatar is fetched from rickandmortyapi.com only once per day;
    // subsequent requests are served from disk cache → no 429s.
    minimumCacheTTL: 86400,
  },
};

export default nextConfig;
