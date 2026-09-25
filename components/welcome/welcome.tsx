'use client';

import Image from 'next/image';
import { Homemade_Apple } from 'next/font/google';
import { type CSSProperties, type RefObject, useEffect, useRef } from 'react';
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
 * Escala de Bienvenida por alto en mobile y tablet (docs/introduccion/DECISIONES.md, D9). El hero
 * tiene que caber entero en la pantalla del celular: el texto conserva su tamaño y lo que se
 * encoge es el aire y las decoraciones. `--hero-k` vale 1rem desde 864 de alto (el frame 1278:2)
 * y baja en línea recta hasta 0,5rem a 568 (y no menos). Cada medida de Figma se escribe como
 * `calc(var(--hero-k) * N)`, con N en rem: a 864 o más es exactamente la de Figma. La ilustración
 * no usa `--hero-k`: ocupa el alto que sobra (ver `IlustracionPlaya`). En desktop (`lg`) nada
 * de esto aplica: cada clase tiene su `lg:` con la medida de antes.
 */
const ESCALA_ALTO = {
  '--hero-k': 'clamp(0.5rem, calc(0.5rem + (100dvh - 35.5rem) * 0.027), 1rem)',
} as CSSProperties;

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
      // Hero de una pantalla (docs/emi/DECISIONES.md, D1): al menos el alto dinámico de la
      // ventana, el texto arriba y la ilustración abajo. Si no cabe, crece en vez de solapar.
      className="relative flex min-h-dvh w-full flex-col pb-[calc(var(--hero-k)*3.3125)] pt-[calc(var(--hero-k)*2.5)] outline-none lg:pb-[3.625rem] lg:pt-[3.25rem]"
      style={ESCALA_ALTO}
      aria-labelledby="welcome-title"
    >
      {/* Desktop: nubes y gaviotas en el sitio del frame 1280:9 de Figma. */}
      <DecorDesktop />

      <PageGrid className="mb-[calc(var(--hero-k)*2.5)] lg:mb-[3.75rem]">
        <div className="relative col-span-4 mx-auto flex min-h-[calc(var(--hero-k)*9)] w-full max-w-lg items-start justify-center md:col-span-12 lg:min-h-[9rem]">
          {/* Nube izquierda (mobile y tablet): un 25 % fuera del borde, 24 px bajo el centro. */}
          <div
            className="pointer-events-none absolute left-0 top-1/2 z-0 w-[min(clamp(5.5rem,38vw,9rem),calc(var(--hero-k)*9))] -translate-x-[50%] translate-y-[calc(-50%+var(--hero-k)*1.5)] lg:hidden"
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
          <div className="relative z-10 mx-auto w-[min(clamp(6.5rem,42vw,9rem),calc(var(--hero-k)*9))] shrink-0 lg:w-[9.45rem]">
            <SolRosado />
          </div>

          {/* Nube derecha (mobile y tablet): un 10 % fuera del borde, 24 px sobre el centro. */}
          <div
            className="pointer-events-none absolute right-0 top-1/2 z-0 w-[min(clamp(5rem,34vw,8rem),calc(var(--hero-k)*8))] translate-x-[40%] translate-y-[calc(-50%-var(--hero-k)*1.5)] lg:hidden"
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
            className="text-[clamp(2rem,11vw,2.5rem)] font-bold leading-none text-black md:text-[52px] lg:whitespace-nowrap lg:text-display"
          >
            {/* En desktop, una sola línea (Figma 1280:9). */}
            <span className="block lg:inline">{t('welcome.titleLine1')}</span>{' '}
            <span className="block lg:inline">{t('welcome.titleLine2')}</span>
          </h2>

          <p
            data-rol="texto"
            className={`${homemadeApple.className} mt-[calc(var(--hero-k)*1.75)] text-[clamp(1rem,4vw,1.125rem)] font-normal leading-snug text-blue lg:mt-[1.875rem] lg:text-p-md`}
          >
            {t('welcome.subtitle')}
          </p>

          <div
            className="relative mx-auto mt-[calc(var(--hero-k)*0.75)] h-[6px] w-full max-w-[220px] lg:mt-s"
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
            className="mt-[calc(var(--hero-k)*2)] text-left text-[16px] font-normal leading-tight text-black md:text-center md:text-[19px] md:leading-snug lg:mx-auto lg:mt-[1.8125rem] lg:max-w-[36.0625rem] lg:text-left lg:text-base lg:leading-[1.2]"
          >
            {renderTextWithBold(t('welcome.body'))}
          </p>
        </div>
      </PageGrid>

      {/* Ancho completo: la sección no tiene márgenes laterales.
          Mobile y tablet (D9): la ilustración se queda con TODO el alto que sobra bajo el texto
          (`flex-1`, contenedor de tamaño) y dentro se escala para caber a lo ancho y a lo alto,
          sin deformarse; el aire mínimo bajo el texto escala con `--hero-k`. Las olas sangran
          hasta los bordes de la pantalla y aquí se recortan en horizontal.
          Desktop: como antes, `mt-auto` la ancla al fondo y el `lg:mt` de la ilustración es el
          aire mínimo bajo el texto (docs/emi/DECISIONES.md, D1).
          El contenedor de tamaño es una capa absoluta dentro del hueco flexible: Chrome evalúa
          `cqh` de un ítem flex con base 0 antes de repartir el alto (daba 0). */}
      <div className="relative mt-[calc(var(--hero-k)*2.5)] min-h-[7rem] w-full flex-1 lg:mt-auto lg:min-h-0 lg:flex-none">
        <div className="absolute inset-0 flex items-end overflow-x-clip [container-type:size] lg:static lg:block lg:overflow-x-visible lg:[container-type:normal]">
          <IlustracionPlaya />
        </div>
      </div>
    </section>
  );
}
