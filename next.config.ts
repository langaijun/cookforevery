import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { applyDashscopeApiKeyPreferDotenv } from './lib/dashscope-env-prefer-dotenv';

applyDashscopeApiKeyPreferDotenv();

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
  // Force disable all caching for Railway builds
  webpack: (config, { dev }) => {
    // Disable webpack cache completely
    config.cache = false;

    // Force rebuild by changing build ID
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    };

    return config;
  },
  // Disable static optimization cache
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  // Allow images from Railway domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.railway.app',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
