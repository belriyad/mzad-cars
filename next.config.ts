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
      {
        protocol: "http",
        hostname: "174.165.78.29",
      },
    ],
  },
};

export default nextConfig;
