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
  const { name, role, side, bleed = 0, dispersion } = integrante;
  const centrado = side === 'center';

  // El sangrado y el desplazamiento viajan como variables CSS para poder anularlos o aplicarlos
  // solo en desktop: un `style` en línea no lo puede pisar una clase de breakpoint.
  const vars = {
    '--sangra': k(-bleed),
    '--dx': `${dispersion?.dx ?? 0}px`,
    '--dy': `${dispersion?.dy ?? 0}px`,
  } as CSSProperties;

  return (
    <li
      className={`equipo-ficha flex items-center gap-l lg:flex-col lg:items-center lg:gap-0 lg:text-center ${centrado ? 'flex-col text-center' : ''} ${side === 'right' ? 'flex-row-reverse' : ''}`}
      style={vars}
    >
      <div
        className={
          side === 'left'
            ? 'ml-[var(--sangra)] lg:ml-0'
            : side === 'right'
              ? 'mr-[var(--sangra)] lg:mr-0'
              : ''
        }
      >
        <Foto integrante={integrante} index={index} />
      </div>
      {/* El nombre no se parte nunca; en el diseño el chip se acerca al borde más que el
          resto del texto, por eso el bloque se sale un poco del margen hacia su lado. En
          desktop la ficha es una columna centrada y ese sangrado sobra. */}
      <div
        className={`min-w-0 flex-1 lg:mt-m lg:w-full lg:flex-none ${side === 'left' ? '-mr-l lg:mr-0' : ''}`}
      >
        <span className="map-chip whitespace-nowrap">
          <span
            className="font-bold text-white"
            style={{ fontSize: 'var(--nombre)', letterSpacing: '-0.04em' }}
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
      // El aire de abajo en desktop cuenta con el desplazamiento de la última fila: `transform`
      // no ocupa espacio, así que sin esto la ficha más baja se metía debajo del footer.
      className="w-full overflow-x-clip bg-cream pb-xl pt-xxl lg:pb-[140px] [--ancho:calc(390px*var(--k))] [--k:1] [--nombre:calc(21.3px*var(--k))] md:[--k:1.25] lg:[--ancho:1200px] lg:[--k:1.4] lg:[--nombre:26px]"
    >
      <div className="mx-auto w-full px-page-margin" style={{ maxWidth: 'var(--ancho)' }}>
        <FadeIn>
          <h2
            id="quienes-somos-title"
            className="text-center font-bold leading-tight tracking-[-0.04em] text-black"
            style={{ fontSize: k(30) }}
          >
            {t('quienesSomos.title')}
          </h2>
          {/* En desktop la banda es ancha, pero un párrafo de 1200 px no se lee: se acota. */}
          <p
            className="mt-l leading-normal text-black lg:mx-auto lg:max-w-[760px] lg:text-center"
            style={{ fontSize: k(16) }}
          >
            {t('quienesSomos.text')}
          </p>
        </FadeIn>

        {/* Desktop: rejilla de 3 en la que ninguna ficha queda alineada con otra (D27). */}
        <ul className="mt-xxl flex flex-col gap-s lg:grid lg:grid-cols-3 lg:gap-x-l lg:gap-y-xxl">
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
