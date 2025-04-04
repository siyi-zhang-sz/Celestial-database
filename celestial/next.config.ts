/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:50000/:path*', // <- Match exactly
      },
    ];
  },
};

module.exports = nextConfig;
