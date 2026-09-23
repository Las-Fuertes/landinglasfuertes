'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { sendGAEvent } from '@next/third-parties/google';

/** Desde dónde se abrió el drawer. Se registra en GA como `sumate_open` (docs/sumate-drawer, D2). */
export type SumateOrigen = 'tripulantes' | 'footer' | 'flotante' | 'hash';

interface SumateDrawerState {
  isOpen: boolean;
  open: (origen: SumateOrigen) => void;
  close: () => void;
}

const SumateDrawerContext = createContext<SumateDrawerState | null>(null);

/**
 * Dentro del drawer las entradas con `FadeIn` se muestran directamente: el panel ya entra
 * animado y un segundo fundido encima se sentía lento. Fuera del drawer vale `false`.
 */
export const EnDrawerContext = createContext(false);
export const useEnDrawer = () => useContext(EnDrawerContext);

/** Hashes que abren el drawer al cargar o al cambiar: `#donar` es el "Reintentar" de /gracias. */
const HASHES_DRAWER = ['#sumate', '#donar'];

/** URL actual sin tocar `history.state`: el router de Next guarda ahí lo suyo. */
function reemplazarHash(hash: string) {
  const { pathname, search } = window.location;
  window.history.replaceState(window.history.state, '', `${pathname}${search}${hash}`);
}

/**
 * Estado único de apertura del drawer "Súmate a Las Fuertes". Lo provee `pages/index.tsx`
 * alrededor de la página y el footer; cualquier componente lo abre con
 * `useSumateDrawer().open('<origen>')`.
 *
 * - Abrir pone `#sumate` en la URL con `replaceState` y cerrar lo quita, sin scroll.
 * - `/#sumate` (o `/#donar`) abre el drawer al cargar. La intro, al ver un hash, se sirve
 *   estática (docs/introduccion/DECISIONES.md, D2), así que no hay pin detrás.
 * - Mientras está abierto, el body no se desplaza, y al cerrar el foco vuelve al disparador.
 */
export function SumateDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const disparadorRef = useRef<HTMLElement | null>(null);
  const abiertoRef = useRef(false);

  const open = useCallback((origen: SumateOrigen) => {
    if (abiertoRef.current) return;
    abiertoRef.current = true;
    const activo = document.activeElement;
    disparadorRef.current =
      activo instanceof HTMLElement && activo !== document.body ? activo : null;
    sendGAEvent('event', 'sumate_open', { origen });
    if (window.location.hash !== '#sumate') reemplazarHash('#sumate');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    if (!abiertoRef.current) return;
    abiertoRef.current = false;
    if (window.location.hash) reemplazarHash('');
    setIsOpen(false);
  }, []);

  // Deep link: al cargar con `#sumate`, y si el hash cambia después (un enlace viejo a
  // `#sumate`, o alguien que lo escribe en la barra).
  useEffect(() => {
    const revisar = () => {
      if (!HASHES_DRAWER.includes(window.location.hash)) return;
      const irADonar = window.location.hash === '#donar';
      open('hash');
      if (irADonar) {
        // Espera a que el panel monte para llevar el scroll interno hasta "¿Cómo quieres ayudar?".
        window.setTimeout(() => {
          document.getElementById('donar')?.scrollIntoView({ block: 'start' });
        }, 450);
      }
    };
    revisar();
    window.addEventListener('hashchange', revisar);
    return () => window.removeEventListener('hashchange', revisar);
  }, [open]);

  // Bloqueo del scroll del body. Se compensa el ancho de la barra de scroll para que la página
  // no salte de lado. No interfiere con la intro: con el body quieto no hay eventos de scroll,
  // y el drawer solo se abre con la intro ya fuera de pantalla o servida estática.
  useEffect(() => {
    if (!isOpen) return;
    const { body, documentElement } = document;
    const barra = window.innerWidth - documentElement.clientWidth;
    const previo = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    body.style.overflow = 'hidden';
    if (barra > 0) body.style.paddingRight = `${barra}px`;
    return () => {
      body.style.overflow = previo.overflow;
      body.style.paddingRight = previo.paddingRight;
    };
  }, [isOpen]);

  // Foco de vuelta al disparador al cerrar. Un frame después, para que el botón flotante ya
  // haya vuelto a mostrarse.
  const primerRender = useRef(true);
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    if (isOpen) return;
    const disparador = disparadorRef.current;
    disparadorRef.current = null;
    if (!disparador?.isConnected) return;
    const raf = requestAnimationFrame(() => disparador.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return <SumateDrawerContext.Provider value={value}>{children}</SumateDrawerContext.Provider>;
}

/**
 * Abre o cierra el drawer de Súmate desde cualquier componente. Fuera del provider (otra
 * página) abrir lleva a la home con `#sumate`, que abre el drawer al cargar.
 */
export function useSumateDrawer(): SumateDrawerState {
  const ctx = useContext(SumateDrawerContext);
  if (ctx) return ctx;
  return {
    isOpen: false,
    open: () => {
      window.location.href = '/#sumate';
    },
    close: () => {},
  };
}
