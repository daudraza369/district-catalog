/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
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
