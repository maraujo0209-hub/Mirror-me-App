/** @type {import('next').NextConfig} */
const nextConfig = {
  /* 1. COMPILER ENGINE & OPTIMIZATION CONFIGURATIONS */
  reactStrictMode: true,         // Highlights potential runtime execution leaks in development
  swcMinify: true,              // Employs high-speed Rust-based compiler for asset bundling
  
  /* 2. EXTERNAL RESOURCE DOMAINS (REMOTE IMAGES IMAGING PIPELINE) */
  images: {
    formats: ['image/avif', 'image/webp'], // Optimize media load footprints over modern networks
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mirror-me-media-vault.s3.amazonaws.com', // Links straight to AWS bucket
        port: '',
        pathname: '/**', // Allows recursive asset matching under all nested directories
      },
      {
        protocol: 'https',
        hostname: 'mirror-me-media-vault.s3.*.amazonaws.com', // Handles regional routing subdomains
        port: '',
        pathname: '/**',
      }
    ],
  },

  /* 3. STRICT STRUCTURAL DEPLOYMENT GUARDRAILS */
  typescript: {
    // Enforces complete verification profiles before staging assets to live target clusters
    ignoreBuildErrors: false, 
  },
  eslint: {
    // Rejects production bundling if linting quality protocols fail
    ignoreDuringBuilds: false,
  },

  /* 4. TRAFFIC HEADERS SECURITY REWRITE INJECTIONS */
  async headers() {
    return [
      {
        // Enforce strict browser execution policies to all active platform endpoints
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // Leverage aggressive browser asset caching
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
