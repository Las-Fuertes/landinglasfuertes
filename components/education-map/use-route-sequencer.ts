'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useScrollTween } from './use-scroll-tween';

/** Duraciones de la coreografía, en ms. */
export const TIMING = {
  sheetExit: 280,
  sheetEnter: 400,
  scroll: 800,
  /**
   * El spring del mapa llega unos 270 ms después que el scroll. Sin esta pausa
   * el modal empezaría a subir mientras el mapa todavía se está deslizando.
   */
  settle: 180,
} as const;

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/** Un salto corto no merece los 800 ms completos. */
function scrollDuration(distance: number) {
  return Math.min(TIMING.scroll, Math.max(320, Math.round(distance * 0.85)));
}

export interface RouteSequencerOptions {
  count: number;
  /** En escritorio y con reduced-motion no hay recorrido: solo cambia el contenido. */
  isPinned: boolean;
  /** Devuelve el `window.scrollY` que centra la parada, o null si aún no se midió. */
  getStopScrollY: (index: number) => number | null;
}

export function useRouteSequencer({ count, isPinned, getStopScrollY }: RouteSequencerOptions) {
  const { tweenTo, cancel } = useScrollTween();

  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const openRef = useRef(false);
  const busyRef = useRef(false);
  const runRef = useRef(0);
  const exitResolveRef = useRef<(() => void) | null>(null);
  /** Qué elemento devolvió el foco al cerrar. */
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    return () => {
      runRef.current++;
      exitResolveRef.current?.();
      exitResolveRef.current = null;
      cancel();
    };
  }, [cancel]);

  /** Lo llama el `onExitComplete` de AnimatePresence. */
  const handleExitComplete = useCallback(() => {
    exitResolveRef.current?.();
    exitResolveRef.current = null;
  }, []);

  const closeSheet = useCallback(() => {
    if (!openRef.current) return Promise.resolve();
    openRef.current = false;
    setIsOpen(false);
    return new Promise<void>(resolve => {
      exitResolveRef.current = resolve;
      // Red de seguridad: si AnimatePresence no avisa (desmontaje, reduced
      // motion sin transición), seguimos igual en vez de quedarnos colgados.
      setTimeout(() => {
        if (exitResolveRef.current === resolve) {
          exitResolveRef.current = null;
          resolve();
        }
      }, TIMING.sheetExit + 200);
    });
  }, []);

  const run = useCallback(
    async (target: number, options: { scroll: boolean }) => {
      // Guarda síncrona: un `useState` no protege contra dos toques en el mismo
      // lote de React, un ref sí.
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(true);

      const token = ++runRef.current;
      const alive = () => token === runRef.current;

      try {
        await closeSheet();
        if (!alive()) return;

        if (options.scroll && isPinned) {
          const destination = getStopScrollY(target);
          if (destination !== null) {
            const distance = Math.abs(destination - window.scrollY);
            if (distance > 24) {
              await tweenTo(destination, { duration: scrollDuration(distance) });
              if (!alive()) return;
              await delay(TIMING.settle);
              if (!alive()) return;
            }
          }
        }

        setIndex(target);
        openRef.current = true;
        setIsOpen(true);
        await delay(TIMING.sheetEnter);
      } finally {
        if (token === runRef.current) {
          busyRef.current = false;
          setBusy(false);
        }
      }
    },
    [closeSheet, getStopScrollY, isPinned, tweenTo]
  );

  const openAt = useCallback(
    (target: number, trigger?: HTMLElement | null) => {
      triggerRef.current = trigger ?? null;
      void run(target, { scroll: true });
    },
    [run]
  );

  /**
   * Lleva el recorrido hasta una parada sin abrir nada. Es lo que hace que
   * tabular por los puntos funcione: al recibir el foco, un punto que estaba
   * fuera de pantalla trae el mapa hasta él.
   */
  const revealStop = useCallback(
    (target: number) => {
      if (!isPinned || busyRef.current) return;
      const destination = getStopScrollY(target);
      if (destination === null) return;
      const distance = Math.abs(destination - window.scrollY);
      if (distance <= 24) return;
      void tweenTo(destination, {
        duration: Math.min(500, scrollDuration(distance)),
        abortOnUserInput: true,
      });
    },
    [getStopScrollY, isPinned, tweenTo]
  );

  const goNext = useCallback(() => {
    if (index >= count - 1) return;
    void run(index + 1, { scroll: true });
  }, [count, index, run]);

  const goPrev = useCallback(() => {
    if (index <= 0) return;
    void run(index - 1, { scroll: true });
  }, [index, run]);

  const close = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    const token = ++runRef.current;
    try {
      cancel();
      await closeSheet();
    } finally {
      if (token === runRef.current) {
        busyRef.current = false;
        setBusy(false);
      }
      // Devolver el foco sin que el navegador arrastre el scroll: sin
      // `preventScroll` deshace el recorrido de un golpe.
      triggerRef.current?.focus({ preventScroll: true });
      triggerRef.current = null;
    }
  }, [cancel, closeSheet]);

  return {
    index,
    isOpen,
    /** Mientras algo está en marcha: bloquea botones y levanta el escudo. */
    busy,
    isFirst: index === 0,
    isLast: index === count - 1,
    openAt,
    revealStop,
    goNext,
    goPrev,
    close,
    handleExitComplete,
  };
}
