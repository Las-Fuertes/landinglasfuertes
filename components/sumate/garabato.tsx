'use client';

import { useContext } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { GarabatosContext } from './sumate-drawer-context';

/**
 * Vaivén en reposo de un garabato (docs/PATTERNS.md, lenguaje de movimiento, punto 8): sutil pero
 * visible, ciclos de 3 a 6 s, y quieto con `prefers-reduced-motion`.
 */
export function Garabato({
  src,
  ancho,
  alto,
  className,
  vaiven,
  duracion,
}: {
  src: string;
  ancho: number;
  alto: number;
  className: string;
  vaiven: { x?: number[]; y?: number[]; rotate?: number[] };
  duracion: number;
}) {
  const reduce = useReducedMotion();
  // Con el drawer oculto, quieto en el primer valor de cada ciclo: al abrir arranca desde ahí,
  // igual que cuando se montaba en el clic (docs/sumate-drawer/DECISIONES.md, D4).
  const { pausado, cargar } = useContext(GarabatosContext);
  const reposo = Object.fromEntries(Object.entries(vaiven).map(([k, v]) => [k, v?.[0] ?? 0]));
  return (
    <motion.img
      src={cargar ? src : undefined}
      alt=""
      aria-hidden
      width={ancho}
      height={alto}
      draggable={false}
      className={`pointer-events-none absolute h-auto select-none ${className}`}
      animate={reduce ? undefined : pausado ? reposo : vaiven}
      transition={
        pausado ? { duration: 0 } : { duration: duracion, ease: 'easeInOut', repeat: Infinity }
      }
    />
  );
}
