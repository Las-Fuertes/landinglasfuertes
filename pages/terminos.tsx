import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { PageGrid } from '../components/layout/page-grid';
import { Resaltado } from '../components/layout/resaltado';
import Footer from '../components/layout/footer';
import LanguageSwitcher from '../components/layout/language-switcher';
import { SumateDrawer, SumateDrawerProvider, SumateFlotante } from '../components/sumate';

/**
 * Secciones de la página y cuántos párrafos tiene cada una en `terminos.secciones.<id>.pN`.
 * El contenido sale de lo que el proyecto ya dice y hace (docs/navegacion/DECISIONES.md, D4).
 */
const SECCIONES = [
  { id: 'responsable', parrafos: 3 },
  { id: 'menores', parrafos: 4 },
  { id: 'cookies', parrafos: 3 },
  { id: 'donaciones', parrafos: 6 },
] as const;

/** El correo de la fundación, que los párrafos citan en texto plano y aquí se vuelve enlace. */
const CORREO = 'fundacionlasfuertes@gmail.com';

/** `**negrita**` y el correo de la fundación como enlace `mailto:`. */
function renderParrafo(texto: string): ReactNode[] {
  return texto.split(/(\*\*.*?\*\*|fundacionlasfuertes@gmail\.com)/g).map((parte, i) => {
    if (parte.startsWith('**') && parte.endsWith('**'))
      return <strong key={i}>{parte.slice(2, -2)}</strong>;
    if (parte === CORREO)
      return (
        <a
          key={i}
          href={`mailto:${CORREO}`}
          className="font-bold underline underline-offset-2 hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
        >
          {parte}
        </a>
      );
    return parte;
  });
}

export default function Terminos() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t('terminos.metaTitulo')}</title>
        <meta name="description" content={t('terminos.metaDescripcion')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <LanguageSwitcher />

      <SumateDrawerProvider>
        <main className="min-h-screen bg-beige text-black">
          {/* Cabecera azul con el mismo borde rasgado del footer. */}
          <header className="relative overflow-x-clip pb-xxl pt-[6.5rem] text-papel">
            <div
              aria-hidden
              className="absolute -inset-x-l -top-l bottom-0 bg-blue [filter:url(#footer-rough-edge)]"
            />
            <PageGrid className="relative">
              <div className="col-span-4 md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3">
                <Link
                  href="/"
                  aria-label={t('terminos.logoAria')}
                  className="inline-block rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-papel"
                >
                  <Image
                    src="/images/footer/logo.svg"
                    alt=""
                    width={185}
                    height={92}
                    priority
                    className="h-auto w-[7.5rem] md:w-[9.5rem]"
                  />
                </Link>
                <h1 className="mt-xl text-h1 font-bold leading-tight tracking-[-0.04em] md:text-[3.125rem]">
                  {t('terminos.titulo')}
                </h1>
                <p className="mt-s text-p-lg font-medium text-papel/80">
                  {t('terminos.actualizado')}
                </p>
              </div>
            </PageGrid>
          </header>

          <PageGrid className="pb-[8rem] pt-xxl">
            <div className="col-span-4 md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3">
              <p className="text-h4 leading-relaxed">{t('terminos.intro')}</p>

              {SECCIONES.map(({ id, parrafos }) => (
                <section key={id} id={id} aria-labelledby={`${id}-titulo`} className="mt-xxl">
                  <h2 id={`${id}-titulo`}>
                    <Resaltado
                      tono="negro"
                      className="text-h3 font-bold tracking-[-0.03em] md:text-h2 md:font-bold"
                    >
                      {t(`terminos.secciones.${id}.titulo`)}
                    </Resaltado>
                  </h2>
                  {Array.from({ length: parrafos }, (_, i) => (
                    <p key={i} className="mt-m leading-relaxed">
                      {renderParrafo(t(`terminos.secciones.${id}.p${i + 1}`))}
                    </p>
                  ))}
                </section>
              ))}
            </div>
          </PageGrid>
        </main>

        <Footer />

        <SumateFlotante />
        <SumateDrawer />
      </SumateDrawerProvider>
    </>
  );
}
