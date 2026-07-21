'use client';

import { useState, type ReactElement } from 'react';
import { motion } from 'framer-motion';
import { HandCoins, Package, Clock } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import DonarDinero from './donar-dinero';
import DonarCosas from './donar-cosas';
import DonarTiempo from './donar-tiempo';

type Category = 'dinero' | 'cosas' | 'tiempo';

/* Cada categoría toma un acento de la paleta lúdica del sitio (sol, flor, conchas). */
const CATEGORIES: {
  id: Category;
  icon: typeof HandCoins;
  border: string;
  text: string;
}[] = [
  { id: 'dinero', icon: HandCoins, border: 'border-blue', text: 'text-blue' },
  { id: 'cosas', icon: Package, border: 'border-orange', text: 'text-orange' },
  { id: 'tiempo', icon: Clock, border: 'border-pink', text: 'text-pink' },
];

const PANELS: Record<Category, () => ReactElement> = {
  dinero: DonarDinero,
  cosas: DonarCosas,
  tiempo: DonarTiempo,
};

/**
 * Wizard de 2 pasos: primero eliges cómo ayudar (dinero / cosas / tiempo),
 * luego ves el detalle de esa opción en un panel animado.
 */
export default function ComoAyudar() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<Category>('dinero');
  const Panel = PANELS[category];

  return (
    <div id="donar" className="scroll-mt-24">
      <h3 className="text-center text-[1.6rem] font-bold leading-tight text-black md:text-[2rem]">
        {t('sumate.wizard.question')}
      </h3>

      {/* Paso 1: selector de categoría */}
      <div
        role="tablist"
        aria-label={t('sumate.wizard.question')}
        className="mt-6 grid grid-cols-3 gap-2 md:mx-auto md:max-w-2xl md:gap-grid-gutter"
      >
        {CATEGORIES.map(({ id, icon: Icon, border, text }) => {
          const active = category === id;
          return (
            <motion.button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${id}`}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCategory(id)}
              className={`relative flex flex-col items-center gap-1.5 rounded-2xl border-2 px-2 py-4 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 md:py-5 ${
                active
                  ? `${border} bg-white shadow-md`
                  : 'border-transparent bg-white/60 hover:border-black/10 hover:bg-white'
              }`}
            >
              <Icon
                className={`h-7 w-7 md:h-9 md:w-9 ${active ? text : 'text-black/60'}`}
                strokeWidth={1.8}
                aria-hidden
              />
              <span
                className={`text-[0.95rem] font-bold md:text-[1.1rem] ${active ? text : 'text-black'}`}
              >
                {t(`sumate.wizard.${id}`)}
              </span>
              <span className="hidden text-[0.85rem] leading-tight text-black/60 md:block">
                {t(`sumate.wizard.${id}Hint`)}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Paso 2: panel de la categoría elegida */}
      <div className="mt-6 rounded-3xl border border-black/10 bg-white p-6 shadow-md md:mx-auto md:max-w-3xl md:p-10">
        {/* Solo animación de entrada (sin exit ni mode="wait"): con clics rápidos
            entre tabs, la fase de salida podía interrumpirse y dejar el panel
            atascado en opacidad 0 (panel "vacío"). */}
        <motion.div
          key={category}
          id={`panel-${category}`}
          role="tabpanel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          <Panel />
        </motion.div>
      </div>
    </div>
  );
}
