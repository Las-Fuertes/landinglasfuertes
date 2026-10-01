'use client';

import { useTranslation } from '../../hooks/useTranslation';
import { FadeIn } from './fade-in';
import { Garabato } from './garabato';
import SumateHero from './sumate-hero';
import ProyectoDestacado from './proyecto-destacado';
import ComoAyudar from './como-ayudar';
import Testimonio from './testimonio';
import Difunde from './difunde';
import { FEATURED_PROJECT, SEDE_MAPA_URL } from './sumate.data';

/** Hay campaña con foto o con meta: entonces se muestra la tarjeta del proyecto destacado. */
const HAY_PROYECTO =
  Boolean(FEATURED_PROJECT.imageSrc) ||
  (FEATURED_PROJECT.goalCop > 0 && FEATURED_PROJECT.raisedCop >= 0);

/**
 * Todo lo de "Súmate a Las Fuertes" dentro del modal (`sumate-drawer.tsx`), según Figma
 * `1300:1865` (docs/sumate-drawer/DECISIONES.md, D3): un cielo de garabatos (nubes, sol, pájaros)
 * sobre el título, "¿Cómo quieres ayudar?" con sus tarjetas de borde rasgado, Difunde y una
 * despedida con el sello de olas. Una columna de 923 px como máximo (el panel de Figma).
 *
 * Las medidas `lg:` salen del frame de 1290 px; mobile y tablet no tienen frame y se derivan.
 */
export default function SumateContenido() {
  const { t } = useTranslation();

  return (
    <div className="relative mx-auto flex w-full max-w-[57.6875rem] flex-col items-center px-6 pb-xxl pt-[8.5rem] min-[380px]:px-page-margin md:pt-[10rem] lg:px-0 lg:pt-[14.5rem]">
      {/* Cielo (Figma: nubes 1300:1899 y 1300:1900, sol 1300:1882, pájaros 1300:1860 a 1862).
          En lg, cada pieza en su sitio del frame, contado desde el borde de la columna. */}
      <Garabato
        src="/images/sumate/nube-chica.svg"
        ancho={80}
        alto={32}
        className="left-6 top-xl w-14 md:left-xl md:w-[4.25rem] lg:left-[1.3rem] lg:top-[3.25rem] lg:w-[5rem]"
        vaiven={{ x: [0, 8, 0] }}
        duracion={5.5}
      />
      <Garabato
        src="/images/sumate/nube-grande.svg"
        ancho={121}
        alto={51}
        className="left-[24%] top-[4.75rem] w-[5.25rem] md:top-[5.5rem] md:w-[6.25rem] lg:left-[11.6rem] lg:top-[7.25rem] lg:w-[7.5rem]"
        vaiven={{ x: [0, -10, 0] }}
        duracion={6}
      />
      <Garabato
        src="/images/welcome/pink-sun.svg"
        ancho={147}
        alto={141}
        className="left-[46%] top-l w-[4.75rem] md:left-auto md:right-[30%] md:w-[6rem] lg:left-[25.25rem] lg:right-auto lg:top-[3.375rem] lg:w-[7.4rem]"
        vaiven={{ rotate: [0, 4, 0], y: [0, -5, 0] }}
        duracion={4.5}
      />
      <Garabato
        src="/images/sumate/pajaros.svg"
        ancho={98}
        alto={72}
        className="right-6 top-[5.5rem] w-[3.75rem] md:right-xl md:top-[6.5rem] md:w-[5rem] lg:left-[52.2rem] lg:right-auto lg:top-[12.25rem] lg:w-[6.125rem]"
        vaiven={{ y: [0, -6, 0], x: [0, 4, 0] }}
        duracion={3.5}
      />

      <FadeIn className="w-full">
        <SumateHero />
      </FadeIn>

      {HAY_PROYECTO && (
        <FadeIn className="mt-xl w-full">
          <ProyectoDestacado />
        </FadeIn>
      )}

      <FadeIn className="mt-xxl w-full lg:mt-[5rem]">
        <ComoAyudar />
      </FadeIn>

      {/* Sin testimonio autorizado aún: el componente se oculta hasta tener cita y autor. */}
      <Testimonio />

      <FadeIn className="mt-xxl w-full lg:mt-[6rem]">
        <Difunde />
      </FadeIn>

      {/* Despedida (Figma 1300:1873, 1300:1874, 1300:2118 y 1425:978): sello rosa de borde rasgado
          con olas, el agradecimiento en la letra manuscrita del sitio y el enlace a la ubicación. */}
      <div className="mt-xl flex flex-col items-center text-center lg:mt-[3rem]">
        <span aria-hidden className="relative flex size-[5.8125rem] items-center justify-center">
          <span className="absolute inset-0 bg-pink-sol [filter:url(#map-rough-edge)]" />
          <img
            src="/images/sumate/sello-olas.svg"
            alt=""
            width={124}
            height={47}
            draggable={false}
            className="relative h-auto w-[7.75rem] max-w-none -translate-x-2 rotate-[2.07deg] select-none"
          />
        </span>
        <p className="mt-xl font-acento text-[1.25rem] leading-snug text-black">
          {t('sumate.despedida.gracias')}
        </p>
        <p className="mt-s max-w-[42rem] text-base leading-normal text-black md:text-[1.25rem]">
          {t('sumate.despedida.ubicacion')}{' '}
          <a
            href={SEDE_MAPA_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('sumate.despedida.ubicacionAria')}
            className="-my-3 inline-block py-3 font-bold underline underline-offset-2 transition hover:text-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-blue"
          >
            {t('sumate.despedida.ubicacionEnlace')}
          </a>
        </p>
      </div>
    </div>
  );
}
