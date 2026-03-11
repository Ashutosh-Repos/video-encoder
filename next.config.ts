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
  serverExternalPackages: [
    "worker_threads",
    "ffmpeg",
    "workerpool",
    "chokidar",
  ],
};

export default nextConfig;
