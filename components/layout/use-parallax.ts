'use client';

import { type RefObject, useEffect, useState } from 'react';
import { type MotionStyle, useReducedMotion, useScroll, useTransform } from 'framer-motion';

type Offset = NonNullable<Parameters<typeof useScroll>[0]>['offset'];

/**
 * Parallax ligado al scroll (docs/emi/DECISIONES.md, D8). Devuelve el `style` de una capa que se
 * desplaza en vertical, SOLO con `transform` (y `will-change: transform`), de `desde` a `hasta`
 * veces el alto de la ventana mientras `objetivo` recorre `offset`. Un valor positivo es una capa
 * que se queda atrás (baja respecto al scroll). `movil` son los valores a menos de 768 px de
 * ancho, donde el desfase se reduce. Con `prefers-reduced-motion` no devuelve estilo: la capa
 * queda quieta. Sin listeners propios: framer-motion lee el scroll con un solo observador.
 */
export function useParallax(
  objetivo: RefObject<HTMLElement | null>,
  offset: Offset,
  rango: { desde: number; hasta: number; movil?: { desde: number; hasta: number } }
): MotionStyle | undefined {
  const reducido = useReducedMotion();
  // El servidor no sabe el alto de la ventana: el estilo se aplica tras montar, para que el primer
  // pintado del cliente coincida con el HTML del servidor (sin aviso de hidratación).
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  const { scrollYProgress } = useScroll({ target: objetivo, offset });
  const y = useTransform(scrollYProgress, p => {
    if (typeof window === 'undefined') return 0;
    const r = window.innerWidth < 768 && rango.movil ? rango.movil : rango;
    return (r.desde + (r.hasta - r.desde) * p) * window.innerHeight;
  });
  return reducido || !montado ? undefined : { y, willChange: 'transform' };
}
