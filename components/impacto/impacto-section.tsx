'use client';

import { MapaImpacto } from './mapa-impacto';

/**
 * "Así se ve el impacto en acción": va entre la Introducción y Welcome (D1, D5). Solo hay diseño
 * mobile; tablet y desktop escalan la misma composición con `--k` (D7), como Quiénes somos.
 */
export default function ImpactoSection() {
  return (
    <section
      id="impacto"
      aria-labelledby="impacto-title"
      className="w-full overflow-x-clip bg-beige [--k:1] md:[--k:1.25] lg:[--k:1.4]"
      style={{ paddingTop: 'calc(32px * var(--k))', paddingBottom: 'calc(34px * var(--k))' }}
    >
      <MapaImpacto />
    </section>
  );
}
