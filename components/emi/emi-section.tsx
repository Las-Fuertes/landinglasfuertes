'use client';

import { useRouter } from 'next/router';

import { PrinciplesSection } from '../principles';
import { PageGrid } from '../layout/page-grid';
import { FadeIn } from '../sumate/fade-in';
import { useTranslation } from '../../hooks/useTranslation';
import { renderTextWithBold } from '../../lib/render-text-with-bold';

/**
 * "Educación menstrual integral como mapa de cambio" (docs/emi/DECISIONES.md, D2). Antes era la
 * segunda mitad de Bienvenida; ahora es una sección propia, justo después del hero, y el slider
 * de principios es su segunda mitad. Figma: mobile 1288:913 (390 x 1034), desktop 1288:676
 * (1280 x 956).
 *
 * Entrada al hacer scroll con `FadeIn` por piezas, el texto primero: el chip, el título, los
 * párrafos y la cinta de "Así lo comprendimos nosotras:" (lenguaje de movimiento, reglas 1 y 2).
 * El slider trae su propia animación y no se envuelve.
 */
export default function EmiSection() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  // En francés la cinta no cabe en una línea a 390 con text-h3 (335 px de texto para 299 de
  // columna útil): bajo lg pasa a text-h4 con tracking-tighter (unos 296 px) y queda en una.
  const cintaMobile = locale === 'fr' ? 'text-h4 tracking-tighter' : 'text-h3 tracking-[-0.04em]';

  return (
    <section
      id="emi"
      className="relative w-full bg-cream pt-[3.25rem] lg:pt-[4.6875rem]"
      aria-labelledby="emi-title"
    >
      <PageGrid>
        <div className="col-span-4 flex flex-col items-center md:col-span-12">
          <FadeIn>
            {/* El chip rasgado del sitio, en el rosa del sol y sin las palomas de antes. */}
            <span className="map-chip map-chip--emi">
              <span className="block text-h1 font-bold leading-[2.15rem] tracking-[-0.04em] text-beige lg:text-[3.25rem] lg:leading-[2.8rem]">
                EMI
              </span>
            </span>
          </FadeIn>

          <FadeIn delay={0.08} className="mt-6 lg:mt-7">
            <h2
              id="emi-title"
              className="mx-auto max-w-[20rem] text-balance text-center text-h2 font-bold leading-8 tracking-[-0.04em] text-black lg:max-w-[40rem] lg:text-h1 lg:font-bold lg:leading-[1.2]"
            >
              {t('emi.title')}
            </h2>
          </FadeIn>

          <FadeIn delay={0.16} className="mt-[1.125rem] w-full lg:mt-9 lg:max-w-[50.375rem]">
            <div className="text-left text-base leading-[1.2] text-black lg:text-h4 lg:leading-[1.2]">
              <p>{renderTextWithBold(t('emi.paragraph1'))}</p>
              <p className="mt-[1.2em]">{renderTextWithBold(t('emi.paragraph2'))}</p>
            </div>
          </FadeIn>

          {/* Título del slider: la cinta negra con texto crema (chip rasgado, docs/PATTERNS.md).
              Va aquí y no dentro de components/principles; ver docs/emi/PROGRESS.md. */}
          <FadeIn delay={0.24} className="mb-m mt-[2.9375rem] lg:mt-[2.125rem]">
            <h3 id="principios" className="scroll-mt-xl text-center">
              <span className="map-chip map-chip--cinta">
                <span
                  className={`block font-bold leading-8 text-beige lg:text-[1.5625rem] lg:tracking-[-0.04em] ${cintaMobile}`}
                >
                  {t('emi.comprendimos')}
                </span>
              </span>
            </h3>
          </FadeIn>
        </div>
      </PageGrid>

      {/* Segunda mitad: el slider de principios (lo construye components/principles). */}
      <PrinciplesSection etiquetadoPor="principios" />
    </section>
  );
}
