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
    // Skip Vercel's image optimizer — images are served directly from the CDN
    // (content.mzadqatar.com / files.qatarliving.com). This avoids the 502
    // that occurs when Vercel's optimizer tries to fetch external images.
    unoptimized: true,
  },
};

export default nextConfig;
