import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from '../hooks/useTranslation';
import Hero from '../components/hero';
import { DonationsSection } from '../components/donations';
import { EducationMapSection } from '../components/education-map';
import { SumateSection } from '../components/sumate';
import Footer from '../components/layout/footer';
import LanguageSwitcher from '../components/layout/language-switcher';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '';

export default function Home() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const ogImage = `${SITE_URL}/images/hero-background-desktop-min.jpg`;

  // TEMPORAL: mientras se termina de trabajar la primera parte del sitio,
  // solo se muestra desde "Dirigir el cambio..." en adelante.
  // Con ?show=all se ve la experiencia completa. Quitar cuando esté lista.
  const showAll = router.asPath.includes('show=all');

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name="description" content={t('meta.description')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph / tarjetas al compartir */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Las Fuertes" />
        <meta property="og:title" content={t('meta.title')} />
        <meta property="og:description" content={t('meta.description')} />
        <meta property="og:locale" content={locale} />
        {SITE_URL && <meta property="og:url" content={SITE_URL} />}
        {SITE_URL && <meta property="og:image" content={ogImage} />}
        <meta name="twitter:card" content={SITE_URL ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title" content={t('meta.title')} />
        <meta name="twitter:description" content={t('meta.description')} />
        {SITE_URL && <meta name="twitter:image" content={ogImage} />}
      </Head>

      <LanguageSwitcher />

      <main className="min-h-screen">
        {showAll ? (
          <Hero />
        ) : (
          <div className="min-h-screen overflow-x-clip bg-beige pt-16">
            <DonationsSection />
            <EducationMapSection />
            <SumateSection />
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
