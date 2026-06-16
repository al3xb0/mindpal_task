import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rickandmortyapi.com',
      },
    ],
    // Avatars are already small, CDN-served 300x300 jpegs, so server-side
    // optimisation adds no value. Proxying every one through /_next/image
    // floods the upstream API and triggers 429s on scroll. Serve them
    // directly from the CDN instead.
    unoptimized: true,
  },
};

export default nextConfig;
