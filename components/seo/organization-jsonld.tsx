import Head from 'next/head';
import { useTranslation } from '../../hooks/useTranslation';
import { SITE_URL, urlDe, type SiteLocale } from './site';

/**
 * Datos estructurados de la fundación (docs/auditoria, S8). Solo datos que ya están en el repo:
 * nombre, correo y redes del footer. No incluye NIT ni dirección postal.
 */
export function OrganizationJsonLd() {
  const { t, locale } = useTranslation();
  const datos = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: 'Fundación Las Fuertes',
    alternateName: 'Las Fuertes',
    url: urlDe('/', locale as SiteLocale),
    logo: `${SITE_URL}/images/footer/logo.svg`,
    description: t('meta.description'),
    areaServed: 'CO',
    email: 'fundacionlasfuertes@gmail.com',
    sameAs: [
      'https://www.instagram.com/las.fuertes/',
      'https://www.linkedin.com/company/fundaci%C3%B3n-las-fuertes/',
    ],
  };

  return (
    <Head>
      <script
        key="jsonld-organization"
        type="application/ld+json"
        // `<` escapado para que ningún texto cierre el script.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, '\\u003c') }}
      />
    </Head>
  );
}
