'use client';

import Image from 'next/image';
import { useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSinCortina } from './use-sin-cortina';

/**
 * Momento (`performance.now()`) en que el título de la sección empezó a entrar, o `null` si aún
 * no. El mapa lo lee para ir 250 ms detrás (docs/impacto/DECISIONES.md, D2).
 */
export type InicioTitulo = number | null;

/**
 * "Así se ve el impacto en acción", fijo arriba mientras se recorre la sección
 * (docs/impacto/DECISIONES.md, D10; D5 y D6 lo definieron, D9 lo quitó). Es `sticky top-0` de CSS
 * puro, hijo directo de la sección, y mide `--alto-titulo` (la sección lo define). Ocupa su
 * alto en el flujo (la primera fila mide la pantalla menos el título), así al acabar la sección
 * sube con ella y no queda flotando sobre Quiénes somos. `--aire-arriba` reserva, en mobile, el alto del CTA "Súmate" flotante.
 *
 * La entrada es la de D2: aparece y sube cuando está en pantalla y no hay cortina del Mapa
 * educativo encima.
 */
export function TituloImpacto({ onInicio }: { onInicio: (inicio: number) => void }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const libre = useSinCortina();
  const enPantalla = useInView(ref, { once: true, margin: '-60px' });
  const [entrada, setEntrada] = useState(false);

  useEffect(() => {
    if (!libre || !enPantalla || entrada) return;
    setEntrada(true);
    onInicio(performance.now());
  }, [libre, enPantalla, entrada, onInicio]);

  return (
    <div
      ref={ref}
      data-impacto-titulo
      className="impacto-cabecera sticky top-0 z-10 h-[var(--alto-titulo)] bg-beige pt-[var(--aire-arriba)]"
      data-entrada={entrada || undefined}
    >
      <h2
        id="impacto-title"
        className="mx-auto text-center font-bold tracking-[-0.04em] text-black"
        style={{
          fontSize: 'calc(30px * var(--k))',
          lineHeight: 'calc(32px * var(--k))',
          maxWidth: 'calc(321px * var(--k))',
        }}
      >
        {/* El salto de línea es del diseño; se escribe `\n` en el copy. La flor va al final de la
            última línea, girada como una pegatina, y no ocupa una fila propia (D3). */}
        {t('impacto.title')
          .split('\n')
          .map((linea, i, lineas) => (
            <span key={i} className="block">
              {linea}
              {i === lineas.length - 1 && (
                <span className="impacto-flor relative ml-[0.2em] inline-block h-[1.1em] w-[1.1em] align-[-0.2em]">
                  <span className="absolute inset-0 -rotate-12">
                    <Image src="/images/impacto/flor.svg" alt="" fill />
                  </span>
                </span>
              )}
            </span>
          ))}
      </h2>
    </div>
  );
}
