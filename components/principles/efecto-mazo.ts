import type { Swiper as SwiperClass } from 'swiper';
import type { SwiperModule } from 'swiper/types';

import { ARCO_SALIDA, type Pose } from './estampillas.data';

/**
 * Efecto "mazo" para Swiper: las estampillas se apilan con una pose fija por profundidad
 * (abanico en desktop, pila en mobile). Al avanzar, la de enfrente sigue al dedo hacia la
 * izquierda, sale lanzada hasta quedar libre del mazo, cambia de capa ahí (donde ya no tapa a
 * ninguna) y vuelve por detrás a su sitio del fondo, como quien baraja. Swiper sigue poniendo
 * todo lo demás: arrastre y swipe, flechas, autoplay, loop y accesibilidad. Mismo patrón que
 * `EffectCards` (`virtualTranslate` + transform por slide), pero las transiciones se interpolan
 * en JS: arrancan con la velocidad que traía el gesto y terminan en ease-out.
 * Ver docs/emi/DECISIONES.md, D3 y su segunda ronda.
 */

export type ConfigMazo = {
  poses: readonly Pose[];
  /** prefers-reduced-motion: sin vuelo (va en línea recta al fondo). */
  reducido: boolean;
};

const EFECTO = 'mazo';

/** Lo que Swiper pone en cada slide y en la instancia y sus tipos no declaran. */
type SlideSwiper = HTMLElement & { progress: number; swiperSlideOffset: number };
type SwiperInterno = SwiperClass & {
  classNames: string[];
  setTransition: (duracion: number) => void;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);

/** Hermite cúbica en [0, 1] con pendientes m0 (inicio) y m1 (final) sobre la recta 0 a 1. */
function hermite(u: number, m0: number, m1: number) {
  const u2 = u * u;
  const u3 = u2 * u;
  return m0 * (u3 - 2 * u2 + u) + (-2 * u3 + 3 * u2) + m1 * (u3 - u2);
}

/**
 * Tramo del progreso en que la de enfrente va del frente hasta quedar libre del mazo. En ese
 * punto cambia de capa, y el resto (hasta 1) es la vuelta por detrás hasta el fondo.
 */
const P_CAMBIO_CAPA = 0.6;
/** Hasta aquí la de enfrente va pegada al dedo, 1:1 (el umbral de avance es 0,3). */
const P_UNO_A_UNO = 0.3;
/** Giro de "lanzada" en el punto en que queda libre. */
const GIRO_LANZADA = ARCO_SALIDA.r;

type Colocacion = { x: number; y: number; r: number; capa: number };

/**
 * Colocación de una estampilla según su progreso de Swiper (0 = al frente, -1 = la siguiente,
 * +1 = la que acaba de irse). `ancho` y `alto` en px de la estampilla.
 */
function colocar(
  progreso: number,
  n: number,
  ancho: number,
  alto: number,
  config: ConfigMazo
): Colocacion {
  const { poses } = config;
  const pose = (i: number) => poses[clamp(i, 0, poses.length - 1)];
  const poseEn = (profundidad: number) => {
    const d = clamp(profundidad, 0, n - 1);
    const i = Math.floor(d);
    const a = pose(i);
    const b = pose(i + 1);
    const t = d - i;
    return { x: lerp(a.x, b.x, t) * alto, y: lerp(a.y, b.y, t) * alto, r: lerp(a.r, b.r, t) };
  };

  // El mazo es circular: q = -p módulo n. q en [0, n-1] es una profundidad normal; q en
  // (n-1, n) es la de enfrente de viaje hacia el fondo (o volviendo), con v = n - q en (0, 1).
  const q = ((-progreso % n) + n) % n;
  if (q <= n - 1) {
    const p = poseEn(q);
    return { ...p, capa: n * 10 - Math.round(q * 10) };
  }

  const v = n - q; // 0 = al frente, 1 = en el fondo
  const frente = poseEn(0);
  const fondo = poseEn(n - 1);

  if (config.reducido) {
    return {
      x: lerp(frente.x, fondo.x, v),
      y: lerp(frente.y, fondo.y, v),
      r: lerp(frente.r, fondo.r, v),
      capa: v < 0.5 ? n * 10 + 10 : 0,
    };
  }

  // Punto donde queda libre: a la izquierda de la estampilla que en ese momento está más a la
  // izquierda (las demás van de camino a su pose nueva, a profundidad k - P_CAMBIO_CAPA), con
  // holgura para los giros. Ahí el cambio de capa no se ve porque no se solapa con ninguna.
  const izquierdaMazo = Math.min(
    0,
    ...Array.from({ length: n - 1 }, (_, k) => poseEn(k + 1 - P_CAMBIO_CAPA).x)
  );
  const libreX = izquierdaMazo - ancho * 1.22;
  const libreY = frente.y - alto * 0.04;

  if (v <= P_UNO_A_UNO) {
    // Pegada al dedo: el dedo recorre `ancho` px por unidad de progreso.
    const u = v / P_UNO_A_UNO;
    return {
      x: frente.x - v * ancho,
      y: frente.y + (libreY - frente.y) * 0.3 * u,
      r: frente.r + (GIRO_LANZADA - frente.r) * 0.3 * u,
      capa: n * 10 + 10,
    };
  }

  if (v <= P_CAMBIO_CAPA) {
    // Lanzada: sigue con la velocidad del dedo y frena hasta parar en el punto libre (pendiente
    // de salida 0), donde cambia de capa y da la vuelta sin quiebre.
    const u = (v - P_UNO_A_UNO) / (P_CAMBIO_CAPA - P_UNO_A_UNO);
    const x0 = frente.x - P_UNO_A_UNO * ancho;
    const recorrido = x0 - libreX;
    const m0 = recorrido > 0 ? ((P_CAMBIO_CAPA - P_UNO_A_UNO) * ancho) / recorrido : 0;
    const f = hermite(u, clamp(m0, 0, 3), 0);
    const y0 = frente.y + (libreY - frente.y) * 0.3;
    const r0 = frente.r + (GIRO_LANZADA - frente.r) * 0.3;
    return {
      x: lerp(x0, libreX, f),
      y: lerp(y0, libreY, f),
      r: lerp(r0, GIRO_LANZADA, f),
      capa: n * 10 + 10,
    };
  }

  // Vuelta por detrás hasta el fondo, arrancando y llegando sin velocidad.
  const u = (v - P_CAMBIO_CAPA) / (1 - P_CAMBIO_CAPA);
  const f = hermite(u, 0, 0);
  return {
    x: lerp(libreX, fondo.x, f),
    y: lerp(libreY, fondo.y, f),
    r: lerp(GIRO_LANZADA, fondo.r, f),
    // Bajo todas (el fondo es 10). Si vuelven dos a la vez, la que va más adelantada queda
    // encima, como quedarán al llegar: sin empates que el DOM resuelva a su manera.
    capa: Math.round(v * 9),
  };
}

export function crearEfectoMazo(config: { current: ConfigMazo }): SwiperModule {
  return function EfectoMazo({ swiper, on }) {
    /**
     * Dos piezas (D3, tercera ronda):
     * - `camino`: la transición en curso, en espacio de PROGRESO, para que la estampilla que sale
     *   recorra su vuelo (pegada al dedo, lanzada, cambio de capa en el punto libre, vuelta por
     *   detrás). Guarda, por estampilla, cuánto le falta hasta su destino y lo reduce con su
     *   curva (Hermite: arranca con la velocidad del gesto y termina parada).
     * - `restos`: si llega un gesto o una tecla nueva a mitad de un camino, ese camino se
     *   convierte en una diferencia VISUAL (px y grados) entre lo que se ve y la nueva base, que
     *   se desvanece con la curva que le quedaba. Así lo nuevo arranca desde la pose visible y
     *   la estampilla que volvía al fondo termina su vuelta suave. En progreso no se puede:
     *   la vuelta por detrás es tan larga que sumar progreso la haría saltar cientos de px.
     * - `vuelos`: la estampilla que estaba EN VUELO (saliendo o volviendo por detrás) cuando se
     *   interrumpe su camino lo termina tal cual, con su capa y su punto libre, sin mezclarse
     *   con lo nuevo; al acabar, se funde en 400 ms hasta su sitio nuevo en el mazo.
     */
    type Curva = { inicio: number; total: number; m0: number };
    type Camino = Curva & { falta: WeakMap<HTMLElement, number> };
    type Resto = Curva & {
      r0: number;
      delta: WeakMap<HTMLElement, { x: number; y: number; r: number }>;
    };
    type Vuelo = Curva & { antes: number; falta: number };
    const vuelos = new Map<HTMLElement, Vuelo>();
    let camino: Camino | null = null;
    let restos: Resto[] = [];
    /** Último destino (progreso de Swiper) de cada estampilla. */
    const objetivo = new WeakMap<HTMLElement, number>();
    let duracion = 0;
    let raf = 0;
    /** Últimas posiciones pintadas a mano (arrastre), para sacar la velocidad al soltar. */
    let historial: { t: number; translate: number }[] = [];

    const restante = (c: Curva, ahora: number) => {
      const t = Math.min((ahora - c.inicio) / c.total, 1);
      return 1 - hermite(t, c.m0, 0);
    };

    const medidas = (slideEl: HTMLElement) => {
      const ancho = swiper.width;
      return { n: swiper.slides.length, ancho, alto: slideEl.offsetHeight || ancho };
    };

    /** Colocación sin restos: la base más el camino en curso. */
    const base = (slideEl: HTMLElement, progreso: number, ahora: number) => {
      const falta = camino ? (camino.falta.get(slideEl) ?? 0) * restante(camino, ahora) : 0;
      const { n, ancho, alto } = medidas(slideEl);
      return colocar(progreso + falta, n, ancho, alto, config.current);
    };

    const colocarVuelo = (slideEl: HTMLElement, v: Vuelo, ahora: number) => {
      const { n, ancho, alto } = medidas(slideEl);
      return colocar(v.antes + v.falta * restante(v, ahora), n, ancho, alto, config.current);
    };

    const pintar = (ahora: number) => {
      swiper.slides.forEach(slideEl => {
        const vuelo = vuelos.get(slideEl);
        const c = vuelo
          ? colocarVuelo(slideEl, vuelo, ahora)
          : base(slideEl, (slideEl as SlideSwiper).progress, ahora);
        // La que ya estaba en vuelo va por encima de la que sale después (salió antes).
        if (vuelo && c.capa > swiper.slides.length * 10) c.capa += 10;
        let { x, y, r } = c;
        if (!vuelo) {
          for (const resto of restos) {
            const d = resto.delta.get(slideEl);
            if (!d) continue;
            const f = resto.r0 > 0 ? restante(resto, ahora) / resto.r0 : 0;
            x += d.x * f;
            y += d.y * f;
            r += d.r * f;
          }
        }
        const offset = (slideEl as SlideSwiper).swiperSlideOffset;
        slideEl.style.zIndex = String(c.capa);
        slideEl.style.transform = `translate3d(${-offset + x}px, ${y}px, 0) rotate(${r}deg)`;
      });
    };

    const activo = (c: Curva, ahora: number) => ahora - c.inicio < c.total;

    const bucle = (ahora: number) => {
      raf = 0;
      if (swiper.destroyed) return;
      if (camino && !activo(camino, ahora)) camino = null;
      restos = restos.filter(r => activo(r, ahora));
      // Vuelos que acaban: de su pose final a su sitio nuevo, fundido corto sin velocidad.
      vuelos.forEach((v, slideEl) => {
        if (activo(v, ahora)) return;
        vuelos.delete(slideEl);
        const fin = colocarVuelo(slideEl, v, ahora);
        const ahoraBase = base(slideEl, (slideEl as SlideSwiper).progress, ahora);
        const delta = new WeakMap<HTMLElement, { x: number; y: number; r: number }>();
        delta.set(slideEl, {
          x: fin.x - ahoraBase.x,
          y: fin.y - ahoraBase.y,
          r: fin.r - ahoraBase.r,
        });
        restos.push({ inicio: ahora, total: 400, m0: 0, r0: 1, delta });
      });
      pintar(ahora);
      if (camino || restos.length || vuelos.size) raf = requestAnimationFrame(bucle);
    };

    const arrancarBucle = () => {
      if (!raf && (camino || restos.length || vuelos.size)) raf = requestAnimationFrame(bucle);
    };

    const cancelar = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      camino = null;
      restos = [];
      vuelos.clear();
    };

    /**
     * Swiper espera un `transitionend` para dar la transición por hecha (loop, autoplay,
     * eventos). Se le da enseguida: el movimiento que queda es solo visual, así que una segunda
     * tecla o un gesto nuevo pueden encadenar otro avance sin esperar.
     */
    const terminarTransicion = () => {
      if (swiper.destroyed) return;
      swiper.animating = false;
      swiper.wrapperEl.dispatchEvent(
        new window.CustomEvent('transitionend', { bubbles: true, cancelable: true })
      );
    };

    /** El camino en curso pasa a ser un resto visual, medido contra la base `anteriores`. */
    const congelarCamino = (anteriores: (number | undefined)[], ahora: number) => {
      if (!camino || !activo(camino, ahora)) {
        camino = null;
        return;
      }
      const r0 = restante(camino, ahora);
      const delta = new WeakMap<HTMLElement, { x: number; y: number; r: number }>();
      const actual = camino;
      swiper.slides.forEach((slideEl, i) => {
        const antes = anteriores[i];
        if (antes === undefined || vuelos.has(slideEl)) return;
        const { n, ancho, alto } = medidas(slideEl);
        const falta = actual.falta.get(slideEl) ?? 0;
        const pVisto = antes + falta * restante(actual, ahora);
        const q = ((-pVisto % n) + n) % n;
        if (q > n - 1 + 1e-6) {
          // En vuelo: termina su camino tal cual.
          vuelos.set(slideEl, {
            inicio: actual.inicio,
            total: actual.total,
            m0: actual.m0,
            antes,
            falta,
          });
          return;
        }
        const visto = base(slideEl, antes, ahora);
        const sinCamino = colocar(antes, n, ancho, alto, config.current);
        delta.set(slideEl, {
          x: visto.x - sinCamino.x,
          y: visto.y - sinCamino.y,
          r: visto.r - sinCamino.r,
        });
      });
      restos.push({ inicio: camino.inicio, total: camino.total, m0: camino.m0, r0, delta });
      camino = null;
    };

    const setTranslate = () => {
      const ahora = performance.now();
      const n = swiper.slides.length;
      const anteriores = swiper.slides.map(slideEl => objetivo.get(slideEl));
      // Diferencia de progreso de cada una, sin los saltos de n del loop de Swiper (recoloca
      // estampillas en el DOM y su progreso salta en múltiplos de n sin moverse en pantalla).
      const saltos = swiper.slides.map((slideEl, i) => {
        const antes = anteriores[i];
        if (antes === undefined) return 0;
        const d = antes - (slideEl as SlideSwiper).progress;
        return d - n * Math.round(d / n);
      });
      swiper.slides.forEach(slideEl => objetivo.set(slideEl, (slideEl as SlideSwiper).progress));
      const seMueve = saltos.some(d => Math.abs(d) > 1e-6);

      if (duracion <= 0) {
        // Arrastre, loopFix o repintado. Si el destino se mueve a mitad de un camino (se agarró
        // el mazo durante una transición), el camino pasa a resto visual.
        if (seMueve && camino) congelarCamino(anteriores, ahora);
        historial.push({ t: ahora, translate: swiper.translate });
        historial = historial.filter(h => ahora - h.t < 120);
        pintar(ahora);
        arrancarBucle();
        return;
      }

      if (camino) congelarCamino(anteriores, ahora);

      const falta = new WeakMap<HTMLElement, number>();
      let delta = 0;
      swiper.slides.forEach((slideEl, i) => {
        falta.set(slideEl, saltos[i]);
        if (Math.abs(saltos[i]) > Math.abs(delta)) delta = saltos[i];
      });

      // Velocidad con la que venía el gesto (0 si no venía de un arrastre: flechas, teclado,
      // autoplay). La curva arranca con esa velocidad y termina parada: ease-out tras un
      // arrastre, ease-in-out desde quieto. Nunca frena en seco al soltar.
      let total = duracion;
      let m0 = 0;
      const reciente = historial.filter(h => ahora - h.t < 100);
      if (reciente.length >= 2 && Math.abs(delta) > 1e-3) {
        const a = reciente[0];
        const b = reciente[reciente.length - 1];
        const dt = Math.max(b.t - a.t, 1);
        // El progreso sube cuando el translate baja: una estampilla por `ancho` px. Lo que
        // falta es (antes - destino), así que la velocidad hacia el destino es -vProgreso.
        const vProgreso = -(b.translate - a.translate) / dt / Math.max(swiper.width, 1);
        const vHaciaDestino = -vProgreso / delta;
        m0 = vHaciaDestino * total;
        if (m0 > 3) {
          total = Math.max(280, 3 / vHaciaDestino);
          m0 = vHaciaDestino * total;
        }
        m0 = clamp(m0, 0, 3);
      }
      historial = [];

      if (Math.abs(delta) > 1e-4) camino = { inicio: ahora, total, m0, falta };
      pintar(ahora);
      arrancarBucle();
      // Para Swiper la transición ya terminó (ver arriba); en el siguiente tick, como haría
      // un transitionend real, para no reentrar en slideTo.
      setTimeout(terminarTransicion, 0);
    };

    on('beforeInit', () => {
      if (swiper.params.effect !== EFECTO) return;
      (swiper as SwiperInterno).classNames.push(`${swiper.params.containerModifierClass}${EFECTO}`);
      const forzados = { watchSlidesProgress: true, virtualTranslate: true };
      Object.assign(swiper.params, forzados);
      Object.assign(swiper.originalParams, forzados);
    });

    on('setTranslate', () => {
      if (swiper.params.effect !== EFECTO) return;
      setTranslate();
    });

    on('setTransition', (_s, ms) => {
      if (swiper.params.effect !== EFECTO) return;
      duracion = ms;
      // Las transiciones las lleva el JS, no CSS.
      swiper.slides.forEach(slideEl => {
        slideEl.style.transitionDuration = '0ms';
      });
    });

    on('destroy', cancelar);
  };
}

/** Vuelve a pintar el mazo con la configuración actual (tras cambiar de breakpoint). */
export function repintarMazo(swiper: SwiperClass) {
  (swiper as SwiperInterno).setTransition(0);
  swiper.setTranslate(swiper.translate);
}
