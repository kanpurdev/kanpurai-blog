import type { NextConfig } from "next";
const config: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
};
export default config;
