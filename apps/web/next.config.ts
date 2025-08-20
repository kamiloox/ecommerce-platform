import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiBaseUrl) {
      throw new Error('NEXT_PUBLIC_API_URL environment variable is required');
    }
    return [
      {
        source: '/cms/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
      {
        source: '/api/media/:path*',
        destination: `${apiBaseUrl}/api/media/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: 'picsum.photos',
      },
      {
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
