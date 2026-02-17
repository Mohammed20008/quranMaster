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
  // Increase page data limit for large JSON files like quran.json
  experimental: {
    largePageDataBytes: 128 * 100000, // 12.8 MB (default is 128 KB)
  },
};

export default nextConfig;
