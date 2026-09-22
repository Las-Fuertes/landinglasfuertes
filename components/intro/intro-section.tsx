import Image from 'next/image';
import type { ReactNode } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { renderTextWithMarks } from '../../lib/render-text-with-bold';
import {
  INTRO_STEPS,
  type Breakpoint,
  type GroupTransform,
  type IntroLayer,
  type IntroVariant,
} from './intro.data';

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

const SIN_TRANSFORMAR: GroupTransform = { scale: 1, dx: 0, dy: 0 };

/** Aplica la transformación del grupo a una capa definida en el lienzo mobile. */
function transformar(layer: IntroLayer, g: GroupTransform): IntroLayer {
  if (g === SIN_TRANSFORMAR) return layer;
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

function Capa({
  layer,
  canvas,
  sangra = false,
}: {
  layer: IntroLayer;
  canvas: { width: number; height: number };
  /** La capa se estira hasta los bordes de la pantalla, anclada por su borde inferior. */
  sangra?: boolean;
}) {
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

  // Una capa que sangra conserva su proporción y se ancla por abajo, para que la línea donde
  // el horizonte toca el agua no se mueva cuando la pantalla crece. El 104% deja un poco de
  // margen para que el filo del trazo nunca quede justo en el borde.
  const caja = sangra
    ? {
        left: 'calc(50% - 52vw)',
        bottom: pct(canvas.height - (box.top + box.height), 'height'),
        width: '104vw',
        height: `calc(104vw * ${(box.height / box.width).toFixed(5)})`,
      }
    : {
        left: pct(box.left, 'width'),
        top: pct(box.top, 'height'),
        width: pct(box.width, 'width'),
        height: pct(box.height, 'height'),
      };

  return (
    <div className="absolute" style={{ ...caja, opacity }}>
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
  groups,
  breakpoint,
}: {
  /** Id único por breakpoint, para poder capturar cada uno por separado. */
  ancla: string;
  variant: IntroVariant;
  /** Grupos de capas compartidos, definidos en el lienzo mobile y transformados al vuelo. */
  groups: Record<string, IntroLayer[]>;
  breakpoint: Breakpoint;
}) {
  const { t } = useTranslation();
  const { canvas, own, texts } = variant;
  const maxW = ANCHO_MAXIMO[breakpoint];

  const pct = (v: number, eje: 'width' | 'height') => `${(v / canvas[eje]) * 100}%`;
  // El tipo crece con el lienzo y se congela cuando este llega a su ancho máximo.
  const fuente = (px: number) =>
    `min(${(px / canvas.width) * 100}vw, ${(px / canvas.width) * maxW}px)`;

  const sangran = new Set(variant.sangra ?? []);
  const capas: ReactNode[] = [];
  own.forEach((l, i) => capas.push(<Capa key={`own-${i}`} layer={l} canvas={canvas} />));
  Object.entries(groups).forEach(([nombre, layers]) => {
    const g = variant.groups?.[nombre] ?? SIN_TRANSFORMAR;
    layers.forEach((l, i) =>
      capas.push(
        <Capa
          key={`${nombre}-${i}`}
          layer={transformar(l, g)}
          canvas={canvas}
          sangra={sangran.has(nombre)}
        />
      )
    );
  });

  return (
    <div
      id={ancla}
      // Solo el paso que tiene capas que sangran deja pasar algo por los lados; los demás
      // siguen recortando en el lienzo, tal como estaban. Arriba y abajo se recorta siempre,
      // para que un paso no invada al siguiente.
      className={`relative mx-auto w-full ${sangran.size > 0 ? 'overflow-y-clip' : 'overflow-hidden'}`}
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

  return (
    <section aria-label={t('intro.label')} className="relative w-full overflow-x-clip">
      {(['mobile', 'tablet', 'desktop'] as const).map(bp => (
        <div key={bp} className={VISIBILIDAD[bp]}>
          {INTRO_STEPS.map(paso => {
            // Si un paso no tiene variante propia para este breakpoint, se muestra
            // la de mobile. Así se puede avanzar paso por paso sin romper nada.
            const propia = paso.variants[bp];
            return (
              <Paso
                key={paso.id}
                ancla={bp === 'mobile' ? paso.id : `${paso.id}-${bp}`}
                variant={propia ?? paso.variants.mobile}
                groups={paso.groups}
                breakpoint={propia ? bp : 'mobile'}
              />
            );
          })}
        </div>
      ))}
    </section>
  );
}
