/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow Cloudinary images
  images: {
    domains: ["res.cloudinary.com"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
  },

  // Don’t block build on ESLint errors
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Don’t block build on TypeScript errors
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optional: enable experimental features
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
