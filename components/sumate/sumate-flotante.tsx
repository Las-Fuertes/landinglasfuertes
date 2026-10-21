'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import MenuHamburguesa from '../layout/menu-hamburguesa';
import { useSumateDrawer } from './sumate-drawer-context';

/** La primera sección tras la intro. Cuando su borde de arriba toca el techo, la intro ya salió. */
const ID_TRAS_INTRO = 'bienvenida';
/**
 * Mientras la intro trae a Bienvenida (docs/introduccion/DECISIONES.md, D6), la página ya está en
 * Bienvenida pero la intro sigue en pantalla: la navegación espera a que termine. La intro marca
 * `<html>` con este atributo mientras tanto.
 */
const LLEGANDO = 'data-intro-llegando';
/**
 * Toda sección con este atributo retira la navegación mientras está en pantalla (hoy, el Mapa
 * educativo: docs/mapa-educativo/DECISIONES.md, D5). Para sumar otra basta con ponerle
 * `data-oculta-flotante=""`; la navegación la encuentra sola, aunque se monte más tarde.
 */
const OCULTA = 'data-oculta-flotante';
/**
 * Cuánto tiene que entrar la sección para contar como "en pantalla": un 10 % por arriba y por
 * abajo no cuenta, así una franja que apenas asoma no hace parpadear la navegación.
 */
const MARGEN_OCULTA = '-10% 0px -10% 0px';
/** Mismo umbral que el selector de idioma para "arriba del todo". */
const ARRIBA_PX = 40;
/** Las mismas tres razones de siempre para no mostrarse: la intro, el drawer y las secciones. */
function useVisible(drawerAbierto: boolean) {
  const [trasIntro, setTrasIntro] = useState(false);
  const [tapado, setTapado] = useState(false);

  // Secciones que piden no tener la navegación encima. Un IntersectionObserver por todas; si se
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
      // En otra página (Términos) no hay intro: la navegación releva al selector de idioma, que
      // solo se ve arriba del todo (`scrollY < 40`, language-switcher.tsx).
      setTrasIntro(
        el ? el.getBoundingClientRect().top <= 0 && !llegando : window.scrollY >= ARRIBA_PX
      );
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

  // El menú de idioma se ve también durante la intro (D7); el CTA, solo tras ella.
  const libre = !drawerAbierto && !tapado;
  return { menu: libre, cta: libre && trasIntro };
}

/**
 * Navegación flotante (Figma `1402:225`; docs/navegacion/DECISIONES.md, D1 y D7). Arriba a la
 * izquierda: el botón del menú hamburguesa (solo cambio de idioma, `menu-hamburguesa.tsx`) y, a
 * su derecha, el CTA "Súmate". El menú se ve desde la intro; el CTA aparece solo después de ella.
 * Ambos se retiran con el drawer abierto y sobre las secciones con `data-oculta-flotante`, y se
 * ocultan con opacidad sin desmontarse (quedan `inert`), para que el foco pueda volver al botón
 * al cerrar el drawer.
 */
export default function SumateFlotante() {
  const { t } = useTranslation();
  const { isOpen: drawerAbierto, open: abrirDrawer } = useSumateDrawer();
  const { menu, cta } = useVisible(drawerAbierto);

  return (
    <div className="fixed left-page-margin top-4 z-[80] flex items-center gap-s">
      <MenuHamburguesa visible={menu} />
      <nav
        aria-label={t('nav.etiqueta')}
        aria-hidden={!cta || undefined}
        inert={!cta}
        data-nav-flotante=""
        data-visible={cta ? '' : undefined}
        className={`transition duration-300 ${
          cta ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0'
        }`}
      >
        {/* Píldora blanca translúcida con borde fino y sombra, y dentro un chip azul en
            mayúsculas extrabold (blanco sobre `blue` pasa AA de sobra). Toda la píldora es el
            botón. Mide lo mismo de alto que el botón del menú. */}
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label={t('sumate.drawer.flotanteAria')}
          onClick={() => abrirDrawer('flotante')}
          data-sumate-flotante=""
          className="group flex h-12 items-center rounded-full border border-black/10 bg-white/95 p-1 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
        >
          <span className="flex h-full items-center whitespace-nowrap rounded-full bg-blue px-m text-[0.85rem] font-extrabold uppercase text-white transition-colors group-hover:bg-blue-300">
            {t('nav.sumate')}
          </span>
        </button>
      </nav>
    </div>
  );
}
