'use client';

import {
  type MutableRefObject,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { Sentido } from './intro.motion';

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';
/** Arrastre en touch para que dispare UNA parte. */
const TOUCH_THRESHOLD = 50;
/**
 * Silencio que cierra un gesto de rueda. La inercia de un trackpad manda eventos seguidos
 * durante 1,5 a 2 s; mientras lleguen con menos de esta separación es el mismo gesto.
 */
const FIN_DE_GESTO_MS = 180;
/** `deltaY` acumulado en un gesto a partir del cual cuenta como scroll fuerte. */
const SCROLL_FUERTE_PX = 1500;
/** Gestos nuevos durante una misma transición a partir de los cuales cuenta como scroll fuerte. */
const GESTOS_FUERTES = 2;
/**
 * Nuevo impulso sin silencio: si alguien vuelve a hacer scroll mientras la inercia del gesto
 * anterior aún decae, los eventos nunca dejan 180 ms de hueco. Cuenta como gesto nuevo cuando,
 * tras haber bajado del pico a menos de `IMPULSO_DECAIDO` de él, `|deltaY|` vuelve a crecer
 * `IMPULSO_FACTOR` veces sobre el valle y pasa de `IMPULSO_MIN_PX`.
 */
const IMPULSO_DECAIDO = 0.4;
const IMPULSO_FACTOR = 3;
const IMPULSO_MIN_PX = 12;
/** Tolerancia para considerar que la página está arriba del todo. */
const ARRIBA_PX = 2;

export interface Transicion {
  desde: number;
  hacia: number;
  sentido: Sentido;
  /** Cambia con cada transición, para que el efecto que la anima se dispare aunque se repita. */
  id: number;
}

/** Un timeline de GSAP visto desde aquí: solo hace falta poder terminarlo de golpe. */
interface Terminable {
  progress(value: number): unknown;
}

export interface IntroPinState {
  /**
   * 'fallback': SSR, sin JS, `prefers-reduced-motion` o llegada directa con hash en la URL.
   * Se queda así para siempre una vez decidido al montar. 'pin': las transiciones activas.
   */
  mode: 'fallback' | 'pin';
  stepIndex: number;
  /** La transición en curso, o null si la intro está quieta. */
  transicion: Transicion | null;
  /** Cambia cada vez que la parte 1 debe reproducir su entrada (al cargar, al volver desde abajo). */
  entrada: number;
  /**
   * Llegada a Bienvenida desde la parte 3 (D6): distinto de 0 mientras corre. Cambia con cada
   * llegada, para que el efecto que la anima se dispare aunque se repita.
   */
  llegada: number;
  /** El componente avisa cuando el timeline de la llegada terminó. */
  terminarLlegada: () => void;
  engaged: boolean;
  saltarVisible: boolean;
  placeholderRef: RefObject<HTMLDivElement>;
  saltarRef: RefObject<HTMLButtonElement>;
  /** El timeline que corre ahora (transición o entrada). Lo escribe el componente. */
  timelineRef: MutableRefObject<Terminable | null>;
  /** El componente avisa cuando el timeline de la transición terminó. */
  terminarTransicion: () => void;
  saltar: () => void;
}

interface Gesto {
  vivo: boolean;
  /** Ya disparó una parte (o desenganchó): el resto del gesto, inercia incluida, se traga. */
  consumido: boolean;
  acumulado: number;
  /** scrollY al empezar: solo engancha un gesto que arrancó arriba del todo. */
  inicioY: number;
  sentido: Sentido;
  /** Mayor `|deltaY|` del gesto y menor desde ese pico: sirven para detectar un impulso nuevo. */
  pico: number;
  valle: number;
}

const esCampoDeTexto = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

/**
 * Máquina de estado de la Introducción con pin (docs/introduccion/DECISIONES.md, D2).
 *
 * - Un gesto avanza UNA parte, dure lo que dure. Un gesto de rueda es una ráfaga de eventos
 *   que termina tras `FIN_DE_GESTO_MS` de silencio. No se dispara otra parte mientras el gesto
 *   vive ni mientras corre el timeline: se libera cuando las dos cosas terminaron.
 * - Solo engancha un gesto hacia abajo que empieza con la página arriba del todo. Al subir
 *   desde abajo no hay enganche ni reversa: cuando la intro sale de la pantalla por arriba
 *   vuelve a la parte 1 sin animar, y al reaparecer la parte 1 reproduce su entrada.
 * - Scroll fuerte (un gesto de más de `SCROLL_FUERTE_PX`, o `GESTOS_FUERTES` gestos durante
 *   una transición), Tab o Escape muestran el botón de saltar.
 */
export function useIntroPin(totalSteps: number): IntroPinState {
  const [mode, setMode] = useState<'fallback' | 'pin'>('fallback');
  const [stepIndex, setStepIndex] = useState(0);
  const [transicion, setTransicion] = useState<Transicion | null>(null);
  const [entrada, setEntrada] = useState(0);
  const [llegada, setLlegada] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [saltarVisible, setSaltarVisible] = useState(false);

  const placeholderRef = useRef<HTMLDivElement>(null!);
  const saltarRef = useRef<HTMLButtonElement>(null!);
  const timelineRef = useRef<Terminable | null>(null);

  const stepRef = useRef(0);
  const engagedRef = useRef(false);
  /** Corre una transición (la entrada de la parte 1 no bloquea: un gesto la termina). */
  const corriendoRef = useRef(false);
  const transicionIdRef = useRef(0);
  /** Corre la llegada a Bienvenida: la página se desplaza por código y la capa sigue fija. */
  const llegandoRef = useRef(false);
  /**
   * Tras la llegada, el resto del gesto que la disparó (la inercia, o el mismo dedo) se sigue
   * tragando: si no, al soltar la capa fija la página seguiría bajando más allá de Bienvenida.
   */
  const tragarRef = useRef(false);
  /** La intro salió por arriba: al reaparecer, la parte 1 reproduce su entrada. */
  const salioRef = useRef(false);
  const gestosDuranteRef = useRef(0);
  const gestoRef = useRef<Gesto>({
    vivo: false,
    consumido: false,
    acumulado: 0,
    inicioY: 0,
    sentido: 1,
    pico: 0,
    valle: 0,
  });
  const finDeGestoRef = useRef<number | undefined>(undefined);
  const touchRef = useRef<{ y: number; inicioY: number; hecho: boolean } | null>(null);

  const enganchar = useCallback((valor: boolean) => {
    engagedRef.current = valor;
    setEngaged(valor);
    if (!valor) setSaltarVisible(false);
  }, []);

  const terminarTransicion = useCallback(() => {
    corriendoRef.current = false;
    timelineRef.current = null;
    setTransicion(null);
  }, []);

  /**
   * Fin de la llegada a Bienvenida: la capa fija se suelta (la página ya está en Bienvenida) y la
   * intro vuelve a la parte 1 sin animar, como cuando sale de la pantalla por arriba. Al subir,
   * se ve la parte 1 en su sitio y reproduce su entrada (D2, D3).
   */
  const terminarLlegada = useCallback(() => {
    llegandoRef.current = false;
    corriendoRef.current = false;
    timelineRef.current = null;
    tragarRef.current = true;
    salioRef.current = true;
    stepRef.current = 0;
    setStepIndex(0);
    setLlegada(0);
    engagedRef.current = false;
    setEngaged(false);
    setSaltarVisible(false);
  }, []);

  /** Termina de golpe lo que esté corriendo. `progress(1)` dispara su `onComplete`. */
  const terminarTimeline = useCallback(() => {
    timelineRef.current?.progress(1);
    timelineRef.current = null;
  }, []);

  const desenganchar = useCallback(() => {
    if (corriendoRef.current) terminarTimeline();
    enganchar(false);
  }, [enganchar, terminarTimeline]);

  /**
   * Intenta moverse una parte. Devuelve false si se sale de la intro (antes de la 1 o después
   * de la 3): entonces desengancha y el evento debe pasar tal cual al scroll nativo.
   */
  const avanzar = useCallback(
    (sentido: Sentido): boolean => {
      const siguiente = stepRef.current + sentido;
      // Desde la parte 3 hacia abajo, Bienvenida es un paso más (D6): la intro sale con su
      // coreografía, la página se asienta sola en Bienvenida y esta entra por piezas.
      if (siguiente === totalSteps && engagedRef.current && document.getElementById('bienvenida')) {
        terminarTimeline();
        corriendoRef.current = true;
        llegandoRef.current = true;
        gestosDuranteRef.current = 0;
        setLlegada(++transicionIdRef.current);
        return true;
      }
      if (siguiente < 0 || siguiente >= totalSteps) {
        desenganchar();
        return false;
      }
      if (!engagedRef.current) enganchar(true);
      // Si la parte 1 todavía está entrando, se termina en el acto y se sigue.
      terminarTimeline();
      corriendoRef.current = true;
      gestosDuranteRef.current = 0;
      const t: Transicion = {
        desde: stepRef.current,
        hacia: siguiente,
        sentido,
        id: ++transicionIdRef.current,
      };
      stepRef.current = siguiente;
      setStepIndex(siguiente);
      setTransicion(t);
      return true;
    },
    [totalSteps, desenganchar, enganchar, terminarTimeline]
  );

  const mostrarSaltar = useCallback(() => setSaltarVisible(true), []);

  const saltar = useCallback(() => {
    terminarTimeline();
    enganchar(false);
    // Lleva a la primera sección tras la intro, Bienvenida (docs/sumate-drawer/DECISIONES.md, D1).
    const siguiente = document.getElementById('bienvenida');
    if (!siguiente) return;
    // Espera a que la capa fija se suelte antes de desplazarse.
    requestAnimationFrame(() => {
      siguiente.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // El foco sigue al contenido: si no, se queda en un botón que ya no existe.
      if (!siguiente.hasAttribute('tabindex')) siguiente.setAttribute('tabindex', '-1');
      siguiente.focus({ preventScroll: true });
    });
  }, [enganchar, terminarTimeline]);

  // Decide el modo una sola vez, tras montar. Nunca se revierte: si arranca en 'fallback'
  // (reduced-motion o hash en la URL) se queda ahí, sin listeners ni capa fija.
  useEffect(() => {
    const reduce = window.matchMedia(REDUCE_QUERY).matches;
    const hasHash = window.location.hash.length > 0;
    if (reduce || hasHash) return;

    setMode('pin');

    // ?introPaso=N (docs/PATTERNS.md): fuerza la parte y engancha de inmediato, sin entrada.
    // Es lo que usa scripts/captura.js para fotografiar cada parte en reposo.
    const forced = Number(new URLSearchParams(window.location.search).get('introPaso'));
    if (Number.isInteger(forced) && forced >= 1 && forced <= totalSteps) {
      stepRef.current = forced - 1;
      setStepIndex(forced - 1);
      enganchar(true);
      return;
    }
    // La entrada de la parte 1 al cargar se pide en el mismo render que activa el pin, para
    // que las piezas ya estén ocultas en el primer pintado.
    setEntrada(1);
  }, [totalSteps, enganchar]);

  useEffect(() => {
    if (mode !== 'pin') return;

    const arriba = () => window.scrollY <= ARRIBA_PX;

    const onWheel = (e: WheelEvent) => {
      // El pellizco del trackpad llega como rueda con ctrlKey: es zoom, no un gesto de la intro.
      if (e.ctrlKey) return;
      const sentido: Sentido | 0 = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
      if (sentido === 0) return;
      const abs = Math.abs(e.deltaY);
      const g = gestoRef.current;
      // Un gesto nuevo empieza tras un silencio, SIEMPRE que cambia el sentido (la inercia de
      // subida que llega arriba no se come la bajada que sigue), o con un impulso nuevo sobre
      // una inercia que ya decaía. Si no, un scroll fuerte encadenado bloqueaba la intro.
      const impulso =
        g.consumido &&
        g.valle <= g.pico * IMPULSO_DECAIDO &&
        abs >= Math.max(g.valle * IMPULSO_FACTOR, IMPULSO_MIN_PX);
      if (!g.vivo || sentido !== g.sentido || impulso) {
        tragarRef.current = false;
        g.vivo = true;
        g.consumido = false;
        g.acumulado = 0;
        g.inicioY = window.scrollY;
        g.sentido = sentido;
        g.pico = abs;
        g.valle = abs;
      } else if (abs > g.pico) {
        g.pico = abs;
        g.valle = abs;
      } else {
        g.valle = Math.min(g.valle, abs);
      }
      window.clearTimeout(finDeGestoRef.current);
      finDeGestoRef.current = window.setTimeout(() => {
        gestoRef.current.vivo = false;
      }, FIN_DE_GESTO_MS);
      g.acumulado += abs;

      if (engagedRef.current) {
        if (g.acumulado > SCROLL_FUERTE_PX) mostrarSaltar();
        if (g.consumido) {
          e.preventDefault();
          return;
        }
        g.consumido = true;
        if (corriendoRef.current) {
          // Un gesto nuevo mientras corre la transición: se traga entero y se cuenta.
          e.preventDefault();
          if (++gestosDuranteRef.current >= GESTOS_FUERTES) mostrarSaltar();
          return;
        }
        if (avanzar(sentido)) e.preventDefault();
        return;
      }

      // El resto del gesto que llevó a Bienvenida no mueve la página (D6).
      if (tragarRef.current && g.consumido) {
        e.preventDefault();
        return;
      }

      // Sin enganchar: solo un gesto hacia abajo que empezó arriba del todo entra a la intro.
      if (!g.consumido && sentido === 1 && g.inicioY <= ARRIBA_PX && arriba()) {
        g.consumido = true;
        if (avanzar(1)) e.preventDefault();
      }
    };

    const onKeydown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || esCampoDeTexto(e.target)) return;

      if (engagedRef.current && (e.key === 'Tab' || e.key === 'Escape')) {
        // Nadie se queda atrapado: con teclado aparece el botón de saltar y recibe el foco.
        if (document.activeElement === saltarRef.current) {
          if (e.key === 'Escape') saltar();
          return;
        }
        e.preventDefault();
        mostrarSaltar();
        requestAnimationFrame(() => saltarRef.current?.focus());
        return;
      }

      let sentido: Sentido | 0 = 0;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') sentido = 1;
      else if (e.key === 'ArrowUp' || e.key === 'PageUp') sentido = -1;
      else if (e.key === ' ' && e.target === document.body) sentido = e.shiftKey ? -1 : 1;
      if (sentido === 0) return;

      if (engagedRef.current) {
        if (e.repeat || corriendoRef.current) {
          e.preventDefault();
          return;
        }
        if (avanzar(sentido)) e.preventDefault();
        return;
      }
      if (sentido === 1 && !e.repeat && arriba() && avanzar(1)) e.preventDefault();
    };

    const onTouchStart = (e: TouchEvent) => {
      tragarRef.current = false;
      const y = e.touches[0]?.clientY;
      touchRef.current = y === undefined ? null : { y, inicioY: window.scrollY, hecho: false };
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = touchRef.current;
      if (!t) return;
      const y = e.touches[0]?.clientY ?? t.y;
      const delta = t.y - y; // positivo: el dedo sube, se avanza
      const sentido: Sentido = delta > 0 ? 1 : -1;

      if (!engagedRef.current) {
        // El dedo que llevó a Bienvenida no sigue moviendo la página al soltarse la capa (D6).
        if (t.hecho && tragarRef.current) {
          e.preventDefault();
          return;
        }
        // Sin enganchar solo interesa un dedo que sube con la página arriba del todo. Se
        // retiene el scroll nativo desde el primer movimiento para que no se escape.
        if (t.hecho || sentido !== 1 || t.inicioY > ARRIBA_PX || !arriba()) return;
        e.preventDefault();
        if (delta < TOUCH_THRESHOLD) return;
        t.hecho = true;
        avanzar(1);
        return;
      }

      if (t.hecho || corriendoRef.current) {
        e.preventDefault();
        if (!t.hecho && corriendoRef.current) {
          t.hecho = true;
          if (++gestosDuranteRef.current >= GESTOS_FUERTES) mostrarSaltar();
        }
        return;
      }
      // Desde la parte 1 hacia arriba se suelta en el acto, para que el mismo dedo siga con el
      // gesto de recargar. Desde la parte 3 hacia abajo ya no: Bienvenida es un paso más (D6).
      if (sentido === -1 && stepRef.current === 0) {
        t.hecho = true;
        desenganchar();
        return;
      }
      e.preventDefault();
      if (Math.abs(delta) < TOUCH_THRESHOLD) return;
      t.hecho = true;
      avanzar(sentido);
    };

    const onTouchEnd = () => {
      touchRef.current = null;
    };

    // Red de seguridad: si la página se movió por otra vía (barra de scroll, un enlace, el foco
    // saltando a otra sección), la capa fija se suelta.
    const onScroll = () => {
      // La llegada a Bienvenida desplaza la página por código con la capa aún fija.
      if (llegandoRef.current) return;
      if (engagedRef.current) {
        if (!arriba()) desenganchar();
        return;
      }
      // De vuelta arriba sin haber salido del todo (se asomó a Bienvenida desde la parte 3 y
      // volvió): reengancha en la parte en que estaba, para poder retroceder dentro de la intro.
      // El gesto o el dedo que trajo hasta aquí se da por consumido, así su inercia no retrocede.
      if (arriba() && stepRef.current > 0) {
        enganchar(true);
        if (gestoRef.current.vivo) gestoRef.current.consumido = true;
        if (touchRef.current) touchRef.current.hecho = true;
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeydown);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeydown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(finDeGestoRef.current);
    };
  }, [mode, totalSteps, avanzar, desenganchar, enganchar, mostrarSaltar, saltar]);

  // Reinicio al salir por arriba: la intro vuelve a la parte 1 sin animar, y cuando reaparece
  // (subiendo desde Bienvenida) la parte 1 reproduce su entrada.
  useEffect(() => {
    if (mode !== 'pin') return;
    const el = placeholderRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([en]) => {
        if (!en) return;
        if (!en.isIntersecting) {
          if (engagedRef.current) return;
          salioRef.current = true;
          terminarTimeline();
          corriendoRef.current = false;
          stepRef.current = 0;
          setStepIndex(0);
          setTransicion(null);
        } else if (salioRef.current) {
          salioRef.current = false;
          setEntrada(n => n + 1);
        }
      },
      // El margen de 1 px hace que tocar el borde cuente como fuera: "saltar" deja la intro
      // justo encima de Bienvenida, con su borde inferior pegado al de arriba de la pantalla.
      { rootMargin: '-1px 0px 0px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mode, terminarTimeline]);

  return {
    mode,
    stepIndex,
    transicion,
    entrada,
    llegada,
    terminarLlegada,
    engaged,
    saltarVisible,
    placeholderRef,
    saltarRef,
    timelineRef,
    terminarTransicion,
    saltar,
  };
}
