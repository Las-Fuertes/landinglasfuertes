'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * Pista de "desliza" en lugar de la palabra SWIPE del diseño: una mano con el índice arriba y
 * una flecha doble, dibujada aquí (la mano sigue el trazo del icono `pointer` de lucide, que el
 * repo ya usa, para que combine con las flechas del resto del sitio).
 *
 * Mientras está: vaivén horizontal de 8 px, 1,6 s de ida y vuelta con sine.inOut y 0,4 s de
 * pausa (ciclo de 2 s), solo si `enPantalla`. Con prefers-reduced-motion se queda quieta.
 * Cuando `visible` pasa a false se va con un fundido de 0,45 s, pero SIGUE MONTADO y ocupando
 * su sitio: si se desmontara, la sección perdería alto y lo de debajo saltaría hacia arriba
 * (feedback de Johan, D3 segunda ronda). Es decorativa: el slider ya
 * tiene sus instrucciones para lectores de pantalla. Ver docs/emi/DECISIONES.md, D3.
 */

const VAIVEN_PX = 8;
const IDA_Y_VUELTA_S = 1.6;
const PAUSA_S = 0.4;
/** sine.inOut como curva de Bézier. */
const SINE_IN_OUT: [number, number, number, number] = [0.37, 0, 0.63, 1];

type Props = {
  visible: boolean;
  enPantalla: boolean;
  className?: string;
};

export function PulgarDeslizar({ visible, enPantalla, className }: Props) {
  const reducido = useReducedMotion();
  const mover = visible && enPantalla && !reducido;

  return (
    <motion.div
      className={className}
      aria-hidden="true"
      data-pulgar-deslizar=""
      data-visible={visible ? '' : undefined}
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      style={{ pointerEvents: 'none' }}
    >
      <motion.svg
        viewBox="0 0 24 30"
        className="h-10 w-10 text-black"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={mover ? { x: [0, -VAIVEN_PX, 0] } : { x: 0 }}
        transition={
          mover
            ? {
                duration: IDA_Y_VUELTA_S,
                ease: SINE_IN_OUT,
                repeat: Infinity,
                repeatDelay: PAUSA_S,
              }
            : { duration: 0.3 }
        }
      >
        {/* Flecha doble de deslizar, sobre la punta del dedo. */}
        <path d="M3.5 3h9" />
        <path d="M5.5 1 3.5 3l2 2" />
        <path d="M10.5 1l2 2-2 2" />
        {/* Mano con el índice arriba. */}
        <g transform="translate(0 6)">
          <path d="M22 14a8 8 0 0 1-8 8" />
          <path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
          <path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1" />
          <path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10" />
          <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </g>
      </motion.svg>
    </motion.div>
  );
}
