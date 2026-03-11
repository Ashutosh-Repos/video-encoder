import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Updated from 'domains' to 'remotePatterns' (Next.js 16 standard)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
      },
    ],
  },
  experimental: {
    // This prevents Turbopack/Webpack from trying to bundle native Node modules
    serverComponentsExternalPackages: [
      "worker_threads",
      "ffmpeg",
      "workerpool",
    ],
  },
};

export default nextConfig;
