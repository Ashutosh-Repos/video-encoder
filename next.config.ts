import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // eslint: {
  //   // Warning: This allows production builds to successfully complete even if
  //   // your project has ESLint errors.
  //   ignoreDuringBuilds: true,
  // },
  images: {
    domains: ["res.cloudinary.com", "assets.aceternity.com"],
  },
  output: "standalone",
  // experimental: {
  //   serverActions: {
  //     bodySizeLimit: "100000mb", // Only needed if using Server Actions
  //   },
  // },
  // api: {
  //   bodyParser: {
  //     sizeLimit: "100000mb", // ⬅️ This fixes the "Body exceeded 1 MB" error
  //   },
  // },
};

export default nextConfig;
