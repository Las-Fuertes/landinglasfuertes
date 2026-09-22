'use client';

import Image from 'next/image';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { renderTextWithMarks } from '../../lib/render-text-with-bold';
import { type Bloque, type Capa } from './bloques.data';

const k = (px: number) => `calc(${px}px * var(--k))`;
const ANCHO = 390;

/** Una capa en porcentaje del lienzo de su bloque (mismo esquema que la Introducción, D13). */
function CapaImg({
  capa,
  top,
  height,
  className = '',
  delay,
}: {
  capa: Capa;
  top: number;
  height: number;
  className?: string;
  delay?: number;
}) {
  const { box, inset, rotate, inner } = capa;
  const style = {
    transitionDelay: delay ? `${delay}s` : undefined,
    left: `${(box.left / ANCHO) * 100}%`,
    top: `${((box.top - top) / height) * 100}%`,
    width: `${(box.width / ANCHO) * 100}%`,
    height: `${(box.height / height) * 100}%`,
  };
  // Carga inmediata: las capas "después" nacen recortadas por clip-path y Chrome no pide una
  // imagen lazy que no se ve, así que la animación arrancaba sin nada que descubrir.
  const img = <Image src={capa.src} alt="" fill sizes="100vw" loading="eager" />;
  const conInset = inset ? (
    <div className="absolute" style={{ inset }}>
      {img}
    </div>
  ) : (
    img
  );
  if (rotate && inner) {
    return (
      <div className={`absolute flex items-center justify-center ${className}`} style={style}>
        <div
          className="relative flex-none"
          style={{
            width: `${(inner.width / box.width) * 100}%`,
            height: `${(inner.height / box.height) * 100}%`,
            transform: `rotate(${rotate}deg)`,
          }}
        >
          {conInset}
        </div>
      </div>
    );
  }
  return (
    <div className={`absolute ${className}`} style={style}>
      {conInset}
    </div>
  );
}

/**
 * Un bloque de impacto: ilustración con estado "antes" y "después" (D8), título en chips y
 * párrafo. Las capas de `despues` entran cuando el bloque lleva un rato en viewport (agua que
 * sube o fundido, según `entrada`) y los `extras` rematan con un rebote. Todo en CSS
 * (`.impacto-bloque` en styles/global.css) disparado por `data-encendido`.
 */
export function BloqueImpacto({ bloque }: { bloque: Bloque }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const encendido = useInView(ref, { once: true, amount: 0.6 });
  const { lienzo } = bloque;

  return (
    <div
      ref={ref}
      className="impacto-bloque mx-auto w-full"
      data-encendido={encendido || undefined}
      style={{ maxWidth: k(ANCHO) }}
    >
      <div
        className="relative w-full"
        style={{ aspectRatio: `${ANCHO} / ${lienzo.height}` }}
        aria-hidden="true"
      >
        {bloque.base?.map(capa => (
          <CapaImg key={capa.src} capa={capa} top={lienzo.top} height={lienzo.height} />
        ))}
        <div className={`impacto-antes impacto-antes--${bloque.entrada} absolute inset-0`}>
          {bloque.antes.map(capa => (
            <CapaImg key={capa.src} capa={capa} top={lienzo.top} height={lienzo.height} />
          ))}
        </div>
        <div className={`impacto-despues impacto-despues--${bloque.entrada} absolute inset-0`}>
          {bloque.despues.map(capa => (
            <CapaImg
              key={capa.src}
              capa={capa}
              top={lienzo.top}
              height={lienzo.height}
              className="impacto-capa"
              delay={capa.delay}
            />
          ))}
        </div>
        {bloque.extras?.map((capa, i) => (
          <div
            key={`${capa.src}-${i}`}
            className="impacto-extra absolute inset-0"
            style={{ ['--i' as string]: i }}
          >
            <CapaImg capa={capa} top={lienzo.top} height={lienzo.height} />
          </div>
        ))}
      </div>

      <div
        style={{
          paddingLeft: k(46),
          paddingRight: k(20),
          marginTop: k(bloque.texto - lienzo.top - lienzo.height),
        }}
      >
        <h3
          className="font-bold leading-tight tracking-[-0.04em] text-black"
          style={{ fontSize: k(30) }}
        >
          {renderTextWithMarks(t(`impacto.bloques.${bloque.id}.title`))}
        </h3>
        <p
          className="leading-normal text-black"
          style={{ fontSize: k(16), marginTop: k(10), maxWidth: k(297) }}
        >
          {t(`impacto.bloques.${bloque.id}.text`)}
        </p>
      </div>
    </div>
  );
}
