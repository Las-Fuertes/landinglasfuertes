'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

/** Espera tras el último `scroll` en los navegadores sin `scrollend` (Safari). */
const QUIETO_MS = 150;
/** El cambio de la ilustración llega a este tiempo de la entrada (s), como en D4... */
const CAMBIO_S = 1.5;
/** ...pero nunca antes de esta pausa (s) desde que el bloque se asentó en pantalla. */
const PAUSA_MIN_S = 0.4;

/**
 * Los dos disparadores de un bloque de Impacto (docs/impacto/DECISIONES.md, D5).
 *
 * - `entrada`: la pantalla del bloque asoma (un 1 % visible). Arranca enseguida, aún con
 *   la página en movimiento, la entrada del texto y de la ilustración en su estado "antes": así
 *   la pantalla que llega nunca está vacía mientras el imán termina de encajarla.
 * - `inicio`: segundos hasta el cambio de la ilustración (agua, líquido, color, lámparas), o
 *   `null` si todavía no toca. Se fija cuando el bloque se asienta: el scroll se detuvo y se ve
 *   al menos el 90 % de lo que de él cabe bajo el título fijo. El cambio llega 1,5 s después de
 *   la entrada, como en D4, pero nunca antes de 0,4 s tras asentarse: quien lee ya llegó cuando
 *   la ilustración se transforma.
 *
 * Ninguno vuelve atrás. Con movimiento reducido los dos se dan desde el principio y el CSS pone
 * los retrasos a cero: todo se ve en su estado final.
 */
export function useEntradaBloque(ref: RefObject<HTMLElement | null>) {
  const [entrada, setEntrada] = useState(false);
  const [inicio, setInicio] = useState<number | null>(null);
  const momentoEntrada = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || inicio !== null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEntrada(true);
      setInicio(0);
      return;
    }

    const entrar = () => {
      if (momentoEntrada.current !== null) return;
      momentoEntrada.current = performance.now();
      setEntrada(true);
    };

    const observador = new IntersectionObserver(
      ([registro]) => {
        if (registro?.isIntersecting) entrar();
      },
      // 1 % y no 0: una pantalla pegada al borde inferior, sin ningún píxel a la vista, ya cuenta
      // como intersección con umbral 0 y entraría sin que nadie la viera.
      { threshold: 0.01 }
    );
    // Se observa la pantalla entera del bloque (su punto de imán), no solo el dibujo y el texto:
    // asoma con el primer movimiento hacia ella, y el fundido ya va en marcha cuando el bloque
    // llega a verse.
    observador.observe(el.closest<HTMLElement>('[data-iman]') ?? el);

    // El tope útil es el pie del título fijo de la sección: lo que queda debajo de él no se ve.
    const titulo = el.closest('section')?.querySelector('[data-impacto-titulo]');
    const revisar = () => {
      const r = el.getBoundingClientRect();
      const alto = window.innerHeight;
      const tope = Math.max(0, titulo?.getBoundingClientRect().bottom ?? 0);
      const visible = Math.min(r.bottom, alto) - Math.max(r.top, tope);
      if (r.height <= 0 || visible < Math.min(r.height, alto - tope) * 0.9) return;
      entrar();
      const desde = (performance.now() - (momentoEntrada.current ?? performance.now())) / 1000;
      setInicio(Math.max(CAMBIO_S - desde, PAUSA_MIN_S));
    };

    let espera: number | undefined;
    const alMover = () => {
      window.clearTimeout(espera);
      espera = window.setTimeout(revisar, QUIETO_MS);
    };

    revisar();
    window.addEventListener('scroll', alMover, { passive: true });
    window.addEventListener('scrollend', revisar);
    return () => {
      observador.disconnect();
      window.clearTimeout(espera);
      window.removeEventListener('scroll', alMover);
      window.removeEventListener('scrollend', revisar);
    };
  }, [ref, inicio]);

  return { entrada, inicio };
}
