'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from '../../hooks/useTranslation';
import { LOCALES, useCambiarIdioma } from './language-switcher';

/**
 * Menú hamburguesa de la esquina de arriba a la izquierda (docs/navegacion/DECISIONES.md, D7).
 * Ofrece una sola cosa: el cambio de idioma (es, en, fr). Es un disclosure: `aria-expanded` y
 * `aria-controls` en el botón, Escape cierra y devuelve el foco al botón, y se cierra también al
 * elegir un idioma, al hacer clic fuera y al salir el foco del menú.
 */
export default function MenuHamburguesa({ visible }: { visible: boolean }) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const cambiarIdioma = useCambiarIdioma();
  const reducido = useReducedMotion();
  const [abierto, setAbierto] = useState(false);
  const raizRef = useRef<HTMLDivElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const idLista = useId();

  const cerrar = useCallback((devolverFoco: boolean) => {
    setAbierto(false);
    if (devolverFoco) botonRef.current?.focus({ preventScroll: true });
  }, []);

  // Si el menú se retira (drawer abierto, mapa), se cierra.
  useEffect(() => {
    if (!visible) setAbierto(false);
  }, [visible]);

  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: PointerEvent) => {
      if (!raizRef.current?.contains(e.target as Node)) cerrar(false);
    };
    const alTecla = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Que la intro u otra capa no reciban también este Escape.
      e.stopPropagation();
      cerrar(true);
    };
    document.addEventListener('pointerdown', alPulsar);
    document.addEventListener('keydown', alTecla, true);
    return () => {
      document.removeEventListener('pointerdown', alPulsar);
      document.removeEventListener('keydown', alTecla, true);
    };
  }, [abierto, cerrar]);

  return (
    <div
      ref={raizRef}
      data-menu-hamburguesa=""
      inert={!visible}
      aria-hidden={!visible || undefined}
      onBlur={e => {
        if (abierto && !raizRef.current?.contains(e.relatedTarget as Node | null)) cerrar(false);
      }}
      className={`relative transition duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0'
      }`}
    >
      <button
        ref={botonRef}
        type="button"
        aria-expanded={abierto}
        aria-controls={abierto ? idLista : undefined}
        aria-label={abierto ? t('nav.cerrar') : t('nav.abrir')}
        onClick={() => setAbierto(a => !a)}
        data-nav-boton=""
        className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/95 text-black shadow-lg transition-colors hover:text-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
      >
        {abierto ? (
          <X className="h-5 w-5" strokeWidth={2.25} aria-hidden />
        ) : (
          <Menu className="h-5 w-5" strokeWidth={2.25} aria-hidden />
        )}
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            id={idLista}
            role="group"
            aria-label={t('lang.label')}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={reducido ? { duration: 0 } : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-full mt-s flex flex-col gap-xs rounded-3xl border border-black/10 bg-white/95 p-1 shadow-lg"
          >
            {LOCALES.map(({ code, label, nombre }) => {
              const activo = locale === code;
              return (
                // Enlace real (con `hreflang`) para que buscadores y teclado encuentren /en y
                // /fr; el clic normal lo atiende `cambiarIdioma`, que conserva el hash.
                <Link
                  key={code}
                  href={router.asPath.split('#')[0]}
                  locale={code}
                  hrefLang={code}
                  lang={code}
                  scroll={false}
                  aria-label={`${label}, ${nombre}`}
                  aria-current={activo ? 'true' : undefined}
                  onClick={e => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                    e.preventDefault();
                    cambiarIdioma(code);
                    cerrar(true);
                  }}
                  className={`flex items-center gap-s whitespace-nowrap rounded-full px-m py-2 text-[0.85rem] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue ${
                    activo ? 'bg-blue text-white' : 'text-black hover:text-blue'
                  }`}
                >
                  <span>{label}</span>
                  <span className="font-normal">{nombre}</span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
