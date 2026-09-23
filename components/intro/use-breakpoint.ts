'use client';

import { useEffect, useState } from 'react';
import type { Breakpoint } from './intro.data';

const TABLET_QUERY = '(min-width: 768px)';
const DESKTOP_QUERY = '(min-width: 1024px)';

/**
 * Breakpoint activo por JS, con los mismos puntos de corte que Tailwind
 * (`docs/PATTERNS.md`). Lo usa el mecanismo de pin de la Introducción para
 * montar solo el paso del breakpoint que corresponde, en vez de esconder con
 * clases los otros dos (ver D2 en docs/introduccion/DECISIONES.md): con el pin,
 * mantener los 9 bloques a la vez obligaría a sincronizar 3 máquinas de estado en paralelo.
 *
 * Arranca en 'mobile' para que el primer render de cliente coincida con el
 * servidor; el valor real se resuelve en el efecto, tras montar.
 */
export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>('mobile');

  useEffect(() => {
    const tablet = window.matchMedia(TABLET_QUERY);
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const calcular = (): Breakpoint =>
      desktop.matches ? 'desktop' : tablet.matches ? 'tablet' : 'mobile';

    setBp(calcular());
    const onChange = () => setBp(calcular());
    tablet.addEventListener('change', onChange);
    desktop.addEventListener('change', onChange);
    return () => {
      tablet.removeEventListener('change', onChange);
      desktop.removeEventListener('change', onChange);
    };
  }, []);

  return bp;
}
