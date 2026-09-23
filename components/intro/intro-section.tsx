'use client';

import gsap from 'gsap';
import Image from 'next/image';
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { renderTextWithMarks } from '../../lib/render-text-with-bold';
import {
  INTRO_STEPS,
  type Breakpoint,
  type GroupTransform,
  type IntroLayer,
  type IntroStep,
  type IntroVariant,
} from './intro.data';
import { crearLlegada, limpiarBienvenida } from './bienvenida.motion';
import { crearAsomo, crearEntrada, crearReposo, crearTransicion, limpiar } from './intro.motion';
import { useBreakpoint } from './use-breakpoint';
import { useIntroPin } from './use-intro-pin';

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
  indice,
  sangra = false,
  eager = false,
}: {
  layer: IntroLayer;
  canvas: { width: number; height: number };
  /** Posición de la capa dentro de su paso; va a `data-i` para la coreografía. */
  indice: number;
  /** La capa se estira hasta los bordes de la pantalla, anclada por su borde inferior. */
  sangra?: boolean;
  /** Con el pin, las imágenes se piden en el acto: la transición no puede esperar al lazy. */
  eager?: boolean;
}) {
  const { box, rotate, inner, inset, opacity, flipY } = layer;
  const pct = (v: number, eje: 'width' | 'height') => `${(v / canvas[eje]) * 100}%`;

  // Los SVG del diseño traen preserveAspectRatio="none": se estiran a su caja, que es
  // lo que queremos porque las proporciones ya vienen en los datos.
  const img = (
    <Image src={layer.src} alt="" fill sizes="100vw" loading={eager ? 'eager' : undefined} />
  );
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

  // La caja exterior es la que anima la coreografía (`data-rol`). Si el diseño baja la opacidad,
  // va en una caja interior, para que la animación no la pise al terminar.
  const contenido =
    rotate !== undefined && inner ? (
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
    );

  return (
    <div className="absolute" style={caja} data-rol={layer.rol} data-i={indice}>
      {opacity === undefined ? (
        contenido
      ) : (
        <div className="h-full w-full" style={{ opacity }}>
          {contenido}
        </div>
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
  eager = false,
  agrupar = false,
}: {
  /** Id único por breakpoint, para poder capturar cada uno por separado. */
  ancla: string;
  variant: IntroVariant;
  /** Grupos de capas compartidos, definidos en el lienzo mobile y transformados al vuelo. */
  groups: Record<string, IntroLayer[]>;
  breakpoint: Breakpoint;
  eager?: boolean;
  /**
   * Con el pin, cada grupo va en un envoltorio del tamaño del lienzo (no cambia nada en reposo):
   * es lo que mueve el movimiento en reposo del barco, con la persona dentro (D5).
   */
  agrupar?: boolean;
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
  own.forEach((l, i) =>
    capas.push(
      <Capa key={`own-${i}`} layer={l} canvas={canvas} indice={capas.length} eager={eager} />
    )
  );
  let indice = capas.length;
  Object.entries(groups).forEach(([nombre, layers]) => {
    const g = variant.groups?.[nombre] ?? SIN_TRANSFORMAR;
    const delGrupo = layers.map((l, i) => (
      <Capa
        key={`${nombre}-${i}`}
        layer={transformar(l, g)}
        canvas={canvas}
        indice={indice++}
        sangra={sangran.has(nombre)}
        eager={eager}
      />
    ));
    if (agrupar) {
      capas.push(
        <div key={nombre} className="absolute inset-0" data-grupo={nombre}>
          {delGrupo}
        </div>
      );
    } else {
      capas.push(...delGrupo);
    }
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
            <p key={j} style={{ fontSize: fuente(txt.size) }} data-rol={txt.rol ?? 'texto'}>
              {renderTextWithMarks(claves.map(c => t(c)).join(' '))}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Si un paso no tiene variante propia para un breakpoint, se muestra la de mobile. Así se
 * puede avanzar paso por paso sin romper nada.
 */
function resolverPaso(paso: IntroStep, bp: Breakpoint) {
  const propia = paso.variants[bp];
  return {
    ancla: bp === 'mobile' ? paso.id : `${paso.id}-${bp}`,
    variant: propia ?? paso.variants.mobile,
    breakpoint: propia ? bp : ('mobile' as Breakpoint),
  };
}

/**
 * Pide por adelantado las imágenes de las 3 partes del breakpoint activo. Con el pin solo se
 * monta la parte que se ve; sin esto, las piezas de la parte que entra llegarían tarde a su
 * propia animación. Mismas props que `Capa`, así el navegador reutiliza la misma descarga.
 */
function PrecargaImagenes({ breakpoint }: { breakpoint: Breakpoint }) {
  const srcs = new Set<string>();
  INTRO_STEPS.forEach(paso => {
    const { variant } = resolverPaso(paso, breakpoint);
    variant.own.forEach(l => srcs.add(l.src));
    Object.values(paso.groups).forEach(ls => ls.forEach(l => srcs.add(l.src)));
  });
  return (
    <div aria-hidden className="hidden">
      {Array.from(srcs).map(src => (
        <div key={src} className="relative">
          <Image src={src} alt="" fill sizes="100vw" loading="eager" />
        </div>
      ))}
    </div>
  );
}

/** La entrada de la parte 1 espera a sus imágenes, pero nunca más de esto. */
const ESPERA_IMAGENES_MS = 500;

function imagenesListas(raiz: HTMLElement): Promise<void> {
  const pendientes = Array.from(raiz.querySelectorAll('img'))
    .filter(img => !img.complete)
    .map(img => new Promise<void>(r => img.addEventListener('load', () => r(), { once: true })));
  return Promise.race([
    Promise.all(pendientes).then(() => undefined),
    new Promise<void>(r => setTimeout(r, ESPERA_IMAGENES_MS)),
  ]);
}

/**
 * Introducción: las 3 partes con las que abre la web.
 *
 * El primer render (servidor y primer paint de cliente) es SIEMPRE el markup estático: los 9
 * bloques (3 partes x 3 breakpoints) apilados, sin capa fija ni listeners. Es también lo que
 * se queda con `prefers-reduced-motion` o con un `#hash` en la URL. Tras montar, `useIntroPin`
 * decide si activar el pin: la intro ocupa una pantalla y cada gesto pasa a la parte siguiente
 * con una coreografía de GSAP (`intro.motion.ts`). Mecánica y porqués en
 * docs/introduccion/DECISIONES.md, D2.
 */
export default function IntroSection() {
  const { t } = useTranslation();
  const pin = useIntroPin(INTRO_STEPS.length);
  const breakpoint = useBreakpoint();
  const pasosRef = useRef<(HTMLDivElement | null)[]>([]);
  const { transicion, entrada, llegada, timelineRef, terminarTransicion, terminarLlegada } = pin;

  /**
   * Cambia cada vez que la intro queda quieta tras una entrada o una transición: es cuando
   * arranca el movimiento en reposo (D5).
   */
  const [reposo, setReposo] = useState(0);
  /** `?quieto=1` congela el movimiento en reposo, para comparar capturas (docs/PATTERNS.md). */
  const quieto = useRef(false);
  /** La persona de la parte 3 se asoma después de la transición que lleva a ella. */
  const personaPendiente = useRef(false);

  useEffect(() => {
    quieto.current = new URLSearchParams(window.location.search).get('quieto') === '1';
  }, []);

  // Con `?introPaso=N` no hay entrada: la intro ya está quieta desde que se activa el pin.
  useEffect(() => {
    if (pin.mode === 'pin' && pin.entrada === 0) setReposo(r => r + 1);
  }, [pin.mode, pin.entrada]);

  // La transición se arma antes del primer pintado de la parte que entra, para que no asome
  // en su sitio final ni un fotograma. `gsap.context` deshace todo al desmontar (StrictMode
  // monta dos veces en desarrollo).
  useLayoutEffect(() => {
    if (!transicion) return;
    const origen = pasosRef.current[transicion.desde];
    const destino = pasosRef.current[transicion.hacia];
    if (!origen || !destino) {
      terminarTransicion();
      return;
    }
    // El sol, el barco y las olas solo viajan entre las partes 2 y 3.
    const continuidad = Math.min(transicion.desde, transicion.hacia) === 1;
    // Hacia la parte 3 la persona se asomará al final; desde ella, se esconde con la salida.
    personaPendiente.current = !!destino.querySelector('[data-rol="persona"]');
    const ctx = gsap.context(() => {
      const tl = crearTransicion(origen, destino, transicion.sentido, continuidad);
      tl.eventCallback('onComplete', () => {
        limpiar(destino);
        terminarTransicion();
        setReposo(r => r + 1);
      });
      timelineRef.current = tl;
      tl.play();
    });
    return () => ctx.revert();
  }, [transicion, timelineRef, terminarTransicion]);

  // Llegada a Bienvenida desde la parte 3 (D6). Todo antes del primer pintado: las piezas de
  // Bienvenida se ocultan, la página se asienta en Bienvenida por debajo de la capa fija (que
  // deja de pintar su fondo en este mismo render) y la parte 3 sigue encima, en su sitio, para
  // salir con su coreografía. Como la capa es fija y Bienvenida está oculta, el salto de scroll
  // no se ve. Al terminar, la capa se suelta y el scroll vuelve a ser nativo.
  useLayoutEffect(() => {
    if (!llegada) return;
    const origen = pasosRef.current[INTRO_STEPS.length - 1];
    const bienvenida = document.getElementById('bienvenida');
    // La persona de la parte 3 no se asoma: sale con la intro, desde donde esté.
    personaPendiente.current = false;
    if (!origen || !bienvenida) {
      terminarLlegada();
      return;
    }
    // El botón flotante de Súmate espera a que termine (tapaba el de saltar).
    document.documentElement.setAttribute('data-intro-llegando', '');
    // Primero se desplaza (sin animación: la capa fija lo tapa) y luego se mide: la llegada
    // lleva el sol rojo al sitio del rosado en pantalla.
    window.scrollTo({
      top: bienvenida.getBoundingClientRect().top + window.scrollY,
      behavior: 'instant',
    });
    const ctx = gsap.context(() => {
      const { tl, deshacer } = crearLlegada(origen, bienvenida);
      tl.eventCallback('onComplete', () => {
        limpiarBienvenida(bienvenida);
        terminarLlegada();
      });
      timelineRef.current = tl;
      tl.play();
      return deshacer;
    });
    return () => {
      ctx.revert();
      document.documentElement.removeAttribute('data-intro-llegando');
    };
  }, [llegada, timelineRef, terminarLlegada]);

  // Entrada de la parte 1: al cargar y cada vez que la intro reaparece subiendo desde abajo.
  useLayoutEffect(() => {
    if (!entrada) return;
    const raiz = pasosRef.current[0];
    if (!raiz) return;
    let vivo = true;
    const ctx = gsap.context(() => {
      const tl = crearEntrada(raiz);
      tl.eventCallback('onComplete', () => {
        limpiar(raiz);
        if (timelineRef.current === tl) timelineRef.current = null;
        setReposo(r => r + 1);
      });
      timelineRef.current = tl;
      imagenesListas(raiz).then(() => {
        if (vivo) tl.play();
      });
    });
    return () => {
      vivo = false;
      ctx.revert();
    };
  }, [entrada, timelineRef]);

  // La persona se asoma como nota aparte, cuando la transición ya terminó: no alarga el bloqueo
  // de gestos. Va en un efecto de layout para quedar escondida en el mismo commit en que el
  // contexto de la transición se deshace (que la dejaría visible). Si llega un gesto, el asomo se
  // mata SIN revertir: la salida la esconde desde donde esté, sin salto.
  useLayoutEffect(() => {
    if (transicion || llegada || !personaPendiente.current) return;
    const raiz = pasosRef.current[pin.stepIndex];
    if (!raiz) return;
    const tween = crearAsomo(raiz);
    tween?.eventCallback('onComplete', () => {
      personaPendiente.current = false;
      const persona = raiz.querySelector('[data-rol="persona"]');
      if (persona) gsap.set(persona, { clearProps: 'transform,clipPath' });
    });
    return () => {
      tween?.kill();
    };
  }, [transicion, llegada, pin.stepIndex]);

  // Movimiento en reposo: arranca cuando la intro queda quieta y se detiene (volviendo suave a
  // su sitio) en cuanto empieza una transición. Se pausa fuera de pantalla y con la pestaña
  // oculta. Con `?quieto=1` no hay.
  useEffect(() => {
    if (pin.mode !== 'pin' || transicion || llegada || !reposo || quieto.current) return;
    // Mientras corre la entrada de la parte 1, espera: su final vuelve a disparar este efecto.
    if (timelineRef.current) return;
    const raiz = pasosRef.current[pin.stepIndex];
    if (!raiz) return;
    const r = crearReposo(raiz);
    let visible = true;
    const actualizar = () => (visible && !document.hidden ? r.reanudar() : r.pausar());
    const io = new IntersectionObserver(([en]) => {
      visible = !!en?.isIntersecting;
      actualizar();
    });
    if (pin.placeholderRef.current) io.observe(pin.placeholderRef.current);
    document.addEventListener('visibilitychange', actualizar);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', actualizar);
      r.detener();
    };
  }, [
    pin.mode,
    pin.stepIndex,
    pin.placeholderRef,
    transicion,
    llegada,
    reposo,
    entrada,
    breakpoint,
    timelineRef,
  ]);

  // Si el breakpoint cambia a media transición, las piezas animadas ya no existen: se termina.
  // Solo cuenta un cambio real con el pin ya activo: el paso de 'mobile' (valor de arranque de
  // useBreakpoint) al breakpoint de verdad llega en el mismo render que activa el pin, y
  // terminar ahí mataba la entrada de la parte 1 en tablet y desktop.
  const breakpointPrevio = useRef<Breakpoint | null>(null);
  useEffect(() => {
    if (pin.mode !== 'pin') return;
    if (breakpointPrevio.current && breakpointPrevio.current !== breakpoint) {
      timelineRef.current?.progress(1);
    }
    breakpointPrevio.current = breakpoint;
  }, [pin.mode, breakpoint, timelineRef]);

  if (pin.mode === 'fallback') {
    return (
      <section
        aria-label={t('intro.label')}
        className="relative w-full overflow-x-clip"
        data-intro-estatica=""
      >
        {(['mobile', 'tablet', 'desktop'] as const).map(bp => (
          <div key={bp} className={VISIBILIDAD[bp]}>
            {INTRO_STEPS.map(paso => (
              <Paso key={paso.id} groups={paso.groups} {...resolverPaso(paso, bp)} />
            ))}
          </div>
        ))}
      </section>
    );
  }

  // Quieta, solo está montada la parte actual; durante una transición, la saliente y la
  // entrante, esta encima.
  const montados = transicion ? [transicion.desde, transicion.hacia] : [pin.stepIndex];

  return (
    <section
      aria-label={t('intro.label')}
      className="relative w-full overflow-x-clip"
      data-paso={pin.stepIndex + 1}
    >
      {/* Ocupa una pantalla en el flujo, sin importar la parte: el avance es por gestos, no
          por distancia de scroll. Enganchada, la misma caja pasa a `fixed` sin remontarse, y
          como solo engancha con la página arriba del todo, no se mueve ni un píxel. */}
      <div ref={pin.placeholderRef} className="relative h-dvh w-full">
        <div
          // Durante la llegada a Bienvenida la capa sigue fija pero sin fondo: debajo ya está
          // Bienvenida, con sus piezas ocultas, sobre el mismo beige de la página (D6).
          className={`inset-0 overflow-hidden ${pin.engaged ? `fixed z-40 ${llegada ? '' : 'bg-beige'}` : 'absolute'}`}
        >
          {montados.map(i => {
            const paso = INTRO_STEPS[i];
            return (
              <div
                key={paso.id}
                ref={el => {
                  pasosRef.current[i] = el;
                }}
                aria-hidden={i !== pin.stepIndex || undefined}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Paso groups={paso.groups} eager agrupar {...resolverPaso(paso, breakpoint)} />
              </div>
            );
          })}
          <PrecargaImagenes breakpoint={breakpoint} />
          {pin.engaged && pin.saltarVisible && (
            <button
              ref={pin.saltarRef}
              type="button"
              onClick={pin.saltar}
              className="absolute bottom-6 right-page-margin z-10 rounded-full border border-black/10 bg-white/80 px-5 py-2 text-sm font-bold text-black shadow-lg backdrop-blur-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue"
            >
              {t('intro.saltar')}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
