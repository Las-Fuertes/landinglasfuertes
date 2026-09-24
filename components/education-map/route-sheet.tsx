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
    /* Envoltorio de posición. En móvil el contenedor apoya la hoja abajo: el margen la separa del
       borde como en Figma. En tablet el contenedor también la apoya abajo, así que se sube hasta
       el centro con un translate (su alto es el de la tarjeta, de ahí el 50 %). En desktop el
       contenedor ya centra. Va aparte del panel porque framer-motion escribe el transform del
       panel al animar. */
    <div className="mx-1 mb-6 w-full max-w-md md:mb-0 md:-translate-y-[calc(50dvh-0.5rem-50%)] lg:translate-y-0">
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        onKeyDown={onKeyDown}
        data-sheet-card=""
        initial={isSheet ? { y: '100%' } : { opacity: 0, scale: 0.96, y: 24 }}
        animate={isSheet ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
        exit={isSheet ? { y: '100%' } : { opacity: 0, scale: 0.97, y: 16 }}
        transition={{ duration: isSheet ? 0.4 : 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto relative flex max-h-[calc(100dvh-3rem)] w-full flex-col"
      >
        {/* Marco rasgado: bloque negro con el filtro de papel y un recuadro papel
            encima. Va como hermano y no como ::before negativo, porque el panel se
            anima con transform y eso esconde cualquier capa con z-index negativo. */}
        <div aria-hidden className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black" style={{ filter: 'url(#map-rough-edge)' }} />
          <div className="absolute inset-1 bg-papel" style={{ filter: 'url(#map-rough-edge)' }} />
        </div>

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={labels.close}
          data-sheet-close=""
          className="group absolute right-1 top-1.5 z-20 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink/25 text-black transition group-hover:bg-pink group-focus-visible:ring-2 group-focus-visible:ring-black">
            <X className="h-3 w-3" strokeWidth={2.5} aria-hidden />
          </span>
        </button>

        {/* Una sola columna, igual en todos los anchos (Figma 894:754 y siguientes; D8). Si no
            cabe, primero se encoge la foto (hasta min-h-40) y solo después aparece el scroll,
            que el escudo de la sección deja pasar por `data-sheet-scroll`. */}
        <div
          data-sheet-scroll
          className="relative z-10 flex min-h-0 flex-col overflow-y-auto overscroll-contain px-8 pb-6 pt-14"
        >
          <h3
            id={titleId}
            data-sheet-title=""
            className="-mx-6 shrink-0 text-center text-[clamp(1.75rem,10.3vw,2.5rem)] font-bold leading-none tracking-[-0.04em]"
          >
            {title.split('\n').map((line, i) => (
              <span key={line} className={`block ${i > 0 ? '-mt-1.5' : ''}`}>
                <span className="map-chip map-chip--cinta !px-3 !py-1">
                  <span className="text-papel">{line}</span>
                </span>
              </span>
            ))}
          </h3>

          <div className="relative mt-6 flex aspect-[9/10] min-h-40 w-full flex-col">
            <span
              data-sheet-chip=""
              className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap bg-pink-sol px-2 py-1.5 text-base font-bold leading-none text-black"
            >
              {age}
            </span>
            <div data-sheet-photo="" className="h-full w-full overflow-hidden rounded-xl">
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
            data-sheet-body=""
            className="mt-5 shrink-0 text-base font-normal leading-[1.2] text-black"
          >
            {body}
          </p>

          {/* "Atrás" existe también en la primera parada: ahí no hay ruta anterior y vuelve al
              mapa (cierra), como la X. El contenedor distingue "Terminar" porque el clic sale
              de este <footer>; no cambiar la etiqueta. */}
          <footer className="-mr-2 mt-3 flex shrink-0 items-center justify-end gap-5">
            <button
              type="button"
              onClick={isFirst ? onClose : onPrev}
              disabled={busy}
              data-sheet-back=""
              className="-my-2 px-1 py-2 text-[0.625rem] font-extrabold uppercase leading-none text-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:opacity-40"
            >
              {labels.back}
            </button>

            <button
              type="button"
              onClick={isLast ? onClose : onNext}
              disabled={busy}
              data-sheet-next=""
              className={`inline-flex h-7 items-center gap-1 rounded bg-black ${isLast ? 'px-3' : 'pl-3 pr-1.5'} text-[0.625rem] font-extrabold uppercase leading-none text-papel transition hover:bg-black/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-50`}
            >
              {isLast ? labels.finish : labels.next}
              {!isLast && <ChevronRight className="h-3 w-3" strokeWidth={2} aria-hidden />}
            </button>
          </footer>
        </div>
      </motion.div>
    </div>
  );
}
