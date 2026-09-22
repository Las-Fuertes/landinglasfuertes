import Image from 'next/image';
import type { ReactNode } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { renderTextWithMarks } from '../../lib/render-text-with-bold';
import {
  STEP_1_CLUSTER,
  STEP_1_VARIANTS,
  STEP_2_VARIANTS,
  STEP_3_VARIANTS,
  type GroupTransform,
  type IntroLayer,
  type IntroVariant,
} from './intro.data';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/** Cada breakpoint se muestra en su rango y se oculta fuera de él. */
const VISIBILIDAD: Record<Breakpoint, string> = {
  mobile: 'md:hidden',
  tablet: 'hidden md:block lg:hidden',
  desktop: 'hidden lg:block',
};

/**
 * Ancho máximo por breakpoint. En mobile el lienzo de Figma mide 390 pero se deja
 * crecer un poco para que no quede una franja vacía en teléfonos anchos.
 */
const ANCHO_MAXIMO: Record<Breakpoint, number> = { mobile: 430, tablet: 1024, desktop: 1280 };

/** Aplica la transformación del grupo a una capa definida en el lienzo mobile. */
function transformar(layer: IntroLayer, g: GroupTransform): IntroLayer {
  if (g.scale === 1 && g.dx === 0 && g.dy === 0) return layer;
  return {
    ...layer,
    box: {
      left: layer.box.left * g.scale + g.dx,
      top: layer.box.top * g.scale + g.dy,
      width: layer.box.width * g.scale,
      height: layer.box.height * g.scale,
    },
    inner: layer.inner && {
      width: layer.inner.width * g.scale,
      height: layer.inner.height * g.scale,
    },
  };
}

function Capa({ layer, canvas }: { layer: IntroLayer; canvas: { width: number; height: number } }) {
  const { box, rotate, inner, inset, opacity, flipY } = layer;
  const pct = (v: number, eje: 'width' | 'height') => `${(v / canvas[eje]) * 100}%`;

  // Los SVG del diseño traen preserveAspectRatio="none": se estiran a su caja, que es
  // lo que queremos porque las proporciones ya vienen en los datos.
  const img = <Image src={layer.src} alt="" fill sizes="100vw" />;
  const conInset = inset ? (
    <div className="absolute" style={{ inset }}>
      {img}
    </div>
  ) : (
    img
  );

  return (
    <div
      className="absolute"
      style={{
        left: pct(box.left, 'width'),
        top: pct(box.top, 'height'),
        width: pct(box.width, 'width'),
        height: pct(box.height, 'height'),
        opacity,
      }}
    >
      {rotate !== undefined && inner ? (
        <div className="flex h-full w-full items-center justify-center">
          <div
            className="relative flex-none"
            style={{
              width: `${(inner.width / box.width) * 100}%`,
              height: `${(inner.height / box.height) * 100}%`,
              transform: `rotate(${rotate}deg)${flipY ? ' scaleY(-1)' : ''}`,
            }}
          >
            {conInset}
          </div>
        </div>
      ) : (
        conInset
      )}
    </div>
  );
}

/**
 * Un paso en un breakpoint concreto: el lienzo, sus capas y sus textos, todo en
 * porcentaje para que escale solo dentro de su rango.
 */
function Paso({
  ancla,
  variant,
  cluster = [],
  breakpoint,
}: {
  /** Id único por breakpoint, para poder capturar cada uno por separado. */
  ancla: string;
  variant: IntroVariant;
  /** Capas compartidas, definidas en el lienzo mobile y transformadas al vuelo. */
  cluster?: IntroLayer[];
  breakpoint: Breakpoint;
}) {
  const { t } = useTranslation();
  const { canvas, group, own, texts } = variant;
  const maxW = ANCHO_MAXIMO[breakpoint];

  const pct = (v: number, eje: 'width' | 'height') => `${(v / canvas[eje]) * 100}%`;
  // El tipo crece con el lienzo y se congela cuando este llega a su ancho máximo.
  const fuente = (px: number) =>
    `min(${(px / canvas.width) * 100}vw, ${(px / canvas.width) * maxW}px)`;

  const capas: ReactNode[] = [];
  own.forEach((l, i) => capas.push(<Capa key={`own-${i}`} layer={l} canvas={canvas} />));
  cluster.forEach((l, i) =>
    capas.push(<Capa key={`grp-${i}`} layer={transformar(l, group)} canvas={canvas} />)
  );

  return (
    <div
      id={ancla}
      className="relative mx-auto w-full overflow-hidden"
      style={{ maxWidth: maxW, aspectRatio: `${canvas.width} / ${canvas.height}` }}
    >
      {capas}
      {texts.map((txt, i) => (
        <div
          key={i}
          className={`absolute leading-[1.25] text-black ${txt.align === 'center' ? 'text-center' : 'text-left'} ${txt.bold ? 'font-bold' : ''}`}
          style={{
            left: pct(txt.left, 'width'),
            top: pct(txt.top, 'height'),
            width: pct(txt.width, 'width'),
            letterSpacing: txt.tracking,
          }}
        >
          {txt.paragraphs.map((claves, j) => (
            <p key={j} style={{ fontSize: fuente(txt.size) }}>
              {renderTextWithMarks(claves.map(c => t(c)).join(' '))}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Introducción: los 3 pasos con los que abre la web. Completamente estática: no hay
 * scroll-driven, ni GSAP, ni botón de saltar. Lo que se ve al llegar es lo que hay.
 */
export default function IntroSection() {
  const { t } = useTranslation();

  const pasos = [
    { id: 'intro-paso-1', variants: STEP_1_VARIANTS, cluster: STEP_1_CLUSTER },
    { id: 'intro-paso-2', variants: STEP_2_VARIANTS, cluster: undefined },
    { id: 'intro-paso-3', variants: STEP_3_VARIANTS, cluster: undefined },
  ];

  return (
    <section aria-label={t('intro.label')} className="relative w-full">
      {(['mobile', 'tablet', 'desktop'] as const).map(bp => (
        <div key={bp} className={VISIBILIDAD[bp]}>
          {pasos.map(paso => {
            // Si un paso todavía no tiene variante propia para este breakpoint, se
            // muestra la de mobile. Así se puede avanzar paso por paso.
            const variant = paso.variants[bp] ?? paso.variants.mobile;
            if (!variant) return null;
            const esPropia = Boolean(paso.variants[bp]);
            return (
              <Paso
                key={paso.id}
                ancla={bp === 'mobile' ? paso.id : `${paso.id}-${bp}`}
                variant={variant}
                cluster={paso.cluster}
                breakpoint={esPropia ? bp : 'mobile'}
              />
            );
          })}
        </div>
      ))}
    </section>
  );
}
