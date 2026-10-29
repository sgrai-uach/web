import type { NextConfig } from "next";

const apiBackendUrl =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

const pwaTerrenoUrl =
  process.env.INTERNAL_PWA_URL ||
  process.env.NEXT_PUBLIC_PWA_URL ||
  "http://localhost:3001";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBackendUrl}/api/:path*`,
      },
      {
        source: "/terreno",
        destination: `${pwaTerrenoUrl}/terreno`,
      },
      {
        source: "/terreno/:path*",
        destination: `${pwaTerrenoUrl}/terreno/:path*`,
      },
    ];
  },
};

export default nextConfig;
