'use client';

import Image from 'next/image';
import { useInView } from 'framer-motion';
import { useRef, type CSSProperties } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { renderTextWithMarks } from '../../lib/render-text-with-bold';
import { type Bloque, type BloqueId, type Capa } from './bloques.data';

const k = (px: number) => `calc(${px}px * var(--k))`;
const ANCHO = 390;

/**
 * Sitio de cada bloque en la rejilla de 12 columnas de desktop (docs/impacto/DECISIONES.md, D1).
 * Filas intercaladas: el mapa (fila 1) lleva la ilustración a la izquierda, la piscina a la
 * derecha, y así alternando. El texto ocupa 6 columnas (7 en la copa, para que la frase en
 * francés no deje "an." sola), unos 55 caracteres por línea a 20 px. Las ilustraciones altas
 * (lámparas, copa) ocupan 4 columnas y dejan una de aire; las apaisadas (piscina, persona)
 * ocupan 6 y sangran hasta el borde de la página por su lado, sobre el margen de 40.
 */
const DESKTOP: Record<BloqueId, { arte: string; texto: string }> = {
  piscina: {
    arte: 'lg:col-span-6 lg:col-start-7 lg:-mr-page-margin',
    texto: 'lg:col-span-6 lg:col-start-1',
  },
  luces: {
    arte: 'lg:col-span-4 lg:col-start-2',
    texto: 'lg:col-span-6 lg:col-start-7',
  },
  copa: {
    arte: 'lg:col-span-4 lg:col-start-9',
    texto: 'lg:col-span-7 lg:col-start-1',
  },
  persona: {
    arte: 'lg:col-span-6 lg:col-start-1 lg:-ml-page-margin',
    texto: 'lg:col-span-6 lg:col-start-7',
  },
};

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
    // Va como variable para que sirva igual a la transición y a la animación de la capa.
    ['--delay' as string]: delay ? `${delay}s` : undefined,
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
  const desktop = DESKTOP[bloque.id];

  return (
    <div
      ref={ref}
      className="impacto-bloque mx-auto w-full max-w-[var(--ancho-bloque)] lg:grid lg:max-w-none lg:grid-cols-12 lg:items-center lg:gap-x-grid-gutter"
      data-encendido={encendido || undefined}
      style={{ ['--ancho-bloque' as string]: k(ANCHO) } as CSSProperties}
    >
      <div
        className={`relative w-full lg:row-start-1 lg:w-auto lg:justify-self-stretch ${desktop.arte}`}
        style={{ aspectRatio: `${ANCHO} / ${lienzo.height}` }}
        aria-hidden="true"
      >
        {bloque.base?.map(capa => (
          <CapaImg key={capa.src} capa={capa} top={lienzo.top} height={lienzo.height} />
        ))}
        {bloque.antes.length > 0 && (
          <div className={`impacto-antes impacto-antes--${bloque.entrada} absolute inset-0`}>
            {bloque.antes.map(capa => (
              <CapaImg key={capa.src} capa={capa} top={lienzo.top} height={lienzo.height} />
            ))}
          </div>
        )}
        <div className={`impacto-despues impacto-despues--${bloque.entrada} absolute inset-0`}>
          {bloque.despues.map(capa => (
            <CapaImg
              key={capa.src}
              capa={capa}
              top={lienzo.top}
              height={lienzo.height}
              className={`impacto-capa${capa.anim ? ` impacto-capa--${capa.anim}` : ''}`}
              delay={capa.delay}
            />
          ))}
        </div>
        {bloque.frente?.map(capa => (
          <CapaImg key={capa.src} capa={capa} top={lienzo.top} height={lienzo.height} />
        ))}
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

      {/* Imagen y texto a la misma distancia en los cinco bloques (docs/impacto, D2): los lienzos
          ya van ceñidos al dibujo, así que el aire es solo `mt-xl`. */}
      <div
        className={`mt-xl pl-[var(--texto-izq)] pr-[var(--texto-der)] lg:row-start-1 lg:mt-0 lg:px-0 ${desktop.texto}`}
        style={
          {
            ['--texto-izq' as string]: k(46),
            ['--texto-der' as string]: k(20),
          } as CSSProperties
        }
      >
        <h3
          className="font-bold leading-tight tracking-[-0.04em] text-black"
          style={{ fontSize: k(30) }}
        >
          {renderTextWithMarks(t(`impacto.bloques.${bloque.id}.title`), { variante: 'titulo' })}
        </h3>
        <p
          className="mt-[var(--p-arriba)] max-w-[var(--p-ancho)] text-[length:var(--p-letra)] leading-normal text-black lg:mt-m lg:max-w-none lg:text-balance lg:text-h3 lg:leading-normal"
          style={
            {
              ['--p-letra' as string]: k(16),
              ['--p-arriba' as string]: k(10),
              ['--p-ancho' as string]: k(297),
            } as CSSProperties
          }
        >
          {t(`impacto.bloques.${bloque.id}.text`)}
        </p>
      </div>
    </div>
  );
}
