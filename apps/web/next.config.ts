import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/cms/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
