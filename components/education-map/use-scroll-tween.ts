'use client';

import { useCallback, useEffect, useRef } from 'react';

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export interface ScrollTweenOptions {
  duration?: number;
  /** Cortar el tween si la persona toca o rueda. Útil para saltos de teclado. */
  abortOnUserInput?: boolean;
}

/**
 * Scroll programático con duración propia.
 *
 * `scrollTo({ behavior: 'smooth' })` no sirve acá: no deja controlar la
 * duración, en iOS se cae si hay inercia en curso, y `global.css` lo fuerza a
 * `auto` bajo reduced-motion, así que el comportamiento cambiaría por persona.
 */
export function useScrollTween() {
  const rafRef = useRef(0);
  const abortRef = useRef<(() => void) | null>(null);

  const cancel = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    abortRef.current?.();
    abortRef.current = null;
  }, []);

  useEffect(() => cancel, [cancel]);

  /** Resuelve `true` si llegó al destino, `false` si se abortó. */
  const tweenTo = useCallback(
    (to: number, { duration = 800, abortOnUserInput = false }: ScrollTweenOptions = {}) =>
      new Promise<boolean>(resolve => {
        cancel();

        // Matar cualquier inercia en vuelo antes de empezar: si no, en iOS el
        // fling y el tween se pelean por el scroll durante un par de frames.
        window.scrollTo(0, window.scrollY);

        const from = window.scrollY;
        const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const dest = clampScroll(to, max);
        if (Math.abs(dest - from) < 1) {
          resolve(true);
          return;
        }

        let settled = false;
        const onUser = () => finish(false);

        function finish(ok: boolean) {
          if (settled) return;
          settled = true;
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
          if (abortOnUserInput) {
            window.removeEventListener('wheel', onUser);
            window.removeEventListener('touchstart', onUser);
          }
          abortRef.current = null;
          resolve(ok);
        }

        if (abortOnUserInput) {
          window.addEventListener('wheel', onUser, { passive: true });
          window.addEventListener('touchstart', onUser, { passive: true });
        }
        abortRef.current = () => finish(false);

        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          window.scrollTo(0, from + (dest - from) * easeInOutCubic(t));
          if (t < 1) rafRef.current = requestAnimationFrame(step);
          else finish(true);
        };
        rafRef.current = requestAnimationFrame(step);
      }),
    [cancel]
  );

  return { tweenTo, cancel };
}

const clampScroll = (value: number, max: number) => Math.min(Math.max(value, 0), max);
