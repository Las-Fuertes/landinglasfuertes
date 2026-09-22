'use client';

import Image from 'next/image';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { renderTextWithMarks } from '../../lib/render-text-with-bold';
import { FadeIn } from '../sumate/fade-in';
import {
  DEPARTAMENTOS,
  ETIQUETAS,
  ISLA_FUERTE,
  MAPA_CAJA,
  MAPA_VIEWBOX,
  type TerritorioId,
} from './mapa.data';

/** Una medida del diseño mobile, escalada por `--k` (ver la sección). */
const k = (px: number) => `calc(${px}px * var(--k))`;

/** Índice de encendido de cada territorio: el orden de `ETIQUETAS`, desde Isla Fuerte. */
const ORDEN: Record<TerritorioId, number> = Object.fromEntries(
  ETIQUETAS.map((e, i) => [e.id, i])
) as Record<TerritorioId, number>;

/**
 * El mapa de Colombia con los territorios que se encienden (D8). Es un SVG inline con un path
 * por departamento; los seis territorios y la isla llevan `--i` con su turno, y el CSS de
 * `.impacto-territorio` hace el paso de gris a rosa en cascada cuando el contenedor entra en
 * viewport. Las etiquetas son HTML (chips del sitio, traducibles) posicionadas en porcentaje de
 * la caja del SVG, y aparecen justo después de su territorio.
 */
export function MapaImpacto() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const encendido = useInView(ref, { once: true, amount: 0.45 });

  const pct = (x: number, y: number) => ({
    left: `${((x - MAPA_CAJA.left) / MAPA_CAJA.width) * 100}%`,
    top: `${((y - MAPA_CAJA.top) / MAPA_CAJA.height) * 100}%`,
  });

  return (
    <div className="mx-auto w-full" style={{ maxWidth: k(390) }}>
      <FadeIn>
        <div className="relative mx-auto" style={{ width: k(42), height: k(41) }}>
          <Image src="/images/impacto/flor.svg" alt="" fill />
        </div>
        <h2
          id="impacto-title"
          className="mx-auto text-center font-bold tracking-[-0.04em] text-black"
          style={{ fontSize: k(30), lineHeight: k(32), maxWidth: k(321), marginTop: k(4) }}
        >
          {/* El salto de línea es del diseño; se escribe `\n` en el copy. */}
          {t('impacto.title')
            .split('\n')
            .map((linea, i) => (
              <span key={i} className="block">
                {linea}
              </span>
            ))}
        </h2>
      </FadeIn>

      <div
        ref={ref}
        className="impacto-mapa relative w-full"
        data-encendido={encendido || undefined}
        style={{ aspectRatio: `${MAPA_CAJA.width} / ${MAPA_CAJA.height}`, marginTop: k(19) }}
      >
        <svg
          viewBox={MAPA_VIEWBOX}
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <g className="stroke-beige" strokeWidth={1} strokeLinejoin="round">
            {DEPARTAMENTOS.map(({ figma, d, territorio }) => (
              <path
                key={figma}
                d={d}
                className={territorio ? 'impacto-territorio' : 'fill-ash'}
                style={territorio ? { ['--i' as string]: ORDEN[territorio] } : undefined}
              />
            ))}
            <path
              d={ISLA_FUERTE.d}
              transform={ISLA_FUERTE.transform}
              className="impacto-territorio"
              style={{ ['--i' as string]: ORDEN.islaFuerte }}
            />
          </g>
        </svg>

        {ETIQUETAS.map(({ id, x, y, chico }, i) => (
          <div
            key={id}
            className="impacto-etiqueta absolute"
            style={{ ...pct(x, y), ['--i' as string]: i }}
          >
            <span className="map-chip whitespace-nowrap">
              <span className="font-bold text-white" style={{ fontSize: k(chico ? 12 : 16) }}>
                {t(`impacto.mapa.territorios.${id}`)}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* El cierre pisa el borde inferior del mapa, como en el diseño. */}
      <div className="relative px-page-margin" style={{ marginTop: k(-33) }}>
        <h3
          className="font-bold leading-tight tracking-[-0.04em] text-black"
          style={{ fontSize: k(30) }}
        >
          {renderTextWithMarks(t('impacto.mapa.cierre'))}
        </h3>
        <p className="leading-normal text-black" style={{ fontSize: k(16), marginTop: k(10) }}>
          {t('impacto.mapa.texto')}
        </p>
      </div>
    </div>
  );
}
