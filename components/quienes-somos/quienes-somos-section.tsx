'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { FadeIn } from '../sumate/fade-in';
import { INTEGRANTES, type Integrante } from './quienes-somos.data';

/** Una medida del diseño mobile, escalada por `--k` (ver la sección). */
const k = (px: number) => `calc(${px}px * var(--k))`;

function Foto({ integrante, index }: { integrante: Integrante; index: number }) {
  const { slug, name, size, focus } = integrante;
  return (
    <div className="relative flex-none" style={{ width: k(size), height: k(size) }}>
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <Image
          src={`/images/quienes-somos/${slug}.jpg`}
          alt={name}
          fill
          sizes="(min-width: 1024px) 290px, (min-width: 768px) 260px, 210px"
          className="object-cover"
          style={{ objectPosition: focus }}
        />
      </div>
      {/* El anillo dibujado a mano. Es el mismo trazo en todas las fotos; girarlo un
          poco en cada una evita que se note la repetición. */}
      <div
        className="pointer-events-none absolute inset-[-1.1%_-1.4%_-1.1%_-1.1%]"
        style={{ transform: `rotate(${(index * 47) % 360}deg)` }}
      >
        <Image src="/images/quienes-somos/anillo.svg" alt="" fill />
      </div>
    </div>
  );
}

function Persona({ integrante, index }: { integrante: Integrante; index: number }) {
  const { t } = useTranslation();
  const { name, role, side, bleed = 0 } = integrante;
  const centrado = side === 'center';

  const sangrado: CSSProperties =
    side === 'left'
      ? { marginLeft: k(-bleed) }
      : side === 'right'
        ? { marginRight: k(-bleed) }
        : {};

  return (
    <li
      className={`flex items-center gap-l ${centrado ? 'flex-col text-center' : ''} ${side === 'right' ? 'flex-row-reverse' : ''}`}
    >
      <div style={sangrado}>
        <Foto integrante={integrante} index={index} />
      </div>
      {/* El nombre no se parte nunca; en el diseño el chip se acerca al borde más que el
          resto del texto, por eso el bloque se sale un poco del margen hacia su lado. */}
      <div className={`min-w-0 flex-1 ${side === 'left' ? '-mr-l' : ''}`}>
        <span className="map-chip whitespace-nowrap">
          <span
            className="font-bold text-white"
            style={{ fontSize: k(21.3), letterSpacing: '-0.04em' }}
          >
            {name}
          </span>
        </span>
        <p className="mt-s leading-snug text-black" style={{ fontSize: k(14) }}>
          {t(`quienesSomos.roles.${role}`)}
        </p>
      </div>
    </li>
  );
}

/**
 * Quiénes somos: el equipo, justo antes del footer (D5). Solo hay diseño mobile; en
 * tablet y desktop se escala la misma composición (D7) con la variable `--k`.
 */
export default function QuienesSomosSection() {
  const { t } = useTranslation();

  return (
    <section
      id="quienes-somos"
      aria-labelledby="quienes-somos-title"
      className="w-full overflow-x-clip bg-cream pb-xl pt-xxl [--k:1] md:[--k:1.25] lg:[--k:1.4]"
    >
      <div className="mx-auto w-full px-page-margin" style={{ maxWidth: k(390) }}>
        <FadeIn>
          <h2
            id="quienes-somos-title"
            className="text-center font-bold leading-tight tracking-[-0.04em] text-black"
            style={{ fontSize: k(30) }}
          >
            {t('quienesSomos.title')}
          </h2>
          <p className="mt-l leading-normal text-black" style={{ fontSize: k(16) }}>
            {t('quienesSomos.text')}
          </p>
        </FadeIn>

        <ul className="mt-xxl flex flex-col gap-s">
          {INTEGRANTES.map((integrante, i) => (
            <FadeIn key={integrante.slug} delay={0.05}>
              <Persona integrante={integrante} index={i} />
            </FadeIn>
          ))}
        </ul>
      </div>
    </section>
  );
}
