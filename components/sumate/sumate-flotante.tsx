'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { useTranslation } from '../../hooks/useTranslation';
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
/**
 * Ronda 3 (docs/navegacion/DECISIONES.md, ampliación de D1): el menú (hamburguesa con "Inicio" y
 * "Súmate") queda apagado TEMPORALMENTE y en su lugar se ve solo el CTA "Súmate", en la misma
 * esquina y con la misma visibilidad. Para volver al menú basta con poner esto en `true`.
 */
const MENU_ACTIVO: boolean = false;
/** Curva de entrada del sitio (la de `FadeIn`). */
const ENTRADA = [0.22, 1, 0.36, 1] as const;

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

  return trasIntro && !drawerAbierto && !tapado;
}

/**
 * Navegación flotante (Figma `1402:225`; docs/navegacion/DECISIONES.md, D1). Reemplaza al botón
 * "Súmate" fijo y hereda su comportamiento: aparece solo después de la intro, se retira con el
 * drawer abierto y sobre las secciones con `data-oculta-flotante`, y se oculta con opacidad sin
 * desmontarse (queda `inert`), para que el foco pueda volver al botón al cerrar el drawer.
 *
 * Cerrada es un círculo con el ícono de menú arriba a la izquierda; abierta, una píldora de papel
 * con "Inicio" (lleva arriba del todo, a la intro) y "Súmate" (abre el drawer). Es un disclosure:
 * `aria-expanded` y `aria-controls` en el botón, Escape cierra y devuelve el foco al botón, y
 * cierra también al elegir una entrada, al hacer clic fuera o al salir el foco de la navegación.
 * El selector de idioma vive en la misma esquina pero solo con la página arriba del todo, donde
 * esta navegación nunca se muestra.
 */
export default function SumateFlotante() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isOpen: drawerAbierto, open: abrirDrawer } = useSumateDrawer();
  const visible = useVisible(drawerAbierto);
  const reducido = useReducedMotion();
  const [abierto, setAbierto] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const idLista = useId();

  const cerrar = useCallback((devolverFoco: boolean) => {
    setAbierto(false);
    if (devolverFoco) botonRef.current?.focus({ preventScroll: true });
  }, []);

  // Si la navegación se retira (el mapa, el drawer, la vuelta a la intro), el menú se cierra.
  useEffect(() => {
    if (!visible) setAbierto(false);
  }, [visible]);

  // Clic fuera y Escape.
  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) cerrar(false);
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

  const irAInicio = () => {
    setAbierto(false);
    // Fuera de la home (Términos), Inicio lleva a la home en el mismo idioma.
    if (!document.getElementById(ID_TRAS_INTRO)) {
      router.push('/');
      return;
    }
    // Salto directo: un recorrido suave de toda la página pasaría por el pin de la intro a
    // medio camino. El foco va a `main`, para que el siguiente Tab entre en la intro.
    window.scrollTo({ top: 0, behavior: 'auto' });
    const main = document.querySelector('main');
    if (main) {
      if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
    }
  };

  const irASumate = () => {
    // El foco pasa antes al botón del menú: el drawer lo guarda como disparador y lo devuelve
    // ahí al cerrar, porque "Súmate" ya no estará en pantalla.
    cerrar(true);
    abrirDrawer('flotante');
  };

  const entrada = reducido ? { duration: 0 } : { duration: 0.35, ease: ENTRADA };
  const itemClase =
    'inline-flex h-10 shrink-0 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue';

  const claseVisible = visible
    ? 'translate-y-0 opacity-100'
    : 'pointer-events-none -translate-y-3 opacity-0';

  if (!MENU_ACTIVO)
    return (
      <nav
        aria-label={t('nav.etiqueta')}
        aria-hidden={!visible || undefined}
        inert={!visible}
        data-nav-flotante=""
        data-visible={visible ? '' : undefined}
        className={`fixed left-page-margin top-4 z-[80] transition duration-300 ${claseVisible}`}
      >
        {/* Misma forma que el selector de idioma (language-switcher.tsx), en su mismo sitio:
            píldora blanca translúcida con borde fino, sombra y 4 de relleno, y dentro un chip
            azul como el del idioma activo, misma letra. Así la esquina no cambia de forma al
            pasar de uno a otro; lo que lo hace CTA es el chip azul, más ancho, en mayúsculas
            extrabold (blanco sobre `blue` pasa AA de sobra). Toda la píldora es el botón. */}
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label={t('sumate.drawer.flotanteAria')}
          onClick={() => abrirDrawer('flotante')}
          data-sumate-flotante=""
          className="group flex rounded-full border border-black/10 bg-white/95 p-1 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
        >
          <span className="whitespace-nowrap rounded-full bg-blue px-m py-1.5 text-[0.85rem] font-extrabold uppercase text-white transition-colors group-hover:bg-blue-300">
            {t('nav.sumate')}
          </span>
        </button>
      </nav>
    );

  return (
    <nav
      ref={navRef}
      aria-label={t('nav.etiqueta')}
      aria-hidden={!visible || undefined}
      inert={!visible}
      data-nav-flotante=""
      data-visible={visible ? '' : undefined}
      data-abierto={abierto ? '' : undefined}
      onBlur={e => {
        if (abierto && !navRef.current?.contains(e.relatedTarget as Node | null)) cerrar(false);
      }}
      className={`fixed left-m top-m z-[80] transition duration-300 lg:left-l lg:top-l ${claseVisible}`}
    >
      <div
        className={`flex items-center rounded-full transition-[background-color,box-shadow] duration-300 ${
          abierto ? 'bg-papel shadow-md' : 'bg-transparent shadow-none'
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
          className="m-xs inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-papel-tostado text-black shadow-md transition-colors hover:bg-arena focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
        >
          {abierto ? (
            <X className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          ) : (
            <Menu className="h-6 w-6" strokeWidth={2.25} aria-hidden />
          )}
        </button>

        <AnimatePresence initial={false}>
          {abierto && (
            <motion.ul
              id={idLista}
              key="lista"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={entrada}
              className="flex items-center gap-m overflow-hidden"
            >
              <li className="ml-m">
                <button
                  type="button"
                  onClick={irAInicio}
                  data-nav-inicio=""
                  className={`${itemClase} whitespace-nowrap px-s text-[0.77rem] uppercase tracking-[0.05em] text-black hover:text-blue`}
                >
                  {t('nav.inicio')}
                </button>
              </li>
              <li className="py-xs pr-s">
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-label={t('sumate.drawer.flotanteAria')}
                  onClick={irASumate}
                  data-sumate-flotante=""
                  className={`${itemClase} group`}
                >
                  <span className="inline-flex h-7 min-w-[5.75rem] items-center justify-center whitespace-nowrap rounded-full border border-black bg-black px-m text-[0.65rem] font-extrabold uppercase text-papel transition-colors group-hover:bg-blue-300">
                    {t('nav.sumate')}
                  </span>
                </button>
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
