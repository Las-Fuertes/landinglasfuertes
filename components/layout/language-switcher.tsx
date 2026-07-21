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

/**
 * Selector de idioma flotante: visible solo en el tope de la página.
 * Al hacer scroll desaparece; reaparece únicamente al volver arriba del todo.
 */
export default function LanguageSwitcher() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function switchTo(code: string) {
    router.push(router.asPath, router.asPath, { locale: code, scroll: false });
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
