import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow HMR when opening the app via LAN IP instead of localhost
  allowedDevOrigins: ["192.168.1.14"],
  transpilePackages: ["@stoplight/elements", "@stoplight/elements-core"],
};

export default nextConfig;
