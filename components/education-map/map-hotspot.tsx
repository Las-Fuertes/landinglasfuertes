import { useTranslation } from '../../hooks/useTranslation';
import { VIEWBOX, type MapRoute } from './education-map.data';

/** Cuerpo de "Haz clic aquí" en unidades del frame (antes ~12, dibujado en el arte). */
const TEXTO_CUERPO = 17;
const DESPLAZA_X = { izquierda: '0', centro: '-50%', derecha: '-100%' } as const;

export interface MapHotspotProps {
  route: MapRoute;
  index: number;
  label: string;
  onOpen: (index: number, trigger: HTMLElement | null) => void;
  /** Al recibir el foco, trae el recorrido hasta este punto. */
  onReveal: (index: number) => void;
}

/**
 * Una parada del mapa (docs/mapa-educativo/DECISIONES.md, D1).
 *
 * El botón cubre el grupo entero de la diseñadora: etiqueta, ilustración y el punto "Haz clic
 * aquí". Todo eso ya viene dibujado en el arte salvo la frase (D17: va en HTML para traducirla),
 * así que el botón es transparente; solo pinta la frase, los aros que laten desde el punto y, con teclado, un marco alrededor del grupo. Como la capa del mapa
 * se dimensiona en px y no con `scale`, el área táctil crece con el zoom y nunca baja de 44 px.
 */
export default function MapHotspot({ route, index, label, onOpen, onReveal }: MapHotspotProps) {
  const { t } = useTranslation();
  const { box, texto } = route;
  return (
    <button
      type="button"
      aria-label={label}
      aria-haspopup="dialog"
      data-parada={route.id}
      style={
        {
          left: `${(box.x / VIEWBOX.w) * 100}%`,
          top: `${(box.y / VIEWBOX.h) * 100}%`,
          width: `${(box.w / VIEWBOX.w) * 100}%`,
          height: `${(box.h / VIEWBOX.h) * 100}%`,
          '--map-hotspot-index': index,
        } as React.CSSProperties
      }
      className="absolute z-10 min-h-11 min-w-11 cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      onClick={event => onOpen(index, event.currentTarget)}
      onFocus={() => onReveal(index)}
    >
      <span
        aria-hidden
        className="absolute"
        style={{
          left: `${((route.cx - box.x) / box.w) * 100}%`,
          top: `${((route.cy - box.y) / box.h) * 100}%`,
        }}
      >
        <span className="map-hotspot-pulse" />
        <span className="map-hotspot-pulse map-hotspot-pulse--late" />
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute select-none whitespace-nowrap font-medium leading-none text-black"
        style={{
          left: `${((texto.cx - box.x) / box.w) * 100}%`,
          top: `${((texto.cy - box.y) / box.h) * 100}%`,
          fontSize: `${(TEXTO_CUERPO / VIEWBOX.w) * 100}cqw`,
          transform: `translate(${DESPLAZA_X[texto.ancla]}, -50%)`,
        }}
      >
        {t('educationMap.hazClic')}
      </span>
    </button>
  );
}
