'use client';

import { useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import type { MapRoute } from './education-map.data';
import { routePhoto } from './education-map.data';

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export interface RouteSheetProps {
  route: MapRoute;
  /** `sheet` sube desde abajo (móvil y tablet), `dialog` es centrado (lg+). */
  variant: 'sheet' | 'dialog';
  title: string;
  age: string;
  body: string;
  imageAlt: string;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  labels: { back: string; next: string; finish: string; close: string };
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function RouteSheet({
  route,
  variant,
  title,
  age,
  body,
  imageAlt,
  isFirst,
  isLast,
  busy,
  labels,
  onClose,
  onNext,
  onPrev,
}: RouteSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isSheet = variant === 'sheet';

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  const titleId = `map-route-${route.id}-title`;
  const bodyId = `map-route-${route.id}-body`;

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onKeyDown={onKeyDown}
      initial={isSheet ? { y: '100%' } : { opacity: 0, scale: 0.96, y: 24 }}
      animate={isSheet ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
      exit={isSheet ? { y: '100%' } : { opacity: 0, scale: 0.97, y: 16 }}
      transition={{ duration: isSheet ? 0.4 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto relative flex max-h-[88dvh] w-full max-w-[30rem] flex-col lg:max-h-[86dvh] lg:max-w-[34rem]"
    >
      {/* Marco rasgado: bloque negro con el filtro de papel y un recuadro beige
          encima. Va como hermano y no como ::before negativo, porque el panel se
          anima con transform y eso esconde cualquier capa con z-index negativo. */}
      <div aria-hidden className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black" style={{ filter: 'url(#map-rough-edge)' }} />
        <div
          className="absolute inset-[5px] bg-[#FFF5E8]"
          style={{ filter: 'url(#map-rough-edge)' }}
        />
      </div>

      <div className="relative z-10 flex min-h-0 flex-col p-4 min-[380px]:p-5 lg:p-7">
        <header className="relative shrink-0 pr-10">
          <h3
            id={titleId}
            className="text-[clamp(1.25rem,5.6vw,1.75rem)] font-bold leading-[1.3] tracking-tight lg:text-[2rem]"
          >
            {title.split('\n').map(line => (
              <span key={line} className="block">
                <span className="map-chip">
                  <span className="text-white">{line}</span>
                </span>
              </span>
            ))}
          </h3>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className="absolute -top-1 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#F7D7E8] text-black transition hover:bg-pink focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <X className="h-4 w-4" strokeWidth={3} aria-hidden />
          </button>
        </header>

        {/* La única zona con scroll: el escudo de la sección la deja pasar.
            El degradado de abajo avisa que el texto sigue, algo necesario en
            pantallas cortas donde el párrafo no entra completo. */}
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-gradient-to-t from-[#FFF5E8] to-transparent"
          />
          <div data-sheet-scroll className="min-h-0 flex-1 overflow-y-auto overscroll-contain pt-5">
            <div className="relative">
              <span className="map-chip map-chip--pink map-chip--flat absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap">
                <span className="text-[clamp(0.75rem,3.4vw,0.9rem)] font-bold text-black">
                  {age}
                </span>
              </span>

              <div
                className="relative w-full overflow-hidden"
                style={{ height: 'clamp(130px, 26dvh, 300px)' }}
              >
                <picture>
                  <source type="image/avif" srcSet={routePhoto(route.id, 'avif')} />
                  <img
                    src={routePhoto(route.id, 'webp')}
                    alt={imageAlt}
                    width={route.image.width}
                    height={route.image.height}
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </picture>
              </div>
            </div>

            <p
              id={bodyId}
              className="mt-4 text-[clamp(0.875rem,3.7vw,1rem)] font-medium leading-[1.5] text-black lg:text-[1.05rem]"
            >
              {body}
            </p>
          </div>
        </div>

        <footer className="mt-4 flex shrink-0 flex-col gap-2 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-end min-[360px]:gap-5">
          {!isFirst && (
            <button
              type="button"
              onClick={onPrev}
              disabled={busy}
              className="h-11 shrink-0 text-[0.8rem] font-bold uppercase tracking-wide text-black transition disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-black min-[360px]:h-auto min-[360px]:py-1"
            >
              {labels.back}
            </button>
          )}

          <button
            type="button"
            onClick={isLast ? onClose : onNext}
            disabled={busy}
            className="inline-flex h-11 w-full items-center justify-center gap-1 rounded-md bg-black px-4 text-[0.8rem] font-bold uppercase tracking-wide text-white transition hover:bg-black/85 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 min-[360px]:w-auto"
          >
            {isLast ? labels.finish : labels.next}
            {!isLast && <ChevronRight className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />}
          </button>
        </footer>
      </div>
    </motion.div>
  );
}
