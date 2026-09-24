'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSumateDrawer } from './sumate-drawer-context';

/** La primera sección tras la intro. Cuando su borde de arriba toca el techo, la intro ya salió. */
const ID_TRAS_INTRO = 'bienvenida';
/**
 * Mientras la intro trae a Bienvenida (docs/introduccion/DECISIONES.md, D6), la página ya está en
 * Bienvenida pero la intro sigue en pantalla con su botón de saltar abajo a la derecha: el botón
 * espera a que termine. La intro marca `<html>` con este atributo mientras tanto.
 */
const LLEGANDO = 'data-intro-llegando';
/**
 * Toda sección con este atributo retira el botón mientras está en pantalla (hoy, el Mapa
 * educativo: docs/mapa-educativo/DECISIONES.md, D5). Para sumar otra basta con ponerle
 * `data-oculta-flotante=""`; el botón la encuentra solo, aunque se monte más tarde.
 */
const OCULTA = 'data-oculta-flotante';
/**
 * Cuánto tiene que entrar la sección para contar como "en pantalla": un 10 % por arriba y por
 * abajo no cuenta, así una franja que apenas asoma no hace parpadear el botón.
 */
const MARGEN_OCULTA = '-10% 0px -10% 0px';

/**
 * Botón fijo "Súmate" abajo a la derecha. Aparece solo después de la intro (ni enganchada ni
 * visible: con el pin la intro ocupa la pantalla y la página está arriba del todo) y se oculta
 * mientras el drawer está abierto o mientras una sección con `data-oculta-flotante` está en
 * pantalla. Se oculta con opacidad y no se desmonta, para que el foco pueda volver a él al
 * cerrar el drawer.
 */
export default function SumateFlotante() {
  const { t } = useTranslation();
  const { isOpen, open } = useSumateDrawer();
  const [trasIntro, setTrasIntro] = useState(false);
  const [tapado, setTapado] = useState(false);

  // Secciones que piden no tener el botón encima. Un IntersectionObserver por todas; si se
  // monta o desmonta alguna, se vuelve a buscar.
  useEffect(() => {
    const dentro = new Set<Element>();
    const io = new IntersectionObserver(
      entradas => {
        for (const en of entradas) {
          if (en.isIntersecting) dentro.add(en.target);
          else dentro.delete(en.target);
        }
        setTapado(dentro.size > 0);
      },
      { rootMargin: MARGEN_OCULTA }
    );
    let observadas: Element[] = [];
    const buscar = () => {
      const ahora = Array.from(document.querySelectorAll(`[${OCULTA}]`));
      for (const el of observadas) {
        if (!ahora.includes(el)) {
          io.unobserve(el);
          dentro.delete(el);
        }
      }
      for (const el of ahora) if (!observadas.includes(el)) io.observe(el);
      observadas = ahora;
      setTapado(dentro.size > 0);
    };
    buscar();
    let raf = 0;
    const mo = new MutationObserver(() => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          buscar();
        });
    });
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [OCULTA],
    });
    return () => {
      mo.disconnect();
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const medir = () => {
      raf = 0;
      const el = document.getElementById(ID_TRAS_INTRO);
      const llegando = document.documentElement.hasAttribute(LLEGANDO);
      setTrasIntro(el ? el.getBoundingClientRect().top <= 0 && !llegando : false);
    };
    const programar = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener('scroll', programar, { passive: true });
    window.addEventListener('resize', programar);
    const mo = new MutationObserver(programar);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: [LLEGANDO] });
    return () => {
      mo.disconnect();
      window.removeEventListener('scroll', programar);
      window.removeEventListener('resize', programar);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const visible = trasIntro && !isOpen && !tapado;

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={t('sumate.drawer.flotanteAria')}
      aria-hidden={!visible || undefined}
      tabIndex={visible ? 0 : -1}
      onClick={() => open('flotante')}
      data-sumate-flotante=""
      data-visible={visible ? '' : undefined}
      className={`fixed bottom-l right-l z-[80] inline-flex h-12 items-center justify-center rounded-lg border-2 border-white bg-blue px-l text-[1rem] font-bold uppercase tracking-tight text-white shadow-lg transition duration-300 hover:bg-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 md:h-[3.25rem] md:px-7 md:text-[1.05rem] ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      {t('sumate.drawer.flotante')}
    </button>
  );
}
