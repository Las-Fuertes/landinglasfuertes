'use client';

import { type Ref, useLayoutEffect, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

type Accion = 'saltar' | 'anterior' | 'siguiente';

/**
 * "Saltar intro" y las dos flechas de la Introducción (D10), en el sitio del antiguo "Saltar
 * animación". Es la salida y el avance para quien no usa la rueda: ratón sobre la barra lateral,
 * tableta, teclado o lector de pantalla.
 *
 * - Se ven en reposo y se esconden mientras corre una entrada o una transición; vuelven al final
 *   de cada una. Escondidos son `inert`: ni se enfocan ni se leen.
 * - Si el foco estaba en uno de ellos al esconderse, se queda en el contenedor (que no es inert)
 *   y vuelve al mismo botón cuando reaparecen. Así, quien pulsa Enter sobre la flecha sigue ahí.
 *   Un Tab durante la transición también deja el foco en el contenedor (`data-intro-navegacion`,
 *   use-intro-pin.ts) y al reaparecer pasa a avanzar.
 * - Cada flecha solo está si se puede ir en ese sentido. Como aparecen al final de cada paso,
 *   con un fundido, que "Saltar intro" se corra un hueco cuando aparece la de retroceder no se
 *   nota; un hueco vacío entre los botones, sí.
 */
export function IntroNavegacion({
  visible,
  puedeRetroceder,
  puedeAvanzar,
  onSaltar,
  onRetroceder,
  onAvanzar,
  saltarRef,
}: {
  visible: boolean;
  puedeRetroceder: boolean;
  puedeAvanzar: boolean;
  onSaltar: () => void;
  onRetroceder: () => void;
  onAvanzar: () => void;
  saltarRef: Ref<HTMLButtonElement>;
}) {
  const { t } = useTranslation();
  const contenedor = useRef<HTMLDivElement>(null);
  /** El botón que tenía el foco cuando se escondieron. */
  const recordado = useRef<Accion | null>(null);

  useLayoutEffect(() => {
    const raiz = contenedor.current;
    if (!raiz) return;
    const activo = document.activeElement;
    if (!visible) {
      if (activo instanceof HTMLElement && activo !== raiz && raiz.contains(activo)) {
        recordado.current = (activo.dataset.accion as Accion | undefined) ?? null;
        raiz.focus({ preventScroll: true });
      }
      return;
    }
    // El foco puede estar en el grupo sin recordado: lo dejó ahí un Tab durante la transición
    // (use-intro-pin.ts). Entonces vuelve a avanzar.
    if (activo !== raiz) return;
    const disponible = (a: Accion) =>
      raiz.querySelector<HTMLButtonElement>(`[data-accion="${a}"]:not(.hidden)`);
    const destino =
      (recordado.current && disponible(recordado.current)) ??
      disponible('siguiente') ??
      disponible('saltar');
    recordado.current = null;
    destino?.focus({ preventScroll: true });
  }, [visible, puedeAvanzar, puedeRetroceder]);

  const boton =
    'flex h-10 items-center justify-center rounded-full border border-black/15 bg-beige-light/90 text-black shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-beige';
  const flecha = (arriba: boolean) => (
    <svg aria-hidden viewBox="0 0 20 20" className="h-5 w-5" fill="none">
      <path
        d={arriba ? 'M5 12.5 10 7.5l5 5' : 'M5 7.5l5 5 5-5'}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div
      ref={contenedor}
      data-intro-navegacion
      tabIndex={-1}
      role="group"
      aria-label={t('intro.navegacion')}
      className="absolute bottom-6 right-page-margin z-10 focus:outline-none"
    >
      <div
        inert={!visible}
        className={`flex items-center gap-s transition-[opacity,transform] duration-300 ease-out ${
          visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-1 opacity-0'
        }`}
      >
        <button
          ref={saltarRef}
          type="button"
          data-accion="saltar"
          onClick={onSaltar}
          className={`${boton} px-l text-p-lg font-bold`}
        >
          {t('intro.saltar')}
        </button>
        <button
          type="button"
          data-accion="anterior"
          aria-label={t('intro.anterior')}
          onClick={onRetroceder}
          className={`${boton} w-10 ${puedeRetroceder ? '' : 'hidden'}`}
        >
          {flecha(true)}
        </button>
        <button
          type="button"
          data-accion="siguiente"
          aria-label={t('intro.siguiente')}
          onClick={onAvanzar}
          className={`${boton} w-10 ${puedeAvanzar ? '' : 'hidden'}`}
        >
          {flecha(false)}
        </button>
      </div>
    </div>
  );
}
