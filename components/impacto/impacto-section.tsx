'use client';

import { BloqueImpacto } from './bloque-impacto';
import { BLOQUES } from './bloques.data';
import { MapaImpacto } from './mapa-impacto';

const k = (px: number) => `calc(${px}px * var(--k))`;

/**
 * "Así se ve el impacto en acción": va entre la Introducción y Welcome (D1, D5). Solo hay diseño
 * mobile; tablet y desktop escalan la misma composición con `--k` (D7), como Quiénes somos.
 *
 * En Figma cada bloque es una pantalla de 833 px con mucho aire arriba y abajo; en flujo se
 * conserva el ritmo interno de cada bloque y entre bloques se deja un aire fijo (D22).
 */
export default function ImpactoSection() {
  return (
    <section
      id="impacto"
      aria-labelledby="impacto-title"
      className="w-full overflow-x-clip bg-beige [--k:1] md:[--k:1.25] lg:[--k:1.4]"
      style={{ paddingTop: k(32), paddingBottom: k(60) }}
    >
      <MapaImpacto />
      {BLOQUES.map(bloque => (
        <div key={bloque.id} style={{ marginTop: k(120) }}>
          <BloqueImpacto bloque={bloque} />
        </div>
      ))}
    </section>
  );
}
