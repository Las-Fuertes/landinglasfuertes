'use client';

import { useInView, useReducedMotion } from 'framer-motion';
import { type RefObject, useEffect, useState } from 'react';

/** Segundos desde que el bloque asoma hasta el cambio de la ilustración (agua, líquido, color). */
const CAMBIO_S = 0.6;

/**
 * Disparador de un bloque de Impacto (docs/impacto/DECISIONES.md, D9 y D10): una sola lectura de
 * viewport con `useInView` (`once`), sin escuchar el scroll. Cuando un 2 % del bloque está a la
 * vista recibe `entrada` y, en el mismo momento, el reloj del cambio de la ilustración (`inicio`,
 * en segundos, que el CSS usa como retraso). Antes de eso, `inicio` es `null`.
 *
 * Con movimiento reducido todo se da desde el principio y el CSS pone los retrasos a cero.
 */
export function useEntradaBloque(ref: RefObject<HTMLElement | null>) {
  // `useReducedMotion` ya vale `true` en el primer render del cliente, pero el HTML del servidor
  // salió sin `data-entrada`: React no corrige atributos en la hidratación y, con movimiento
  // reducido, los bloques se quedaban invisibles. Se lee tras montar para que el cambio llegue al DOM.
  const preferencia = useReducedMotion();
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  const reducido = montado && preferencia;
  const visible = useInView(ref, { once: true, amount: 0.02 });
  const entrada = visible || !!reducido;
  return { entrada, inicio: entrada ? (reducido ? 0 : CAMBIO_S) : null };
}
