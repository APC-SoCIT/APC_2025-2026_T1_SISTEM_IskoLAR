import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dpzjgeyadwuhedfzgsec.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/attachments/**',
      },
    ],
  },
  eslint: {
    // This allows production builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
