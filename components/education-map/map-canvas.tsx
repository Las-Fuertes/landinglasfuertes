'use client';

import { motion, type MotionValue } from 'framer-motion';
import { MAP_ASPECT, MAP_ROUTES, MAP_WIDTHS, VIEWBOX } from './education-map.data';
import MapHotspot from './map-hotspot';

const srcSet = (ext: 'avif' | 'webp') =>
  MAP_WIDTHS.map(w => `/images/education-map/map-${w}.${ext} ${w}w`).join(', ');

export interface MapCanvasProps {
  /** Con recorrido: tamaño en px y traslación animada. Sin él: ancho completo. */
  pinned: boolean;
  mapWidth: number;
  mapHeight: number;
  x: MotionValue<number>;
  y: MotionValue<number>;
  hotspotLabel: (index: number) => string;
  onOpen: (index: number, trigger: HTMLElement | null) => void;
  onReveal: (index: number) => void;
}

export default function MapCanvas({
  pinned,
  mapWidth,
  mapHeight,
  x,
  y,
  hotspotLabel,
  onOpen,
  onReveal,
}: MapCanvasProps) {
  const sizes = pinned && mapWidth > 0 ? `${Math.round(mapWidth)}px` : '100vw';

  return (
    <motion.div
      className={
        pinned ? 'absolute left-0 top-0 origin-top-left' : 'relative mx-auto w-full max-w-[1600px]'
      }
      style={
        pinned
          ? {
              width: mapWidth,
              height: mapHeight,
              x,
              y,
              willChange: 'transform',
              backfaceVisibility: 'hidden',
            }
          : {
              aspectRatio: `${VIEWBOX.w} / ${VIEWBOX.h}`,
              // Sin recorrido queremos ver el mapa entero de un vistazo, pero los
              // rótulos vienen vectorizados en el arte: por debajo de ~1150px se
              // vuelven ilegibles. El piso del clamp protege esa legibilidad y el
              // techo evita que el mapa desborde ventanas altas.
              maxWidth: `clamp(1150px, calc(88svh * ${MAP_ASPECT.toFixed(5)}), 1600px)`,
            }
      }
    >
      <picture>
        <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
        {/* Decorativo: el significado lo cargan los botones y la lista de rutas. */}
        <img
          src="/images/education-map/map-1600.webp"
          alt=""
          width={VIEWBOX.w}
          height={VIEWBOX.h}
          decoding="async"
          draggable={false}
          className="pointer-events-none block h-full w-full select-none"
        />
      </picture>

      {MAP_ROUTES.map((route, index) => (
        <MapHotspot
          key={route.id}
          route={route}
          index={index}
          label={hotspotLabel(index)}
          onOpen={onOpen}
          onReveal={onReveal}
        />
      ))}
    </motion.div>
  );
}
