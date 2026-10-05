import { useTranslation } from '../hooks/useTranslation';
import { IntroSection } from '../components/intro';
import { ImpactoSection } from '../components/impacto';
import { WelcomeSection } from '../components/welcome';
import { EmiSection } from '../components/emi';
import { DonationsSection } from '../components/donations';
import { EducationMapSection } from '../components/education-map';
import { SumateDrawer, SumateDrawerProvider, SumateFlotante } from '../components/sumate';
import { QuienesSomosSection } from '../components/quienes-somos';
import Footer from '../components/layout/footer';
import LanguageSwitcher from '../components/layout/language-switcher';
import VolverArriba from '../components/layout/volver-arriba';
import { OrganizationJsonLd, SeoHead } from '../components/seo';
import { useSeccionesVistas } from '../lib/use-secciones-vistas';

export default function Home() {
  const { t } = useTranslation();
  useSeccionesVistas();

  return (
    <>
      <SeoHead title={t('meta.title')} description={t('meta.description')} ruta="/" />
      <OrganizationJsonLd />

      <LanguageSwitcher />

      {/* El orden de la página vive aquí, no dentro de <Hero />. Súmate ya no es una sección:
          es un drawer que abren Donaciones, el footer y el botón flotante.
          Ver docs/sumate-drawer/DECISIONES.md (D1, D2). */}
      <SumateDrawerProvider>
        <main id="contenido" tabIndex={-1} className="min-h-screen outline-none">
          <h1 className="sr-only">{t('meta.h1')}</h1>
          <div className="relative min-h-screen overflow-x-clip bg-beige">
            <IntroSection />
            <WelcomeSection />
            {/* EMI contiene el slider de principios (docs/emi/DECISIONES.md, D2). */}
            <EmiSection />
            <DonationsSection />
            <EducationMapSection />
            <ImpactoSection />
            <QuienesSomosSection />
          </div>
        </main>

        <Footer />

        <SumateFlotante />
        {/* Volver arriba: solo en la home (docs/navegacion/DECISIONES.md, D6). */}
        <VolverArriba />
        <SumateDrawer />
      </SumateDrawerProvider>
    </>
  );
}
