import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["res.cloudinary.com", "assets.aceternity.com"],
  },
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
