import type { MapRoute } from './education-map.data';

export interface MapHotspotProps {
  route: MapRoute;
  index: number;
  label: string;
  onOpen: (index: number, trigger: HTMLElement | null) => void;
  /** Al recibir el foco, trae el recorrido hasta este punto. */
  onReveal: (index: number) => void;
}

/**
 * El punto interactivo del mapa.
 *
 * El anillo rosado ya viene dibujado en el arte, así que acá solo va el área
 * táctil y los aros que salen desde detrás. El botón mide 44×44 aunque el
 * anillo visible sea de 16: como la capa del mapa se dimensiona en px y no con
 * `scale`, esos 44 px se mantienen sea cual sea el zoom.
 */
export default function MapHotspot({ route, index, label, onOpen, onReveal }: MapHotspotProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-haspopup="dialog"
      style={
        {
          left: `${route.u * 100}%`,
          top: `${route.v * 100}%`,
          '--map-hotspot-index': index,
        } as React.CSSProperties
      }
      className="absolute z-10 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      onClick={event => onOpen(index, event.currentTarget)}
      onFocus={() => onReveal(index)}
    >
      <span aria-hidden className="map-hotspot-pulse" />
      <span aria-hidden className="map-hotspot-pulse map-hotspot-pulse--late" />
    </button>
  );
}
