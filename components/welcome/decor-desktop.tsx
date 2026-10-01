import Image from 'next/image';
import { CapaPieza, type Lienzo, type Pieza } from './ilustracion-playa';
import { NubeDeriva } from './nube-deriva';

/**
 * Nubes y gaviotas de Bienvenida en desktop (`lg`), en el sitio exacto del frame 1280:9 de Figma
 * (1280 x 832). Van en una caja de 1280 x 832 centrada en la sección: a 1280 de ancho coincide
 * con el frame y en pantallas más anchas la composición se queda alrededor del centro, sin
 * estirarse. Por debajo de 1280 la caja se sale por los lados y la recorta la página
 * (`overflow-x-clip` en `pages/index.tsx`). En mobile y tablet las nubes son las de siempre, en
 * la fila del sol (`welcome.tsx`).
 *
 * Las cajas son las de Figma con el `inset` del SVG ya aplicado cuando el archivo es el de antes
 * (`left-cloud.svg`, `right-cloud.svg`), o el `inset` tal cual para los archivos nuevos.
 */
const FRAME: Omit<Lienzo, 'piezas'> = { x0: 0, y0: 0, ancho: 1280, alto: 832 };
const P = '/images/welcome/';

const PIEZAS: Pieza[] = [
  // "Vector 5" y "Vector 7": las dos nubes de siempre. "Vector 5" se movió en el frame (antes en
  // x=208,64 con el inset; ahora 126 sin él, 123,64 con él).
  {
    src: `${P}left-cloud.svg`,
    rol: 'nube',
    x: 123.64,
    y: 133.08,
    ancho: 153.53,
    alto: 64.83,
    deriva: { px: 18, s: 13 },
  },
  {
    src: `${P}right-cloud.svg`,
    rol: 'nube',
    x: 890.93,
    y: 80.15,
    ancho: 109.75,
    alto: 44.21,
    deriva: { px: 12, s: 8.5 },
  },
  // "Vector 1310": la nube nueva de la derecha, más baja.
  {
    src: `${P}nube-derecha-alta.svg`,
    rol: 'nube',
    x: 1039,
    y: 176,
    ancho: 141.674,
    alto: 50.434,
    inset: '-6.07% -2.49% -6.51% -1.13%',
    deriva: { px: 20, s: 11 },
  },
  // "Vector 1313" (2026-09-30): el mismo dibujo que "Vector 5" (el export de Figma es idéntico a
  // `left-cloud.svg`), en x=1145 y=139, sin espejo. Sangra por la derecha a 1280 (acaba en 1296
  // con el inset): su deriva es corta para no descubrir su extremo.
  {
    src: `${P}left-cloud.svg`,
    rol: 'nube',
    x: 1142.64,
    y: 133.08,
    ancho: 153.53,
    alto: 64.83,
    deriva: { px: 10, s: 12 },
  },
  // Gaviotas de la derecha ("Vector 1305", "1306" y "1307"); las de la izquierda van con la
  // ilustración, porque caen sobre ella.
  {
    src: `${P}gaviota-3.svg`,
    rol: 'gaviota',
    x: 954,
    y: 351,
    ancho: 37.483,
    alto: 11.272,
    inset: '-7.37% 0.2% -15.6% 0',
  },
  {
    src: `${P}gaviota-2.svg`,
    rol: 'gaviota',
    x: 1019.98,
    y: 367.49,
    ancho: 31.654,
    alto: 9.574,
    inset: '-10.05% -0.61% -15.59% -0.74%',
  },
  {
    src: `${P}gaviota-1.svg`,
    rol: 'gaviota',
    x: 965.36,
    y: 409.45,
    ancho: 36.208,
    alto: 10.787,
    inset: '-12.01% 0 -11.46% 0',
  },
];

export function DecorDesktop() {
  return (
    <>
      <div
        className="pointer-events-none absolute left-1/2 top-0 hidden h-[52rem] w-[80rem] -translate-x-1/2 lg:block"
        aria-hidden
      >
        {PIEZAS.map((p, i) => (
          <CapaPieza key={i} p={p} lienzo={FRAME} />
        ))}
      </div>
      {/* "Vector 1309": la nube que sale del borde izquierdo (x -55 en el frame, un tercio fuera).
          Va con el frame de 1280, como el resto del decorado, pero sin despegarse del borde de la
          pantalla cuando esta es más angosta que el frame: hasta 1280 sale del borde de la
          pantalla (a 1024 igual que antes) y desde ahí sigue al frame. Antes iba siempre pegada al
          borde de la pantalla y a 1512 o 1920 quedaba sola, lejos del resto (D12). En Figma está
          girada 180 grados y volteada en vertical: en suma, un espejo horizontal. */}
      <div
        className="pointer-events-none absolute left-[max(0rem,calc(50%-40rem))] top-[14.625rem] hidden w-[10.3125rem] -translate-x-1/3 lg:block"
        aria-hidden
      >
        <div className="relative aspect-[165/61] w-full" data-rol="nube">
          {/* El espejo va en su propia caja: la de fuera la mueve la entrada. */}
          <NubeDeriva deriva={{ px: 14, s: 10 }}>
            <div className="absolute inset-0 -scale-x-100">
              <div className="absolute" style={{ inset: '-9.71% -2.79% -7.73% -1.43%' }}>
                <Image src={`${P}nube-borde.svg`} alt="" fill sizes="172px" />
              </div>
            </div>
          </NubeDeriva>
        </div>
      </div>
    </>
  );
}
