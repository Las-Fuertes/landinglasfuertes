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
 * Título fijo y una pantalla por bloque, sobre el alto fijo (docs/impacto/DECISIONES.md, D10;
 * D9 había quitado ambos). El título es `position: sticky` de CSS, sin JS por frame, y mide
 * `--alto-titulo`. La fila del mapa y cada par ilustración más texto miden `min-h-pantalla` (el
 * alto de pantalla medido una vez, docs/scroll/DECISIONES.md, D1: no cambia con la barra de
 * Safari) y reservan arriba `--alto-titulo` de relleno, que es donde el título se queda
 * superpuesto; su contenido se centra en lo que queda libre debajo. Sin imán de JS ni
 * `scroll-snap`: scroll nativo libre.
 *
 * D11: el contenedor del sticky es esta sección y termina con el último bloque (sin aire debajo),
 * así el título sube con la niña. Desde `lg` los bloques miden su alto natural con `xxl` entre
 * uno y otro (`scroll-mt` deja libre el título al anclar). Sin `overflow` propio: el recorte
 * horizontal lo hace el wrapper de `pages/index.tsx`.
 */
export default function ImpactoSection() {
  const [inicioTitulo, setInicioTitulo] = useState<InicioTitulo>(null);
  const alEmpezarTitulo = useCallback((inicio: number) => setInicioTitulo(inicio), []);

  return (
    <section
      id="impacto"
      aria-labelledby="impacto-title"
      // La franja del título (D6 y D10): aire arriba y abajo alrededor de las dos líneas (2 rem
      // por `--k` cada una). En mobile el CTA "Súmate" flotante (16 + 42 = 58 px) cae encima de la
      // primera línea: la franja reserva su alto (arriba 64 + 10, abajo 16). Desde tablet, 25 por
      // `--k` arriba y abajo. `--alto-titulo` es la franja entera.
      className="relative w-full bg-beige [--aire-abajo:theme(spacing.4)] [--aire-arriba:calc(theme(spacing.16)+theme(spacing.s))] [--alto-titulo:calc(var(--aire-arriba)+4rem*var(--k)+var(--aire-abajo))] [--k:1] md:[--aire-abajo:calc(theme(spacing.l)*var(--k))] md:[--aire-arriba:calc(theme(spacing.l)*var(--k))] md:[--k:1.25] lg:[--k:1.4]"
    >
      <TituloImpacto onInicio={alEmpezarTitulo} />
      {/* En desktop, la misma caja que el PageGrid: 1200 de ancho con 40 de margen. */}
      <div className="lg:mx-auto lg:max-w-[75rem] lg:px-page-margin">
        <div className="flex min-h-[calc(var(--alto-fijo,100svh)-var(--alto-titulo))] flex-col justify-center pb-m lg:min-h-0 lg:pb-xxl lg:pt-xl">
          <MapaImpacto inicioTitulo={inicioTitulo} />
        </div>
        {/* La ilustración se topa con lo que deja libre la pantalla (`--fuera-del-arte`, que lee
            `BloqueImpacto`): el título, el aire de arriba y abajo, la separación y el texto. */}
        {BLOQUES.map(bloque => (
          <div
            key={bloque.id}
            data-impacto-pantalla={bloque.id}
            className="flex min-h-pantalla scroll-mt-[var(--alto-titulo)] flex-col justify-center pb-m pt-[var(--alto-titulo)] lg:min-h-0 lg:pb-xxl lg:pt-0 lg:last:pb-0 [--fuera-del-arte:calc(var(--alto-titulo)+theme(spacing.m)+(theme(spacing.xl)+13rem)*var(--k))]"
          >
            <BloqueImpacto bloque={bloque} />
          </div>
        ))}
      </div>
    </section>
  );
}
