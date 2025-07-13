/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  experimental: {
    serverComponentsExternalPackages: ['socket.io-client'],
  },
}

module.exports = nextConfig