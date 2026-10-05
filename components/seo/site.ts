/**
 * Dominio público del sitio y utilidades de URL para SEO (docs/auditoria, S1 y S4).
 *
 * `NEXT_PUBLIC_SITE_URL` en Vercel llegó a estar mal escrito (`lasfueres.org`, sin la "t") y
 * rompió canonical, og:url e imagen. Por eso solo se confía en la variable si su host termina en
 * `lasfuertes.org`; si no, se usa el valor por defecto. Un error de variable ya no rompe el SEO.
 */
export const SITE_URL_POR_DEFECTO = 'https://www.lasfuertes.org';

export function resolverSiteUrl(valor: string | undefined): string {
  if (!valor) return SITE_URL_POR_DEFECTO;
  try {
    const url = new URL(valor);
    const host = url.hostname;
    if (host === 'lasfuertes.org' || host.endsWith('.lasfuertes.org')) {
      return url.origin;
    }
  } catch {
    // valor que no es una URL: se ignora
  }
  return SITE_URL_POR_DEFECTO;
}

export const SITE_URL = resolverSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const LOCALES = ['es', 'en', 'fr'] as const;
export type SiteLocale = (typeof LOCALES)[number];

/** Formato de `og:locale`: idioma_REGIÓN. */
export const OG_LOCALE: Record<SiteLocale, string> = {
  es: 'es_CO',
  en: 'en_US',
  fr: 'fr_FR',
};

/** URL absoluta de una ruta (`/` o `/terminos`) en un idioma. El español es el idioma por defecto
 * y no lleva prefijo. */
export function urlDe(ruta: string, locale: SiteLocale): string {
  const prefijo = locale === 'es' ? '' : `/${locale}`;
  const limpia = ruta === '/' ? '' : ruta;
  return `${SITE_URL}${prefijo}${limpia}` || SITE_URL;
}
