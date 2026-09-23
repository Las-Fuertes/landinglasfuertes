'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { EnDrawerContext, useSumateDrawer } from './sumate-drawer-context';
import SumateContenido from './sumate-contenido';

/** Mismo selector que la trampa de foco de `education-map/route-sheet.tsx`. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

const DESKTOP_QUERY = '(min-width: 1024px)';

/** Entrada ease-out y salida más corta (docs/sumate-drawer/DECISIONES.md, D2). */
const ENTRADA = { duration: 0.4, ease: [0.22, 1, 0.36, 1] } as const;
const SALIDA = { duration: 0.22, ease: [0.4, 0, 1, 1] } as const;

/** Desktop entra de lado; móvil y tablet suben desde abajo, como `route-sheet.tsx`. */
function useEsDesktop() {
  const [esDesktop, setEsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const calcular = () => setEsDesktop(mq.matches);
    calcular();
    mq.addEventListener('change', calcular);
    return () => mq.removeEventListener('change', calcular);
  }, []);
  return esDesktop;
}

/**
 * "Súmate a Las Fuertes" como drawer: lateral desde la derecha en lg+ (`max-w-xl`), sheet desde
 * abajo en móvil y tablet dejando una franja arriba. Se abre con `useSumateDrawer().open()`.
 * Con `prefers-reduced-motion` solo hay fundido, sin desplazamiento.
 */
export default function SumateDrawer() {
  const { t } = useTranslation();
  const { isOpen, close } = useSumateDrawer();
  const esDesktop = useEsDesktop();
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // stopPropagation: la intro escucha el teclado en window y no debe ver lo del drawer.
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      event.stopPropagation();

      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        el => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const activo = document.activeElement;
      const dentro = activo instanceof Node && panelRef.current.contains(activo);

      if (event.shiftKey && (activo === first || !dentro)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (activo === last || !dentro)) {
        event.preventDefault();
        first.focus();
      }
    },
    [close]
  );

  // Con movimiento reducido el panel aparece en su sitio (solo el overlay funde) y al cerrar se
  // desvanece. Un fundido de entrada del panel dejaba un cuadro en opacidad 0 al terminar.
  const entra = reduce ? { opacity: 1 } : esDesktop ? { x: '100%' } : { y: '100%' };
  const visible = reduce ? { opacity: 1 } : esDesktop ? { x: 0 } : { y: 0 };
  const sale = reduce ? { opacity: 0 } : entra;

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="sumate-drawer" className="fixed inset-0 z-[90]">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/50"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: ENTRADA }}
            exit={{ opacity: 0, transition: SALIDA }}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sumate-title"
            onKeyDown={onKeyDown}
            initial={entra}
            animate={{ ...visible, transition: ENTRADA }}
            exit={{ ...sale, transition: SALIDA }}
            className="absolute inset-x-0 bottom-0 flex h-[92dvh] flex-col overflow-hidden rounded-t-3xl bg-beige shadow-lg lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-full lg:max-w-xl lg:rounded-l-3xl lg:rounded-tr-none"
          >
            <div className="relative flex shrink-0 items-center justify-end px-m pb-xs pt-m">
              {/* Asa del sheet: solo decorativa, marca que el panel sube desde abajo. */}
              <span
                aria-hidden
                className="absolute left-1/2 top-s h-1 w-10 -translate-x-1/2 rounded-full bg-black/15 lg:hidden"
              />
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label={t('sumate.drawer.cerrar')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black transition hover:bg-beige-light focus:outline-none focus-visible:ring-2 focus-visible:ring-blue"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div data-drawer-scroll className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <EnDrawerContext.Provider value={true}>
                <SumateContenido />
              </EnDrawerContext.Provider>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
