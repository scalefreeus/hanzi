/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/hanzi' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/hanzi' : '',
  trailingSlash: true,
};

export default nextConfig;
