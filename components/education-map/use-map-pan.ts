'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMotionValue, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import type { MapLayout, MapTrack } from './map-geometry';
import { progressStops, targetSeries } from './map-geometry';
import { CURVA, cssCurva, duracionViaje } from './coreografia';

export interface PanGeometry {
  layout: MapLayout;
  track: MapTrack;
  /** Posición absoluta del track en la página, en px. */
  trackTop: number;
}

/**
 * Suave pero sin rebote: con damping 30 sobre stiffness 120 el amortiguamiento
 * es ζ ≈ 1.37, o sea sobreamortiguado. Importa porque un spring con rebote se
 * saldría del rectángulo de traslaciones válidas y dejaría ver el fondo.
 */
const SPRING = { stiffness: 120, damping: 30, mass: 1, restDelta: 0.25 } as const;

/** Suavizado por tramo. Deja el mapa llegando y saliendo despacio de cada parada. */
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Cuánto más cerca tiene que estar otra parada para robarle el foco a la actual. */
const ACTIVE_HYSTERESIS = 0.012;

interface Series {
  stops: number[];
  x: number[];
  y: number[];
}

function interpolate(progress: number, series: Series) {
  const { stops, x, y } = series;
  let i = 0;
  while (i < stops.length - 2 && progress > stops[i + 1]) i++;

  const span = stops[i + 1] - stops[i];
  const k = span > 0 ? easeInOutSine(clamp01((progress - stops[i]) / span)) : 0;
  return { tx: lerp(x[i], x[i + 1], k), ty: lerp(y[i], y[i + 1], k) };
}

/**
 * Convierte el scroll de la página en la traslación del mapa.
 *
 * Usa `useScroll()` crudo en vez de `useScroll({ target, offset })` a propósito:
 * el denominador de la versión con target es la altura viva del viewport, que
 * cambia cuando colapsa la barra del navegador móvil. Acá el denominador es el
 * mismo `track.pin` que usa `stopScrollY`, así que "SIGUIENTE RUTA" aterriza
 * exacto por construcción.
 */
export function useMapPan(geometry: PanGeometry | null, enabled: boolean, stopCount: number) {
  const { scrollY } = useScroll();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING);
  const y = useSpring(rawY, SPRING);

  const [activeIndex, setActiveIndex] = useState(0);
  /** La capa que se desliza durante un viaje (envuelve al mapa) y la del mapa. */
  const capaRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<HTMLDivElement>(null);
  /** Durante un viaje el scroll ya está en el destino y el mapa no le hace caso (D9). */
  const congeladoRef = useRef(false);
  const viajeRef = useRef<Animation | null>(null);
  const activeRef = useRef(0);
  const primedRef = useRef(false);
  const seriesRef = useRef<Series | null>(null);
  const geometryRef = useRef<PanGeometry | null>(null);

  const series = useMemo<Series | null>(
    () =>
      enabled && geometry
        ? {
            stops: progressStops(geometry.track, stopCount),
            x: targetSeries(geometry.layout, 'tx'),
            y: targetSeries(geometry.layout, 'ty'),
          }
        : null,
    [enabled, geometry, stopCount]
  );

  geometryRef.current = enabled ? geometry : null;
  seriesRef.current = series;

  const apply = useCallback(
    (scrollValue: number) => {
      const geo = geometryRef.current;
      const series = seriesRef.current;
      if (!geo || !series || congeladoRef.current) return;

      const progress =
        geo.track.pin > 0 ? clamp01((scrollValue - geo.trackTop) / geo.track.pin) : 0;
      const { tx, ty } = interpolate(progress, series);

      rawX.set(tx);
      rawY.set(ty);

      // El primer valor se planta sin animar: si no, al montar el mapa entraría
      // deslizándose desde el 0 del motion value.
      if (!primedRef.current) {
        primedRef.current = true;
        x.jump(tx);
        y.jump(ty);
      }

      let best = activeRef.current;
      let bestDistance = Math.abs(progress - series.stops[best + 1]);
      for (let i = 0; i < stopCount; i++) {
        const d = Math.abs(progress - series.stops[i + 1]);
        if (d < bestDistance - ACTIVE_HYSTERESIS) {
          bestDistance = d;
          best = i;
        }
      }
      if (best !== activeRef.current) {
        activeRef.current = best;
        setActiveIndex(best);
      }
    },
    [rawX, rawY, x, y, stopCount]
  );

  useMotionValueEvent(scrollY, 'change', apply);

  // Recolocar tras un cambio de tamaño o de modo, sin esperar a que haya scroll.
  useEffect(() => {
    if (!enabled || !geometry) {
      primedRef.current = false;
      return;
    }
    apply(window.scrollY);
  }, [enabled, geometry, apply]);

  useEffect(() => () => viajeRef.current?.cancel(), []);

  /**
   * Viaje de "Siguiente ruta" (D9). En vez de desplazar la página cientos de px frame a frame
   * (scroll, sticky, evento, React y el spring del mapa, todo en el hilo principal), la página
   * salta de una vez al destino con el mapa congelado, el mapa se planta en el encuadre de
   * llegada y la capa que lo envuelve arranca desplazada lo que falta y vuelve a cero con una
   * animación de la Web Animations API. Es una sola animación de `transform` que corre en el
   * compositor: el hilo principal no trabaja durante el viaje, y el mapa no se vuelve a pintar.
   * Al llegar, el nombre de la barra y la parada activa se actualizan.
   */
  const viajar = useCallback(
    (destino: number) =>
      new Promise<void>(resolve => {
        viajeRef.current?.cancel();
        const geo = geometryRef.current;
        const series = seriesRef.current;
        const capa = capaRef.current;
        const mapa = mapaRef.current;
        if (!geo || !series || !capa || !mapa || geo.track.pin <= 0) {
          window.scrollTo(0, destino);
          resolve();
          return;
        }

        const { tx, ty } = interpolate(clamp01((destino - geo.trackTop) / geo.track.pin), series);
        const dx = x.get() - tx;
        const dy = y.get() - ty;

        congeladoRef.current = true;
        // El spring queda ya en el destino: `set` lo arranca y `jump` lo planta sin animar.
        rawX.set(tx);
        rawY.set(ty);
        x.jump(tx);
        y.jump(ty);
        // framer-motion escribe el transform en su propio frame; aquí se escribe ya, para que el
        // mapa y la capa que lo compensa cambien en el mismo frame y no haya un salto.
        mapa.style.transform = `translateX(${tx}px) translateY(${ty}px) translateZ(0)`;
        window.scrollTo(0, destino);

        const fin = () => {
          if (viajeRef.current !== anim) return;
          viajeRef.current = null;
          congeladoRef.current = false;
          apply(window.scrollY);
          resolve();
        };
        const anim = capa.animate(
          [
            { transform: `translate3d(${dx}px, ${dy}px, 0)` },
            { transform: 'translate3d(0, 0, 0)' },
          ],
          { duration: duracionViaje(Math.hypot(dx, dy)), easing: cssCurva(CURVA.viaje) }
        );
        viajeRef.current = anim;
        anim.onfinish = fin;
        // Cancelado (desmontaje u otro viaje): si otro viaje ya tomó el relevo, no se descongela.
        anim.oncancel = () => {
          if (viajeRef.current === anim) {
            viajeRef.current = null;
            congeladoRef.current = false;
            apply(window.scrollY);
          }
          resolve();
        };
      }),
    [apply, rawX, rawY, x, y]
  );

  return { x, y, activeIndex, capaRef, mapaRef, viajar };
}
