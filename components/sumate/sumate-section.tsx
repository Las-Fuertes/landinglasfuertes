'use client';

import { PageGrid } from '../layout/page-grid';
import { FadeIn } from './fade-in';
import SumateHero from './sumate-hero';
import ProyectoDestacado from './proyecto-destacado';
import ComoAyudar from './como-ayudar';
import Testimonio from './testimonio';
import Difunde from './difunde';

export default function SumateSection() {
  return (
    <section
      id="sumate"
      className="relative w-full scroll-mt-16 bg-beige pb-16 pt-12 md:pb-20 md:pt-16"
      aria-labelledby="sumate-title"
    >
      <PageGrid>
        <div className="col-span-4 md:col-span-12">
          <FadeIn>
            <SumateHero />
          </FadeIn>
        </div>

        <div className="col-span-4 md:col-span-12">
          <FadeIn delay={0.05}>
            <ProyectoDestacado />
          </FadeIn>
        </div>

        <div className="col-span-4 mt-4 md:col-span-12">
          <FadeIn>
            <ComoAyudar />
          </FadeIn>
        </div>

        {/* Sin testimonio autorizado aún: el componente se oculta hasta tener cita y autor. */}
        <div className="col-span-4 md:col-span-12">
          <Testimonio />
        </div>

        <div className="col-span-4 mt-4 md:col-span-12">
          <FadeIn>
            <Difunde />
          </FadeIn>
        </div>
      </PageGrid>
    </section>
  );
}
