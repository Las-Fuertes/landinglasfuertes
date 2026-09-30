'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';

const LOCALES = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
] as const;

type Props = {
  /**
   * Dentro del aviso de protección de menores (docs/aviso/DECISIONES.md, D1): siempre visible,
   * porque la página de fondo puede estar desplazada (un deep link como `/#impacto`) y la puerta
   * no se desplaza con ella. Misma apariencia y esquina que en la landing.
   */
  enPuerta?: boolean;
};

/**
 * Selector de idioma flotante: visible solo en el tope de la página.
 * Al hacer scroll desaparece; reaparece únicamente al volver arriba del todo.
 */
export default function LanguageSwitcher({ enPuerta = false }: Props) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    if (enPuerta) return;
    const onScroll = () => setAtTop(window.scrollY < 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [enPuerta]);

  function switchTo(code: string) {
    // El hash (p. ej. `#sumate`) se toma de la URL real: `router.asPath` no siempre lo trae
    // tras la carga, y sin él un deep link se perdería al cambiar de idioma.
    const destino = router.asPath.split('#')[0] + window.location.hash;
    router.push(destino, destino, { locale: code, scroll: false });
  }

  return (
    <motion.div
      role="group"
      aria-label={t('lang.label')}
      className="fixed left-page-margin top-4 z-50 flex rounded-full border border-black/10 bg-white/80 p-1 shadow-lg backdrop-blur-sm"
      initial={false}
      animate={{ opacity: atTop ? 1 : 0, y: atTop ? 0 : -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ pointerEvents: atTop ? 'auto' : 'none' }}
    >
      {LOCALES.map(({ code, label }) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            onClick={() => switchTo(code)}
            className={`rounded-full px-3 py-1.5 text-[0.85rem] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue ${
              active ? 'bg-blue text-white' : 'text-black hover:text-blue'
            }`}
          >
            {label}
          </button>
        );
      })}
    </motion.div>
  );
}
