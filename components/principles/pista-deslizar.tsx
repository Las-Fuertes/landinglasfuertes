'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Homemade_Apple } from 'next/font/google';
import type { Swiper as SwiperClass } from 'swiper';

import { useTranslation } from '../../hooks/useTranslation';

/**
 * Pista de "desliza" del slider de estampillas (docs/emi/DECISIONES.md, D4; elección de Johan
 * del 2026-09-25: la mezcla de las opciones A y B). Un solo gesto en tres tiempos:
 *
 * 1. El texto llega primero (regla 2): "desliza" se escribe de izquierda a derecha en la letra
 *    manuscrita del sitio (Homemade Apple), 0,9 s.
 * 2. La flecha curva, dibujada a mano, se traza desde la palabra hacia la izquierda (pathLength,
 *    que framer-motion lleva con stroke-dashoffset), 0,9 s solapada con el texto, y la punta se
 *    marca al final, 0,3 s.
 * 3. Justo al cerrar la punta, la estampilla de enfrente hace lo que la flecha dice: anticipación
 *    a la derecha, tirón a la izquierda con -4°, vuelta con un pequeño sobrepaso (seguimiento) y
 *    reposo exacto, 1,5 s. La flecha acompaña el mismo tirón con los mismos tiempos (6 px), para
 *    que se lean como un solo gesto y no como dos cosas que compiten.
 *
 * Después el amago (estampilla y flecha juntas) se repite a los 1,8 s de cada cambio de
 * estampilla (la transición del mazo dura 1 s) y luego cada 4,2 s: cae una vez entre dos avances
 * del autoplay (4,5 s). Nada se mueve fuera de pantalla.
 *
 * El amago se hace con la Web Animations API sobre `[data-estampilla-cuerpo]`, el hijo de cada
 * slide que envuelve la imagen: el slide lo mueve el efecto mazo; el cuerpo no tiene transform
 * propio, así que el amago se suma a la pose sin pelearse con él. Si la persona agarra el mazo a
 * mitad de un amago, el cuerpo vuelve a su sitio en 200 ms desde donde esté.
 *
 * Cuando `visible` pasa a false (primer uso del slider) se funde en 0,45 s y SIGUE MONTADA
 * ocupando su hueco: el layout no se mueve. Con prefers-reduced-motion aparece ya dibujada, quieta
 * y sin amago. Es decorativa (aria-hidden en el hueco): las instrucciones para lectores de
 * pantalla van en `principles.instrucciones`.
 */

const letraManuscrita = Homemade_Apple({ subsets: ['latin'], weight: ['400'] });

const AMAGO_MS = 1500;
const ESPERA_TRAS_CAMBIO_MS = 1800;
const CICLO_MS = 4200;

/** Tiempos del gesto, compartidos por la estampilla y la flecha. */
const TIEMPOS = [0, 0.14, 0.45, 0.74, 0.87, 1] as const;
const CURVAS = [
  'ease-in-out',
  'cubic-bezier(0.3, 0, 0.2, 1)',
  'cubic-bezier(0.45, 0, 0.3, 1)',
  'ease-in-out',
  'ease-in-out',
];
const ESTAMPILLA = [
  'none',
  'translateX(2%) rotate(0.8deg)',
  'translateX(-9%) rotate(-4deg)',
  'translateX(1.2%) rotate(0.6deg)',
  'translateX(-0.4%) rotate(-0.2deg)',
  'none',
];
const FLECHA = [
  'none',
  'translateX(0.1rem)',
  'translateX(-0.4rem)',
  'translateX(0.05rem)',
  'none',
  'none',
];

type Fotogramas = NonNullable<Parameters<HTMLElement['animate']>[0]>;
const fotogramas = (transforms: string[], origen?: string): Fotogramas =>
  transforms.map((transform, i) => ({
    offset: TIEMPOS[i],
    transform,
    ...(origen && { transformOrigin: origen }),
    ...(CURVAS[i] && { easing: CURVAS[i] }),
  }));

/** Vuelve a reposo desde donde esté, sin salto. */
function devolver(animacion: Animation | null) {
  if (!animacion || animacion.playState !== 'running') return;
  const el = (animacion.effect as KeyframeEffect | null)?.target as Element | null;
  const desde = el ? getComputedStyle(el).transform : 'none';
  animacion.cancel();
  el?.animate([{ transform: desde }, { transform: 'none' }], { duration: 200, easing: 'ease-out' });
}

type Props = {
  swiper: SwiperClass | null;
  visible: boolean;
  enPantalla: boolean;
  reducido: boolean;
};

export function PistaDeslizar({ swiper, visible, enPantalla, reducido }: Props) {
  const { t } = useTranslation();
  const [dibujar, setDibujar] = useState(false);
  const [dibujada, setDibujada] = useState(false);
  const flechaRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (enPantalla) setDibujar(true);
  }, [enPantalla]);

  // El amago: el primero en cuanto se cierra la punta de la flecha, luego tras cada cambio de
  // estampilla y cada CICLO_MS.
  const amagar = dibujada && visible && enPantalla && !reducido;
  useEffect(() => {
    if (!swiper || swiper.destroyed || !amagar) return;
    let temporizador = 0;
    let deEstampilla: Animation | null = null;
    let deFlecha: Animation | null = null;

    const disparar = () => {
      if (swiper.destroyed) return;
      const cuerpo = swiper.slides[swiper.activeIndex]?.querySelector<HTMLElement>(
        '[data-estampilla-cuerpo]'
      );
      deEstampilla?.cancel();
      deFlecha?.cancel();
      deEstampilla =
        cuerpo?.animate(fotogramas(ESTAMPILLA, '50% 100%'), {
          duration: AMAGO_MS,
          easing: 'linear',
        }) ?? null;
      deFlecha =
        flechaRef.current?.animate(fotogramas(FLECHA), { duration: AMAGO_MS, easing: 'linear' }) ??
        null;
      temporizador = window.setTimeout(disparar, CICLO_MS);
    };
    const tras = (ms: number) => {
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(disparar, ms);
    };
    const alCambiar = () => tras(ESPERA_TRAS_CAMBIO_MS);

    tras(0);
    swiper.on('slideChange', alCambiar);
    return () => {
      window.clearTimeout(temporizador);
      if (!swiper.destroyed) swiper.off('slideChange', alCambiar);
      devolver(deEstampilla);
      devolver(deFlecha);
    };
  }, [swiper, amagar]);

  // El primer render es igual en servidor y cliente (sin trazar): reduced-motion solo se aplica
  // tras montar, y entonces el dibujo aparece entero de golpe (duración 0), sin animar.
  const [montada, setMontada] = useState(false);
  useEffect(() => setMontada(true), []);
  const quieta = montada && reducido;
  const trazo = dibujar || quieta;
  const sinTiempo = { duration: 0 };

  return (
    <motion.div
      className="flex items-center gap-1 text-blue lg:flex-col lg:gap-0"
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <svg
        ref={flechaRef}
        viewBox="0 0 60 28"
        className="h-9 w-[4.8rem] overflow-visible"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* El cuerpo: una curva algo temblorosa, de la palabra hacia la izquierda. */}
        <motion.path
          d="M57 21c-3.5-6.2-9.8-11.4-18.6-12.6C29.2 7.1 21.8 8.6 15.6 11.3 12 12.9 9.2 14.4 6.6 16.3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={trazo ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={
            quieta
              ? sinTiempo
              : {
                  delay: 0.45,
                  duration: 0.9,
                  ease: [0.3, 0, 0.2, 1],
                  opacity: { delay: 0.45, duration: 0.01 },
                }
          }
        />
        {/* La punta, en un solo trazo, como se haría a mano. */}
        <motion.path
          d="M9.6 8.4 6.3 16.5l8.4 1.9"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={trazo ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={
            quieta
              ? sinTiempo
              : {
                  delay: 1.3,
                  duration: 0.3,
                  ease: 'easeOut',
                  opacity: { delay: 1.3, duration: 0.01 },
                }
          }
          onAnimationComplete={() => {
            if (dibujar) setDibujada(true);
          }}
        />
      </svg>
      <motion.span
        className={`${letraManuscrita.className} block whitespace-nowrap pt-xs text-h4 leading-none`}
        initial={{ clipPath: 'inset(-50% 100% -50% 0)' }}
        animate={
          trazo ? { clipPath: 'inset(-50% 0% -50% 0)' } : { clipPath: 'inset(-50% 100% -50% 0)' }
        }
        transition={quieta ? sinTiempo : { duration: 0.9, ease: 'easeInOut' }}
      >
        {t('principles.pista')}
      </motion.span>
    </motion.div>
  );
}
