'use client';

import type { RefObject } from 'react';
import { motion, type MotionValue } from 'framer-motion';
import { MAP_ASPECT, MAP_ROUTES, MAP_WIDTHS, VIEWBOX } from './education-map.data';
import MapHotspot from './map-hotspot';

/** Mapa de 2026-09-24 (docs/mapa-educativo/DECISIONES.md, D1). El de antes (`map-*`) se conserva. */
const srcSet = (ext: 'avif' | 'webp') =>
  MAP_WIDTHS.map(w => `/images/education-map/mapa-ruta-${w}.${ext} ${w}w`).join(', ');

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
  /** Con recorrido: la capa que desliza el viaje de "Siguiente ruta" y la del mapa (D9). */
  capaRef?: RefObject<HTMLDivElement | null>;
  mapaRef?: RefObject<HTMLDivElement | null>;
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
  capaRef,
  mapaRef,
}: MapCanvasProps) {
  const sizes = pinned && mapWidth > 0 ? `${Math.round(mapWidth)}px` : '100vw';

  const mapa = (
    <motion.div
      ref={mapaRef}
      className={pinned ? 'absolute left-0 top-0 origin-top-left' : 'relative mx-auto w-full'}
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
        {/* Decorativo: el significado lo cargan los botones de cada parada. */}
        <img
          src="/images/education-map/mapa-ruta-1600.webp"
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

  // La capa solo existe con recorrido: en reposo no tiene transform y no crea capa propia; el
  // navegador la promueve mientras dura el viaje.
  return pinned ? (
    <div ref={capaRef} className="absolute inset-0">
      {mapa}
    </div>
  ) : (
    mapa
  );
}
