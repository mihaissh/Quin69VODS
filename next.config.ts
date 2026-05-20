import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "cdn.betterttv.net" },
      { protocol: "https", hostname: "cdn.frankerfacez.com" },
      { protocol: "https", hostname: "static.twitchcdn.net" },
      { protocol: "https", hostname: "*.7tv.io" },
    ],
  },
  // Allow YouTube embeds
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
