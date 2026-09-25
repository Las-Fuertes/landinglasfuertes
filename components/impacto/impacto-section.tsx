'use client';

import type { CSSProperties } from 'react';
import { BloqueImpacto } from './bloque-impacto';
import { BLOQUES } from './bloques.data';
import { MapaImpacto } from './mapa-impacto';

const k = (px: number) => `calc(${px}px * var(--k))`;

/**
 * "Así se ve el impacto en acción": va tras el Mapa educativo y antes de Quiénes somos
 * (docs/sumate-drawer/DECISIONES.md, D1; antes iba tras la Introducción, D5). Solo hay diseño
 * mobile; tablet escala la misma composición con `--k` (docs/secciones-impacto, D7), como
 * Quiénes somos.
 *
 * En Figma cada bloque es una pantalla de 833 px con mucho aire arriba y abajo; en flujo se
 * conserva el ritmo interno de cada bloque y entre bloques se deja un aire fijo (D22).
 *
 * Desde `lg` cada bloque es una fila a dos columnas, ilustración y texto intercalados de lado
 * (docs/impacto/DECISIONES.md, D1). Las medidas de mobile van en variables CSS y no en `style`
 * directo, para que una clase `lg:` las pueda pisar sin tocar mobile ni tablet.
 */
export default function ImpactoSection() {
  return (
    <section
      id="impacto"
      aria-labelledby="impacto-title"
      className="w-full overflow-x-clip bg-beige pb-[var(--aire-abajo)] pt-[var(--aire-arriba)] [--k:1] md:[--k:1.25] lg:pt-12 lg:[--k:1.4]"
      style={
        { ['--aire-arriba' as string]: k(20), ['--aire-abajo' as string]: k(60) } as CSSProperties
      }
    >
      {/* En desktop, la misma caja que el PageGrid: 1200 de ancho con 40 de margen. */}
      <div className="lg:mx-auto lg:max-w-[75rem] lg:px-page-margin">
        <MapaImpacto />
        {BLOQUES.map(bloque => (
          <div
            key={bloque.id}
            className="mt-[var(--aire-bloque)] lg:mt-24"
            style={{ ['--aire-bloque' as string]: k(120) } as CSSProperties}
          >
            <BloqueImpacto bloque={bloque} />
          </div>
        ))}
      </div>
    </section>
  );
}
