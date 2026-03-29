import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.18.58",
    "192.168.18.52",
    "localhost",
    "127.0.0.1",
  ],
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: "http://174.165.78.29:8090/api/:path*",
      },
      // Proxy backend images so Vercel's image optimizer never hits a bare HTTP IP.
      // Usage: /_img/some/path  →  http://174.165.78.29:8090/some/path
      {
        source: "/_img/:path*",
        destination: "http://174.165.78.29:8090/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "content.mzadqatar.com",
      },
      {
        protocol: "https",
        hostname: "files.qatarliving.com",
      },
      {
        protocol: "https",
        hostname: "*.qatarliving.com",
      },
      // Images coming through the /_img proxy are served from the same origin,
      // so no remote pattern is needed for the bare IP any more.
    ],
  },
};

export default nextConfig;
