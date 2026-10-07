'use client';

import { useInView, useReducedMotion } from 'framer-motion';
import { type RefObject } from 'react';

/** Segundos desde que el bloque asoma hasta el cambio de la ilustración (agua, líquido, color). */
const CAMBIO_S = 1.2;

/**
 * Disparador de un bloque de Impacto (docs/impacto/DECISIONES.md, D9): una sola lectura de
 * viewport con `useInView` (`once`), sin escuchar el scroll. Cuando un 30 % del bloque está a la
 * vista recibe `entrada` y, en el mismo momento, el reloj del cambio de la ilustración (`inicio`,
 * en segundos, que el CSS usa como retraso). Antes de eso, `inicio` es `null`.
 *
 * Con movimiento reducido todo se da desde el principio y el CSS pone los retrasos a cero.
 */
export function useEntradaBloque(ref: RefObject<HTMLElement | null>) {
  const reducido = useReducedMotion();
  const visible = useInView(ref, { once: true, amount: 0.3 });
  const entrada = visible || !!reducido;
  return { entrada, inicio: entrada ? (reducido ? 0 : CAMBIO_S) : null };
}
