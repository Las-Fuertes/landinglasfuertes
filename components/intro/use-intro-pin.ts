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
import { FIN_DE_GESTO_MS, type GestoRueda, registrarRueda } from '../../lib/gesto-rueda';
import { alAceptarAviso } from '../aviso/aviso';
import { track } from '../../lib/analytics';

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';
/** Arrastre en touch para que dispare UNA parte. */
const TOUCH_THRESHOLD = 50;
/** Tolerancia para considerar que la página está arriba del todo. */
const ARRIBA_PX = 2;

export interface Transicion {
  desde: number;
  hacia: number;
  sentido: Sentido;
  /** Cambia con cada transición, para que el efecto que la anima se dispare aunque se repita. */
  id: number;
}

/**
 * Un timeline de GSAP visto desde aquí: hace falta poder terminarlo de golpe y, en la llegada a
 * Bienvenida, saber si ya pasó su etiqueta `asentada` (lo que queda solo es fondo).
 */
interface Terminable {
  progress(value: number): unknown;
  time?(): number;
  labels?: Record<string, number>;
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
  placeholderRef: RefObject<HTMLDivElement>;
  saltarRef: RefObject<HTMLButtonElement>;
  /** El timeline que corre ahora (transición o entrada). Lo escribe el componente. */
  timelineRef: MutableRefObject<Terminable | null>;
  /** El componente avisa cuando el timeline de la transición terminó. */
  terminarTransicion: () => void;
  saltar: () => void;
  /**
   * Un paso adelante o atrás desde los botones de la intro (D10), como un gesto. No hace nada si
   * ya corre una transición.
   */
  irA: (sentido: Sentido) => void;
}

/**
 * El gesto de rueda en curso. La detección (silencio, cambio de sentido, impulso nuevo) vive en
 * `lib/gesto-rueda.ts`, compartida con el Mapa educativo; `consumido` aquí significa que ya
 * disparó una parte (o desenganchó).
 */
interface Gesto extends GestoRueda {
  /** scrollY al empezar: solo engancha un gesto que arrancó arriba del todo. */
  inicioY: number;
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
 * - "Saltar intro" y las dos flechas (D10) están siempre a mano en reposo: los pinta el componente
 *   y llaman a `saltar` e `irA`. Tab recorre la página con normalidad; Escape lleva el foco a
 *   "Saltar intro".
 */
export function useIntroPin(totalSteps: number): IntroPinState {
  const [mode, setMode] = useState<'fallback' | 'pin'>('fallback');
  const [stepIndex, setStepIndex] = useState(0);
  const [transicion, setTransicion] = useState<Transicion | null>(null);
  const [entrada, setEntrada] = useState(0);
  const [llegada, setLlegada] = useState(0);
  const [engaged, setEngaged] = useState(false);

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
   * Tras la llegada, el resto del gesto de rueda que la disparó (la inercia) se sigue tragando:
   * si no, al soltar la capa fija la página seguiría bajando más allá de Bienvenida. El dedo no
   * (D13): al terminar la llegada queda libre en el acto.
   */
  const tragarRef = useRef(false);
  /**
   * Pone o quita el `touchmove` bloqueante y vuelve pasiva o no la rueda según haga falta (D14).
   * Lo escribe el efecto de los listeners; lo llaman `enganchar` y `terminarLlegada` para soltar
   * el dedo y la rueda en cuanto la página es libre.
   */
  const sincronizarRef = useRef<() => void>(() => {});
  /** La intro salió por arriba: al reaparecer, la parte 1 reproduce su entrada. */
  const salioRef = useRef(false);
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
    sincronizarRef.current();
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
    sincronizarRef.current();
    // Si se llegó con la flecha de avanzar, el foco sigue al contenido: Bienvenida.
    const bienvenida = document.getElementById('bienvenida');
    if (bienvenida && placeholderRef.current?.contains(document.activeElement)) {
      if (!bienvenida.hasAttribute('tabindex')) bienvenida.setAttribute('tabindex', '-1');
      bienvenida.focus({ preventScroll: true });
    }
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

  const saltar = useCallback(() => {
    // Un segundo clic a media llegada solo la termina: no cuenta como otro salto.
    if (!llegandoRef.current) track('intro_skipped', { step: stepRef.current + 1 });
    // Lleva a la primera sección tras la intro, Bienvenida (docs/sumate-drawer/DECISIONES.md, D1).
    const siguiente = document.getElementById('bienvenida');
    // Como el gesto desde la parte 3 (D6), desde la parte en que esté (D12): la intro sale con
    // su coreografía y Bienvenida entra por piezas, el texto primero. Antes se llegaba con un
    // desplazamiento y Bienvenida ya en reposo: se perdía su entrada.
    if (siguiente && !llegandoRef.current) {
      terminarTimeline();
      if (!engagedRef.current) {
        // Los botones viven en la intro: si la página se movió un poco, se vuelve arriba antes
        // de enganchar, para que la capa fija no se suelte en el acto.
        if (window.scrollY > ARRIBA_PX) window.scrollTo({ top: 0, behavior: 'instant' });
        enganchar(true);
      }
      corriendoRef.current = true;
      llegandoRef.current = true;
      setLlegada(++transicionIdRef.current);
      return;
    }
    // A media llegada, saltar la termina: Bienvenida queda en reposo.
    terminarTimeline();
    enganchar(false);
    if (!siguiente) return;
    // Espera a que la capa fija se suelte antes de desplazarse.
    requestAnimationFrame(() => {
      siguiente.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // El foco sigue al contenido: si no, se queda en un botón que ya no existe.
      if (!siguiente.hasAttribute('tabindex')) siguiente.setAttribute('tabindex', '-1');
      siguiente.focus({ preventScroll: true });
    });
  }, [enganchar, terminarTimeline]);

  const irA = useCallback(
    (sentido: Sentido) => {
      if (corriendoRef.current) return;
      // Los botones viven en la intro: si la página se movió un poco, se vuelve arriba antes de
      // enganchar, para que la capa fija no se suelte en el acto.
      if (!engagedRef.current && window.scrollY > ARRIBA_PX) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      avanzar(sentido);
    },
    [avanzar]
  );

  // Decide el modo una sola vez, tras montar. Nunca se revierte: si arranca en 'fallback'
  // (reduced-motion o hash en la URL) se queda ahí, sin listeners ni capa fija.
  useEffect(() => {
    const reduce = window.matchMedia(REDUCE_QUERY).matches;
    const hasHash = window.location.hash.length > 0;
    if (reduce || hasHash) return;

    // Con el aviso de protección de menores puesto, la intro no arranca: espera a que se acepte
    // y empieza su entrada con el telón de la puerta ya casi ido (docs/aviso/DECISIONES.md, D1).
    return alAceptarAviso(() => {
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
    });
  }, [totalSteps, enganchar]);

  useEffect(() => {
    if (mode !== 'pin') return;

    const arriba = () => window.scrollY <= ARRIBA_PX;
    /** Si la rueda se escucha ahora con `passive: false` (ver `sincronizar`). */
    let ruedaBloquea: boolean | null = null;

    const onWheel = (e: WheelEvent) => {
      // El pellizco del trackpad llega como rueda con ctrlKey: es zoom, no un gesto de la intro.
      if (e.ctrlKey) return;
      // Fuera de la zona de la intro la rueda se escucha pasiva (D14): sigue registrando el gesto,
      // para que uno que llega arriba no se confunda con uno nuevo, pero no puede frenar nada.
      const puede = ruedaBloquea === true;
      const frenar = () => {
        if (puede) e.preventDefault();
      };
      const sentido: Sentido | 0 = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
      if (sentido === 0) return;
      const abs = Math.abs(e.deltaY);
      const g = gestoRef.current;
      // Un gesto nuevo empieza tras un silencio, SIEMPRE que cambia el sentido (la inercia de
      // subida que llega arriba no se come la bajada que sigue), o con un impulso nuevo sobre
      // una inercia que ya decaía. Si no, un scroll fuerte encadenado bloqueaba la intro.
      if (registrarRueda(g, sentido, abs)) {
        tragarRef.current = false;
        g.inicioY = window.scrollY;
        sincronizar();
      }
      window.clearTimeout(finDeGestoRef.current);
      finDeGestoRef.current = window.setTimeout(() => {
        gestoRef.current.vivo = false;
        sincronizar();
      }, FIN_DE_GESTO_MS);
      g.acumulado += abs;

      if (engagedRef.current) {
        if (g.consumido) {
          frenar();
          return;
        }
        g.consumido = true;
        if (corriendoRef.current) {
          // Un gesto nuevo mientras corre la transición: se traga entero.
          frenar();
          return;
        }
        if (avanzar(sentido)) frenar();
        return;
      }

      // El resto del gesto que llevó a Bienvenida no mueve la página (D6).
      if (tragarRef.current && g.consumido) {
        frenar();
        return;
      }

      // Sin enganchar: solo un gesto hacia abajo que empezó arriba del todo entra a la intro.
      if (!g.consumido && sentido === 1 && g.inicioY <= ARRIBA_PX && arriba()) {
        g.consumido = true;
        if (avanzar(1)) frenar();
      }
    };

    const onKeydown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || esCampoDeTexto(e.target)) return;

      // Tab recorre la página con normalidad: "Saltar intro" y las flechas son lo primero que
      // encuentra dentro de la intro (D10). Escape lleva el foco a "Saltar intro".
      if (engagedRef.current && e.key === 'Escape') {
        saltarRef.current?.focus();
        return;
      }

      // Durante una transición o la llegada, los botones están escondidos (inert) y el siguiente
      // enfocable está fuera de la intro: Tab desplazaría la página y soltaría la capa fija a
      // mitad de camino. El foco se queda en el grupo de la navegación, que lo devuelve a los
      // botones al reaparecer (D10). En reposo, Tab sale de la intro con normalidad.
      if (e.key === 'Tab' && engagedRef.current && corriendoRef.current) {
        e.preventDefault();
        const grupo = placeholderRef.current?.querySelector<HTMLElement>('[data-intro-navegacion]');
        if (grupo && !grupo.contains(document.activeElement)) grupo.focus({ preventScroll: true });
        return;
      }

      // Espacio avanza como en cualquier página, salvo sobre un botón (que se pulsa).
      const target = e.target instanceof HTMLElement ? e.target : null;
      const espacioLibre =
        target === document.body ||
        (!!target &&
          !!placeholderRef.current?.contains(target) &&
          !target.closest('button, a, [role="button"]'));
      let sentido: Sentido | 0 = 0;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') sentido = 1;
      else if (e.key === 'ArrowUp' || e.key === 'PageUp') sentido = -1;
      else if (e.key === ' ' && espacioLibre) sentido = e.shiftKey ? -1 : 1;
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
      // Un dedo nuevo cuando la llegada ya solo anima el fondo (nubes, gaviotas) la termina: se
      // ve quieta y el dedo no puede quedar retenido por ella (D13).
      const tl = timelineRef.current;
      const asentada = tl?.labels?.asentada;
      if (llegandoRef.current && asentada !== undefined && (tl?.time?.() ?? 0) >= asentada) {
        terminarTimeline();
      }
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
        // Al terminar la llegada el dedo queda libre aunque siga puesto (D13): antes se tragaba
        // hasta levantarlo y la página se quedaba pegada a Bienvenida.
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
        if (!t.hecho && corriendoRef.current) t.hecho = true;
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
      sincronizar();
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

    // El `touchmove` que puede frenar el dedo y la rueda que puede frenar la página solo son no
    // pasivos cuando hace falta (D14): con la página arriba del todo (donde la intro engancha),
    // enganchada o durante la llegada; la rueda, además, mientras dura el gesto que trajo hasta
    // Bienvenida (su inercia se traga, D6). Un listener no pasivo en `window` vuelve bloqueante
    // TODO toque o TODA rueda de la página: el navegador no empieza a desplazar hasta que el hilo
    // principal lo atiende, y si está ocupado (fin de la llegada, entradas de Impacto) la página
    // se queda pegada lo que dure esa tarea. Se revisa en cada `scroll`, al enganchar o soltar,
    // al terminar la llegada y al abrir o cerrar un gesto de rueda.
    let conToque = false;
    const sincronizar = () => {
      const hace = llegandoRef.current || engagedRef.current || arriba();
      if (hace !== conToque) {
        conToque = hace;
        if (hace) window.addEventListener('touchmove', onTouchMove, { passive: false });
        else window.removeEventListener('touchmove', onTouchMove);
      }
      const rueda = hace || (tragarRef.current && gestoRef.current.vivo);
      if (rueda !== ruedaBloquea) {
        // El mismo listener cambia de `passive`: hay que quitarlo y volver a ponerlo.
        if (ruedaBloquea !== null) window.removeEventListener('wheel', onWheel);
        window.addEventListener('wheel', onWheel, { passive: !rueda });
        ruedaBloquea = rueda;
      }
    };
    sincronizarRef.current = sincronizar;
    sincronizar();

    window.addEventListener('keydown', onKeydown);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      sincronizarRef.current = () => {};
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeydown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(finDeGestoRef.current);
    };
  }, [mode, totalSteps, avanzar, desenganchar, enganchar, terminarTimeline]);

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
    placeholderRef,
    saltarRef,
    timelineRef,
    terminarTransicion,
    saltar,
    irA,
  };
}
