'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useIsPresent, useReducedMotion } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import type { MapRoute } from './education-map.data';
import { MODAL_DESKTOP, PAJAROS, routePhoto, routePhotoDesktop } from './education-map.data';
import { Resaltado } from '../layout/resaltado';
import { CURVA, sinAceleracion, TIEMPO } from './coreografia';

const DESKTOP_QUERY = '(min-width: 1024px)';

/** Marco de pincel de la foto en desktop, en px de Figma (export de Rectangle 155, D12). */
const MARCO_FOTO = { w: 372, h: 343 };

/** px de Figma a rem, para las medidas del adorno que salen del diseño (D11). */
const rem = (px: number) => `${px / 16}rem`;

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

  // El modal solo existe en el cliente (se abre con un clic), así que se puede leer el ancho al
  // montar. Solo decide si el nombre va en una cinta (desktop) o en las de mobile (D11).
  const [esDesktop, setEsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const cambiar = () => setEsDesktop(mq.matches);
    mq.addEventListener('change', cambiar);
    return () => mq.removeEventListener('change', cambiar);
  }, []);

  const { pajaros } = MODAL_DESKTOP[route.id];
  const pajarosEstilo = {
    left: rem(pajaros.x),
    top: rem(pajaros.y),
    width: rem(PAJAROS.w),
    height: rem(PAJAROS.h),
  };

  // El vector del marco mide 372 x 343 y la foto 369 x 340: 1,5 px de trazo fuera por lado.
  const marcoEstilo = {
    left: rem(-1.5),
    top: rem(-1.5),
    width: rem(MARCO_FOTO.w),
    height: rem(MARCO_FOTO.h),
  };

  const titleId = `map-route-${route.id}-title`;
  const bodyId = `map-route-${route.id}-body`;

  return (
    /* Envoltorio de ancho. El contenedor de la sección centra la tarjeta en los tres anchos
       (D11: en mobile ya no se apoya abajo). Va aparte del panel porque framer-motion escribe el
       transform del panel al animar. */
    <div className="w-full max-w-md lg:max-w-[59.625rem]">
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
        className={`relative flex max-h-[calc(100dvh-1rem)] min-h-[min(88dvh,calc(100dvh-1rem))] w-full flex-col lg:max-h-[90dvh] lg:min-h-[min(42.625rem,90dvh)] ${presente ? 'pointer-events-auto' : 'pointer-events-none'}`}
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

        {/* Cerrar: círculo de 30 px (D11, accesibilidad), a 30 px del borde de arriba y 40 del
            de la derecha en desktop como en Figma. */}
        <button
          ref={closeRef}
          type="button"
          onClick={apagado ? undefined : onClose}
          aria-disabled={apagado || undefined}
          aria-label={labels.close}
          data-sheet-close=""
          className="absolute right-3 top-3 z-20 flex size-7.5 items-center justify-center rounded-full bg-pink/25 text-black transition hover:bg-pink focus:outline-none focus-visible:ring-2 focus-visible:ring-black aria-disabled:opacity-40 lg:right-10 lg:top-7.5"
        >
          <X className="size-4" strokeWidth={2.5} aria-hidden />
        </button>

        {/* Mobile y tablet: una columna (D8), centrada en vertical dentro de una tarjeta más alta
            (D11). Los márgenes automáticos del título y del pie reparten el alto sobrante y, a
            diferencia de `justify-center`, no esconden el principio cuando hace scroll. Si no
            cabe, primero se encoge la foto (hasta min-h-40) y luego aparece el scroll, que el
            escudo de la sección deja pasar por `data-sheet-scroll`.
            Desktop (lg, Figma 1335:2046 y siguientes; D11): título y edades centrados arriba; la
            foto de 369 x 340 con marco de pincel a la izquierda y, a su derecha, el párrafo centrado
            en su alto con el pie abajo. */}
        <div
          data-sheet-scroll
          className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-9 pb-10 pt-16 lg:grid lg:grid-cols-[23.0625rem_minmax(0,1fr)] lg:content-start lg:gap-x-14 lg:px-20 lg:pb-xl lg:pt-24"
        >
          <h3
            id={titleId}
            data-sheet-title=""
            className="-mx-6 mt-auto shrink-0 text-center text-[clamp(1.75rem,10.3vw,2.5rem)] font-bold leading-[1.2] tracking-[-0.04em] lg:col-span-2 lg:mx-0 lg:mt-0 lg:px-10 lg:text-[3.125rem] lg:leading-none lg:[&_.resaltado-pieza--inicio]:z-[1] lg:[&_.resaltado]:[--fondo-alto:1.18em]"
          >
            {/* Una tira por línea (docs/resaltado/DECISIONES.md, D1): el `\n` del locale separa
                título y subtítulo, y si una parte no cabe el navegador la parte en dos tiras. En
                desktop, Figma pone en una sola cinta los nombres que caben (D11).
                Desktop (D12, aprobado por Johan): las cintas se pisan como en Figma, una excepción
                local a la regla de no solape. Interlineado de 1 em y fondo de 1,18 em: cada cinta
                pisa 0,18 em (9 px) a la siguiente, como los 9 px de Figma en Voces. La primera va
                encima, así el fondo de la segunda no tapa los rasgos bajos de la primera línea.
                El fondo sobresale bajo la caja del título y el chip de edades lo pisa 4 px, como
                en Figma; el relleno de arriba (`lg:pt-24`) compensa la caja más baja. */}
            <Resaltado variante="titulo" giro={-0.54} style={{ ['--origen' as string]: 'center' }}>
              {esDesktop && MODAL_DESKTOP[route.id].unaLinea ? title.replace(/\n/g, ' ') : title}
            </Resaltado>
          </h3>

          {/* En mobile se monta 12 px sobre el borde de la foto (su `-mt-4`); en desktop, bajo el
              título, pisando apenas el borde de la cinta como en Figma. */}
          <span
            data-sheet-chip=""
            className="relative z-10 mt-3 shrink-0 self-center whitespace-nowrap bg-pink-sol px-2 py-1.5 text-base font-bold leading-none text-black lg:col-span-2 lg:row-start-2 lg:mt-0 lg:justify-self-center"
          >
            {age}
          </span>

          <div className="relative -mt-4 flex aspect-[9/10] min-h-40 w-full flex-col lg:col-start-1 lg:row-start-3 lg:mt-11 lg:aspect-auto lg:h-[21.25rem] lg:min-h-0 lg:w-[23.0625rem]">
            {/* La foto llega después del texto (D9). */}
            <motion.div
              data-sheet-photo=""
              className="h-full w-full overflow-hidden rounded-xl lg:rounded-none"
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
                {/* Desktop: el recorte de Figma, 369 x 340 a 2x (D11). */}
                <source
                  media={DESKTOP_QUERY}
                  type="image/avif"
                  srcSet={routePhotoDesktop(route.id, 'avif')}
                />
                <source
                  media={DESKTOP_QUERY}
                  type="image/webp"
                  srcSet={routePhotoDesktop(route.id, 'webp')}
                />
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
            {/* Marco de la foto en desktop (D12): el trazo de pincel de Figma (Rectangle 155, brush
                "Grindhouse" de 3 px, igual en los cinco modales), exportado como vector. Sobresale
                1,5 px por lado porque el trazo va centrado en el borde. Mobile y tablet no lo
                llevan: en Figma la foto es redondeada y sin marco. */}
            <motion.img
              aria-hidden
              src="/images/education-map/modal/marco-foto.svg"
              alt=""
              width={372}
              height={343}
              draggable={false}
              data-sheet-marco=""
              className="pointer-events-none absolute hidden max-w-none select-none lg:block"
              style={marcoEstilo}
              onUpdate={sinAceleracion}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: seg(TIEMPO.foto),
                delay: seg(TIEMPO.fotoRetraso),
                ease: CURVA.entrada,
              }}
            />
            {/* Adorno de pájaros de Figma (Vector 1313), solo en desktop; su esquina cambia con
                la parada. Llega con la foto. */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute hidden items-center justify-center lg:flex"
              style={pajarosEstilo}
              onUpdate={sinAceleracion}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: seg(TIEMPO.foto),
                delay: seg(TIEMPO.fotoRetraso),
                ease: CURVA.entrada,
              }}
            >
              <img
                src="/images/education-map/modal/pajaros.svg"
                alt=""
                width={73}
                height={92}
                className="h-auto w-[79.8%] -rotate-[15deg] select-none"
                draggable={false}
              />
            </motion.span>
          </div>

          {/* En mobile el envoltorio no existe (`contents`) y cada pieza sigue en la columna; en
              desktop es la columna derecha, del alto de la foto: el párrafo centrado en el hueco
              y el pie abajo, a ras del borde de la foto como en Figma. */}
          <div className="contents lg:col-start-2 lg:row-start-3 lg:mt-11 lg:flex lg:h-[21.25rem] lg:flex-col">
            <p
              id={bodyId}
              data-sheet-body=""
              className="mt-5 shrink-0 text-base font-normal leading-[1.2] text-black lg:my-auto lg:max-w-[22rem] lg:text-lg lg:leading-[1.25]"
            >
              {body}
            </p>

            {/* "Atrás" existe también en la primera parada: ahí no hay ruta anterior y vuelve al
              mapa (cierra), como la X. El contenedor distingue "Terminar" porque el clic sale
              de este <footer>; no cambiar la etiqueta. Botones de 40 px de alto como mínimo
              (D11, accesibilidad). */}
            <footer className="-mr-2 mb-auto mt-5 flex shrink-0 items-center justify-end gap-3 lg:mb-0 lg:mr-10 lg:mt-0">
              <button
                type="button"
                onClick={apagado ? undefined : isFirst ? onClose : onPrev}
                aria-disabled={apagado || undefined}
                data-sheet-back=""
                className="inline-flex min-h-10 min-w-10 items-center justify-center px-2 text-xs font-extrabold uppercase leading-none text-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-black aria-disabled:opacity-40"
              >
                {labels.back}
              </button>

              <button
                type="button"
                onClick={apagado ? undefined : isLast ? onClose : onNext}
                aria-disabled={apagado || undefined}
                data-sheet-next=""
                className={`inline-flex h-10 min-w-10 items-center gap-1 rounded bg-black ${isLast ? 'px-4' : 'pl-4 pr-2.5'} text-xs font-extrabold uppercase leading-none text-papel transition hover:bg-black/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 aria-disabled:opacity-50 aria-disabled:hover:bg-black`}
              >
                {isLast ? labels.finish : labels.next}
                {!isLast && <ChevronRight className="size-3.5" strokeWidth={2} aria-hidden />}
              </button>
            </footer>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
