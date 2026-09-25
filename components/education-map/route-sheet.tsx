'use client';

import { useCallback, useEffect, useRef } from 'react';
import { motion, useIsPresent, useReducedMotion } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import type { MapRoute } from './education-map.data';
import { routePhoto } from './education-map.data';
import { Resaltado } from '../layout/resaltado';
import { CURVA, sinAceleracion, TIEMPO } from './coreografia';

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
  const reducido = useReducedMotion();
  // Mientras la tarjeta se va (AnimatePresence la mantiene montada durante el cierre) o hay una
  // transición en marcha, los botones se ven y se anuncian apagados y no hacen nada. Sin
  // `disabled` ni `inert`: los dos le quitarían el foco al botón pulsado y lo tirarían al body.
  const presente = useIsPresent();
  const apagado = busy || !presente;
  const seg = (ms: number) => (reducido ? 0 : ms / 1000);

  // D9. Entra rápido y se posa (la curva de `FadeIn`), sale arrancando despacio. En móvil y tablet
  // sube desde abajo una parte de su alto, no entero: menos recorrido, menos mareo. Sin `scale`:
  // solo `transform` y `opacity`, que el compositor mueve sin volver a pintar el papel rasgado.
  const oculta = isSheet ? { opacity: 0, y: '40%' } : { opacity: 0, y: 32 };
  const saliendo = isSheet ? { opacity: 0, y: '45%' } : { opacity: 0, y: 16 };
  const entra = {
    y: { duration: seg(TIEMPO.apertura), ease: CURVA.entrada },
    opacity: { duration: seg(TIEMPO.apertura * 0.6), ease: CURVA.entrada },
  };
  const sale = {
    y: { duration: seg(TIEMPO.cierre), ease: CURVA.salida },
    // El papel se desvanece en el último tramo: el texto es lo último en irse.
    opacity: {
      duration: seg(TIEMPO.cierre * 0.55),
      delay: seg(TIEMPO.cierre * 0.45),
      ease: CURVA.salida,
    },
  };

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Saliendo, el Escape sigue hasta la sección: cancela la apertura de la siguiente (D9).
        if (apagado) return;
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
    [apagado, onClose]
  );

  const titleId = `map-route-${route.id}-title`;
  const bodyId = `map-route-${route.id}-body`;

  return (
    /* Envoltorio de posición. En móvil el contenedor apoya la hoja abajo: el margen la separa del
       borde como en Figma. En tablet el contenedor también la apoya abajo, así que se sube hasta
       el centro con un translate (su alto es el de la tarjeta, de ahí el 50 %). En desktop el
       contenedor ya centra. Va aparte del panel porque framer-motion escribe el transform del
       panel al animar. */
    <div className="mx-1 mb-6 w-full max-w-md md:mb-0 md:-translate-y-[calc(50dvh-0.5rem-50%)] lg:max-w-4xl lg:translate-y-0">
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        onKeyDown={onKeyDown}
        data-sheet-card=""
        onUpdate={sinAceleracion}
        initial={oculta}
        animate={{ opacity: 1, y: 0, transition: entra }}
        exit={{ ...saliendo, transition: sale }}
        // Capa propia: moverla no obliga a volver a pintar su contenido.
        style={{ willChange: 'transform, opacity' }}
        aria-busy={apagado || undefined}
        className={`relative flex max-h-[calc(100dvh-3rem)] w-full flex-col lg:max-h-[90dvh] ${presente ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {/* Marco rasgado: bloque negro con el filtro de papel y un recuadro papel
            encima. Va como hermano y no como ::before negativo, porque el panel se
            anima con transform y eso esconde cualquier capa con z-index negativo. Va en su
            propia capa (`will-change`): el filtro se rasteriza una vez al abrir, no en cada
            frame ni cuando cambia el texto (D9). */}
        <div aria-hidden className="absolute inset-0 z-0" style={{ willChange: 'transform' }}>
          <div className="absolute inset-0 bg-black" style={{ filter: 'url(#map-rough-edge)' }} />
          <div className="absolute inset-1 bg-papel" style={{ filter: 'url(#map-rough-edge)' }} />
        </div>

        <button
          ref={closeRef}
          type="button"
          onClick={apagado ? undefined : onClose}
          aria-disabled={apagado || undefined}
          aria-label={labels.close}
          data-sheet-close=""
          className="group absolute right-1 top-1.5 z-20 flex h-10 w-10 items-center justify-center rounded-full transition focus:outline-none aria-disabled:opacity-40"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink/25 text-black transition group-hover:bg-pink group-focus-visible:ring-2 group-focus-visible:ring-black">
            <X className="h-3 w-3" strokeWidth={2.5} aria-hidden />
          </span>
        </button>

        {/* Móvil y tablet: una columna (Figma 894:754 y siguientes; D8). Si no cabe, primero se
            encoge la foto (hasta min-h-40) y solo después aparece el scroll, que el escudo de la
            sección deja pasar por `data-sheet-scroll`. Desktop (lg): dos columnas, la foto a la
            izquierda y el texto a la derecha (D10). La rejilla coloca los mismos elementos; el
            chip va antes de la foto para poder cambiarlo de columna. */}
        <div
          data-sheet-scroll
          className="relative z-10 flex min-h-0 flex-col overflow-y-auto overscroll-contain px-8 pb-6 pt-14 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:grid-rows-[auto_auto_1fr_auto] lg:gap-x-10 lg:p-10"
        >
          <h3
            id={titleId}
            data-sheet-title=""
            className="-mx-6 shrink-0 text-center text-[clamp(1.75rem,10.3vw,2.5rem)] font-bold leading-[1.2] tracking-[-0.04em] lg:col-start-2 lg:row-start-1 lg:mx-0 lg:pr-6 lg:text-left"
          >
            {/* Una tira por línea (docs/resaltado/DECISIONES.md, D1): el `\n` del locale separa
                título y subtítulo, y si una parte no cabe el navegador la parte en dos tiras. */}
            <Resaltado variante="titulo" giro={-0.54} style={{ ['--origen' as string]: 'center' }}>
              {title}
            </Resaltado>
          </h3>

          {/* En móvil se monta 12 px sobre el borde de la foto (su `-mt-4`); en desktop, bajo el
              título. */}
          <span
            data-sheet-chip=""
            className="relative z-10 mt-3 shrink-0 self-center whitespace-nowrap bg-pink-sol px-2 py-1.5 text-base font-bold leading-none text-black lg:col-start-2 lg:row-start-2 lg:mt-5 lg:self-start lg:justify-self-start"
          >
            {age}
          </span>

          <div className="relative -mt-4 flex aspect-[9/10] min-h-40 w-full flex-col lg:col-start-1 lg:row-span-4 lg:row-start-1 lg:mt-0 lg:aspect-auto lg:h-full lg:min-h-96">
            {/* La foto llega después del texto (D9). */}
            <motion.div
              data-sheet-photo=""
              className="h-full w-full overflow-hidden rounded-xl lg:absolute lg:inset-0"
              onUpdate={sinAceleracion}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: seg(TIEMPO.foto),
                delay: seg(TIEMPO.fotoRetraso),
                ease: CURVA.entrada,
              }}
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
            </motion.div>
          </div>

          <p
            id={bodyId}
            data-sheet-body=""
            className="mt-5 shrink-0 text-base font-normal leading-[1.2] text-black lg:col-start-2 lg:row-start-3 lg:self-start"
          >
            {body}
          </p>

          {/* "Atrás" existe también en la primera parada: ahí no hay ruta anterior y vuelve al
              mapa (cierra), como la X. El contenedor distingue "Terminar" porque el clic sale
              de este <footer>; no cambiar la etiqueta. */}
          <footer className="-mr-2 mt-3 flex shrink-0 items-center justify-end gap-5 lg:col-start-2 lg:row-start-4 lg:mr-0 lg:mt-6">
            <button
              type="button"
              onClick={apagado ? undefined : isFirst ? onClose : onPrev}
              aria-disabled={apagado || undefined}
              data-sheet-back=""
              className="-my-2 px-1 py-2 text-[0.625rem] font-extrabold uppercase leading-none text-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-black aria-disabled:opacity-40"
            >
              {labels.back}
            </button>

            <button
              type="button"
              onClick={apagado ? undefined : isLast ? onClose : onNext}
              aria-disabled={apagado || undefined}
              data-sheet-next=""
              className={`inline-flex h-7 items-center gap-1 rounded bg-black ${isLast ? 'px-3' : 'pl-3 pr-1.5'} text-[0.625rem] font-extrabold uppercase leading-none text-papel transition hover:bg-black/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 aria-disabled:opacity-50 aria-disabled:hover:bg-black`}
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
