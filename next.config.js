/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      path: false,
      fs: false,
      child_process: false,
      crypto: false,
      url: false,
    };
    return config;
  },
  reactStrictMode: false,
  swcMinify: true,
}

module.exports = nextConfig
