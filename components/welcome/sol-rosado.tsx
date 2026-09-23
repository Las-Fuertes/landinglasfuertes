import { SOL_ANILLO, SOL_DISCO, SOL_RAYOS, SOL_VIEWBOX } from './sol-rosado.data';

const { ancho: W, alto: H } = SOL_VIEWBOX;
const pct = (v: number, total: number) => `${(v / total) * 100}%`;
/** Centro del disco en el viewBox: alrededor de él salen y giran los rayos. */
const CENTRO = `${SOL_DISCO.x + SOL_DISCO.ancho / 2} ${SOL_DISCO.y + SOL_DISCO.alto / 2}`;

/**
 * El sol rosado de Bienvenida, el mismo dibujo que `pink-sun.svg` partido en dos capas para
 * animarlo (docs/introduccion/DECISIONES.md, D6):
 *
 * - los 13 rayos, cada uno su `path`, en un grupo que gira despacio en reposo;
 * - el disco (el anillo más el raster con textura), en su propia caja: es lo que recibe el
 *   relevo del sol rojo de la parte 3, con squash and stretch.
 *
 * Quieto se ve igual que el SVG original: mismo viewBox, mismos trazos y el raster en el mismo
 * rectángulo. El anillo queda ahora por encima de los rayos, pero no se tocan.
 */
export function SolRosado() {
  return (
    <div className="relative aspect-[147/141] w-full">
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox={`0 0 ${W} ${H}`}
        data-centro={CENTRO}
        aria-hidden
      >
        <g data-rayos="" className="fill-pink-sol">
          {SOL_RAYOS.map((d, i) => (
            <path key={i} d={d} data-rol="rayo" />
          ))}
        </g>
      </svg>
      <div
        className="absolute"
        data-rol="sol"
        style={{
          left: pct(SOL_DISCO.x, W),
          top: pct(SOL_DISCO.y, H),
          width: pct(SOL_DISCO.ancho, W),
          height: pct(SOL_DISCO.alto, H),
        }}
      >
        {/* Caja interior: la aplasta y la estira el relevo, sin pisar el viaje de la exterior. */}
        <div className="h-full w-full">
          <svg
            className="block h-full w-full overflow-visible"
            viewBox={`${SOL_DISCO.x} ${SOL_DISCO.y} ${SOL_DISCO.ancho} ${SOL_DISCO.alto}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d={SOL_ANILLO} className="fill-pink-sol" />
            <image
              href="/images/welcome/pink-sun-disco.png"
              x={SOL_DISCO.x}
              y={SOL_DISCO.y}
              width={SOL_DISCO.ancho}
              height={SOL_DISCO.alto}
              preserveAspectRatio="none"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
