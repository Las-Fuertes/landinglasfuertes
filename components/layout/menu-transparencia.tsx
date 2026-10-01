'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { ESTADOS_FINANCIEROS } from './transparencia.data';

/**
 * "Transparencia" del footer (docs/navegacion/DECISIONES.md, D2): un botón que despliega los
 * años con estados financieros publicados; cada año abre su PDF en otra pestaña. Los años salen
 * de `transparencia.data.ts`. Disclosure accesible: `aria-expanded` y `aria-controls`, Escape
 * cierra y devuelve el foco al botón, y cierra también con clic fuera o al salir el foco.
 */
export function MenuTransparencia({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  const reducido = useReducedMotion();
  const [abierto, setAbierto] = useState(false);
  const cajaRef = useRef<HTMLDivElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const idLista = useId();

  const cerrar = useCallback((devolverFoco: boolean) => {
    setAbierto(false);
    if (devolverFoco) botonRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: PointerEvent) => {
      if (!cajaRef.current?.contains(e.target as Node)) cerrar(false);
    };
    const alTecla = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
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
      ref={cajaRef}
      className={`relative ${className}`}
      onBlur={e => {
        if (abierto && !cajaRef.current?.contains(e.relatedTarget as Node | null)) cerrar(false);
      }}
    >
      <button
        ref={botonRef}
        type="button"
        aria-expanded={abierto}
        aria-controls={abierto ? idLista : undefined}
        onClick={() => setAbierto(a => !a)}
        data-transparencia-boton=""
        className="inline-flex min-h-8 items-center gap-xs font-medium text-papel underline-offset-4 transition hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-papel"
      >
        {t('footer.transparencia')}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.ul
            id={idLista}
            aria-label={t('footer.transparenciaMenu')}
            initial={reducido ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducido ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            data-transparencia-menu=""
            className="absolute left-0 top-full z-20 mt-xs min-w-[7rem] rounded-lg bg-papel p-xs shadow-lg md:left-auto"
          >
            {ESTADOS_FINANCIEROS.map(({ anio, ruta }) => (
              <li key={anio}>
                <a
                  href={ruta}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => cerrar(false)}
                  aria-label={`${t('footer.transparenciaAnio', { anio: String(anio) })} ${t('footer.nuevaPestana')}`}
                  className="flex min-h-10 items-center rounded-md px-m font-bold text-black transition-colors hover:bg-papel-tostado focus:outline-none focus-visible:ring-2 focus-visible:ring-blue"
                >
                  {anio}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
