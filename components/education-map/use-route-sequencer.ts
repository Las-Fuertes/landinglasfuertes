'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useScrollTween } from './use-scroll-tween';
import { TIEMPO } from './coreografia';

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/** Desplazamiento de teclado hasta una parada (`revealStop`): corto, sin coreografía. */
function scrollDuration(distance: number) {
  return Math.min(500, Math.max(320, Math.round(distance * 0.85)));
}

export interface RouteSequencerOptions {
  count: number;
  /** En escritorio y con reduced-motion no hay recorrido: solo cambia el contenido. */
  isPinned: boolean;
  /** Devuelve el `window.scrollY` que centra la parada, o null si aún no se midió. */
  getStopScrollY: (index: number) => number | null;
  /**
   * El elemento que recibe el foco al cerrar: la parada ACTIVA, no la que abrió el modal. Si el
   * foco volviera a la de origen, su `onFocus` arrastraría el recorrido hasta ella (D6).
   */
  getReturnFocus?: (index: number) => HTMLElement | null;
  /**
   * Lleva el mapa hasta el `scrollY` de una parada con el viaje de D9 y resuelve al llegar. Sin
   * él, el recorrido se hace desplazando la página.
   */
  viajar?: (destino: number) => Promise<void>;
  /** Se llama al empezar el viaje hacia `index`: sirve para precargar la foto de su modal. */
  precargar?: (index: number) => Promise<void>;
}

export function useRouteSequencer({
  count,
  isPinned,
  getStopScrollY,
  getReturnFocus,
  viajar,
  precargar,
}: RouteSequencerOptions) {
  const { tweenTo, cancel } = useScrollTween();

  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const openRef = useRef(false);
  const busyRef = useRef(false);
  const runRef = useRef(0);
  const exitResolveRef = useRef<(() => void) | null>(null);
  /** Escape durante una transición entre paradas: se llega, pero no se abre el modal (D9). */
  const abortRef = useRef(false);
  /** Hay un `run` (paso entre paradas) en marcha; `leave` y `close` no cuentan. */
  const enRutaRef = useRef(false);
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
      }, TIEMPO.cierre + 250);
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
      abortRef.current = false;
      enRutaRef.current = true;
      /** Parada en la que queda el mapa si se cancela con Escape: la de origen hasta que viaja. */
      let asentada = index;
      const cancelada = () => {
        if (!abortRef.current) return false;
        // Sin modal, el mapa quieto en `asentada` y el foco en su parada. `preventScroll`: el
        // navegador no mueve nada y su `onFocus` no encuentra distancia que recorrer.
        setIndex(asentada);
        getReturnFocus?.(asentada)?.focus({ preventScroll: true });
        triggerRef.current = null;
        return true;
      };

      // Coreografía de D9, en fases que se leen de una en una: cierre, viaje, llegada, apertura.
      const foto = precargar?.(target).catch(() => undefined);
      try {
        await closeSheet();
        if (!alive() || cancelada()) return;

        if (options.scroll && isPinned) {
          const destination = getStopScrollY(target);
          if (destination !== null) {
            const distance = Math.abs(destination - window.scrollY);
            if (distance > 24) {
              // El viaje no se corta a medias: un Escape lo deja terminar y asentarse.
              if (viajar) await viajar(destination);
              else await tweenTo(destination, { duration: 900 });
              asentada = target;
              if (!alive() || cancelada()) return;
              await delay(TIEMPO.asiento);
              if (!alive() || cancelada()) return;
            }
          }
        }

        // La foto nueva ya decodificada: si no, aparece a trozos mientras sube la tarjeta. No se
        // espera más de un momento por ella.
        if (foto) await Promise.race([foto, delay(250)]);
        asentada = target;
        if (!alive() || cancelada()) return;

        setIndex(target);
        openRef.current = true;
        setIsOpen(true);
        await delay(TIEMPO.apertura);
      } finally {
        abortRef.current = false;
        enRutaRef.current = false;
        if (token === runRef.current) {
          busyRef.current = false;
          setBusy(false);
        }
      }
    },
    [closeSheet, getReturnFocus, getStopScrollY, index, isPinned, precargar, tweenTo, viajar]
  );

  /**
   * Escape mientras una transición va entre paradas (cierre, viaje o llegada, sin modal a la
   * vista): no se abre el siguiente. El viaje termina y el foco queda en la parada donde se
   * asentó el mapa. Devuelve si había algo que cancelar.
   */
  const abort = useCallback(() => {
    if (!enRutaRef.current || openRef.current) return false;
    abortRef.current = true;
    return true;
  }, []);

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
      // Devolver el foco a la parada que se estaba viendo, sin que el navegador arrastre el
      // scroll: sin `preventScroll` deshace el recorrido de un golpe.
      const destino = getReturnFocus?.(index) ?? triggerRef.current;
      destino?.focus({ preventScroll: true });
      triggerRef.current = null;
    }
  }, [cancel, closeSheet, getReturnFocus, index]);

  /**
   * Cierra el modal y sigue a otro lado con `after` (D6: "Terminar" lleva a Impacto). A
   * diferencia de `close`, no devuelve el foco a la parada que lo abrió: su `onFocus` traería el
   * recorrido de vuelta hasta ella y desharía el salto. Si `after` devuelve una promesa (el paso
   * a Impacto de D9), el secuenciador sigue ocupado hasta que termina.
   */
  const leave = useCallback(
    async (after: () => void | Promise<void>) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      const token = ++runRef.current;
      triggerRef.current = null;
      try {
        cancel();
        await closeSheet();
        if (token === runRef.current) await after();
      } finally {
        if (token === runRef.current) {
          busyRef.current = false;
          setBusy(false);
        }
      }
    },
    [cancel, closeSheet]
  );

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
    leave,
    abort,
    handleExitComplete,
  };
}
