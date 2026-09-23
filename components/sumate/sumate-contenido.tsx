'use client';

import { FadeIn } from './fade-in';
import SumateHero from './sumate-hero';
import ProyectoDestacado from './proyecto-destacado';
import ComoAyudar from './como-ayudar';
import Testimonio from './testimonio';
import Difunde from './difunde';

/**
 * Todo lo de "Súmate a Las Fuertes", tal cual era la sección de la página. Desde el
 * 2026-09-23 vive dentro del drawer (`sumate-drawer.tsx`, docs/sumate-drawer/DECISIONES.md, D2),
 * así que va en una columna sin `PageGrid`: el drawer mide como mucho `max-w-xl` en desktop.
 *
 * Ninguna pieza usa clases `lg:`, así que en el drawer desktop (unos 576 px) se ve la versión
 * tablet (`md:`) y en móvil la de siempre, sin necesitar un modo aparte.
 */
export default function SumateContenido() {
  return (
    <div className="flex flex-col gap-grid-gutter px-6 pb-xxl pt-s min-[380px]:px-page-margin">
      <FadeIn>
        <SumateHero />
      </FadeIn>

      <FadeIn delay={0.05}>
        <ProyectoDestacado />
      </FadeIn>

      <div className="mt-4">
        <FadeIn>
          <ComoAyudar />
        </FadeIn>
      </div>

      {/* Sin testimonio autorizado aún: el componente se oculta hasta tener cita y autor. */}
      <Testimonio />

      <div className="mt-4">
        <FadeIn>
          <Difunde />
        </FadeIn>
      </div>
    </div>
  );
}
