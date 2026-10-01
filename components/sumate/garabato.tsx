'use client';

import { motion, useReducedMotion } from 'framer-motion';

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
  return (
    <motion.img
      src={src}
      alt=""
      aria-hidden
      width={ancho}
      height={alto}
      draggable={false}
      className={`pointer-events-none absolute h-auto select-none ${className}`}
      animate={reduce ? undefined : vaiven}
      transition={{ duration: duracion, ease: 'easeInOut', repeat: Infinity }}
    />
  );
}
