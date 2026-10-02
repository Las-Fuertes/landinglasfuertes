/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Respaldo para lib/analytics.ts (docs/mixpanel/DECISIONES.md, D4): Mixpanel se activa con
  // NEXT_PUBLIC_VERCEL_ENV === 'production'. Así no depende de que Vercel tenga encendido
  // "Automatically expose System Environment Variables": VERCEL_ENV existe siempre en su build.
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV ?? '',
  },
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
  // Imágenes: señal a los rastreadores de IA de que no las usen (docs/aviso/DECISIONES.md, D2).
  // Solo en las respuestas de imágenes; el HTML queda sin la cabecera, para que el texto de la
  // fundación sí se pueda leer e indexar. Ojo: en local (`next dev` y `next start`) el
  // optimizador `/_next/image` responde antes de aplicar estas cabeceras; en Vercel se aplican
  // en su capa de rutas, y hay que comprobarlo en el preview con curl.
  async headers() {
    const noIA = [{ key: 'X-Robots-Tag', value: 'noimageai, noai' }];
    return [
      { source: '/images/:path*', headers: noIA },
      { source: '/_next/image', headers: noIA },
    ];
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
