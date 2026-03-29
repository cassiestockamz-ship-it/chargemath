import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.chargemath.com" }],
        destination: "https://chargemath.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
