import Image from 'next/image';
import type { CSSProperties } from 'react';
import { MujerPlaya } from './mujer-playa';

/**
 * La ilustración de la playa de Bienvenida, por capas, con dos composiciones de Figma
 * (docs/introduccion/DECISIONES.md, D6 y D7):
 *
 * - mobile y tablet: el frame mobile 1278:2 (390 de ancho), grupo "Main illustration" 1283:305
 *   y las olas que lo rodean. Se estira a todo el ancho, como antes.
 * - desktop (`lg`): el frame 1280:9 (1280 x 832), grupo 1280:74 y sus olas, más las gaviotas de
 *   la izquierda, que caen sobre la ilustración. Hasta 1280 de ancho.
 *
 * Cada composición es un lienzo recortado del frame: sus cajas están en px del frame y se pasan
 * a porcentaje del lienzo. `inset` es el del SVG dentro de su caja, tal como lo da Figma. El
 * orden es el de pintado (el de las capas de Figma). La mujer es un SVG inline para que el pelo
 * se mueva en reposo; el resto son archivos de `public/images/welcome/`.
 */
type Rol = 'ola' | 'trazo' | 'palmera' | 'persona' | 'flor' | 'gaviota' | 'nube';

export type Pieza = {
  /** Archivo, o `mujer` para el SVG inline de la mujer. */
  src: string;
  rol: Rol;
  x: number;
  y: number;
  ancho: number;
  alto: number;
  inset?: string;
};

export type Lienzo = {
  /** Recorte del frame: origen y tamaño, en px del frame de Figma. */
  x0: number;
  y0: number;
  ancho: number;
  alto: number;
  piezas: Pieza[];
};

const P = '/images/welcome/';
const MUJER = 'mujer';
/** Insets que da Figma para la mujer y la flor, iguales en los dos frames. */
const INSET_MUJER = '-0.69% -1.08% -0.49% -0.47%';
const INSET_FLOR = '-5.91% -6.03% -3.37% -3.41%';
const INSET_OLAS = '-3.17% 0 -3.54% -0.17%';
const INSET_OLA_CORTA = '-20.64% 0 -21.52% 0';
const INSET_OLA_SUELTA = '-62.11% 0 -38.22% -1.79%';

/** Frame mobile 1278:2: la ilustración va de y 568 (la palmera) a 810 (la mujer). */
const MOBILE: Lienzo = {
  x0: 0,
  y0: 568,
  ancho: 390,
  alto: 243,
  piezas: [
    {
      src: `${P}playa-palmera.png`,
      rol: 'palmera',
      x: 120.13,
      y: 568,
      ancho: 131.387,
      alto: 229.085,
    },
    {
      src: MUJER,
      rol: 'persona',
      x: 166.78,
      y: 689.5,
      ancho: 131.88,
      alto: 120.504,
      inset: INSET_MUJER,
    },
    {
      src: `${P}playa-flor.svg`,
      rol: 'flor',
      x: 150.26,
      y: 777.95,
      ancho: 22.598,
      alto: 23.327,
      inset: INSET_FLOR,
    },
    // La línea de arena: en Figma es una caja de alto 0; se usa el alto del SVG, centrado.
    {
      src: `${P}playa-arena-mobile.svg`,
      rol: 'trazo',
      x: 88.05,
      y: 803.218,
      ancho: 356.712,
      alto: 1.944,
    },
    {
      src: `${P}playa-olas-mobile.svg`,
      rol: 'ola',
      x: -211.31,
      y: 692.41,
      ancho: 856.291,
      alto: 98.43,
      inset: INSET_OLAS,
    },
    {
      src: `${P}playa-ola-corta-mobile.svg`,
      rol: 'ola',
      x: -263.8,
      y: 738.09,
      ancho: 267.672,
      alto: 12.186,
      inset: INSET_OLA_CORTA,
    },
    {
      src: `${P}playa-ola-suelta-mobile.svg`,
      rol: 'ola',
      x: -6,
      y: 683,
      ancho: 64.138,
      alto: 6.352,
      inset: INSET_OLA_SUELTA,
    },
  ],
};

/** Frame desktop 1280:9: de y 496 (la palmera) a 774 (la mujer), en todo el ancho del frame. */
const DESKTOP: Lienzo = {
  x0: 0,
  y0: 496,
  ancho: 1280,
  alto: 278,
  piezas: [
    {
      src: `${P}playa-palmera.png`,
      rol: 'palmera',
      x: 539.61,
      y: 496,
      ancho: 150.281,
      alto: 262.028,
    },
    {
      src: MUJER,
      rol: 'persona',
      x: 591.81,
      y: 628.39,
      ancho: 158.904,
      alto: 145.198,
      inset: INSET_MUJER,
    },
    {
      src: `${P}playa-flor.svg`,
      rol: 'flor',
      x: 571.9,
      y: 734.97,
      ancho: 27.229,
      alto: 28.107,
      inset: INSET_FLOR,
    },
    {
      src: `${P}playa-arena-desktop.svg`,
      rol: 'trazo',
      x: 496.95,
      y: 765.419,
      ancho: 429.808,
      alto: 2.342,
    },
    {
      src: `${P}playa-olas-desktop.svg`,
      rol: 'ola',
      x: 136.24,
      y: 631.91,
      ancho: 1031.759,
      alto: 118.6,
      inset: INSET_OLAS,
    },
    {
      src: `${P}playa-ola-corta-desktop.svg`,
      rol: 'ola',
      x: 270.29,
      y: 686.95,
      ancho: 125.23,
      alto: 14.683,
      inset: INSET_OLA_CORTA,
    },
    {
      src: `${P}playa-ola-suelta-desktop.svg`,
      rol: 'ola',
      x: 339,
      y: 629,
      ancho: 77.281,
      alto: 7.653,
      inset: INSET_OLA_SUELTA,
    },
    // Gaviotas de la izquierda ("Vector 1311", "1312" y "1308").
    {
      src: `${P}gaviota-1.svg`,
      rol: 'gaviota',
      x: 175,
      y: 538,
      ancho: 36.208,
      alto: 10.787,
      inset: '-12.01% 0 -11.46% 0',
    },
    {
      src: `${P}gaviota-2.svg`,
      rol: 'gaviota',
      x: 254,
      y: 571,
      ancho: 31.654,
      alto: 9.574,
      inset: '-10.05% -0.61% -15.59% -0.74%',
    },
    {
      src: `${P}gaviota-4.svg`,
      rol: 'gaviota',
      x: 224,
      y: 502,
      ancho: 60.187,
      alto: 18.776,
      inset: '-6.84% 0 -13.03% 0',
    },
  ],
};

const pct = (v: number, total: number) => `${(v / total) * 100}%`;

/** Una pieza en su caja de Figma, en porcentaje del lienzo que la contiene. */
export function CapaPieza({
  p,
  lienzo,
  contener = false,
}: {
  p: Pieza;
  lienzo: Omit<Lienzo, 'piezas'>;
  /** `object-contain`: el archivo nunca se estira aunque su caja de Figma no tenga su proporción
   * exacta (las olas finas y la arena difieren de un 2 a un 3 %). Solo en mobile (D9). */
  contener?: boolean;
}) {
  const contenido =
    p.src === MUJER ? (
      <MujerPlaya />
    ) : (
      <Image
        src={p.src}
        alt=""
        fill
        className={contener ? 'object-contain' : undefined}
        sizes="(max-width: 1024px) 100vw, 1280px"
      />
    );
  return (
    <div
      className="absolute"
      data-rol={p.rol}
      style={{
        left: pct(p.x - lienzo.x0, lienzo.ancho),
        top: pct(p.y - lienzo.y0, lienzo.alto),
        width: pct(p.ancho, lienzo.ancho),
        height: pct(p.alto, lienzo.alto),
      }}
    >
      {p.inset ? (
        <div className="absolute" style={{ inset: p.inset }}>
          {contenido}
        </div>
      ) : (
        contenido
      )}
    </div>
  );
}

function Composicion({
  lienzo,
  className,
  style,
  contener,
}: {
  lienzo: Lienzo;
  className: string;
  style?: CSSProperties;
  contener?: boolean;
}) {
  return (
    <div
      className={`relative mx-auto ${className}`}
      style={{ aspectRatio: `${lienzo.ancho} / ${lienzo.alto}`, ...style }}
    >
      {lienzo.piezas.map((p, i) => (
        <CapaPieza key={i} p={p} lienzo={lienzo} contener={contener} />
      ))}
    </div>
  );
}

/**
 * Mobile y tablet (docs/introduccion/DECISIONES.md, D9): el lienzo mide lo que quepa a lo ancho
 * (100cqw) y a lo alto (100cqh, pasado a ancho con la proporción del lienzo) del contenedor que
 * le da `welcome.tsx`, así nunca se deforma ni se corta por abajo. Sin `overflow-hidden`: cuando
 * el lienzo es más estrecho que la pantalla, las olas siguen hasta los bordes (el contenedor las
 * recorta en horizontal), como en Figma.
 */
const ANCHO_MOBILE: CSSProperties = {
  width: `min(100cqw, calc(100cqh * ${MOBILE.ancho} / ${MOBILE.alto}), 87.5rem)`,
};

export function IlustracionPlaya() {
  return (
    <div className="relative w-full lg:mt-[2.6875rem]">
      <Composicion lienzo={MOBILE} className="lg:hidden" style={ANCHO_MOBILE} contener />
      <Composicion
        lienzo={DESKTOP}
        className="hidden w-full max-w-screen-xl overflow-hidden lg:block"
      />
    </div>
  );
}
