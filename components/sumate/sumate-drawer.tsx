'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { EnDrawerContext, useSumateDrawer } from './sumate-drawer-context';
import SumateContenido from './sumate-contenido';
import { CURVA, sinAceleracion } from '../education-map/coreografia';

/** Mismo selector que la trampa de foco de `education-map/route-sheet.tsx`. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

const DESKTOP_QUERY = '(min-width: 1024px)';

/** Entrada ease-out y salida más corta (D2). Curvas de `education-map/coreografia.ts`. */
const ENTRADA = { duration: 0.4, ease: CURVA.entrada } as const;
const SALIDA = { duration: 0.22, ease: CURVA.salida } as const;

/** Desktop aparece en su sitio; móvil y tablet suben desde abajo, como `route-sheet.tsx`. */
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
 * "Súmate a Las Fuertes" (docs/sumate-drawer/DECISIONES.md, D2 y D3). En desktop (lg+) es un
 * modal a pantalla completa sobre papel, como una página más del sitio (Figma `1300:1865`); en
 * móvil y tablet sube desde abajo como sheet de `92dvh`, con el borde de arriba rasgado. Se abre
 * con `useSumateDrawer().open()`. Con `prefers-reduced-motion` solo hay fundido, sin desplazamiento.
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
  // desvanece. Un fundido de entrada del panel dejaba un cuadro en opacidad 0 al terminar; en
  // desktop la opacidad va con `sinAceleracion` para no repetir ese parpadeo (coreografia.ts).
  const entra = reduce ? { opacity: 1 } : esDesktop ? { opacity: 0, y: 24 } : { y: '100%' };
  const visible = reduce ? { opacity: 1 } : esDesktop ? { opacity: 1, y: 0 } : { y: 0 };
  const sale = reduce ? { opacity: 0 } : esDesktop ? { opacity: 0, y: 12 } : { y: '100%' };

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="sumate-drawer" className="fixed inset-0 z-[90] overflow-clip">
          {/* `overflow-clip` y no `hidden`: un `scrollIntoView` (el de `#donar`) desplazaba la raíz
              y subía el sheet entero. Velo: en desktop el modal tapa toda la pantalla y el velo
              solo se ve en el fundido. */}
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
            onUpdate={sinAceleracion}
            initial={entra}
            animate={{ ...visible, transition: ENTRADA }}
            exit={{ ...sale, transition: SALIDA }}
            data-sumate-panel=""
            className="absolute inset-x-0 bottom-0 flex h-[92dvh] flex-col lg:inset-0 lg:h-full"
          >
            {/* Fondo de papel. En el sheet, el borde de arriba es rasgado (el filtro del footer)
                y la capa se sale por los lados y por abajo para que solo se rasgue arriba. En
                desktop cubre la pantalla y no hay borde que rasgar. */}
            <div
              aria-hidden
              className="absolute -inset-x-l -bottom-l top-0 bg-papel [filter:url(#footer-rough-edge)] lg:inset-0 lg:[filter:none]"
            />

            {/* Asa del sheet: solo decorativa, marca que el panel sube desde abajo. */}
            <span
              aria-hidden
              className="absolute left-1/2 top-s z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-black/20 lg:hidden"
            />

            {/* Cerrar: círculo de 40 px como el del modal del mapa, fijo en la esquina mientras
                el contenido se desplaza debajo. */}
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label={t('sumate.drawer.cerrar')}
              data-sumate-cerrar=""
              className="absolute right-m top-m z-20 flex size-10 items-center justify-center rounded-full bg-pink-sol/40 text-black backdrop-blur-sm transition hover:bg-pink-sol focus:outline-none focus-visible:ring-2 focus-visible:ring-black lg:right-xl lg:top-7.5"
            >
              <X className="size-5" strokeWidth={2.5} aria-hidden />
            </button>

            <div
              data-drawer-scroll
              className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
            >
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
