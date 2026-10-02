'use client';

import {
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { EnDrawerContext, GarabatosContext, useSumateDrawer } from './sumate-drawer-context';
import SumateContenido from './sumate-contenido';
import { CURVA, cssCurva } from '../education-map/coreografia';

/** Mismo selector que la trampa de foco de `education-map/route-sheet.tsx`. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

const DESKTOP_QUERY = '(min-width: 1024px)';

/** Entrada ease-out y salida más corta (D2). Curvas de `education-map/coreografia.ts`. */
const ENTRADA = { duration: 400, easing: cssCurva(CURVA.entrada) };
const SALIDA = {
  duration: 220,
  easing: cssCurva(CURVA.salida),
  fill: 'forwards' as const,
};

/** Subida y bajada del modal desktop, en px como el `y` de framer-motion que reemplazan (D3). */
const SUBIDA_DESKTOP = 24;
const BAJADA_DESKTOP = 12;

/** Oculto, el panel queda bajo el borde de la pantalla: fuera de vista y de toda intersección. */
const PANEL_OCULTO = { transform: 'translateY(100%)' } as const;

/**
 * Corre `tarea` cuando el navegador está quieto, después de cargar la página. Safari no tiene
 * `requestIdleCallback`: allí espera un momento tras el `load`.
 */
function cuandoQuieto(tarea: () => void) {
  let cancelado = false;
  let idle: number | undefined;
  let timer: number | undefined;
  const programar = () => {
    if (cancelado) return;
    if (typeof window.requestIdleCallback === 'function')
      idle = window.requestIdleCallback(tarea, { timeout: 4000 });
    else timer = window.setTimeout(tarea, 1500);
  };
  if (document.readyState === 'complete') programar();
  else window.addEventListener('load', programar, { once: true });
  return () => {
    cancelado = true;
    window.removeEventListener('load', programar);
    if (idle !== undefined) window.cancelIdleCallback(idle);
    if (timer !== undefined) window.clearTimeout(timer);
  };
}

/** Desktop aparece en su sitio; móvil y tablet suben desde abajo, como `route-sheet.tsx`. */
function useEsDesktop() {
  const [esDesktop, setEsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const calcular = () => setEsDesktop(mq.matches);
    calcular();
    mq.addEventListener('change', calcular);
    return () => mq.removeEventListener('change', calcular);
  }, []);
  return esDesktop;
}

/**
 * "Súmate a Las Fuertes" (docs/sumate-drawer/DECISIONES.md, D2 y D3). En desktop (lg+) es un
 * modal a pantalla completa sobre papel, como una página más del sitio (Figma `1300:1865`); en
 * móvil y tablet sube desde abajo como sheet de `92dvh`, con el borde de arriba rasgado. Se abre
 * con `useSumateDrawer().open()`. Con `prefers-reduced-motion` solo hay fundido, sin desplazamiento.
 *
 * Montado y oculto entre aperturas (D4): el contenido se monta cuando el navegador está quieto
 * tras la carga, no en el clic, y oculto queda `invisible`, `inert`, sin rol de diálogo y con el
 * panel bajo el borde de la pantalla. La entrada y la salida son animaciones de la Web Animations
 * API sobre `transform` y `opacity`, que corren en el compositor aunque el hilo principal esté
 * ocupado. Al terminar de cerrarse, el contenido se vuelve a montar en reposo: cada apertura
 * empieza como antes, en "Con dinero", "Una vez" y arriba del todo.
 */
export default function SumateDrawer() {
  const { t } = useTranslation();
  const { isOpen, close } = useSumateDrawer();
  const esDesktop = useEsDesktop();
  const reduce = useReducedMotion();
  const veloRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Montado en reposo tras la carga; si algo lo abre antes (el deep link), se monta en ese render.
  const [montadoEnReposo, setMontadoEnReposo] = useState(false);
  const montado = montadoEnReposo || isOpen;
  useEffect(() => {
    if (montadoEnReposo) return;
    return cuandoQuieto(() => startTransition(() => setMontadoEnReposo(true)));
  }, [montadoEnReposo]);

  // En pantalla: abierto o terminando de salir. `saliendo` se ajusta en el mismo render en que
  // cambia `isOpen` (no en un efecto): así el render del cierre nunca pasa por "oculto".
  const [saliendo, setSaliendo] = useState(false);
  const [isOpenPrevio, setIsOpenPrevio] = useState(isOpen);
  if (isOpenPrevio !== isOpen) {
    setIsOpenPrevio(isOpen);
    setSaliendo(!isOpen);
  }
  const enPantalla = isOpen || saliendo;

  // Las imágenes de los garabatos se piden en la primera apertura (ver `GarabatosContext`).
  const [abiertoAlgunaVez, setAbiertoAlgunaVez] = useState(false);
  if (isOpen && !abiertoAlgunaVez) setAbiertoAlgunaVez(true);
  const garabatos = useMemo(
    () => ({ pausado: !enPantalla, cargar: abiertoAlgunaVez }),
    [enPantalla, abiertoAlgunaVez]
  );

  // Contenido nuevo tras cada cierre: `cierresRef` cuenta las salidas terminadas y `version` es la
  // clave del contenido. Se pone al día en reposo o, si se abre antes, en el mismo render.
  const cierresRef = useRef(0);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  // Entrada y salida. En un efecto de layout: el primer frame pintado ya es el de la animación.
  const abiertoAntes = useRef(false);
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const velo = veloRef.current;
    if (!panel || !velo) return;
    if (isOpen === abiertoAntes.current) return;
    abiertoAntes.current = isOpen;

    // Si se reabre a media salida, o se cierra a media entrada, se parte de donde esté.
    const actual = getComputedStyle(panel);
    const ahora = { opacity: actual.opacity, transform: actual.transform };
    const opacidadVelo = getComputedStyle(velo).opacity;
    const enMovimiento = panel.getAnimations().length > 0;
    panel.getAnimations().forEach(a => a.cancel());
    velo.getAnimations().forEach(a => a.cancel());

    if (isOpen) {
      if (version !== cierresRef.current) setVersion(cierresRef.current);
      // Con movimiento reducido el panel aparece en su sitio y solo funde el velo.
      const desde = enMovimiento
        ? ahora
        : reduce
          ? null
          : esDesktop
            ? { opacity: 0, transform: `translateY(${SUBIDA_DESKTOP}px)` }
            : { transform: 'translateY(100%)' };
      if (desde) panel.animate([desde, { opacity: 1, transform: 'none' }], ENTRADA);
      velo.animate([{ opacity: enMovimiento ? opacidadVelo : 0 }, { opacity: 1 }], ENTRADA);
      return;
    }

    const hasta = reduce
      ? { opacity: 0 }
      : esDesktop
        ? { opacity: 0, transform: `translateY(${BAJADA_DESKTOP}px)` }
        : { transform: 'translateY(100%)' };
    const salida = panel.animate([ahora, hasta], SALIDA);
    velo.animate([{ opacity: opacidadVelo }, { opacity: 0 }], SALIDA);
    salida.finished.then(
      () => {
        if (abiertoAntes.current) return;
        cierresRef.current += 1;
        setSaliendo(false);
      },
      () => undefined
    );
  }, [isOpen, esDesktop, reduce, version, montado]);

  // Oculto otra vez: fuera las animaciones con `fill`, ya con el estilo de oculto puesto (mismo
  // commit, antes de pintar: no hay frame intermedio).
  useLayoutEffect(() => {
    if (enPantalla) return;
    panelRef.current?.getAnimations().forEach(a => a.cancel());
    veloRef.current?.getAnimations().forEach(a => a.cancel());
  }, [enPantalla]);

  // Contenido nuevo en reposo tras cerrar, para que la próxima apertura no lo monte en el clic.
  useEffect(() => {
    if (enPantalla || version === cierresRef.current) return;
    return cuandoQuieto(() => startTransition(() => setVersion(cierresRef.current)));
  }, [enPantalla, version]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // stopPropagation: la intro escucha el teclado en window y no debe ver lo del drawer.
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      event.stopPropagation();

      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        el => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const activo = document.activeElement;
      const dentro = activo instanceof Node && panelRef.current.contains(activo);

      if (event.shiftKey && (activo === first || !dentro)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (activo === last || !dentro)) {
        event.preventDefault();
        first.focus();
      }
    },
    [close]
  );

  // El mismo elemento en cada render: abrir y cerrar no vuelven a renderizar el contenido, solo
  // los garabatos (por `GarabatosContext`).
  const contenido = useMemo(
    () => (
      <EnDrawerContext.Provider value={true}>
        <SumateContenido />
      </EnDrawerContext.Provider>
    ),
    []
  );

  if (!montado) return null;

  return (
    // Oculto: `invisible` (ni se pinta ni recibe toques), `inert` (fuera del orden de foco y de
    // los lectores de pantalla) y sin `role`/`aria-modal`, que otras secciones leen para saber si
    // hay un modal abierto (principles-section.tsx). Saliendo ya es `inert`: no se interactúa.
    <div
      className={`fixed inset-0 z-[90] overflow-clip ${enPantalla ? '' : 'pointer-events-none invisible'}`}
      inert={!isOpen}
      aria-hidden={isOpen ? undefined : true}
    >
      {/* `overflow-clip` y no `hidden`: un `scrollIntoView` (el de `#donar`) desplazaba la raíz
          y subía el sheet entero. Velo: en desktop el modal tapa toda la pantalla y el velo
          solo se ve en el fundido. */}
      <div
        ref={veloRef}
        aria-hidden
        className="absolute inset-0 bg-black/50"
        style={enPantalla ? undefined : { opacity: 0 }}
        onClick={close}
      />

      <div
        ref={panelRef}
        role={enPantalla ? 'dialog' : undefined}
        aria-modal={enPantalla ? 'true' : undefined}
        aria-labelledby={enPantalla ? 'sumate-title' : undefined}
        onKeyDown={onKeyDown}
        data-sumate-panel=""
        className="absolute inset-x-0 bottom-0 flex h-[92dvh] flex-col lg:inset-0 lg:h-full"
        style={enPantalla ? undefined : PANEL_OCULTO}
      >
        {/* Fondo de papel. En el sheet, el borde de arriba es rasgado (el filtro del footer)
            y la capa se sale por los lados y por abajo para que solo se rasgue arriba. En
            desktop cubre la pantalla y no hay borde que rasgar. */}
        <div
          aria-hidden
          className="absolute -inset-x-l -bottom-l top-0 bg-papel [filter:url(#footer-rough-edge)] lg:inset-0 lg:[filter:none]"
        />

        {/* Asa del sheet: solo decorativa, marca que el panel sube desde abajo. */}
        <span
          aria-hidden
          className="absolute left-1/2 top-s z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-black/20 lg:hidden"
        />

        {/* Cerrar: círculo de 40 px como el del modal del mapa, fijo en la esquina mientras
            el contenido se desplaza debajo. */}
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label={t('sumate.drawer.cerrar')}
          data-sumate-cerrar=""
          className="absolute right-m top-m z-20 flex size-10 items-center justify-center rounded-full bg-pink-sol/40 text-black backdrop-blur-sm transition hover:bg-pink-sol focus:outline-none focus-visible:ring-2 focus-visible:ring-black lg:right-xl lg:top-7.5"
        >
          <X className="size-5" strokeWidth={2.5} aria-hidden />
        </button>

        {/* La clave renueva el contenido (y el scroll interno) tras cada cierre. */}
        <div
          key={version}
          data-drawer-scroll
          className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
        >
          <GarabatosContext.Provider value={garabatos}>{contenido}</GarabatosContext.Provider>
        </div>
      </div>
    </div>
  );
}
