/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    if (process.env.FRONTEND_PROXY_API === 'true') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5088/api/:path*',
        },
      ]
    }

    return []
  },
}

export default nextConfig
