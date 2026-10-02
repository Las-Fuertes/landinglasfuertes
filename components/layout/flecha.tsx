/**
 * La flecha del sitio: un chevrón de trazo redondeado. Es la de las flechas de la Introducción
 * (`components/intro/intro-navegacion.tsx`, D10) y la de "Volver arriba"
 * (`volver-arriba.tsx`, docs/navegacion/DECISIONES.md, D6): un solo dibujo para que se
 * reconozcan como la misma. El tamaño lo pone quien la usa con `className`; el color es el del
 * texto (`currentColor`).
 */
export function Flecha({
  sentido,
  className = 'h-5 w-5',
}: {
  sentido: 'arriba' | 'abajo';
  className?: string;
}) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={className} fill="none">
      <path
        d={sentido === 'arriba' ? 'M5 12.5 10 7.5l5 5' : 'M5 7.5l5 5 5-5'}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
