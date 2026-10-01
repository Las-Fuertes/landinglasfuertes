'use client';

import { useCallback, useRef, useState } from 'react';
import { BloqueImpacto } from './bloque-impacto';
import { BLOQUES } from './bloques.data';
import { MapaImpacto } from './mapa-impacto';
import { TituloImpacto, type InicioTitulo } from './titulo-impacto';
import { useIman } from './use-iman';

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
 * El título de la sección va fijo arriba mientras se recorre (D5, `TituloImpacto`) y mide
 * `--alto-titulo`. Debajo, la fila del mapa y cada par ilustración más texto ocupan al menos el
 * alto útil (la pantalla menos el título), centrados en él, y son un punto de imán (`data-iman`,
 * con `scroll-margin-top` igual al título, para asentar justo debajo de él). El imán es de JS
 * (`useIman`), no `scroll-snap` de CSS: asienta solo al terminar el scroll y hacia adelante, sin
 * atrapar la rueda (D4 y su ampliación). El último punto, el pie de la sección, es el tope de
 * Quiénes somos: salir hacia abajo también encaja.
 */
export default function ImpactoSection() {
  const ref = useRef<HTMLElement>(null);
  useIman(ref);
  const [inicioTitulo, setInicioTitulo] = useState<InicioTitulo>(null);
  const alEmpezarTitulo = useCallback((inicio: number) => setInicioTitulo(inicio), []);

  return (
    <section
      ref={ref}
      id="impacto"
      aria-labelledby="impacto-title"
      // La franja del título (D6): aire arriba y abajo parejo alrededor de las dos líneas
      // (2 rem por `--k` cada una). En mobile el CTA "Súmate" flotante (16 + 42 = 58 px) cae
      // encima de la primera línea en horizontal: la franja reserva su alto y centra el título
      // entre el pie del CTA y su propio pie (arriba 64 + 10, abajo 16). Desde tablet el título
      // centrado ya no le queda al lado y va centrado en la franja entera: 25 por `--k` arriba y
      // abajo. `--alto-titulo` (D5) es la franja entera; las pantallas la restan a su alto.
      className="relative w-full overflow-x-clip bg-beige [--aire-abajo:theme(spacing.4)] [--aire-arriba:calc(theme(spacing.16)+theme(spacing.s))] [--k:1] md:[--aire-abajo:calc(theme(spacing.l)*var(--k))] md:[--aire-arriba:calc(theme(spacing.l)*var(--k))] md:[--k:1.25] lg:[--k:1.4] [--alto-titulo:calc(var(--aire-arriba)+4rem*var(--k)+var(--aire-abajo))]"
    >
      <TituloImpacto onInicio={alEmpezarTitulo} />
      {/* En desktop, la misma caja que el PageGrid: 1200 de ancho con 40 de margen. */}
      <div className="lg:mx-auto lg:max-w-[75rem] lg:px-page-margin">
        <div
          data-iman
          className="flex min-h-[calc(100dvh-var(--alto-titulo))] scroll-mt-[var(--alto-titulo)] flex-col justify-center py-m"
        >
          <MapaImpacto inicioTitulo={inicioTitulo} />
        </div>
        {/* Bajo el título no queda nada fijo: `py-m` basta arriba y abajo, y la ilustración se
            topa con lo que deja libre el alto útil (`--fuera-del-arte`, que lee `BloqueImpacto`):
            el título, ese aire, la separación y el texto. */}
        {BLOQUES.map(bloque => (
          <div
            key={bloque.id}
            data-impacto-pantalla={bloque.id}
            data-iman
            className="flex min-h-[calc(100dvh-var(--alto-titulo))] scroll-mt-[var(--alto-titulo)] flex-col justify-center py-m [--fuera-del-arte:calc(var(--alto-titulo)+theme(spacing.m)*2+(theme(spacing.xl)+13rem)*var(--k))]"
          >
            <BloqueImpacto bloque={bloque} />
          </div>
        ))}
      </div>
    </section>
  );
}
