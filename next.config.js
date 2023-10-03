const { i18n } = require('./next-i18next.config');
// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   openAnalyzer: process.env.ANALYZE === 'true',
// });

const STORE_ID = process.env.BLOB_READ_WRITE_TOKEN?.match(
  /^vercel_blob_rw_([a-z0-9]+)_[a-z0-9]+$/i,
)?.[1].toLowerCase();

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  reactStrictMode: true,
  images: {
    imageSizes: [200, 400, 1050],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: `${STORE_ID}.public.blob.vercel-storage.com`,
        port: '',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 31536000,
  },
  // TODO：edge环境需要移除这个包
  // experimental: {
  //   serverComponentsExternalPackages: ['bcrypt'],
  // },
  webpack(config, { isServer, dev }) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};

// module.exports = withBundleAnalyzer(nextConfig);
module.exports = nextConfig;
