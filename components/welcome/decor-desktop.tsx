import Image from 'next/image';
import { CapaPieza, type Lienzo, type Pieza } from './ilustracion-playa';

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
  // "Vector 5" y "Vector 7": las dos nubes de siempre.
  { src: `${P}left-cloud.svg`, rol: 'nube', x: 208.64, y: 136.08, ancho: 153.53, alto: 64.83 },
  { src: `${P}right-cloud.svg`, rol: 'nube', x: 890.93, y: 80.15, ancho: 109.75, alto: 44.21 },
  // "Vector 1310": la nube nueva de la derecha, más baja.
  {
    src: `${P}nube-derecha-alta.svg`,
    rol: 'nube',
    x: 1039,
    y: 176,
    ancho: 141.674,
    alto: 50.434,
    inset: '-6.07% -2.49% -6.51% -1.13%',
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
          Va pegada al borde de la pantalla, no al frame, para que siga saliendo de él en
          pantallas anchas. En Figma está girada 180 grados y volteada en vertical: en suma, un
          espejo horizontal. */}
      <div
        className="pointer-events-none absolute left-0 top-[14.625rem] hidden w-[10.3125rem] -translate-x-1/3 lg:block"
        aria-hidden
      >
        <div className="relative aspect-[165/61] w-full" data-rol="nube">
          {/* El espejo va en su propia caja: la de fuera la mueve la entrada. */}
          <div className="absolute inset-0 -scale-x-100">
            <div className="absolute" style={{ inset: '-9.71% -2.79% -7.73% -1.43%' }}>
              <Image src={`${P}nube-borde.svg`} alt="" fill sizes="172px" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
