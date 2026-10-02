'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Quietud real, en ms, antes de asentar: sin `scroll`, rueda, dedo puesto ni tecla (D6). Medio
 * segundo: lo bastante para que quien sigue moviendo nunca sienta que el imán le toma el mando.
 */
const QUIETO_MS = 500;
/** Duración del asentado, en ms: 600 para un tramo corto, 900 desde un alto de pantalla (D6). */
const DURACION_MIN = 600;
const DURACION_MAX = 900;
/** Si el punto siguiente queda a menos de esta fracción del alto, el imán lo atrae. */
const CERCA = 0.3;
/** Un gesto que sale de un punto y recorre al menos esta fracción pasa al punto siguiente. */
const EMPUJON = 0.15;
/** Margen de redondeo, en px, para decir que una posición está en un punto. */
const TOLERANCIA = 2;
/**
 * Dispositivos sin imán (D7): los que tienen el dedo como puntero principal. `pointer: coarse`
 * describe el puntero PRINCIPAL, así que da verdadero en iPhone, Android y tablets táctiles, y
 * falso en un portátil con trackpad o ratón aunque su pantalla también sea táctil. No se usa
 * `hover: none` porque algunos Android (Samsung Internet) declaran `hover: hover`, ni el ancho,
 * porque una tablet de 1024 o más es táctil y un portátil estrecho no lo es.
 */
const TACTIL = '(pointer: coarse)';

/**
 * Scroll libre con imán en Impacto (docs/impacto/DECISIONES.md, D4 y su ampliación). Los puntos
 * de imán son los elementos con `data-iman` dentro de la sección, menos su `scroll-margin-top`
 * (el alto del título fijo, D5: asientan justo debajo de él), más el pie de la sección (el tope
 * de Quiénes somos).
 *
 * Ya no usa `scroll-snap-type` de CSS: con `proximity`, Chrome volvía a encajar tras cada muesca
 * de la rueda del ratón y no dejaba avanzar. Ahora el scroll es siempre nativo y libre, y el imán
 * solo actúa tras medio segundo de quietud real (sin `scroll`, rueda, dedo puesto ni tecla), con
 * estas reglas:
 *
 * - Solo si hubo un gesto de la persona (rueda, toque, tecla, clic en la barra) desde el último
 *   reposo: los `scrollTo` del código ("Inicio", "Terminar" del mapa) no se tocan.
 * - Solo dentro de Impacto: entre su tope y el de Quiénes somos.
 * - Solo hacia adelante en la dirección del último movimiento: nunca devuelve. La excepción es
 *   una tecla de página, que avanza la pantalla entera y pasa el punto siguiente por lo que tapa
 *   el título fijo (D5): ahí vuelve a ese punto.
 * - Asienta en el punto siguiente si está a menos del 30 % del alto, o si el gesto salió de un
 *   punto y recorrió al menos el 15 % (el empujón que pasa de pantalla).
 * - Nunca si la pantalla actual es más alta que el alto útil y la persona está leyendo dentro.
 * - Con movimiento reducido no asienta: el scroll queda libre del todo.
 * - En táctil (puntero principal `coarse`, D7) no existe: no registra ni un listener y el scroll
 *   con el dedo es nativo del todo. Asentar tras soltar el dedo se sentía como un salto.
 *
 * El asentado (D6) es una animación propia con `requestAnimationFrame`, no `scrollTo` suave:
 * empieza lento y termina rápido (cúbica `t³`), dura de 600 a 900 ms según la distancia y se
 * cancela en cuanto la persona vuelve a moverse (rueda, dedo, tecla, clic o un `scroll` que no es
 * el suyo): el control vuelve a ella en el mismo evento.
 */
export function useIman(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const seccion = ref.current;
    if (!seccion) return;
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)');
    const tactil = window.matchMedia(TACTIL);

    let ancla = window.scrollY;
    let huboGesto = false;
    /** El último gesto fue una tecla de página (PageDown, PageUp, Espacio). */
    let porPagina = false;
    let tocando = false;
    let temporizador: number | undefined;
    /** Último `scroll` visto: posición y momento. */
    let yVisto = window.scrollY;
    let vistoEn = 0;
    /** Último gesto de la persona (rueda, dedo, tecla, clic en la barra). */
    let gestoEn = 0;
    /** Fotograma pendiente del asentado en curso, y la posición que el asentado acaba de poner. */
    let animacion: number | undefined;
    let yAnimado: number | null = null;

    /** Para el asentado en curso y devuelve el control: el reposo siguiente cuenta desde aquí. */
    const cancelar = () => {
      if (animacion === undefined) return;
      window.cancelAnimationFrame(animacion);
      animacion = undefined;
      // Desde donde lo dejó el asentado, no `scrollY`: la rueda pasiva ya pudo mover la página
      // antes de que llegue su evento, y el gesto se mediría en cero.
      ancla = yAnimado ?? window.scrollY;
      yAnimado = null;
    };

    /** Lleva el scroll a `objetivo` empezando lento y terminando rápido (D6). */
    const deslizar = (objetivo: number) => {
      const desde = window.scrollY;
      const recorrido = objetivo - desde;
      const fraccion = Math.min(1, Math.abs(recorrido) / window.innerHeight);
      const duracion = DURACION_MIN + (DURACION_MAX - DURACION_MIN) * fraccion;
      const inicio = performance.now();
      const paso = (ahora: number) => {
        const t = Math.min(1, Math.max(0, (ahora - inicio) / duracion));
        const y = Math.round(desde + recorrido * t * t * t);
        yAnimado = y;
        window.scrollTo({ top: y, behavior: 'instant' });
        if (t < 1) {
          animacion = window.requestAnimationFrame(paso);
          return;
        }
        animacion = undefined;
        yAnimado = null;
        ancla = objetivo;
      };
      animacion = window.requestAnimationFrame(paso);
    };

    /** Lo que tapa el título fijo arriba (D5): el `scroll-margin-top` de los puntos. */
    let tapado = 0;
    const puntos = () => {
      const base = window.scrollY;
      const elementos = [...seccion.querySelectorAll<HTMLElement>('[data-iman]')];
      const margen = (el: HTMLElement) => parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      tapado = elementos[0] ? margen(elementos[0]) : 0;
      const lista = elementos.map(el => el.getBoundingClientRect().top + base - margen(el));
      lista.push(seccion.getBoundingClientRect().bottom + base);
      return lista.map(Math.round).sort((a, b) => a - b);
    };

    const asentar = () => {
      temporizador = undefined;
      if (tocando) return;
      // Nunca a media inercia (docs/introduccion/DECISIONES.md, D13): si el hilo principal estuvo
      // ocupado, el temporizador puede saltar antes de que llegue el `scroll` siguiente mientras
      // la página sigue deslizando por su cuenta. Si se movió desde el último `scroll` visto, o
      // ese fue hace menos del silencio, se espera otra vez.
      const movidoEn = Math.max(vistoEn, gestoEn);
      if (Math.abs(window.scrollY - yVisto) > 1 || performance.now() - movidoEn < QUIETO_MS) {
        esperar();
        return;
      }
      const y = window.scrollY;
      const desde = ancla;
      const gesto = huboGesto;
      const pagina = porPagina;
      ancla = y;
      huboGesto = false;
      porPagina = false;
      if (!gesto || reducido.matches) return;

      const movido = y - desde;
      if (Math.abs(movido) <= TOLERANCIA) return;
      const lista = puntos();
      const primero = lista[0];
      const ultimo = lista[lista.length - 1];
      if (primero === undefined || ultimo === undefined) return;
      if (y < primero - TOLERANCIA || y > ultimo + TOLERANCIA) return;

      const alto = window.innerHeight;
      // Pantalla en la que se está: del último punto por encima al siguiente por debajo. Lo que
      // se ve de ella es el alto útil, bajo el título fijo; el último tramo (hasta el tope de
      // Quiénes somos) suma además el título, que ahí se suelta.
      const arriba = [...lista].reverse().find(p => p <= y + TOLERANCIA) ?? primero;
      const abajo = lista.find(p => p > arriba) ?? ultimo;
      const util = alto - tapado;
      const largo = abajo - arriba - (abajo === ultimo ? tapado : 0);
      if (largo > util + TOLERANCIA && y >= arriba && y + util <= abajo + TOLERANCIA) {
        return; // leyendo dentro de una pantalla más alta que el alto útil
      }

      // Una tecla de página avanza el alto entero de la pantalla, pero lo que se ve es el alto
      // útil: se pasa del punto siguiente justo lo que tapa el título. Si pasó un punto (que no
      // sea del que salió) por no más que eso, vuelve a él: una tecla, un bloque.
      if (pagina) {
        const pasado =
          movido > 0
            ? [...lista]
                .reverse()
                .find(
                  p => p <= y + TOLERANCIA && p >= y - tapado - TOLERANCIA && p > desde + TOLERANCIA
                )
            : lista.find(
                p => p >= y - TOLERANCIA && p <= y + tapado + TOLERANCIA && p < desde - TOLERANCIA
              );
        if (pasado !== undefined) {
          if (Math.abs(pasado - y) > TOLERANCIA) deslizar(pasado);
          return;
        }
      }

      const objetivo =
        movido > 0
          ? lista.find(p => p > y + TOLERANCIA)
          : [...lista].reverse().find(p => p < y - TOLERANCIA);
      if (objetivo === undefined) return;
      const distancia = Math.abs(objetivo - y);
      const salioDeUnPunto = lista.some(p => Math.abs(p - desde) <= TOLERANCIA);
      const cerca = distancia < alto * CERCA;
      const empujon = salioDeUnPunto && Math.abs(movido) >= alto * EMPUJON && distancia <= alto;
      if (!cerca && !empujon) return;

      // El propio asentado es un scroll de código: el reposo al que llega será el ancla nueva.
      deslizar(objetivo);
    };

    const esperar = () => {
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(asentar, QUIETO_MS);
    };
    const gesto = () => {
      cancelar();
      gestoEn = performance.now();
      huboGesto = true;
      porPagina = false;
      esperar();
    };
    const alTeclear = (evento: KeyboardEvent) => {
      gesto();
      porPagina = evento.key === 'PageDown' || evento.key === 'PageUp' || evento.key === ' ';
    };
    const alEmpezarToque = () => {
      tocando = true;
      gesto();
    };
    const alSoltarToque = (evento: TouchEvent) => {
      tocando = evento.touches.length > 0;
      gestoEn = performance.now();
      esperar();
    };
    const alDesplazar = () => {
      if (animacion !== undefined) {
        // El `scroll` que provoca el propio asentado no cuenta; cualquier otro (la barra, un
        // `scrollTo` del código) es de otro y el asentado se aparta.
        if (yAnimado !== null && Math.abs(window.scrollY - yAnimado) <= 1.5) return;
        cancelar();
      }
      yVisto = window.scrollY;
      vistoEn = performance.now();
      esperar();
    };
    const alPulsar = (evento: PointerEvent) => {
      // Cualquier clic aparta el asentado: un botón que hace `scrollTo` ("Inicio") manda.
      cancelar();
      // Solo la barra de scroll (el clic cae en `<html>`); un botón que hace `scrollTo` no cuenta.
      if (evento.target === document.documentElement) gesto();
    };
    const alTerminarScroll = () => {
      if (animacion !== undefined) return; // el asentado en curso no es un reposo
      // `scrollend` llega al acabar la inercia, pero puede llegar entre dos muescas de la rueda:
      // se le da el mismo silencio que al respaldo, por si viene otra.
      esperar();
    };

    const opciones = { passive: true } as const;
    let activo = false;
    const activar = () => {
      if (activo) return;
      activo = true;
      ancla = window.scrollY;
      yVisto = window.scrollY;
      huboGesto = false;
      window.addEventListener('wheel', gesto, opciones);
      window.addEventListener('touchstart', alEmpezarToque, opciones);
      window.addEventListener('touchmove', gesto, opciones);
      window.addEventListener('touchend', alSoltarToque, opciones);
      window.addEventListener('touchcancel', alSoltarToque, opciones);
      window.addEventListener('keydown', alTeclear);
      window.addEventListener('pointerdown', alPulsar, opciones);
      window.addEventListener('scroll', alDesplazar, opciones);
      window.addEventListener('scrollend', alTerminarScroll, opciones);
    };
    const desactivar = () => {
      if (!activo) return;
      activo = false;
      window.clearTimeout(temporizador);
      temporizador = undefined;
      if (animacion !== undefined) window.cancelAnimationFrame(animacion);
      animacion = undefined;
      yAnimado = null;
      tocando = false;
      window.removeEventListener('wheel', gesto);
      window.removeEventListener('touchstart', alEmpezarToque);
      window.removeEventListener('touchmove', gesto);
      window.removeEventListener('touchend', alSoltarToque);
      window.removeEventListener('touchcancel', alSoltarToque);
      window.removeEventListener('keydown', alTeclear);
      window.removeEventListener('pointerdown', alPulsar);
      window.removeEventListener('scroll', alDesplazar);
      window.removeEventListener('scrollend', alTerminarScroll);
    };
    // Sin imán si el puntero principal es el dedo (D7): ni un listener queda puesto. Se sigue el
    // `change` porque la consulta puede cambiar en vivo (un iPad al que se le conecta un
    // trackpad, la emulación de DevTools).
    const actualizar = () => (tactil.matches ? desactivar() : activar());
    actualizar();
    tactil.addEventListener('change', actualizar);
    return () => {
      tactil.removeEventListener('change', actualizar);
      desactivar();
    };
  }, [ref]);
}
