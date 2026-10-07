'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';

const LOCALES = [
  { code: 'es', label: 'ES', nombre: 'Español' },
  { code: 'en', label: 'EN', nombre: 'English' },
  { code: 'fr', label: 'FR', nombre: 'Français' },
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
 * El CTA "Súmate" flotante (`components/sumate/sumate-flotante.tsx`) copia su forma y su esquina
 * (docs/navegacion/DECISIONES.md, D1): si cambia una, cambia la otra.
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
      className="fixed left-page-margin top-4 z-50 flex rounded-full border border-black/10 bg-white/95 p-1 shadow-lg"
      initial={false}
      animate={{ opacity: atTop ? 1 : 0, y: atTop ? 0 : -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ pointerEvents: atTop ? 'auto' : 'none' }}
      // Oculto no debe recibir foco (WCAG 2.4.7 y 2.4.11): `inert` lo saca del orden de Tab.
      inert={!atTop}
      aria-hidden={atTop ? undefined : true}
    >
      {LOCALES.map(({ code, label, nombre }) => {
        const active = locale === code;
        return (
          // Enlace real (con `hreflang`) para que buscadores y teclado encuentren /en y /fr; el
          // clic normal lo atiende `switchTo`, que conserva el hash de la URL.
          <Link
            key={code}
            href={router.asPath.split('#')[0]}
            locale={code}
            hrefLang={code}
            lang={code}
            scroll={false}
            title={nombre}
            aria-label={`${label}, ${nombre}`}
            aria-current={active ? 'true' : undefined}
            onClick={e => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              switchTo(code);
            }}
            className={`rounded-full px-3 py-1.5 text-[0.85rem] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue ${
              active ? 'bg-blue text-white' : 'text-black hover:text-blue'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </motion.div>
  );
}
