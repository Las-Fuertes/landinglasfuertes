'use client';

import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import {
  FIN_DE_GESTO_MS,
  gestoRuedaInicial,
  registrarRueda,
  SCROLL_FUERTE_PX,
} from '../../lib/gesto-rueda';
import { duracionDesplaza, PASO } from './coreografia';
import { pasarConCortina } from './cortina';
import { useScrollTween } from './use-scroll-tween';

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const TECLAS_SCROLL = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);

/** Mientras dura el paso a la sección, la rueda, el dedo y las teclas no mueven la página. */
function frenarEntrada() {
  const frenar = (e: Event) => e.preventDefault();
  const frenarTeclas = (e: KeyboardEvent) => {
    if (TECLAS_SCROLL.has(e.key)) e.preventDefault();
  };
  window.addEventListener('wheel', frenar, { passive: false, capture: true });
  window.addEventListener('touchmove', frenar, { passive: false, capture: true });
  window.addEventListener('keydown', frenarTeclas, true);
  return () => {
    window.removeEventListener('wheel', frenar, true);
    window.removeEventListener('touchmove', frenar, true);
    window.removeEventListener('keydown', frenarTeclas, true);
  };
}

/**
 * Pausa entre dos eventos de rueda que cierra el gesto aunque no llegue a `FIN_DE_GESTO_MS`. La
 * inercia de un trackpad manda un evento cada 16 a 30 ms; una rueda de ratón, una muesca cada
 * 100 ms o más. Sin esto, girar la rueda a ritmo constante sumaba como un solo gesto (D4).
 */
const PAUSA_ENTRE_EVENTOS_MS = 90;

export interface SaltarMapaOptions {
  /** Solo con recorrido (móvil y tablet sin reduced-motion). */
  activo: boolean;
  /** Mientras el modal de una ruta está abierto o en marcha, no se ofrece saltar. */
  bloqueado: boolean;
  /** Si la página está ahora mismo con el mapa fijado. */
  fijado: () => boolean;
  /** Id de la sección a la que lleva el salto. */
  destino: string;
}

export interface SaltarMapa {
  visible: boolean;
  saltarRef: RefObject<HTMLButtonElement>;
  /** Lleva a `destino` con la transición de D9 y resuelve al terminar. */
  saltar: () => Promise<void>;
  /** Para el `onFocus` del botón: con Tab llega a él antes que a las paradas. */
  mostrar: () => void;
}

const esCampoDeTexto = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

/**
 * "Saltar mapa" (docs/mapa-educativo/DECISIONES.md, D4), el mismo patrón que "Saltar animación"
 * de la intro. El mapa avanza por posición de scroll, así que aquí no se frena nada: solo se
 * ofrece la salida cuando alguien pasa con prisa.
 *
 * - Rueda: UN gesto (misma detección que la intro, `lib/gesto-rueda.ts`) que acumula más de
 *   `SCROLL_FUERTE_PX` con el mapa fijado. La cuenta vuelve a cero con cada gesto nuevo: tras
 *   un silencio, un cambio de sentido, un impulso nuevo o una pausa entre eventos de más de
 *   `PAUSA_ENTRE_EVENTOS_MS` (las muescas de un ratón).
 * - Touch: un arrastre que, con su inercia, desplaza la página más de `SCROLL_FUERTE_PX` con el
 *   mapa fijado. El gesto termina `FIN_DE_GESTO_MS` después del último scroll tras soltar.
 * - Tab lo muestra (sin robar el foco: las paradas siguen siendo alcanzables) y Escape lo
 *   muestra y le da el foco; Escape otra vez sobre el botón salta, como en la intro.
 *
 * No cuenta ni se muestra con un modal de ruta o el drawer de Súmate abiertos. Se oculta al salir
 * del tramo fijado. Saltar lleva a `destino` y le pasa el foco.
 */
export function useSaltarMapa({
  activo,
  bloqueado,
  fijado,
  destino,
}: SaltarMapaOptions): SaltarMapa {
  const [visible, setVisible] = useState(false);
  const saltarRef = useRef<HTMLButtonElement>(null!);
  const visibleRef = useRef(false);
  const bloqueadoRef = useRef(bloqueado);
  bloqueadoRef.current = bloqueado;
  const fijadoRef = useRef(fijado);
  fijadoRef.current = fijado;

  const poner = useCallback((valor: boolean) => {
    if (visibleRef.current === valor) return;
    visibleRef.current = valor;
    setVisible(valor);
  }, []);

  const mostrar = useCallback(() => poner(true), [poner]);
  const { tweenTo } = useScrollTween();

  /**
   * Paso a `destino` (D6 y D9). Cerca (hasta `PASO.umbralPantallas` pantallas), la página se
   * desplaza con sine.inOut y una duración según la distancia; lejos, cortina. Con
   * reduced-motion, salto directo. En los tres casos el foco pasa a la sección.
   */
  const saltar = useCallback(async () => {
    poner(false);
    const siguiente = document.getElementById(destino);
    if (!siguiente) return;
    const y = () => window.scrollY + siguiente.getBoundingClientRect().top;
    const llegar = () => {
      window.scrollTo(0, y());
      // El foco sigue al contenido: si no, se queda en un botón que ya no se ve.
      if (!siguiente.hasAttribute('tabindex')) siguiente.setAttribute('tabindex', '-1');
      siguiente.focus({ preventScroll: true });
    };

    const distancia = Math.abs(siguiente.getBoundingClientRect().top);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || distancia < 2) {
      llegar();
      return;
    }

    const soltar = frenarEntrada();
    try {
      if (distancia <= PASO.umbralPantallas * window.innerHeight) {
        await tweenTo(y(), { duration: duracionDesplaza(distancia), easing: easeInOutSine });
        llegar();
      } else {
        await pasarConCortina(llegar);
      }
    } finally {
      soltar();
    }
  }, [destino, poner, tweenTo]);

  useEffect(() => {
    if (!activo) {
      poner(false);
      return;
    }

    const disponible = () => !bloqueadoRef.current && fijadoRef.current();

    const gesto = gestoRuedaInicial();
    /** Lo que avanzó el gesto de rueda en curso mientras el mapa estaba fijado. */
    let fijadoRueda = 0;
    let finRueda: number | undefined;
    let ultimoEvento = -Infinity;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      const sentido = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
      if (sentido === 0) return;
      const abs = Math.abs(e.deltaY);
      // Una pausa entre eventos es un gesto terminado: el siguiente empieza de cero.
      const ahora = performance.now();
      if (ahora - ultimoEvento > PAUSA_ENTRE_EVENTOS_MS) gesto.vivo = false;
      ultimoEvento = ahora;
      if (registrarRueda(gesto, sentido, abs)) fijadoRueda = 0;
      // Como en la intro tras disparar una parte: con el gesto "consumido", un impulso nuevo
      // sobre la inercia que decae abre otro gesto, así dos flicks seguidos no se suman.
      gesto.consumido = true;
      window.clearTimeout(finRueda);
      finRueda = window.setTimeout(() => {
        gesto.vivo = false;
      }, FIN_DE_GESTO_MS);
      gesto.acumulado += abs;
      if (!disponible()) return;
      fijadoRueda += abs;
      if (fijadoRueda > SCROLL_FUERTE_PX) mostrar();
    };

    /** Arrastre táctil en curso: desde que el dedo toca hasta que la inercia se detiene. */
    let tactil: { ultimoY: number; recorrido: number; suelto: boolean } | null = null;
    let finTactil: number | undefined;

    const onTouchStart = () => {
      window.clearTimeout(finTactil);
      tactil = { ultimoY: window.scrollY, recorrido: 0, suelto: false };
    };
    const onTouchEnd = () => {
      if (!tactil) return;
      tactil.suelto = true;
      window.clearTimeout(finTactil);
      finTactil = window.setTimeout(() => {
        tactil = null;
      }, FIN_DE_GESTO_MS);
    };

    const onScroll = () => {
      if (tactil) {
        const y = window.scrollY;
        if (disponible()) {
          tactil.recorrido += Math.abs(y - tactil.ultimoY);
          if (tactil.recorrido > SCROLL_FUERTE_PX) mostrar();
        }
        tactil.ultimoY = y;
        if (tactil.suelto) {
          window.clearTimeout(finTactil);
          finTactil = window.setTimeout(() => {
            tactil = null;
          }, FIN_DE_GESTO_MS);
        }
      }
      // Fuera del tramo fijado el botón sobra, salvo que tenga el foco.
      if (
        visibleRef.current &&
        !fijadoRef.current() &&
        document.activeElement !== saltarRef.current
      ) {
        poner(false);
      }
    };

    const onKeydown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || esCampoDeTexto(e.target)) return;
      if (e.key !== 'Tab' && e.key !== 'Escape') return;
      if (!disponible()) return;
      if (e.key === 'Tab') {
        mostrar();
        return;
      }
      if (document.activeElement === saltarRef.current) {
        void saltar();
        return;
      }
      mostrar();
      requestAnimationFrame(() => saltarRef.current?.focus({ preventScroll: true }));
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKeydown);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKeydown);
      window.clearTimeout(finRueda);
      window.clearTimeout(finTactil);
    };
  }, [activo, mostrar, poner, saltar]);

  // Al abrir una ruta el botón se retira; vuelve con el próximo scroll fuerte.
  useEffect(() => {
    if (bloqueado) poner(false);
  }, [bloqueado, poner]);

  return { visible, saltarRef, saltar, mostrar };
}
