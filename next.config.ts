import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lmmxgiolcmdmtxjmgntl.supabase.co',
        pathname: '/storage/v1/object/public/postcard-images/**',
      },
    ],
  },
};

export default nextConfig;