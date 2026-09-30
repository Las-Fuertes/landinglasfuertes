'use client';

import Image from 'next/image';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { renderTextWithBold } from '../../lib/render-text-with-bold';
import { EVENTO_CORTINA } from '../education-map/cortina';
import LanguageSwitcher from '../layout/language-switcher';
import { CURVA, cssCurva, PASO } from '../education-map/coreografia';
import { avisoAceptado, ESTRELLA_AVISO, EVENTO_AVISO, guardarAceptacion } from './aviso';
import styles from './puerta-aviso.module.css';
import { useSaltoEstrella } from './salto-estrella';

/**
 * Salida de la puerta al pulsar "Acepto", en ms desde el clic (docs/aviso/DECISIONES.md, D1).
 * Sigue el lenguaje de movimiento de docs/PATTERNS.md: nada en bloque (cada pieza con su
 * tiempo), el texto es lo último en irse, y el fondo se va como el telón de Impacto, solo con
 * opacidad y con la curva y la duración de `cortina.ts`.
 */
export const SALIDA_AVISO = {
  /** La estrella y el botón se van primero. */
  piezas: { inicio: 0, duracion: 240 },
  /** El texto, el último de la puerta en irse. */
  texto: { inicio: 80, duracion: 260 },
  /** El telón: el fondo arena se desvanece descubriendo la landing (el `cortinaSeVa` de Impacto). */
  telon: { inicio: 300, duracion: PASO.cortinaSeVa },
  /** La intro arranca con el telón ya casi transparente (el mismo solape de 120 ms de Impacto). */
  solape: PASO.cortinaSolape,
} as const;

const FIN_TELON = SALIDA_AVISO.telon.inicio + SALIDA_AVISO.telon.duracion;

type Fase = 'puesta' | 'saliendo' | 'fuera';

/**
 * Parte un texto de locales por sus `\n`. Cada corte es solo de un tamaño: `desktop` corta desde
 * `lg` (el aviso en Figma desktop lleva "NO AUTORIZAMOS" en su propia línea) y `mobile` solo por
 * debajo (el llamado va en dos líneas en Figma mobile). Las negritas, con `**`, como en el resto
 * del sitio.
 */
function TextoConCortes({ texto, corte }: { texto: string; corte: 'mobile' | 'desktop' }) {
  return (
    <>
      {texto.split('\n').map((tramo, i) => (
        <Fragment key={i}>
          {i > 0 && <br className={corte === 'desktop' ? 'hidden lg:inline' : 'md:hidden'} />}
          {renderTextWithBold(tramo)}
        </Fragment>
      ))}
    </>
  );
}

/**
 * Aviso de protección de menores, a pantalla completa y por encima de todo, en la primera
 * visita (docs/aviso/DECISIONES.md, D1).
 *
 * Se sirve siempre en el HTML (el sitio es estático) y el script de `pages/_document.tsx` lo
 * esconde antes de pintar si la cookie ya está: así nunca asoma la landing sin haber aceptado ni
 * la puerta con la cookie puesta, y la hidratación ve lo mismo que el servidor. Tras hidratar,
 * con la cookie, el componente se desmonta.
 */
export default function PuertaAviso() {
  const [fase, setFase] = useState<Fase>('puesta');

  useEffect(() => {
    if (avisoAceptado()) setFase('fuera');
  }, []);

  if (fase === 'fuera') return null;
  return <Puerta fase={fase} salir={() => setFase('saliendo')} irse={() => setFase('fuera')} />;
}

function Puerta({ fase, salir, irse }: { fase: Fase; salir: () => void; irse: () => void }) {
  const { t } = useTranslation();
  const raizRef = useRef<HTMLDivElement>(null);
  const estrellaRef = useRef<HTMLDivElement>(null);
  const saltoRef = useRef<HTMLDivElement>(null);
  const detenerSalto = useSaltoEstrella(saltoRef);
  const textoRef = useRef<HTMLDivElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const aceptadoRef = useRef(false);

  // Mientras la puerta está puesta, todo lo demás de la página es inerte (ni foco ni clic ni
  // lector de pantalla) y el foco empieza en "Acepto". Tab y Shift+Tab recorren solo los
  // controles de la puerta (el selector de idioma y "Acepto") y Escape no la cierra: solo se
  // entra aceptando.
  useEffect(() => {
    if (avisoAceptado()) return;
    const raiz = raizRef.current;
    const hermanos = Array.from(raiz?.parentElement?.children ?? []).filter(
      el => el !== raiz && !el.hasAttribute('inert')
    );
    hermanos.forEach(el => el.setAttribute('inert', ''));
    // Sin anillo al llegar (el diseño es el de Figma); con teclado, Tab lo muestra.
    botonRef.current?.focus({ preventScroll: true, focusVisible: false } as Parameters<
      HTMLElement['focus']
    >[0]);

    const onKeydown = (e: KeyboardEvent) => {
      if (aceptadoRef.current) return;
      if (e.key === 'Tab') {
        e.preventDefault();
        const controles = Array.from(
          raizRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])') ?? []
        );
        if (!controles.length) return;
        const actual = controles.indexOf(document.activeElement as HTMLElement);
        const paso = e.shiftKey ? -1 : 1;
        const siguiente =
          actual < 0
            ? (botonRef.current ?? controles[0])
            : controles[(actual + paso + controles.length) % controles.length];
        // Se quita y se vuelve a poner el foco para que, con teclado, el anillo sí se vea
        // (también cuando el foco inicial, sin anillo, se queda en el mismo botón).
        siguiente.blur();
        siguiente.focus({ preventScroll: true, focusVisible: true } as Parameters<
          HTMLElement['focus']
        >[0]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener('keydown', onKeydown, true);
    return () => {
      window.removeEventListener('keydown', onKeydown, true);
      hermanos.forEach(el => el.removeAttribute('inert'));
    };
  }, []);

  const aceptar = useCallback(() => {
    if (aceptadoRef.current) return;
    aceptadoRef.current = true;
    // La estrella deja de saltar y vuelve a reposo mientras se funde: el telón nunca la muestra
    // a medio salto.
    detenerSalto();
    guardarAceptacion();
    salir();

    // La landing se suelta: scroll, foco, y todo lo que esperaba a la puerta (la intro, el
    // drawer de `#sumate`, la entrada de Impacto) arranca.
    const soltar = () => {
      const html = document.documentElement;
      html.dataset.aviso = 'aceptado';
      delete html.dataset.cortinaPuesta;
      raizRef.current?.parentElement
        ?.querySelectorAll(':scope > [inert]')
        .forEach(el => el.removeAttribute('inert'));
      window.dispatchEvent(new Event(EVENTO_AVISO));
      window.dispatchEvent(new Event(EVENTO_CORTINA));
    };

    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const raiz = raizRef.current;
    if (reducido || !raiz?.animate) {
      soltar();
      irse();
      return;
    }

    const fundir = (
      el: Element | null,
      { inicio, duracion }: { inicio: number; duracion: number },
      curva: readonly number[]
    ) =>
      el?.animate([{ opacity: 1 }, { opacity: 0 }], {
        delay: inicio,
        duration: duracion,
        easing: cssCurva(curva),
        fill: 'forwards',
      });

    fundir(estrellaRef.current, SALIDA_AVISO.piezas, CURVA.salida);
    fundir(botonRef.current, SALIDA_AVISO.piezas, CURVA.salida);
    fundir(textoRef.current, SALIDA_AVISO.texto, CURVA.salida);
    const telon = fundir(raiz, SALIDA_AVISO.telon, CURVA.viaje);

    window.setTimeout(soltar, FIN_TELON - SALIDA_AVISO.solape);
    const fin = () => irse();
    if (telon) telon.finished.then(fin, fin);
    else window.setTimeout(fin, FIN_TELON);
  }, [salir, irse, detenerSalto]);

  return (
    <div
      ref={raizRef}
      data-aviso-puerta={fase}
      role="dialog"
      aria-modal="true"
      aria-labelledby="aviso-titulo"
      aria-describedby="aviso-texto"
      className="fixed inset-0 z-[200] overflow-y-auto bg-arena text-black"
    >
      {/* El selector de idioma, en la misma esquina que en la landing: quien llega en otro
          idioma lo cambia antes de aceptar (D1, ampliación del 2026-09-30). */}
      <LanguageSwitcher enPuerta />
      {/* `py-xxl`, igual arriba y abajo: el bloque sigue centrado como en Figma y, si la
          pantalla es tan baja que la puerta se desplaza, el texto no pasa bajo el selector. */}
      <div className="flex min-h-full items-center justify-center px-l py-xxl md:px-page-margin">
        <div className={`${styles.columna} flex flex-col items-center`}>
          <h2 id="aviso-titulo" className="sr-only">
            {t('aviso.titulo')}
          </h2>
          <div ref={estrellaRef} className={styles.estrella}>
            {/* Capa del salto (salto-estrella.ts): solo transform, con el origen en la base
                para el aplastamiento; el fundido de salida va en la capa de fuera. */}
            <div ref={saltoRef} className="origin-bottom">
              {/* Sin `priority`: es `loading="lazy"`, así que con la cookie (puerta en
                  `display: none`) no se descarga; sin ella, la precarga SCRIPT_AVISO. */}
              <Image
                src={ESTRELLA_AVISO}
                alt=""
                width={108}
                height={93}
                unoptimized
                className="block h-auto w-full"
              />
            </div>
          </div>
          <div ref={textoRef} className="self-stretch">
            <p id="aviso-texto" className={styles.texto}>
              <TextoConCortes texto={t('aviso.texto')} corte="desktop" />
            </p>
            <p className={`${styles.llamado} font-bold`}>
              <TextoConCortes texto={t('aviso.llamado')} corte="mobile" />
            </p>
          </div>
          <button
            ref={botonRef}
            type="button"
            onClick={aceptar}
            className={`${styles.boton} rounded bg-black font-extrabold uppercase leading-normal text-papel focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-arena`}
          >
            {t('aviso.boton')}
          </button>
        </div>
      </div>
    </div>
  );
}
