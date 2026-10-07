'use client';

import { useCallback, useState } from 'react';
import { BloqueImpacto } from './bloque-impacto';
import { BLOQUES } from './bloques.data';
import { MapaImpacto } from './mapa-impacto';
import { TituloImpacto, type InicioTitulo } from './titulo-impacto';

/**
 * "Así se ve el impacto en acción": va tras el Mapa educativo y antes de Quiénes somos
 * (docs/sumate-drawer/DECISIONES.md, D1; antes iba tras la Introducción, D5). Solo hay diseño
 * mobile; tablet escala la misma composición con `--k` (docs/secciones-impacto, D7), como
 * Quiénes somos.
 *
 * Desde `lg` cada bloque es una fila a dos columnas, ilustración y texto intercalados de lado
 * (docs/impacto/DECISIONES.md, D1). Las medidas de mobile van en variables CSS y no en `style`
 * directo, para que una clase `lg:` las pueda pisar sin tocar mobile ni tablet.
 *
 * Scroll nativo (docs/impacto/DECISIONES.md, D9): sin imán de JS, sin título fijo y sin filas del
 * alto de la pantalla. El título va una vez arriba, en flujo normal; el mapa y cada par
 * ilustración más texto tienen el alto de su contenido y entre ellos va el aire de la escala
 * (`xxl`, docs/feedback-30-sep/AIRE.md). Las entradas son CSS disparado por `IntersectionObserver`.
 */
export default function ImpactoSection() {
  const [inicioTitulo, setInicioTitulo] = useState<InicioTitulo>(null);
  const alEmpezarTitulo = useCallback((inicio: number) => setInicioTitulo(inicio), []);

  return (
    <section
      id="impacto"
      aria-labelledby="impacto-title"
      // Aire arriba del título (`--aire-arriba`): en mobile el CTA "Súmate" flotante (16 + 42 = 58 px)
      // puede caer encima de la primera línea, así que deja su alto; desde tablet, 25 por `--k`.
      className="relative w-full overflow-x-clip bg-beige pb-xxl [--aire-arriba:calc(theme(spacing.16)+theme(spacing.s))] [--k:1] md:[--aire-arriba:calc(theme(spacing.l)*var(--k))] md:[--k:1.25] lg:[--k:1.4]"
    >
      <TituloImpacto onInicio={alEmpezarTitulo} />
      {/* En desktop, la misma caja que el PageGrid: 1200 de ancho con 40 de margen. */}
      <div className="mt-xl flex flex-col gap-xxl lg:mx-auto lg:mt-xxl lg:max-w-[75rem] lg:px-page-margin">
        <MapaImpacto inicioTitulo={inicioTitulo} />
        {BLOQUES.map(bloque => (
          <BloqueImpacto key={bloque.id} bloque={bloque} />
        ))}
      </div>
    </section>
  );
}
