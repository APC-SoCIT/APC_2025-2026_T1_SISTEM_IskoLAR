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
      {
        protocol: 'https',
        hostname: 'qilnpygdsfyqirbqcxvt.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;