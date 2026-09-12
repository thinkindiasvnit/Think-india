import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary — used for all user-uploaded photos
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // Unsplash — used as placeholder/fallback images
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // Firebase Storage (in case photos are served directly from GCS)
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
    ],
  },
  // Optimize for better performance and SEO
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Enable strict mode for better React practices
  reactStrictMode: true,
};

export default nextConfig;
