import Image from 'next/image';

/**
 * La ilustración de la playa de Bienvenida, por capas (Figma, nodo 1278:99 "Group 48", dentro
 * del frame mobile de 390 de ancho). Antes era un solo PNG de 390 x 244
 * (`beach-woman.png`); ahora cada pieza es su propia capa para que entre por partes
 * (docs/introduccion/DECISIONES.md, D6).
 *
 * Las cajas están en px del lienzo de 390 x 244 (el recorte del frame: la ola de abajo y la de
 * la derecha se salen del frame y se cortan igual que en el PNG). `inset` es el del SVG dentro
 * de su caja, tal como lo da Figma. El orden es el de pintado.
 */
const LIENZO = { ancho: 390, alto: 244 } as const;
/** El grupo empieza en y = 553 dentro del frame de Figma. */
const Y0 = 553;

type Pieza = {
  src: string;
  rol: 'ola' | 'trazo' | 'palmera' | 'persona' | 'flor';
  x: number;
  y: number;
  ancho: number;
  alto: number;
  inset?: string;
};

const P = '/images/welcome/';
const PIEZAS: Pieza[] = [
  { src: `${P}playa-ola.png`, rol: 'ola', x: 250, y: 670, ancho: 174, alto: 57 },
  { src: `${P}playa-ola.png`, rol: 'ola', x: 18, y: 670, ancho: 150, alto: 49 },
  {
    src: `${P}playa-trazo-1.svg`,
    rol: 'trazo',
    x: 9,
    y: 681,
    ancho: 38,
    alto: 2.852,
    inset: '-160.55% -13.8% -168.03% -13.98%',
  },
  { src: `${P}playa-palmera.png`, rol: 'palmera', x: 100, y: 553, ancho: 135, alto: 236 },
  { src: `${P}playa-mujer.png`, rol: 'persona', x: 114, y: 670, ancho: 195, alto: 127 },
  { src: `${P}playa-ola-baja.png`, rol: 'ola', x: -93, y: 727, ancho: 241, alto: 26 },
  {
    src: `${P}playa-trazo-2.svg`,
    rol: 'trazo',
    x: 289,
    y: 740,
    ancho: 64,
    alto: 8.77,
    inset: '-59.38% -7.39% -52.85% -8.38%',
  },
  {
    src: `${P}playa-trazo-3.svg`,
    rol: 'trazo',
    x: 305.5,
    y: 788.063,
    ancho: 97,
    alto: 1.674,
    inset: '-84.1% -1.37% -88.66% -1.6%',
  },
  {
    src: `${P}playa-flor.svg`,
    rol: 'flor',
    x: 131,
    y: 769,
    ancho: 23.25,
    alto: 24,
    inset: '-5.91% -6.03% -3.37% -3.41%',
  },
];

const pct = (v: number, total: number) => `${(v / total) * 100}%`;

export function IlustracionPlaya() {
  return (
    <div className="relative mt-10 w-full">
      <div
        className="relative mx-auto w-full max-w-[1400px] overflow-hidden lg:max-w-[720px]"
        style={{ aspectRatio: `${LIENZO.ancho} / ${LIENZO.alto}` }}
      >
        {PIEZAS.map((p, i) => {
          const img = <Image src={p.src} alt="" fill sizes="(max-width: 768px) 100vw, 720px" />;
          return (
            <div
              key={i}
              className="absolute"
              data-rol={p.rol}
              style={{
                left: pct(p.x, LIENZO.ancho),
                top: pct(p.y - Y0, LIENZO.alto),
                width: pct(p.ancho, LIENZO.ancho),
                height: pct(p.alto, LIENZO.alto),
              }}
            >
              {p.inset ? (
                <div className="absolute" style={{ inset: p.inset }}>
                  {img}
                </div>
              ) : (
                img
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
