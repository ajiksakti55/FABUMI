/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    middlewarePrefetch: "flexible",
  },
  turbopack: {
    rules: {},
  },
  output: "standalone",
};

export default nextConfig;
