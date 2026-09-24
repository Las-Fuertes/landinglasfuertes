'use client';

import { useRouter } from 'next/router';

import { PrinciplesSection } from '../principles';
import { PageGrid } from '../layout/page-grid';
import { Resaltado } from '../layout/resaltado';
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
/**
 * Geometría propia del sello sobre la variante etiqueta: fondo de 1,1 em, poco aire lateral y la
 * caja de antes (interlineado de 2,15 rem a 40 px y 2,8 rem a 52 px, 0,86, más 0,12 rem arriba y
 * abajo), para que el título de la sección quede donde estaba. `--hueco` compensa el margen que la
 * variante calcula para su fondo: el margen queda en 0,12 rem justos.
 */
const SELLO = {
  ['--aire-x' as string]: '0.15em',
  ['--fondo-alto' as string]: '1.1em',
  ['--linea' as string]: '0.86',
  ['--hueco' as string]: 'calc(0.12rem - 0.12em)',
};

export default function EmiSection() {
  const { t } = useTranslation();
  // La sigla se traduce (Johan, 2026-09-24): CME en inglés, EMI en español y francés. No hay una
  // clave de locale solo con la sigla, así que la elige el idioma de la ruta.
  const { locale } = useRouter();
  const sigla = locale === 'en' ? 'CME' : 'EMI';

  return (
    <section
      id="emi"
      className="relative w-full bg-cream pt-[3.25rem] lg:pt-[4.6875rem]"
      aria-labelledby="emi-title"
    >
      <PageGrid>
        <div className="col-span-4 flex flex-col items-center md:col-span-12">
          <FadeIn>
            {/* El resaltado del sitio como sello: rosa del sol, -4,09 grados y poco aire (Figma
                1288:913, caja de 79 x 44 a 40 px). */}
            <Resaltado
              tono="rosa"
              giro={-4.09}
              partir={false}
              className="text-h1 tracking-[-0.04em] lg:text-[3.25rem]"
              style={SELLO}
            >
              {sigla}
            </Resaltado>
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
              {/* Si no cabe en una línea (francés en mobile) se parte en dos piezas con la misma
                  letra: nunca se achica (docs/resaltado/DECISIONES.md, D1). */}
              <Resaltado className="text-h3 tracking-[-0.04em] lg:text-[1.5625rem]">
                {t('emi.comprendimos')}
              </Resaltado>
            </h3>
          </FadeIn>
        </div>
      </PageGrid>

      {/* Segunda mitad: el slider de principios (lo construye components/principles). */}
      <PrinciplesSection etiquetadoPor="principios" />
    </section>
  );
}
