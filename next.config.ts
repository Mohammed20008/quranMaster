import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
  // Ensure JSON files are properly bundled
  webpack: (config, { isServer }) => {
    // Handle large JSON files
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });
    
    return config;
  },
  // Increase body size limit for large data
  experimental: {
    largePageDataBytes: 128 * 100000, // 12.8 MB
  },
};

export default nextConfig;
