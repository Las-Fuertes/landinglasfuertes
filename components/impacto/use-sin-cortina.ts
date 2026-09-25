'use client';

import { useEffect, useState } from 'react';
import { EVENTO_CORTINA } from '../education-map/cortina';

/**
 * `false` mientras la cortina de "Terminar" / "Saltar mapa" del Mapa educativo tapa la página.
 * Impacto no empieza su entrada debajo de ella: arranca cuando la cortina ya se fue
 * (docs/impacto/DECISIONES.md, D2).
 */
export function useSinCortina() {
  const [libre, setLibre] = useState(true);
  useEffect(() => {
    const leer = () => setLibre(!('cortinaPuesta' in document.documentElement.dataset));
    leer();
    window.addEventListener(EVENTO_CORTINA, leer);
    return () => window.removeEventListener(EVENTO_CORTINA, leer);
  }, []);
  return libre;
}
