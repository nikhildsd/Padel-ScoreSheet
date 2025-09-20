import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper trailing slash handling for Vercel
  trailingSlash: false,
  // Ensure images are properly handled
  images: {
    unoptimized: false,
  },
};

export default nextConfig;
