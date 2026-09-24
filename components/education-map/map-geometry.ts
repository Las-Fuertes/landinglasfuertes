/**
 * Toda la matemática del recorrido del mapa. Módulo puro, sin React ni DOM:
 * es la pieza con más aristas de la sección y así se puede razonar (y probar)
 * aparte de la animación.
 *
 * Idea general: el mapa es una capa de `mapW × mapH` px que se traslada dentro
 * de un "stage" fijo de `stageW × stageH`. Para cada parada existe una
 * traslación (tx, ty) que la encuadra. El scroll interpola entre esas
 * traslaciones.
 *
 * Encuadre (docs/mapa-educativo/DECISIONES.md, D2): en cada parada tiene que verse
 * ENTERO el grupo activo (etiqueta, ilustración y punto) y casi nada de los demás.
 * Por eso el zoom sale de la caja del grupo más grande, no de los puntos, y la
 * posición de cada parada se elige buscando la que menos muestra de las otras.
 * Fuera del mapa solo hay mar del mismo azul que el fondo del stage, así que la
 * cámara puede salirse del lienzo sin que se note.
 */

import { VIEWBOX, type MapBox, type MapRoute } from './education-map.data';

export const clamp = (min: number, value: number, max: number) =>
  Math.min(Math.max(value, min), max);

export interface Encuadre {
  /**
   * Fracción del zoom máximo. 1 es el zoom con el que el grupo más grande cabe
   * justo (con `pad` de aire) en el área visible; menos de 1 deja ver más mapa.
   */
  factor: number;
  /** Aire mínimo entre la caja activa y el borde del área visible, en px. */
  pad: number;
  /** Px de abajo del stage que tapa la barra con el nombre y los puntos. */
  insetBottom: number;
  /**
   * Px de arriba que ocupa el encabezado en la primera parada: el título va
   * encima del mapa y Talleres aparece debajo, en grande (D3). Si no cabe, se ignora.
   */
  reservaPrimera: number;
  /**
   * Caja del texto del título en px del stage, con la página al principio de la sección (D7).
   * Con ella se calcula el encuadre de entrada: lo que se ve antes de avanzar.
   */
  titulo?: CajaTitulo;
}

/** Borde inferior del texto del título y su extensión horizontal, en px del stage. */
export interface CajaTitulo {
  bottom: number;
  left: number;
  right: number;
}

/**
 * Silueta de lo que no es mar, vista desde arriba (D7): para cada franja de `SILUETA_PASO`
 * unidades del lienzo, la y más alta con algo dibujado (tierra rosada, la casa de Talleres con
 * su antena, el "Haz clic aquí"). Medida sobre `mapa-ruta-4000.webp` tomando el mínimo de cada
 * franja, así que es conservadora. Si el arte cambia, se vuelve a medir.
 */
const SILUETA_PASO = 20;
const SILUETA = [
  1520, 526, 501, 471, 437, 409, 385, 364, 345, 327, 311, 214, 214, 213, 216, 213, 220, 194, 190,
  187, 174, 95, 97, 91, 77, 71, 100, 90, 80, 72, 66, 62, 59, 57, 54, 51, 50, 49, 49, 49, 51, 53, 57,
  61, 66, 72, 79, 86, 95, 105, 116, 128, 144, 164, 190, 218, 244, 269, 291, 309, 324, 336, 343, 347,
  350, 354, 359, 368, 380, 395, 413, 437, 482, 588, 637, 682, 1520, 1520, 1520, 1520, 1520, 1520,
];

/** La y más alta con algo dibujado entre `x0` y `x1` (unidades del lienzo). */
export function topeSilueta(x0: number, x1: number) {
  const a = clamp(0, Math.floor(x0 / SILUETA_PASO), SILUETA.length - 1);
  const b = clamp(0, Math.floor(x1 / SILUETA_PASO), SILUETA.length - 1);
  let tope: number = VIEWBOX.h;
  for (let i = a; i <= b; i++) tope = Math.min(tope, SILUETA[i]);
  return tope;
}

/** Aire mínimo entre el texto del título y lo dibujado debajo en la primera pantalla (D7). */
export const AIRE_TITULO = 16;

/** Móvil: el grupo más grande (Talleres) llena el ancho. Una parada por pantalla. */
export const ENCUADRE_MOBILE: Omit<Encuadre, 'insetBottom' | 'reservaPrimera'> = {
  factor: 1,
  pad: 16,
};
/** Tablet: zoom intermedio, con más contexto alrededor, sin meter otra parada. */
export const ENCUADRE_TABLET: Omit<Encuadre, 'insetBottom' | 'reservaPrimera'> = {
  factor: 0.8,
  pad: 32,
};

export interface MapTarget {
  tx: number;
  ty: number;
}

export interface MapLayout {
  stageW: number;
  stageH: number;
  /** Alto del stage que de verdad se ve (sin la barra de abajo). */
  visibleH: number;
  /** px de pantalla por unidad del viewBox. */
  scale: number;
  mapW: number;
  mapH: number;
  /** Traslación que encuadra cada parada. */
  targets: MapTarget[];
  /**
   * Encuadre de la primera pantalla, antes de avanzar (D7): la parada 1 con el título encima.
   * Si hay alto de sobra coincide con `targets[0]`; si no, el mapa baja lo necesario para que
   * el título quede sobre el mar, y el tramo de entrada lo sube hasta el encuadre de la parada.
   */
  entrada: MapTarget;
}

/** Fracción (0 a 1) de la caja `b` que cae dentro del área visible con la traslación dada. */
export function visibleFraction(
  b: MapBox,
  scale: number,
  t: MapTarget,
  stageW: number,
  visibleH: number
) {
  const left = t.tx + b.x * scale;
  const top = t.ty + b.y * scale;
  const w = b.w * scale;
  const h = b.h * scale;
  const ix = Math.max(0, Math.min(left + w, stageW) - Math.max(left, 0));
  const iy = Math.max(0, Math.min(top + h, visibleH) - Math.max(top, 0));
  return w > 0 && h > 0 ? (ix * iy) / (w * h) : 0;
}

/** Lo máximo que se puede ver de otra parada en un encuadre (criterio de D2). */
export const MAX_OTRA_VISIBLE = 0.15;
/** Y de su cinta con el nombre, casi nada: una cinta ajena a medias confunde (D2). */
export const MAX_CINTA_VISIBLE = 0.05;

/** Pasos de la búsqueda por eje. 32 × 32 posiciones por parada: sobra y es instantáneo. */
const PASOS = 32;
/** Una cinta ajena que asoma distrae más que un trozo de dibujo: pesa esto más. */
const PESO_CINTA = 4;

/**
 * Elige dónde poner la caja activa dentro del área visible. Primero manda que las
 * otras paradas se vean lo menos posible (sus cintas, sobre todo); a igualdad, que
 * quede lo más centrada. Para las otras cuenta también la franja de la barra de
 * abajo: su degradado deja ver lo que pasa por detrás.
 */
function encuadrar(
  i: number,
  stops: MapRoute[],
  scale: number,
  stageW: number,
  visibleH: number,
  stageH: number,
  pad: number,
  reservaTop: number
): MapTarget {
  const b = stops[i].box;
  const bw = b.w * scale;
  const bh = b.h * scale;

  const rango = (min: number, max: number, libre: number) =>
    max >= min ? [min, max] : [libre / 2, libre / 2];
  const [l0, l1] = rango(pad, stageW - pad - bw, stageW - bw);
  // La reserva del encabezado se respeta hasta donde quepa: si no cabe entera, la caja
  // baja todo lo posible sin cortarse.
  const tope = visibleH - pad - bh;
  const [t0, t1] = rango(Math.min(pad + reservaTop, Math.max(pad, tope)), tope, visibleH - bh);

  const lc = clamp(l0, (stageW - bw) / 2, l1);
  const tc = clamp(t0, (visibleH - bh) / 2, t1);
  const diagonal = Math.hypot(stageW, visibleH);

  let best: MapTarget = { tx: lc - b.x * scale, ty: tc - b.y * scale };
  let bestScore = Infinity;
  for (let a = 0; a <= PASOS; a++) {
    const left = l0 + ((l1 - l0) * a) / PASOS;
    for (let c = 0; c <= PASOS; c++) {
      const top = t0 + ((t1 - t0) * c) / PASOS;
      const t = { tx: left - b.x * scale, ty: top - b.y * scale };
      let otras = 0;
      let excede = 0;
      for (let j = 0; j < stops.length; j++) {
        if (j === i) continue;
        // El criterio de D2 es duro: ninguna otra caja pasa de MAX_OTRA_VISIBLE.
        const cinta = visibleFraction(stops[j].label, scale, t, stageW, stageH);
        excede +=
          Math.max(
            0,
            visibleFraction(stops[j].box, scale, t, stageW, visibleH) - MAX_OTRA_VISIBLE
          ) + Math.max(0, cinta - MAX_CINTA_VISIBLE);
        otras += visibleFraction(stops[j].box, scale, t, stageW, stageH) + PESO_CINTA * cinta;
      }
      const score = excede * 1e4 + otras * 100 + Math.hypot(left - lc, top - tc) / diagonal;
      if (score < bestScore) {
        bestScore = score;
        best = t;
      }
    }
  }
  return best;
}

/** Si algún encuadre muestra de otra parada más de lo que permite D2 (caja o cinta). */
export function incumpleEncuadre(layout: MapLayout, stops: MapRoute[]) {
  const { targets, scale, stageW, stageH, visibleH } = layout;
  return targets.some((t, i) =>
    stops.some(
      (s, j) =>
        j !== i &&
        (visibleFraction(s.box, scale, t, stageW, visibleH) > MAX_OTRA_VISIBLE + 1e-3 ||
          visibleFraction(s.label, scale, t, stageW, stageH) > MAX_CINTA_VISIBLE + 1e-3)
    )
  );
}

function layoutCon(
  stageW: number,
  stageH: number,
  stops: MapRoute[],
  encuadre: Encuadre,
  factor: number
): MapLayout {
  const { pad, insetBottom, reservaPrimera } = encuadre;
  const visibleH = Math.max(1, stageH - insetBottom);

  // El zoom que deja al grupo más grande justo dentro del área visible.
  const fit = stops.reduce(
    (acc, s) => Math.min(acc, (stageW - 2 * pad) / s.box.w, (visibleH - 2 * pad) / s.box.h),
    Infinity
  );
  // Se redondea el ancho a px enteros para que el mapa se dibuje nítido.
  const mapW = Math.max(1, Math.floor(fit * factor * VIEWBOX.w));
  const scale = mapW / VIEWBOX.w;
  const mapH = Math.ceil(VIEWBOX.h * scale);

  const targets = stops.map((_, i) =>
    encuadrar(i, stops, scale, stageW, visibleH, stageH, pad, i === 0 ? reservaPrimera : 0)
  );
  const entrada = encuadreDeEntrada(targets[0], scale, encuadre.titulo);

  return { stageW, stageH, visibleH, scale, mapW, mapH, targets, entrada };
}

/**
 * Baja el encuadre de la parada 1 lo justo para que, bajo el texto del título, todo lo dibujado
 * (tierra, casa, antena) quede al menos `AIRE_TITULO` px más abajo (D7). Nunca lo sube: con alto
 * de sobra la entrada es la misma parada 1 y no hay movimiento en el tramo de entrada.
 */
function encuadreDeEntrada(t: MapTarget, scale: number, titulo?: CajaTitulo): MapTarget {
  if (!titulo || titulo.right <= titulo.left) return t;
  const tope = topeSilueta((titulo.left - t.tx) / scale, (titulo.right - t.tx) / scale);
  const ty = titulo.bottom + AIRE_TITULO - tope * scale;
  return ty > t.ty ? { tx: t.tx, ty } : t;
}

/**
 * Con el `factor` pedido; si en alguna parada se ve demasiado de otra (pantallas
 * apaisadas, sobre todo en tablet), sube el zoom de a poco hasta el máximo (1).
 */
export function computeLayout(
  stageW: number,
  stageH: number,
  stops: MapRoute[],
  encuadre: Encuadre
): MapLayout {
  let factor = encuadre.factor;
  let layout = layoutCon(stageW, stageH, stops, encuadre, factor);
  while (factor < 1 && incumpleEncuadre(layout, stops)) {
    factor = Math.min(1, factor + 0.05);
    layout = layoutCon(stageW, stageH, stops, encuadre, factor);
  }
  return layout;
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
 * piso y techo. Así la velocidad aparente es pareja y un tramo largo recibe el
 * scroll que necesita en vez de pasar volando. Con el orden de 2026-09-24 (D1) ya
 * no hay un tramo de un extremo al otro de la isla, pero el reparto sigue igual.
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

/**
 * Los valores de salida correspondientes: el encuadre de entrada (D7), las paradas y la
 * última repetida para la meseta de salida.
 */
export function targetSeries(layout: MapLayout, axis: 'tx' | 'ty') {
  const inner = layout.targets.map(t => t[axis]);
  return [layout.entrada[axis], ...inner, inner[inner.length - 1]];
}
