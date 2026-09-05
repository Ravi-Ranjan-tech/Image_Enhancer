import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Image_Enhancer",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;