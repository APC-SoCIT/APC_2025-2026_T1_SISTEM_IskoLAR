import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dpzjgeyadwuhedfzgsec.supabase.co', // <-- Comma was missing here
        port: '',
        pathname: '/storage/v1/object/public/attachments/**',
      },
    ],
  },
};

export default nextConfig;