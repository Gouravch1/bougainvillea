/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    '192.168.29.84',
    'localhost:3000',
    '127.0.0.1:3000',
    '192.168.29.84:3000',
  ],
};

export default nextConfig
