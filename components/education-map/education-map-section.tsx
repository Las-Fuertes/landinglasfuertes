'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { MAP_ROUTES, ROUTE_COUNT, routePhoto } from './education-map.data';
import {
  type CajaTitulo,
  computeLayout,
  computeTrack,
  ENCUADRE_MOBILE,
  ENCUADRE_TABLET,
  stopScrollY,
} from './map-geometry';
import { useMapPan, type PanGeometry } from './use-map-pan';
import { useRouteSequencer } from './use-route-sequencer';
import MapCanvas from './map-canvas';
import MapProgressDots from './map-progress-dots';
import RouteSheet from './route-sheet';
import MapTitle from './map-title';
import { useSaltarMapa } from './use-saltar-mapa';
import { CURVA, sinAceleracion, TIEMPO } from './coreografia';
import { useSumateDrawer } from '../sumate';

const DESKTOP_QUERY = '(min-width: 1024px)';
const TABLET_QUERY = '(min-width: 768px)';
const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);

/**
 * Caja del texto del título en px del stage, con la página al principio de la sección (D7). Se
 * mide por líneas (un `Range`), no por la caja del `h2`: el título va centrado y equilibrado, y
 * lo que importa es dónde hay letras.
 */
function medirTitulo(
  titulo: HTMLElement | null,
  track: HTMLElement | null
): CajaTitulo | undefined {
  const h2 = titulo?.querySelector('h2');
  if (!h2 || !track) return undefined;
  const origen = track.getBoundingClientRect();
  const rango = document.createRange();
  rango.selectNodeContents(h2);
  const lineas = Array.from(rango.getClientRects()).filter(r => r.width > 0 && r.height > 0);
  if (lineas.length === 0) return undefined;
  return {
    bottom: Math.max(...lineas.map(r => r.bottom)) - origen.top,
    left: Math.min(...lineas.map(r => r.left)) - origen.left,
    right: Math.max(...lineas.map(r => r.right)) - origen.left,
  };
}

export default function EducationMapSection() {
  const { t } = useTranslation();

  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const geometryRef = useRef<PanGeometry | null>(null);

  // Arranca estático para que el HTML del servidor y el del cliente coincidan;
  // el recorrido se enciende recién al montar, si el dispositivo lo pide.
  const [pinned, setPinned] = useState(false);
  const [geometry, setGeometry] = useState<PanGeometry | null>(null);
  geometryRef.current = geometry;

  useEffect(() => {
    const reduce = window.matchMedia(REDUCE_QUERY);
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const apply = () => setPinned(!reduce.matches && !desktop.matches);

    apply();
    reduce.addEventListener('change', apply);
    desktop.addEventListener('change', apply);
    return () => {
      reduce.removeEventListener('change', apply);
      desktop.removeEventListener('change', apply);
    };
  }, []);

  const readTrackTop = useCallback(
    () => (trackRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY,
    []
  );

  useEffect(() => {
    if (!pinned) {
      setGeometry(null);
      return;
    }

    const measure = () => {
      const stage = stageRef.current;
      if (!stage) return;

      const stageW = stage.clientWidth;
      const stageH = stage.clientHeight;
      if (stageW === 0 || stageH === 0) return;

      const base = window.matchMedia(TABLET_QUERY).matches ? ENCUADRE_TABLET : ENCUADRE_MOBILE;
      // La barra de abajo (nombre y puntos) tapa el mapa: no cuenta como área visible. El
      // encabezado ocupa la parte de arriba de la primera parada (D3).
      const layout = computeLayout(stageW, stageH, MAP_ROUTES, {
        ...base,
        insetBottom: barRef.current?.offsetHeight ?? 0,
        reservaPrimera: titleRef.current?.offsetHeight ?? 0,
        // La primera pantalla deja el título sobre el mar, sin tocar tierra ni casa (D7).
        titulo: medirTitulo(titleRef.current, trackRef.current),
      });
      const track = computeTrack(stageH, layout.targets);
      setGeometry({ layout, track, trackTop: readTrackTop() });
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(stageRef.current!);
    if (titleRef.current) observer.observe(titleRef.current);
    window.addEventListener('orientationchange', measure);
    // Las imágenes de arriba pueden asentarse tarde y correr el track.
    window.addEventListener('load', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('orientationchange', measure);
      window.removeEventListener('load', measure);
    };
  }, [pinned, readTrackTop]);

  const { x, y, activeIndex, capaRef, mapaRef, viajar } = useMapPan(geometry, pinned, ROUTE_COUNT);

  const getStopScrollY = useCallback(
    (index: number) => {
      const current = geometryRef.current;
      if (!current) return null;

      // Volver a medir justo antes de saltar: si el track se movió, corregimos
      // también la geometría para que el recorrido y el destino no se separen.
      const top = readTrackTop();
      if (Math.abs(top - current.trackTop) > 1) {
        const updated = { ...current, trackTop: top };
        geometryRef.current = updated;
        setGeometry(updated);
      }
      return stopScrollY(index, top, current.track);
    },
    [readTrackTop]
  );

  // Al cerrar, el foco vuelve a la parada activa: el mapa ya está en ella y no se mueve (D6).
  const getReturnFocus = useCallback(
    (i: number) => document.querySelector<HTMLElement>(`#mapa [data-parada="${MAP_ROUTES[i].id}"]`),
    []
  );
  // La foto del modal siguiente se decodifica durante el viaje, no mientras sube la tarjeta (D9).
  const precargar = useCallback((i: number) => {
    const foto = new Image();
    foto.src = routePhoto(MAP_ROUTES[i].id, 'avif');
    return foto.decode();
  }, []);
  const sequencer = useRouteSequencer({
    count: ROUTE_COUNT,
    isPinned: pinned,
    getStopScrollY,
    getReturnFocus,
    viajar,
    precargar,
  });
  const {
    isOpen,
    busy,
    index,
    openAt,
    revealStop,
    goNext,
    goPrev,
    close,
    leave,
    abort,
    handleExitComplete,
  } = sequencer;

  // Con el mapa fijado: la página está entre el principio y el final del tramo fijo.
  const isFixed = useCallback(() => {
    const current = geometryRef.current;
    if (!current) return false;
    const y = window.scrollY;
    return y >= current.trackTop - 1 && y <= current.trackTop + current.track.pin + 1;
  }, []);

  // Con el drawer de Súmate abierto tampoco: el scroll es del drawer, no del mapa (D4).
  const { isOpen: drawerOpen } = useSumateDrawer();
  const skip = useSaltarMapa({
    activo: pinned,
    bloqueado: isOpen || busy || drawerOpen,
    fijado: isFixed,
    destino: 'impacto',
  });
  const { saltar } = skip;

  /**
   * "Terminar" en la última parada saca del mapa hacia Impacto, como "Saltar mapa" (D6). El
   * modal solo avisa con `onClose`, que también usan la X, Escape, el fondo y el "Atrás" de la
   * primera parada; para distinguirlo, el contenedor anota en captura si el clic vino del botón
   * de avance del pie del modal (no el `data-sheet-back`) y lo borra al terminar el clic.
   */
  const clicEnPieRef = useRef(false);
  const onSheetClose = useCallback(() => {
    const terminar = clicEnPieRef.current && index === ROUTE_COUNT - 1;
    clicEnPieRef.current = false;
    if (terminar) void leave(saltar);
    else void close();
  }, [close, index, leave, saltar]);

  // Escudo de entrada: frena a la persona sin tocar `body.overflow`, porque
  // entre ruta y ruta seguimos necesitando mover la página nosotros.
  useEffect(() => {
    if (!isOpen && !busy) return;

    const insideSheet = (target: EventTarget | null) =>
      target instanceof Element && target.closest('[data-sheet-scroll]') !== null;

    const blockPointer = (event: Event) => {
      if (insideSheet(event.target)) return;
      event.preventDefault();
    };
    // Escape entre paradas (el modal saliendo o el mapa viajando) cancela la apertura (D9).
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && abort()) event.preventDefault();
    };
    const blockKeys = (event: KeyboardEvent) => {
      if (!SCROLL_KEYS.has(event.key) || insideSheet(event.target)) return;
      event.preventDefault();
    };

    window.addEventListener('wheel', blockPointer, { passive: false, capture: true });
    window.addEventListener('touchmove', blockPointer, { passive: false, capture: true });
    window.addEventListener('keydown', blockKeys);
    window.addEventListener('keydown', onEscape);

    return () => {
      window.removeEventListener('wheel', blockPointer, true);
      window.removeEventListener('touchmove', blockPointer, true);
      window.removeEventListener('keydown', blockKeys);
      window.removeEventListener('keydown', onEscape);
    };
  }, [abort, isOpen, busy]);

  const routeName = useCallback((i: number) => t(`${MAP_ROUTES[i].i18n}.name`), [t]);
  const hotspotLabel = useCallback(
    (i: number) => t('educationMap.a11y.openRoute', { name: routeName(i).replace(/\n/g, ' ') }),
    [routeName, t]
  );

  const activeRoute = MAP_ROUTES[index];
  const reducido = useReducedMotion();

  return (
    <section
      id="mapa"
      className="relative w-full scroll-mt-16 bg-blue-700"
      style={{ overflowAnchor: 'none' }}
      aria-labelledby="education-map-title"
      // El botón flotante de Súmate se retira mientras esta sección está en pantalla (D5).
      data-oculta-flotante=""
    >
      {/* Todo sobre el mar (D3): el título ya no va en beige. Sin recorrido, encima del mapa. */}
      {!pinned && <MapTitle ref={titleRef} title={t('educationMap.title')} overlay={false} />}

      {pinned ? (
        <div
          ref={trackRef}
          className="relative"
          style={geometry ? { height: geometry.track.trackH } : undefined}
          data-paradas-y={
            geometry
              ? MAP_ROUTES.map((_, i) =>
                  Math.round(stopScrollY(i, geometry.trackTop, geometry.track))
                ).join(',')
              : undefined
          }
        >
          {/* Con recorrido, el encabezado flota sobre la primera pantalla del mapa y se va con
              el scroll; la parada 1 queda debajo, en grande (D3). */}
          <MapTitle ref={titleRef} title={t('educationMap.title')} overlay />
          <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-clip">
            {/* Salida para quien pasa con prisa (D4). Va antes que las paradas: con Tab es lo
                primero que se alcanza, como un enlace de "saltar contenido". */}
            <button
              ref={skip.saltarRef}
              type="button"
              onClick={() => void skip.saltar()}
              onFocus={skip.mostrar}
              data-saltar-mapa=""
              data-visible={skip.visible ? '' : undefined}
              className={`absolute right-page-margin top-m z-30 rounded-full border border-black/10 bg-white/80 px-5 py-2 text-sm font-bold text-black shadow-lg backdrop-blur-sm transition duration-300 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue ${
                skip.visible ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              {t('educationMap.saltar')}
            </button>

            <MapCanvas
              pinned
              capaRef={capaRef}
              mapaRef={mapaRef}
              mapWidth={geometry?.layout.mapW ?? 0}
              mapHeight={geometry?.layout.mapH ?? 0}
              x={x}
              y={y}
              hotspotLabel={hotspotLabel}
              onOpen={openAt}
              onReveal={revealStop}
            />

            <div
              ref={barRef}
              className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-s bg-gradient-to-t from-blue-700 via-blue-700/80 to-transparent px-6 pb-m pt-l"
            >
              {/* Compacto (D7): el alto de esta barra se le resta al área visible de cada parada. */}
              <p className="text-center text-[0.95rem] font-bold leading-tight text-black">
                {routeName(activeIndex).replace(/\n/g, ' ')}
              </p>
              <MapProgressDots activeIndex={activeIndex} />
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 pb-8 md:px-8 md:pb-12">
          <MapCanvas
            pinned={false}
            mapWidth={0}
            mapHeight={0}
            x={x}
            y={y}
            hotspotLabel={hotspotLabel}
            onOpen={openAt}
            onReveal={revealStop}
          />
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {isOpen
          ? t('educationMap.a11y.step', {
              n: String(index + 1),
              total: String(ROUTE_COUNT),
              name: routeName(index).replace(/\n/g, ' '),
            })
          : ''}
      </p>

      <AnimatePresence onExitComplete={handleExitComplete}>
        {isOpen && (
          <motion.div
            key="map-overlay"
            className="fixed inset-0 z-[100] flex items-end justify-center p-2 lg:items-center lg:p-6"
            // El velo se aclara antes que la tarjeta (el mapa asoma pronto) y se oscurece a la
            // par que sube la siguiente (D9).
            onUpdate={sinAceleracion}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: {
                duration: reducido ? 0 : TIEMPO.veloApertura / 1000,
                ease: CURVA.entrada,
              },
            }}
            exit={{
              opacity: 0,
              transition: { duration: reducido ? 0 : TIEMPO.veloCierre / 1000, ease: CURVA.salida },
            }}
          >
            <div
              className="absolute inset-0 bg-black/50"
              style={{ touchAction: 'none' }}
              onClick={busy ? undefined : close}
            />
            <div
              className="pointer-events-none relative flex w-full justify-center"
              onClickCapture={event => {
                clicEnPieRef.current =
                  event.target instanceof Element &&
                  event.target.closest('[role="dialog"] footer button:not([data-sheet-back])') !==
                    null;
              }}
              onClick={() => {
                clicEnPieRef.current = false;
              }}
            >
              <RouteSheet
                key={activeRoute.id}
                route={activeRoute}
                variant={pinned ? 'sheet' : 'dialog'}
                title={t(`${activeRoute.i18n}.name`)}
                age={t(`${activeRoute.i18n}.age`)}
                body={t(`${activeRoute.i18n}.body`)}
                imageAlt={t(`${activeRoute.i18n}.imageAlt`)}
                isFirst={index === 0}
                isLast={index === ROUTE_COUNT - 1}
                busy={busy}
                labels={{
                  back: t('educationMap.actions.back'),
                  next: t('educationMap.actions.next'),
                  finish: t('educationMap.actions.finish'),
                  close: t('educationMap.actions.close'),
                }}
                onClose={onSheetClose}
                onNext={goNext}
                onPrev={goPrev}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
