import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**', 
      },
    ]
  },
  // Add module transpilation for ioredis to improve compatibility
  transpilePackages: ['ioredis'],
  // Configure webpack to handle ioredis correctly
  webpack: (config, { isServer, dev }) => {
    // Handle ioredis properly for edge middleware
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
