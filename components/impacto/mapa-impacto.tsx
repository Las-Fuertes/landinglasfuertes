'use client';

import Image from 'next/image';
import { useInView } from 'framer-motion';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { renderTextWithMarks } from '../../lib/render-text-with-bold';
import { Resaltado } from '../layout/resaltado';
import {
  DEPARTAMENTOS,
  ETIQUETAS,
  ISLA_FUERTE,
  MAPA_CAJA,
  MAPA_VIEWBOX,
  type TerritorioId,
} from './mapa.data';
import { useSinCortina } from './use-sin-cortina';

/** Una medida del diseño mobile, escalada por `--k` (ver la sección). */
const k = (px: number) => `calc(${px}px * var(--k))`;

/** Índice de encendido de cada territorio: el orden de `ETIQUETAS`, desde Isla Fuerte. */
const ORDEN: Record<TerritorioId, number> = Object.fromEntries(
  ETIQUETAS.map((e, i) => [e.id, i])
) as Record<TerritorioId, number>;

/** Un territorio: el path en gris y encima el mismo en rosa, con su turno `i` (D2). */
function Territorio({ d, transform, i }: { d: string; transform?: string; i: number }) {
  const turno = { ['--i' as string]: i } as CSSProperties;
  return (
    <>
      <path
        d={d}
        transform={transform}
        className="impacto-territorio-gris fill-ash"
        style={turno}
      />
      <path d={d} transform={transform} className="impacto-territorio" style={turno} />
    </>
  );
}

/**
 * El mapa de Colombia con los territorios que se encienden (D8). Es un SVG inline con un path
 * por departamento; los seis territorios y la isla llevan `--i` con su turno, y el CSS de
 * `.impacto-territorio` hace el paso de gris a rosa en cascada cuando el contenedor entra en
 * viewport. Las etiquetas son HTML (chips del sitio, traducibles) posicionadas en porcentaje de
 * la caja del SVG, y aparecen justo después de su territorio.
 *
 * En desktop (docs/impacto/DECISIONES.md, D1) el título de la sección va centrado arriba, a todo
 * el ancho, y debajo la primera fila: el mapa a la izquierda y el cierre a la derecha, centrados
 * entre sí.
 * Ahí el mapa mide lo que su columna, así que su unidad `--u` (1 px del lienzo de 390) sale del
 * ancho de esa columna (`cqw`) y no de `--k`, para que las etiquetas guarden su tamaño relativo
 * al dibujo. En mobile y tablet `--u` es `1px * --k`, lo mismo que `k()`.
 */
export function MapaImpacto() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const cabeceraRef = useRef<HTMLDivElement>(null);
  const libre = useSinCortina();
  const mapaEnPantalla = useInView(ref, { once: true, amount: 0.45 });
  const cabeceraEnPantalla = useInView(cabeceraRef, { once: true, margin: '-60px' });

  /**
   * Entrada de la fila (D2 de docs/impacto): la cabecera arranca al estar en pantalla y el mapa
   * al estar en pantalla, pero nunca antes de 250 ms después del título ni debajo de la cortina
   * del Mapa educativo. `retraso` es lo que le falta al mapa para cumplirlo, en ms.
   */
  const inicioCabecera = useRef<number | null>(null);
  const [cabecera, setCabecera] = useState(false);
  const [retraso, setRetraso] = useState<number | null>(null);
  useEffect(() => {
    if (!libre) return;
    if (cabeceraEnPantalla && inicioCabecera.current === null) {
      inicioCabecera.current = performance.now();
      setCabecera(true);
    }
    if (mapaEnPantalla && retraso === null) {
      const desde = inicioCabecera.current;
      setRetraso(desde === null ? 0 : Math.max(0, Math.round(desde + 250 - performance.now())));
    }
  }, [libre, cabeceraEnPantalla, mapaEnPantalla, retraso]);
  const encendido = retraso !== null;

  const pct = (x: number, y: number, hasta?: number) => ({
    ...(hasta === undefined
      ? { left: `${((x - MAPA_CAJA.left) / MAPA_CAJA.width) * 100}%` }
      : { right: `${((MAPA_CAJA.left + MAPA_CAJA.width - hasta) / MAPA_CAJA.width) * 100}%` }),
    top: `${((y - MAPA_CAJA.top) / MAPA_CAJA.height) * 100}%`,
  });

  return (
    <div
      className="mx-auto w-full max-w-[var(--ancho-mapa)] lg:grid lg:max-w-none lg:grid-cols-12 lg:items-center lg:gap-x-grid-gutter"
      style={
        {
          ['--ancho-mapa' as string]: k(390),
          ['--u' as string]: k(1),
          // Lo que ocupa la fila del mapa fuera del mapa, para que quepa entera en pantalla (D3).
          ['--resto' as string]: k(320),
        } as CSSProperties
      }
    >
      <div
        ref={cabeceraRef}
        className="impacto-cabecera lg:col-span-12 lg:row-start-1 lg:mb-xl"
        data-entrada={cabecera || undefined}
      >
        <h2
          id="impacto-title"
          className="mx-auto text-center font-bold tracking-[-0.04em] text-black"
          style={{ fontSize: k(30), lineHeight: k(32), maxWidth: k(321) }}
        >
          {/* El salto de línea es del diseño; se escribe `\n` en el copy. La flor va al final de
              la última línea, girada como una pegatina, y no ocupa una fila propia (D3). */}
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

      {/* La celda es el contenedor de `cqw`; en mobile y tablet es un `div` sin estilo. */}
      <div className="lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:[container-type:inline-size]">
        <div
          ref={ref}
          className="impacto-mapa relative mt-[var(--mapa-arriba)] lg:mt-0"
          data-encendido={encendido || undefined}
          style={
            {
              aspectRatio: `${MAPA_CAJA.width} / ${MAPA_CAJA.height}`,
              ['--mapa-arriba' as string]: k(12),
              ['--retraso' as string]: `${retraso ?? 0}ms`,
            } as CSSProperties
          }
        >
          <svg
            viewBox={MAPA_VIEWBOX}
            className="impacto-mapa-base absolute inset-0 h-full w-full overflow-visible"
            aria-hidden="true"
          >
            {/* Cada territorio va dos veces, en su sitio del orden de apilado: en gris y encima en
                rosa, que aparece por opacidad (D2 de docs/impacto; un cambio de `fill` obliga a
                repintar). Cuando el rosa ya está entero, el gris se retira: en reposo se pinta lo
                mismo que antes, un solo path por territorio. */}
            <g className="stroke-beige" strokeWidth={1} strokeLinejoin="round">
              {DEPARTAMENTOS.map(({ figma, d, territorio }) =>
                territorio ? (
                  <Territorio key={figma} d={d} i={ORDEN[territorio]} />
                ) : (
                  <path key={figma} d={d} className="fill-ash" />
                )
              )}
              <Territorio
                d={ISLA_FUERTE.d}
                transform={ISLA_FUERTE.transform}
                i={ORDEN.islaFuerte}
              />
            </g>
          </svg>

          {ETIQUETAS.map(({ id, x, y, chico, hasta }, i) => (
            <div
              key={id}
              className="impacto-etiqueta absolute"
              style={{ ...pct(x, y, hasta), ['--i' as string]: i }}
            >
              <Resaltado partir={false} style={{ fontSize: `calc(${chico ? 12 : 16} * var(--u))` }}>
                {t(`impacto.mapa.territorios.${id}`)}
              </Resaltado>
            </div>
          ))}
        </div>
      </div>

      {/* Bajo el mapa, a la misma distancia que el texto de cada bloque de su dibujo (docs/impacto, D2). */}
      <div className="relative mt-xl px-page-margin lg:col-span-6 lg:col-start-7 lg:row-start-2 lg:mt-0 lg:px-0">
        <h3
          className="font-bold leading-tight tracking-[-0.04em] text-black"
          style={{ fontSize: k(30) }}
        >
          {renderTextWithMarks(t('impacto.mapa.cierre'), { variante: 'titulo' })}
        </h3>
        <p
          className="mt-[var(--p-arriba)] text-[length:var(--p-letra)] leading-normal text-black lg:mt-m lg:text-balance lg:text-h3 lg:leading-normal"
          style={
            { ['--p-letra' as string]: k(16), ['--p-arriba' as string]: k(10) } as CSSProperties
          }
        >
          {t('impacto.mapa.texto')}
        </p>
      </div>
    </div>
  );
}
