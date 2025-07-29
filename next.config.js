/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    // Idiomas soportados
    locales: ['es', 'en', 'fr'],
    // Idioma por defecto
    defaultLocale: 'es',
    // Detectar automáticamente basado en Accept-Language header
    localeDetection: true,
  },
}

module.exports = nextConfig
