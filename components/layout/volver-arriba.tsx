'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSumateDrawer } from '../sumate/sumate-drawer-context';
import { Flecha } from './flecha';

/**
 * Destino del botón: Bienvenida, el comienzo del contenido (docs/navegacion/DECISIONES.md, D6).
 * La intro de arriba es una historia por pasos con capa fija: volver a `scrollY 0` la reinicia en
 * la parte 1 y deja el scroll en modo "un gesto, un paso" (hacen falta tres gestos o "Saltar
 * intro" para volver a bajar).
 */
const ID_DESTINO = 'bienvenida';
/** Secciones que retiran los flotantes mientras están en pantalla (hoy, el mapa). */
const OCULTA = 'data-oculta-flotante';
/** Igual que el CTA Súmate: una franja que apenas asoma no cuenta. */
const MARGEN_OCULTA = '-10% 0px -10% 0px';
/**
 * Lo que "Volver arriba" no puede tapar: los botones marcados con `data-evita-volver-arriba`
 * (hoy, "QUIERO APORTAR" de Donaciones) y los enlaces y botones del footer. El botón se retira
 * mientras alguno pasa por su caja (D6, ampliación).
 */
const EVITA = '[data-evita-volver-arriba], footer a, footer button';
/** Aire alrededor de la caja del botón que también cuenta como "lo taparía", en px. */
const HOLGURA = 8;
/** Lo que baja el botón al ocultarse (`translate-y-3`, 12 px): la caja cubre las dos posiciones. */
const DESPLAZAMIENTO_OCULTO = 12;
/**
 * Recorrido acumulado, en px de scroll, para cambiar de sentido: subir 48 lo muestra, bajar 16 lo
 * esconde. Por debajo de eso es ruido (la inercia que se apaga, un rebote) y no hace parpadear.
 */
const UMBRAL_SUBIR = 48;
const UMBRAL_BAJAR = 16;
/** Tope para dar por terminado el viaje a Bienvenida si nunca llega (otra pestaña, un gesto). */
const TOPE_VIAJE_MS = 4000;

/**
 * Sentido del scroll con UN listener pasivo de `scroll` (más el `resize`, que no bloquea nada).
 * Cuando cambia el alto de la ventana (la barra de Safari que entra o sale, el teclado), ese
 * cuadro no cuenta como movimiento: el contenido en `dvh` cambia de alto y el navegador puede
 * corregir `scrollY` sin que la persona haya movido nada. También se acota `scrollY` al rango
 * real, para que el rebote elástico de iOS al final de la página no se lea como "subir".
 */
function useSubiendo(pausado: React.MutableRefObject<boolean>) {
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    let raf = 0;
    let previo = window.scrollY;
    let alto = window.innerHeight;
    let acumulado = 0;
    let estado = false;

    const fijar = (valor: boolean) => {
      if (valor === estado) return;
      estado = valor;
      setSubiendo(valor);
    };

    const medir = () => {
      raf = 0;
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const y = Math.min(Math.max(window.scrollY, 0), max);
      const delta = y - previo;
      previo = y;
      if (window.innerHeight !== alto) {
        alto = window.innerHeight;
        acumulado = 0;
        return;
      }
      if (pausado.current) {
        acumulado = 0;
        fijar(false);
        return;
      }
      if (delta === 0) return;
      // Un cambio de sentido empieza la cuenta de cero.
      if (Math.sign(delta) !== Math.sign(acumulado)) acumulado = 0;
      acumulado += delta;
      if (acumulado <= -UMBRAL_SUBIR) fijar(true);
      else if (acumulado >= UMBRAL_BAJAR) fijar(false);
    };
    const programar = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };

    window.addEventListener('scroll', programar, { passive: true });
    window.addEventListener('resize', programar, { passive: true });
    return () => {
      window.removeEventListener('scroll', programar);
      window.removeEventListener('resize', programar);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pausado]);

  return subiendo;
}

/** Bienvenida ya quedó entera por encima de la pantalla. Un IntersectionObserver, sin medir. */
function usePasadaBienvenida() {
  const [pasada, setPasada] = useState(false);
  useEffect(() => {
    const el = document.getElementById(ID_DESTINO);
    if (!el) return;
    const io = new IntersectionObserver(([en]) => {
      if (en) setPasada(!en.isIntersecting && en.boundingClientRect.bottom <= 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return pasada;
}

/**
 * Algún elemento con el atributo `atributo` dentro de la zona que marca `margen`. Un
 * IntersectionObserver por todos; si se monta o desmonta alguno, se vuelve a buscar.
 */
function useTapado(atributo: string, margen: string) {
  const [tapado, setTapado] = useState(false);
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
      { rootMargin: margen }
    );
    let observadas: Element[] = [];
    const buscar = () => {
      const ahora = Array.from(document.querySelectorAll(`[${atributo}]`));
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
      attributeFilter: [atributo],
    });
    return () => {
      mo.disconnect();
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [atributo, margen]);
  return tapado;
}

/**
 * Algo de `EVITA` pasa por la caja del botón. Un IntersectionObserver cuya raíz se recorta, con
 * `rootMargin` en px, a esa caja (más `HOLGURA`): no mide nada en el scroll. Se rearma al cambiar
 * el tamaño de la ventana o el texto (el ancho cambia con el idioma).
 */
function usePisaria(boton: React.RefObject<HTMLButtonElement | null>, texto: string) {
  const [pisaria, setPisaria] = useState(false);
  useEffect(() => {
    let io: IntersectionObserver | null = null;
    const dentro = new Set<Element>();
    let raf = 0;
    const armar = () => {
      raf = 0;
      const b = boton.current;
      if (!b) return;
      io?.disconnect();
      dentro.clear();
      const r = b.getBoundingClientRect();
      const alto = window.innerHeight;
      const ancho = document.documentElement.clientWidth;
      const arriba = Math.max(0, r.top - DESPLAZAMIENTO_OCULTO - HOLGURA);
      const abajo = Math.max(0, alto - r.bottom - HOLGURA);
      const izquierda = Math.max(0, r.left - HOLGURA);
      const derecha = Math.max(0, ancho - r.right - HOLGURA);
      io = new IntersectionObserver(
        entradas => {
          for (const en of entradas) {
            if (en.isIntersecting) dentro.add(en.target);
            else dentro.delete(en.target);
          }
          setPisaria(dentro.size > 0);
        },
        { rootMargin: `-${arriba}px -${derecha}px -${abajo}px -${izquierda}px` }
      );
      document.querySelectorAll(EVITA).forEach(el => io?.observe(el));
    };
    const programar = () => {
      if (!raf) raf = requestAnimationFrame(armar);
    };
    armar();
    window.addEventListener('resize', programar, { passive: true });
    return () => {
      window.removeEventListener('resize', programar);
      if (raf) cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, [boton, texto]);
  return pisaria;
}

/**
 * "Volver arriba" (feedback del 2-oct, docs/navegacion/DECISIONES.md, D6). Abajo a la derecha,
 * con la forma del selector de idioma y del CTA Súmate (píldora blanca translúcida con chip
 * dentro). Aparece al subir, una vez pasada Bienvenida, y se esconde al bajar. Oculto en la intro
 * y en Bienvenida, sobre el mapa (`data-oculta-flotante`) y con el drawer de Súmate abierto. Se
 * oculta con opacidad y queda `inert`, sin desmontarse. Solo se monta en la home.
 *
 * Lleva a Bienvenida con desplazamiento suave (salto directo con movimiento reducido) y deja el
 * foco ahí, para que el siguiente Tab siga desde el comienzo del contenido. Sin evento de
 * analítica.
 */
export default function VolverArriba() {
  const { t } = useTranslation();
  const { isOpen: drawerAbierto } = useSumateDrawer();
  const viajando = useRef(false);
  const botonRef = useRef<HTMLButtonElement>(null);
  const subiendo = useSubiendo(viajando);
  const pasada = usePasadaBienvenida();
  // Secciones que retiran los flotantes (el mapa) y botones que no se pueden tapar.
  const tapado = useTapado(OCULTA, MARGEN_OCULTA);
  const pisaria = usePisaria(botonRef, t('nav.volverArriba'));
  const visible = subiendo && pasada && !tapado && !pisaria && !drawerAbierto;

  // El viaje termina al llegar (Bienvenida deja de estar "pasada") o por tope.
  useEffect(() => {
    if (!pasada) viajando.current = false;
  }, [pasada]);

  const volver = () => {
    const destino = document.getElementById(ID_DESTINO);
    if (!destino) return;
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    viajando.current = true;
    window.setTimeout(() => {
      viajando.current = false;
    }, TOPE_VIAJE_MS);
    // Mismo destino que "Saltar intro": el borde de arriba de Bienvenida contra el techo.
    destino.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'start' });
    if (!destino.hasAttribute('tabindex')) destino.setAttribute('tabindex', '-1');
    destino.focus({ preventScroll: true });
  };

  return (
    <button
      ref={botonRef}
      type="button"
      onClick={volver}
      aria-label={t('nav.volverArriba')}
      aria-hidden={!visible || undefined}
      inert={!visible}
      data-volver-arriba=""
      data-visible={visible ? '' : undefined}
      className={`group fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-page-margin z-[80] flex rounded-full border border-black/10 bg-white/80 p-1 shadow-lg backdrop-blur-sm transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 motion-reduce:transition-none ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      {/* Misma letra que el chip del selector de idioma; la flecha en un círculo azul es lo que
          se reconoce de un vistazo, y el texto dice a dónde lleva en el idioma de la página. La
          flecha es la de la intro (`flecha.tsx`), a su mismo tamaño, apuntando hacia arriba. */}
      <span className="flex items-center gap-xs whitespace-nowrap rounded-full py-1 pl-1 pr-3 text-[0.85rem] font-bold text-black transition-colors group-hover:text-blue">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue text-white">
          <Flecha sentido="arriba" className="h-5 w-5" />
        </span>
        {t('nav.volverArriba')}
      </span>
    </button>
  );
}
