import Head from 'next/head';
import { useTranslation } from '../../hooks/useTranslation';
import { LOCALES, OG_LOCALE, SITE_URL, urlDe, type SiteLocale } from './site';

type Props = {
  title: string;
  description: string;
  /** Ruta sin idioma: `/` o `/terminos`. */
  ruta: string;
};

/** Imagen para compartir. Pendiente de decisión (docs/auditoria, S10): hoy es la del hero. */
const OG_IMAGE_RUTA = '/images/hero-background-desktop-min.jpg';
const OG_IMAGE_ANCHO = '3840';
const OG_IMAGE_ALTO = '2160';

/**
 * Etiquetas de cabecera comunes (docs/auditoria, S4 y S9): title, description, canonical por
 * idioma, hreflang con x-default, Open Graph y Twitter. Todas las URLs salen de `SITE_URL`.
 */
export function SeoHead({ title, description, ruta }: Props) {
  const { t, locale } = useTranslation();
  const canonical = urlDe(ruta, locale as SiteLocale);
  const imagen = `${SITE_URL}${OG_IMAGE_RUTA}`;
  const alt = t('meta.ogImageAlt');

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={canonical} />
      {LOCALES.map(l => (
        <link key={`hl-${l}`} rel="alternate" hrefLang={l} href={urlDe(ruta, l)} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={urlDe(ruta, 'es')} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Las Fuertes" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={OG_LOCALE[locale as SiteLocale]} />
      {LOCALES.filter(l => l !== locale).map(l => (
        <meta key={`ogl-${l}`} property="og:locale:alternate" content={OG_LOCALE[l]} />
      ))}
      <meta property="og:image" content={imagen} />
      <meta property="og:image:width" content={OG_IMAGE_ANCHO} />
      <meta property="og:image:height" content={OG_IMAGE_ALTO} />
      <meta property="og:image:alt" content={alt} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imagen} />
      <meta name="twitter:image:alt" content={alt} />
    </Head>
  );
}
