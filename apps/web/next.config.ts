import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/cms/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
      {
        source: '/api/media/:path*',
        destination: 'http://localhost:3000/api/media/:path*',
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
