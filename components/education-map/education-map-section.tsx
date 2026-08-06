'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PageGrid } from '../layout/page-grid';
import { useTranslation } from '../../hooks/useTranslation';
import { MAP_ROUTES, ROUTE_COUNT } from './education-map.data';
import { computeLayout, computeTrack, stopScrollY, ZOOM_MOBILE, ZOOM_TABLET } from './map-geometry';
import { useMapPan, type PanGeometry } from './use-map-pan';
import { useRouteSequencer } from './use-route-sequencer';
import MapCanvas from './map-canvas';
import MapProgressDots from './map-progress-dots';
import RouteSheet from './route-sheet';

const DESKTOP_QUERY = '(min-width: 1024px)';
const TABLET_QUERY = '(min-width: 768px)';
const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);

export default function EducationMapSection() {
  const { t } = useTranslation();

  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
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

      const zoom = window.matchMedia(TABLET_QUERY).matches ? ZOOM_TABLET : ZOOM_MOBILE;
      const layout = computeLayout(stageW, stageH, MAP_ROUTES, zoom);
      const track = computeTrack(stageH, layout.targets);
      setGeometry({ layout, track, trackTop: readTrackTop() });
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(stageRef.current!);
    window.addEventListener('orientationchange', measure);
    // Las imágenes de arriba pueden asentarse tarde y correr el track.
    window.addEventListener('load', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('orientationchange', measure);
      window.removeEventListener('load', measure);
    };
  }, [pinned, readTrackTop]);

  const { x, y, activeIndex } = useMapPan(geometry, pinned, ROUTE_COUNT);

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

  const sequencer = useRouteSequencer({
    count: ROUTE_COUNT,
    isPinned: pinned,
    getStopScrollY,
  });
  const { isOpen, busy, index, openAt, revealStop, goNext, goPrev, close, handleExitComplete } =
    sequencer;

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
    const blockKeys = (event: KeyboardEvent) => {
      if (!SCROLL_KEYS.has(event.key) || insideSheet(event.target)) return;
      event.preventDefault();
    };

    window.addEventListener('wheel', blockPointer, { passive: false, capture: true });
    window.addEventListener('touchmove', blockPointer, { passive: false, capture: true });
    window.addEventListener('keydown', blockKeys);

    return () => {
      window.removeEventListener('wheel', blockPointer, true);
      window.removeEventListener('touchmove', blockPointer, true);
      window.removeEventListener('keydown', blockKeys);
    };
  }, [isOpen, busy]);

  const routeName = useCallback((i: number) => t(`${MAP_ROUTES[i].i18n}.name`), [t]);
  const hotspotLabel = useCallback(
    (i: number) => t('educationMap.a11y.openRoute', { name: routeName(i).replace(/\n/g, ' ') }),
    [routeName, t]
  );

  const activeRoute = MAP_ROUTES[index];

  return (
    <section
      id="mapa"
      className="relative w-full scroll-mt-16 bg-blue-700"
      style={{ overflowAnchor: 'none' }}
      aria-labelledby="education-map-title"
    >
      {/* Filtro de borde rasgado: lo usan los chips y el marco del modal.
          Vive acá y no en otra sección para no depender de que esa esté montada. */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <filter id="map-rough-edge" x="-3%" y="-3%" width="106%" height="106%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.028"
              numOctaves="4"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="6"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* El encabezado conserva el beige de la página; el azul empieza en el mapa. */}
      <div className="bg-beige pb-10 pt-12 md:pb-14 md:pt-16">
        <PageGrid>
          <div className="col-span-4 flex flex-col items-center text-center md:col-span-12">
            <h2
              id="education-map-title"
              className="max-w-[20rem] text-balance text-[clamp(1.25rem,5.8vw,1.75rem)] font-bold leading-[1.32] tracking-tight text-black md:max-w-[34rem] md:text-[2rem]"
            >
              {t('educationMap.title')}
            </h2>
          </div>
        </PageGrid>
      </div>

      {pinned ? (
        <div
          ref={trackRef}
          className="relative"
          style={geometry ? { height: geometry.track.trackH } : undefined}
        >
          <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-clip">
            <MapCanvas
              pinned
              mapWidth={geometry?.layout.mapW ?? 0}
              mapHeight={geometry?.layout.mapH ?? 0}
              x={x}
              y={y}
              hotspotLabel={hotspotLabel}
              onOpen={openAt}
              onReveal={revealStop}
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-blue-700 via-blue-700/80 to-transparent px-6 pb-6 pt-12">
              <p className="text-center text-[0.95rem] font-bold leading-tight text-black">
                {routeName(activeIndex).replace(/\n/g, ' ')}
              </p>
              <MapProgressDots activeIndex={activeIndex} />
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-8 md:px-8 md:py-12">
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="absolute inset-0 bg-black/50"
              style={{ touchAction: 'none' }}
              onClick={busy ? undefined : close}
            />
            <div className="pointer-events-none relative flex w-full justify-center">
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
                onClose={close}
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
