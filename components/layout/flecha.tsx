/**
 * La flecha del sitio: un chevrón de trazo redondeado. Es la de las flechas de la Introducción
 * (`components/intro/intro-navegacion.tsx`, D10) y la de "Volver arriba"
 * (`volver-arriba.tsx`, docs/navegacion/DECISIONES.md, D6): un solo dibujo para que se
 * reconozcan como la misma. El tamaño lo pone quien la usa con `className`; el color es el del
 * texto (`currentColor`).
 */
const TRAZOS = {
  arriba: 'M5 12.5 10 7.5l5 5',
  abajo: 'M5 7.5l5 5 5-5',
  izquierda: 'M12.5 5 7.5 10l5 5',
  derecha: 'M7.5 5l5 5-5 5',
} as const;

export function Flecha({
  sentido,
  className = 'h-5 w-5',
}: {
  sentido: 'arriba' | 'abajo' | 'izquierda' | 'derecha';
  className?: string;
}) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={className} fill="none">
      <path
        d={TRAZOS[sentido]}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
