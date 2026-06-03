/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. STATIC EXPORT CONFIGURATION
  output: 'export', 
  basePath: '/Mirror-me-App',
  assetPrefix: '/Mirror-me-App/',
  images: {
    unoptimized: true, // GitHub Pages does not support the default Next.js Image optimization server
  },

  /* 2. COMPILER ENGINE & OPTIMIZATION */
  reactStrictMode: true,
  swcMinify: true,
  
  /* 3. EXTERNAL RESOURCE DOMAINS */
  // (Your existing remotePatterns configuration stays here)
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mirror-me-media-vault.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mirror-me-media-vault.s3.*.amazonaws.com',
        port: '',
        pathname: '/**',
      }
    ],
  },

  /* 4. STRICT STRUCTURAL DEPLOYMENT GUARDRAILS */
  typescript: {
    ignoreBuildErrors: false, 
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;

module.exports = nextConfig;
