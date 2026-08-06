/**
 * Toda la matemática del recorrido del mapa. Módulo puro, sin React ni DOM:
 * es la pieza con más aristas de la sección y así se puede razonar (y probar)
 * aparte de la animación.
 *
 * Idea general: el mapa es una capa de `mapW × mapH` px que se traslada dentro
 * de un "stage" fijo de `stageW × stageH`. Para cada parada existe una
 * traslación (tx, ty) que la deja en el punto de foco. El scroll interpola
 * entre esas traslaciones.
 */

import { MAP_ASPECT, type MapRoute } from './education-map.data';

export const clamp = (min: number, value: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** Dónde queremos que caiga la parada activa dentro del stage, en fracción. */
export const FOCUS = { x: 0.5, y: 0.5 } as const;

export interface ZoomRange {
  min: number;
  max: number;
}

/**
 * En móvil el rango deja pasar el zoom "ideal" (~2.56×), que es justo el que
 * permite centrar horizontalmente las cinco paradas sin recorte.
 * En tablet lo limitamos: el mapa se ve menos ampliado y entra más contexto,
 * a cambio de que las paradas de los extremos queden algo descentradas.
 */
export const ZOOM_MOBILE: ZoomRange = { min: 2.2, max: 2.9 };
export const ZOOM_TABLET: ZoomRange = { min: 1.5, max: 1.8 };

export interface MapTarget {
  tx: number;
  ty: number;
}

export interface MapLayout {
  stageW: number;
  stageH: number;
  mapW: number;
  mapH: number;
  /** Rectángulo de traslaciones válidas: las que mantienen el mapa cubriendo el stage. */
  txMin: number;
  txMax: number;
  tyMin: number;
  tyMax: number;
  /** Traslación que deja cada parada en el punto de foco, ya recortada. */
  targets: MapTarget[];
}

/**
 * Ancho mínimo de mapa para que ninguna parada quede recortada en un eje.
 * Sale de exigir que el destino sin recortar caiga dentro del rectángulo válido.
 */
function widthForExactFocus(stops: MapRoute[], stageW: number) {
  return stops.reduce(
    (acc, s) => Math.max(acc, (FOCUS.x * stageW) / s.u, ((1 - FOCUS.x) * stageW) / (1 - s.u)),
    0
  );
}

/**
 * Cuánto más alto que el stage tiene que quedar el mapa como mínimo. Sin esto,
 * en pantallas altas y angostas el mapa queda exactamente del alto del stage y
 * el movimiento vertical desaparece del todo.
 */
const COVER_BLEED = 1.06;

export function computeLayout(
  stageW: number,
  stageH: number,
  stops: MapRoute[],
  zoom: ZoomRange
): MapLayout {
  const desired = clamp(zoom.min * stageW, widthForExactFocus(stops, stageW), zoom.max * stageW);

  // El mapa siempre tiene que cubrir el stage; esa condición gana sobre el zoom máximo.
  // Se redondea hacia arriba para que el recorte no deje una hendija de subpíxel
  // en los extremos, y de paso el mapa se dibuja en tamaños enteros.
  const mapW = Math.ceil(Math.max(desired, stageW, stageH * MAP_ASPECT * COVER_BLEED));
  const mapH = Math.ceil(mapW / MAP_ASPECT);

  const txMin = stageW - mapW;
  const txMax = 0;
  const tyMin = stageH - mapH;
  const tyMax = 0;

  const targets = stops.map(s => ({
    tx: clamp(txMin, FOCUS.x * stageW - s.u * mapW, txMax),
    ty: clamp(tyMin, FOCUS.y * stageH - s.v * mapH, tyMax),
  }));

  return { stageW, stageH, mapW, mapH, txMin, txMax, tyMin, tyMax, targets };
}

/** Tramo de entrada y de salida, en múltiplos de la altura del stage. */
export const LEAD_IN = 0.35;
export const LEAD_OUT = 0.5;
/** Escala global del largo del recorrido. Bajarlo acorta el scroll total. */
export const LEG_BASE = 1;
const LEG_MIN = 0.7;
const LEG_MAX = 1.6;

export interface MapTrack {
  /** Largo de cada tramo entre paradas, en px de scroll. */
  legs: number[];
  /** Scroll acumulado hasta cada parada, medido desde el final del lead-in. */
  cum: number[];
  leadIn: number;
  leadOut: number;
  /** Scroll total durante el cual el stage queda fijo. */
  pin: number;
  /** Altura que hay que darle al track. */
  trackH: number;
}

/**
 * Reparte el scroll entre paradas en proporción a lo que se mueve el mapa, con
 * piso y techo. Así la velocidad aparente es pareja y el salto largo (ruta 3 a
 * ruta 4, de un extremo al otro) recibe el scroll que necesita en vez de pasar
 * volando.
 */
export function computeTrack(baseH: number, targets: MapTarget[]): MapTrack {
  const distances = targets
    .slice(1)
    .map((t, i) => Math.hypot(t.tx - targets[i].tx, t.ty - targets[i].ty));

  const total = distances.reduce((a, b) => a + b, 0);
  const mean = distances.length > 0 && total > 0 ? total / distances.length : 1;

  const legs = distances.map(d => baseH * clamp(LEG_MIN, (LEG_BASE * d) / mean, LEG_MAX));

  const cum: number[] = [0];
  for (const leg of legs) cum.push(cum[cum.length - 1] + leg);

  const leadIn = LEAD_IN * baseH;
  const leadOut = LEAD_OUT * baseH;
  const pin = leadIn + cum[cum.length - 1] + leadOut;

  return { legs, cum, leadIn, leadOut, pin, trackH: baseH + pin };
}

/** Progreso normalizado (0–1) en el que la parada `i` queda en el punto de foco. */
export const stopProgress = (i: number, track: MapTrack) =>
  track.pin > 0 ? (track.leadIn + track.cum[i]) / track.pin : 0;

/**
 * `window.scrollY` exacto que deja la parada `i` en el punto de foco.
 * Es la función inversa de `stopProgress`, y por eso "SIGUIENTE RUTA" aterriza
 * clavado: las dos usan el mismo `pin`, no la altura viva del viewport.
 */
export const stopScrollY = (i: number, trackTop: number, track: MapTrack) =>
  trackTop + track.leadIn + track.cum[i];

/**
 * Puntos de entrada del `useTransform` por tramos: los cinco progresos de
 * parada más las mesetas de entrada y salida.
 */
export function progressStops(track: MapTrack, count: number) {
  const inner = Array.from({ length: count }, (_, i) => stopProgress(i, track));
  return [0, ...inner, 1];
}

/** Los valores de salida correspondientes, repitiendo el primero y el último. */
export function targetSeries(targets: MapTarget[], axis: 'tx' | 'ty') {
  const inner = targets.map(t => t[axis]);
  return [inner[0], ...inner, inner[inner.length - 1]];
}
