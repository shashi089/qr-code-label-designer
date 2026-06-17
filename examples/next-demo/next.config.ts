import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["qrlayout-ui", "qrlayout-core"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
