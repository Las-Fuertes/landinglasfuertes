'use client';

import Image from 'next/image';
import { Homemade_Apple } from 'next/font/google';
import { type RefObject, useEffect, useRef } from 'react';
import { crearReposoBienvenida } from '../intro/bienvenida.motion';
import { PageGrid } from '../layout/page-grid';
import { useTranslation } from '../../hooks/useTranslation';
import { renderTextWithBold } from '../../lib/render-text-with-bold';
import { DecorDesktop } from './decor-desktop';
import { IlustracionPlaya } from './ilustracion-playa';
import { SolRosado } from './sol-rosado';

const homemadeApple = Homemade_Apple({
  subsets: ['latin'],
  weight: ['400'],
});

/**
 * Movimiento en reposo de Bienvenida (docs/introduccion/DECISIONES.md, D6 y D7): los rayos
 * del sol giran despacio, el pelo de la mujer se mece desde la nuca y las gaviotas suben y bajan. Mismas condiciones que la intro animada (el
 * atributo que pone `pages/_document.tsx`: sin `prefers-reduced-motion` ni `#hash` al cargar),
 * congelado con `?quieto=1`, y en pausa fuera de pantalla o con la pestaña oculta.
 */
function useReposoBienvenida(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const seccion = ref.current;
    if (!seccion || !document.documentElement.hasAttribute('data-intro-anima')) return;
    if (new URLSearchParams(window.location.search).get('quieto') === '1') return;
    const r = crearReposoBienvenida(seccion);
    let visible = false;
    const actualizar = () => (visible && !document.hidden ? r.reanudar() : r.pausar());
    actualizar();
    // El margen de 1 px hace que tocar el borde cuente como fuera: con la página arriba del todo,
    // Bienvenida empieza justo en el borde inferior de la pantalla.
    const io = new IntersectionObserver(
      ([en]) => {
        visible = !!en?.isIntersecting;
        actualizar();
      },
      { rootMargin: '-1px 0px -1px 0px' }
    );
    io.observe(seccion);
    document.addEventListener('visibilitychange', actualizar);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', actualizar);
      r.detener();
    };
  }, [ref]);
}

/**
 * "Bienvenidx a Las Fuertes". Es un paso más de la Introducción: desde la parte 3, la intro la
 * trae con su coreografía (`components/intro/bienvenida.motion.ts`), y para eso cada pieza lleva
 * `data-rol`. Sin pasar por la intro (hash, recarga a media página, reduced-motion) se ve
 * quieta, en su estado final.
 */
export default function WelcomeSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  useReposoBienvenida(ref);

  return (
    <section
      ref={ref}
      id="bienvenida"
      // Destino de "Saltar animación", que le pone tabindex=-1 y el foco: sin contorno de foco.
      className="relative w-full pb-16 pt-10 outline-none lg:pt-[3.25rem]"
      aria-labelledby="welcome-title"
    >
      {/* Desktop: nubes y gaviotas en el sitio del frame 1280:9 de Figma. */}
      <DecorDesktop />

      <PageGrid className="mb-10 lg:mb-[3.75rem]">
        <div className="relative col-span-4 mx-auto flex min-h-[9rem] w-full max-w-lg items-start justify-center md:col-span-12">
          {/* Nube izquierda (mobile y tablet): un 25 % fuera del borde, 24 px bajo el centro. */}
          <div
            className="pointer-events-none absolute left-0 top-1/2 z-0 w-[clamp(5.5rem,38vw,9rem)] -translate-x-[50%] translate-y-[calc(-50%+24px)] lg:hidden"
            aria-hidden
          >
            <div className="relative aspect-[154/65] w-full" data-rol="nube">
              <Image
                src="/images/welcome/left-cloud.svg"
                alt=""
                fill
                className="object-contain object-left"
                sizes="(max-width: 768px) 38vw, 9rem"
              />
            </div>
          </div>

          {/* Sun */}
          <div className="relative z-10 mx-auto w-[clamp(6.5rem,42vw,9rem)] shrink-0 lg:w-[9.45rem]">
            <SolRosado />
          </div>

          {/* Nube derecha (mobile y tablet): un 10 % fuera del borde, 24 px sobre el centro. */}
          <div
            className="pointer-events-none absolute right-0 top-1/2 z-0 w-[clamp(5rem,34vw,8rem)] translate-x-[40%] translate-y-[calc(-50%-24px)] lg:hidden"
            aria-hidden
          >
            <div className="relative aspect-[110/45] w-full" data-rol="nube">
              <Image
                src="/images/welcome/right-cloud.svg"
                alt=""
                fill
                className="object-contain object-right"
                sizes="(max-width: 768px) 34vw, 8rem"
              />
            </div>
          </div>
        </div>
      </PageGrid>

      <PageGrid>
        <div className="col-span-4 mx-auto w-full max-w-md text-center md:col-span-12 md:max-w-2xl">
          <h2
            id="welcome-title"
            data-rol="texto"
            className="text-[40px] font-bold leading-none text-black md:text-[52px] lg:whitespace-nowrap lg:text-display"
          >
            {/* En desktop, una sola línea (Figma 1280:9). */}
            <span className="block lg:inline">{t('welcome.titleLine1')}</span>{' '}
            <span className="block lg:inline">{t('welcome.titleLine2')}</span>
          </h2>

          <p
            data-rol="texto"
            className={`${homemadeApple.className} mt-7 text-[clamp(1rem,4vw,1.125rem)] font-normal leading-snug text-blue lg:mt-[1.875rem] lg:text-p-md`}
          >
            {t('welcome.subtitle')}
          </p>

          <div
            className="relative mx-auto mt-3 h-[6px] w-full max-w-[220px] lg:mt-s"
            data-rol="garabato"
          >
            <Image
              src="/images/welcome/subtitle-underline.svg"
              alt=""
              fill
              className="object-contain object-center"
              sizes="220px"
            />
          </div>

          <p
            data-rol="texto"
            className="mt-8 text-left text-[16px] font-normal leading-tight text-black md:text-center md:text-[19px] md:leading-snug lg:mx-auto lg:mt-[1.8125rem] lg:max-w-[36.0625rem] lg:text-left lg:text-base lg:leading-[1.2]"
          >
            {renderTextWithBold(t('welcome.body'))}
          </p>
        </div>
      </PageGrid>

      {/* Ancho completo: la sección no tiene márgenes laterales. En desktop se limita para que
          la ilustración no crezca de más en pantallas anchas. */}
      <IlustracionPlaya />

      <PageGrid className="mt-36 md:mt-16">
        <div
          className="col-span-4 md:col-span-10 md:col-start-2"
          data-rol="emi"
          role="region"
          aria-labelledby="welcome-emi-title"
        >
          <div className="flex flex-col items-center text-center">
            <div className="relative mx-auto aspect-[123/59] w-full max-w-[7.6875rem] shrink-0">
              <Image
                src="/images/welcome/emi-dove.svg"
                alt="EMI"
                fill
                className="object-contain"
                sizes="154px"
              />
            </div>
            <h3
              id="welcome-emi-title"
              className="mt-6 text-center text-[clamp(1.25rem,4vw,1.75rem)] font-bold leading-tight text-black md:mt-8 lg:text-[2rem]"
            >
              {t('welcome.emiTitle')}
            </h3>
          </div>
          <p className="mx-auto mt-6 max-w-3xl text-left text-[16px] font-normal leading-tight text-black md:mt-8 md:text-[18px] md:leading-snug lg:text-[20px]">
            {renderTextWithBold(t('welcome.emiParagraph1'))}
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-left text-[16px] font-normal leading-tight text-black md:text-[18px] md:leading-snug lg:text-[20px]">
            {renderTextWithBold(t('welcome.emiParagraph2'))}
          </p>
        </div>
      </PageGrid>
    </section>
  );
}
