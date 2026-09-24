'use client';

import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';

// En el servidor useLayoutEffect avisa; en el cliente medimos antes de pintar.
const useMedirAntesDePintar = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Dice en qué línea visual cae cada palabra de un texto, medido por el navegador. Es el corte de
 * línea del resaltado (docs/resaltado/DECISIONES.md, D1) y del título de Donaciones
 * (docs/donaciones/DECISIONES.md, D1): nada de cortes escritos a mano por idioma.
 *
 * `medidorRef` apunta a una copia invisible del texto con la misma tipografía y el mismo ancho,
 * en la que cada palabra que interesa va en un elemento con `data-palabra`. Devuelve, en el orden
 * del documento, el número de línea (0, 1, 2...) de cada una, o `null` antes de medir (servidor
 * y primer render). Vuelve a medir si cambia el ancho, cuando cargan las fuentes y si cambia
 * `clave` (el texto, el idioma).
 */
export function useLineasMedidas(
  medidorRef: RefObject<HTMLElement | null>,
  clave: string,
  activo = true
): number[] | null {
  const [lineas, setLineas] = useState<number[] | null>(null);

  useMedirAntesDePintar(() => {
    const medidor = medidorRef.current;
    if (!medidor || !activo) return;

    const medir = () => {
      const nuevas: number[] = [];
      let arriba: number | null = null;
      let linea = -1;
      medidor.querySelectorAll<HTMLElement>('[data-palabra]').forEach(palabra => {
        const caja = palabra.getBoundingClientRect();
        // Una palabra nueva abre línea si empieza por debajo de la mitad de la anterior.
        if (arriba === null || caja.top - arriba > caja.height / 2) {
          linea++;
          arriba = caja.top;
        }
        nuevas.push(linea);
      });
      setLineas(previas =>
        previas && previas.join() === nuevas.join() ? previas : nuevas.length ? nuevas : null
      );
    };

    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(medidor);
    document.fonts?.ready.then(medir).catch(() => undefined);
    return () => observador.disconnect();
  }, [clave, activo]);

  return activo ? lineas : null;
}
