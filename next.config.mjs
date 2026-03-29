/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 828, 1080],
    imageSizes: [88, 176],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'db.districtflowers.com',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig;
