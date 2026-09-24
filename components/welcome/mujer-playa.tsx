import { useId } from 'react';
import {
  MUJER_CUERPO,
  MUJER_LINEAS,
  MUJER_PELO,
  MUJER_TEXTURA,
  MUJER_VIEWBOX,
} from './mujer-playa.data';

const { ancho: W, alto: H } = MUJER_VIEWBOX;

/**
 * Punto de giro del pelo, en unidades del viewBox: el centro del borde superior del cuello, que
 * el contorno del pelo tapa unas 2 unidades (el cuello acaba en y 34,1 a 34,7 y el pelo baja
 * hasta 36,5 ahí). Girando alrededor de este punto, la raíz casi no se mueve y las puntas (a la
 * izquierda, a unas 110 unidades) llevan todo el recorrido; el pelo nunca destapa el cuello.
 */
export const NUCA = { x: 130.4, y: 35 } as const;

type Textura = (typeof MUJER_TEXTURA)[keyof typeof MUJER_TEXTURA];

/** El filtro de textura de Figma, igual que en el SVG exportado. */
function FiltroTextura({ id, t }: { id: string; t: Textura }) {
  return (
    <filter
      id={id}
      x={t.x}
      y={t.y}
      width={t.ancho}
      height={t.alto}
      filterUnits="userSpaceOnUse"
      colorInterpolationFilters="sRGB"
    >
      <feFlood floodOpacity="0" result="BackgroundImageFix" />
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.999 0.999"
        numOctaves={3}
        seed={t.semilla}
      />
      <feDisplacementMap
        in="shape"
        scale={t.escala}
        xChannelSelector="R"
        yChannelSelector="G"
        result="displacedImage"
        width="100%"
        height="100%"
      />
      <feMerge>
        <feMergeNode in="displacedImage" />
      </feMerge>
    </filter>
  );
}

/**
 * La mujer de la playa como SVG inline (Figma "Girl", `public/images/welcome/playa-mujer.svg`),
 * para que el pelo sea un grupo propio que se mece en reposo (`crearReposoBienvenida`, D7).
 *
 * El pelo va en dos grupos anidados: el de fuera gira (`data-pelo`) y el de dentro se inclina
 * con un poco de retraso (`data-pelo-onda`), los dos alrededor de la nuca. Quieta se ve igual
 * que el SVG de Figma: mismas capas, mismo orden y la misma textura.
 */
export function MujerPlaya() {
  // La ilustración monta dos mujeres (la de mobile y la de desktop, una oculta): cada una con
  // sus propios filtros, porque un filtro dentro de un SVG con `display: none` no pinta.
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const cuerpo = `mujer-textura-cuerpo-${id}`;
  const pelo = `mujer-textura-pelo-${id}`;
  return (
    <svg
      className="block h-full w-full overflow-visible"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      data-nuca={`${NUCA.x} ${NUCA.y}`}
      aria-hidden
    >
      <defs>
        <FiltroTextura id={cuerpo} t={MUJER_TEXTURA.cuerpo} />
        <FiltroTextura id={pelo} t={MUJER_TEXTURA.pelo} />
      </defs>
      <g filter={`url(#${cuerpo})`} className="fill-blue">
        {MUJER_CUERPO.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      {/* Los trazos claros del cuerpo: en Figma son el beige del fondo. */}
      <g className="fill-beige">
        {MUJER_LINEAS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g data-pelo="">
        <g data-pelo-onda="">
          <g filter={`url(#${pelo})`} className="fill-blue">
            {MUJER_PELO.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        </g>
      </g>
    </svg>
  );
}
