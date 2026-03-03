/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pages Router configuration
  reactStrictMode: false,
  swcMinify: true,
  // Allow build to complete; run `npm run lint` and fix Prettier/CRLF separately
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  // Ensure proper error handling
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig
