'use client';

import { useState, type ReactElement } from 'react';
import { motion } from 'framer-motion';
import { HandCoins, Package, Clock } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { track } from '../../lib/analytics';
import { medirFormaAyuda, SALIENTE } from './sumate-medicion';
import { GIVE_LIVELY_URL } from './sumate.data';
import { MarcoRasgado } from './ui';
import { Garabato } from './garabato';
import DonarDinero from './donar-dinero';
import DonarCosas from './donar-cosas';
import DonarTiempo from './donar-tiempo';

type Category = 'dinero' | 'cosas' | 'tiempo';

/* Los íconos de siempre, cada uno con su acento de la paleta lúdica (sol, flor, conchas). El texto
   de la tarjeta elegida va en azul en las tres: el naranja y el rosa no llegan al contraste AA. */
const CATEGORIES: {
  id: Category;
  icon: typeof HandCoins;
  acento: string;
}[] = [
  { id: 'dinero', icon: HandCoins, acento: 'text-blue' },
  { id: 'cosas', icon: Package, acento: 'text-orange' },
  { id: 'tiempo', icon: Clock, acento: 'text-pink' },
];

const PANELS: Record<Category, () => ReactElement> = {
  dinero: DonarDinero,
  cosas: DonarCosas,
  tiempo: DonarTiempo,
};

/**
 * Wizard de 2 pasos: primero eliges cómo ayudar (dinero / cosas / tiempo), luego ves el detalle
 * de esa opción en un panel animado. Según Figma `1300:1865` (docs/sumate-drawer/DECISIONES.md,
 * D3): tarjetas y panel con el marco rasgado del sitio, azul y con sombra el elegido; bajo el
 * panel de dinero, la caja de "¿Donas desde Estados Unidos?" con marco gris.
 */
export default function ComoAyudar() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<Category>('dinero');
  const Panel = PANELS[category];

  return (
    <div id="donar" className="scroll-mt-s">
      <h3 className="text-center text-[1.75rem] font-bold leading-tight tracking-[-0.04em] text-black md:text-[2.5rem]">
        {t('sumate.wizard.question')}
      </h3>

      {/* Paso 1: selector de categoría (Figma: 142 x 149, a 40 px una de otra) */}
      <div
        role="tablist"
        aria-label={t('sumate.wizard.question')}
        className="mx-auto mt-xl grid max-w-md grid-cols-3 gap-s md:max-w-none md:grid-cols-[repeat(3,8.875rem)] md:justify-center md:gap-xl lg:mt-[4.5rem]"
      >
        {CATEGORIES.map(({ id, icon: Icon, acento }) => {
          const active = category === id;
          return (
            <motion.button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={active}
              aria-controls={`panel-${id}`}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setCategory(id);
                medirFormaAyuda(id);
              }}
              data-sumate-categoria={id}
              className="group relative flex min-h-[6.5rem] flex-col items-center justify-center gap-1.5 px-2 py-m text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-4 focus-visible:ring-offset-papel md:min-h-[9.3125rem]"
            >
              <MarcoRasgado
                tono={active ? 'azul' : 'gris'}
                grosor={active ? 'grueso' : 'fino'}
                sombra={active}
              />
              <Icon
                className={`relative h-7 w-7 md:h-8 md:w-8 ${active ? 'text-blue' : acento}`}
                strokeWidth={1.8}
                aria-hidden
              />
              <span
                className={`relative text-[0.95rem] font-bold leading-tight md:text-[1.125rem] ${
                  active ? 'text-blue' : 'text-black group-hover:text-blue'
                }`}
              >
                {t(`sumate.wizard.${id}`)}
              </span>
              <span className="relative hidden text-sm leading-tight text-black/75 md:block">
                {t(`sumate.wizard.${id}Hint`)}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Paso 2: panel de la categoría elegida (Figma 1300:2069: 923 de ancho, borde azul de 3 px) */}
      <div className="relative mt-xl px-m pb-xl pt-l md:px-xl md:pb-xxl md:pt-xl lg:mt-[3.375rem] lg:px-[9.25rem]">
        <MarcoRasgado tono="azul" sombra />
        {/* Estrella y concha de Figma (1300:1908 y 1300:1991), fuera del panel a los lados. Solo
            desde xl: a 1024 no hay margen para ellas sin pisar el borde. */}
        <Garabato
          src="/images/sumate/estrella.svg"
          ancho={60}
          alto={51}
          className="-left-[6.9375rem] top-[6.5rem] hidden w-[3.65rem] xl:block"
          vaiven={{ rotate: [0, 7, 0] }}
          duracion={5}
        />
        <Garabato
          src="/images/sumate/concha.svg"
          ancho={65}
          alto={48}
          className="-right-[6.75rem] top-[27.3rem] hidden w-[4rem] -rotate-[18deg] xl:block"
          vaiven={{ rotate: [-18, -12, -18], y: [0, -6, 0] }}
          duracion={4}
        />
        {/* Solo animación de entrada (sin exit ni mode="wait"): con clics rápidos
            entre tabs, la fase de salida podía interrumpirse y dejar el panel
            atascado en opacidad 0 (panel "vacío"). */}
        <motion.div
          key={category}
          id={`panel-${category}`}
          role="tabpanel"
          aria-labelledby={`tab-${category}`}
          className="relative"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          <Panel />
        </motion.div>
      </div>

      {/* Donantes en Estados Unidos: Give Lively vía Caring for Colombia (501c3). SOLO aplica para
          USA (deducción de impuestos allá); desde otros países el camino es la tarjeta
          internacional del widget. Figma 1300:2103: caja aparte bajo el panel, marco gris. */}
      {category === 'dinero' && (
        <div className="relative mt-l px-m py-xl text-center min-[380px]:px-l md:px-xl lg:mt-[2.1875rem] lg:px-[9.25rem] lg:pb-xl lg:pt-[3.125rem]">
          <MarcoRasgado tono="gris" relleno="bg-white/60" />
          <div className="relative">
            <p className="text-base font-bold uppercase text-black md:text-[1.125rem]">
              <span aria-hidden>🇺🇸</span> {t('sumate.usa.title')}
            </p>
            <p className="mx-auto mt-s max-w-[36rem] text-sm leading-relaxed text-black/80 md:text-base">
              {t('sumate.usa.text')}
            </p>
            <a
              href={GIVE_LIVELY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track(
                  'us_donation_clicked',
                  { payment_provider: 'givelively' },
                  { nombre: 'usa_givelively_click' },
                  SALIENTE
                )
              }
              className="mt-l inline-flex min-h-10 w-full items-center justify-center rounded border border-blue bg-white px-6 py-s text-sm font-extrabold uppercase leading-tight text-blue transition hover:bg-blue hover:text-papel focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-papel md:w-auto"
            >
              {t('sumate.usa.cta')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
