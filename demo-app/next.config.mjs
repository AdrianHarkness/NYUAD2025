/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    // This makes sure important env variables are available to client components
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    VERCEL: process.env.VERCEL,
  },
}

export default nextConfig
