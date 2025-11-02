/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // i18n configuration for Pages Router
  // Note: If migrating to App Router, use next-intl or similar instead
  i18n: {
    // Idiomas soportados
    locales: ['es', 'en', 'fr'],
    // Idioma por defecto
    defaultLocale: 'es',
  },
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
    qualities: [75, 85],
  },
  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },
};

module.exports = nextConfig;
