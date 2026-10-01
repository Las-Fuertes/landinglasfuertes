'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState, type CSSProperties } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { CURVA, sinAceleracion } from '../education-map/coreografia';
import { Resaltado } from '../layout/resaltado';
import { INTEGRANTES, type Encuadre, type Integrante, type Pajaro } from './quienes-somos.data';
import estilos from './quienes-somos.module.css';

/** Una medida del lienzo de Figma, escalada por `--k` (ver `quienes-somos.module.css`). */
const k = (px: number) => `calc(${px}px * var(--k))`;

const RUTA = '/images/quienes-somos';

/**
 * Coreografía de entrada (docs/quienes-somos/DECISIONES.md, D1). Pausada y por capas: el nombre y
 * el cargo llegan primero, la foto se asienta un instante después y los pájaros, que son un
 * detalle, llegan tarde y lineales, sin rebote. En desktop las fichas de una fila se escalonan
 * por columna.
 */
const ENTRADA = {
  texto: { duracion: 0.8, retraso: 0 },
  foto: { duracion: 0.95, retraso: 0.12 },
  pajaro: { duracion: 0.7, retraso: 0.75 },
  /** Entre columnas de una misma fila, en desktop. */
  columna: 0.18,
} as const;

const VISTA = { once: true, margin: '-80px' } as const;

/**
 * Con `prefers-reduced-motion` las variantes son las mismas pero con duración y retraso 0: todo
 * aparece de golpe. No se juega con `initial={false}` porque `useReducedMotion` puede llegar
 * tarde al primer render y el `initial` solo se lee al montar.
 */
function variantes(base: number, animar: boolean): Record<'texto' | 'foto' | 'pajaro', Variants> {
  return {
    texto: {
      oculto: { opacity: 0, y: 16 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: animar ? ENTRADA.texto.duracion : 0,
          delay: animar ? base + ENTRADA.texto.retraso : 0,
          ease: CURVA.entrada,
        },
      },
    },
    foto: {
      oculto: { opacity: 0, scale: 0.92 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: animar ? ENTRADA.foto.duracion : 0,
          delay: animar ? base + ENTRADA.foto.retraso : 0,
          ease: CURVA.entrada,
        },
      },
    },
    pajaro: {
      oculto: { opacity: 0, x: -14, y: 10 },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration: animar ? ENTRADA.pajaro.duracion : 0,
          delay: animar ? base + ENTRADA.pajaro.retraso : 0,
          ease: 'linear',
        },
      },
    },
  };
}

/**
 * Columnas de la rejilla según el ancho: 1 en mobile, 2 en tablet, 3 desde 1024. Solo decide el
 * escalonado de la entrada por columna, nunca el layout (ese va en CSS).
 */
function useColumnas() {
  const [columnas, setColumnas] = useState(1);
  useEffect(() => {
    const tablet = window.matchMedia('(min-width: 768px)');
    const desktop = window.matchMedia('(min-width: 1024px)');
    const actualizar = () => setColumnas(desktop.matches ? 3 : tablet.matches ? 2 : 1);
    actualizar();
    tablet.addEventListener('change', actualizar);
    desktop.addEventListener('change', actualizar);
    return () => {
      tablet.removeEventListener('change', actualizar);
      desktop.removeEventListener('change', actualizar);
    };
  }, []);
  return columnas;
}

/** Columna de la ficha: en desktop las filas son de 3, 3 y 2; en tablet, de 2. */
function columnaDe(i: number, columnas: number) {
  if (columnas === 3) return i < 6 ? i % 3 : i - 6;
  return columnas === 2 ? i % 2 : 0;
}

const pct = (n: number) => `${(n * 100).toFixed(2)}%`;

function varsEncuadre(desktop: Encuadre, mobile: Encuadre = desktop) {
  return {
    '--m-x': pct(mobile.x),
    '--m-y': pct(mobile.y),
    '--m-ancho': pct(mobile.ancho),
    '--m-alto': pct(mobile.alto),
    '--d-x': pct(desktop.x),
    '--d-y': pct(desktop.y),
    '--d-ancho': pct(desktop.ancho),
    '--d-alto': pct(desktop.alto),
  } as CSSProperties;
}

function PajaroDibujo({
  pajaro,
  className,
  variants,
}: {
  pajaro: Pajaro;
  className: string;
  variants: Variants;
}) {
  const { color, forma, x, y, ancho } = pajaro;
  // Los dos trazos de Figma: 60 x 75,11 el grande y 43,97 x 54,76 el chico.
  const proporcion = forma === 'grande' ? 75.11 / 60.0129 : 54.7578 / 43.9656;
  return (
    <motion.div
      variants={variants}
      onUpdate={sinAceleracion}
      className={`pointer-events-none absolute ${className}`}
      style={{ left: k(x), top: k(y), width: k(ancho), height: k(ancho * proporcion) }}
      aria-hidden="true"
    >
      {/* El giro de Figma va en la imagen: el `transform` del contenedor es de la entrada. */}
      <img
        src={`${RUTA}/pajaros-${color}-${forma}.svg`}
        alt=""
        className="block size-full rotate-[-14.98deg]"
      />
    </motion.div>
  );
}

function Foto({
  integrante,
  index,
  v,
}: {
  integrante: Integrante;
  index: number;
  v: ReturnType<typeof variantes>;
}) {
  const { slug, name, size, encuadre, encuadreMobile, pajaro } = integrante;
  return (
    <div className="relative flex-none" style={{ width: k(size), height: k(size) }}>
      <motion.div variants={v.foto} onUpdate={sinAceleracion} className="absolute inset-0">
        <div className="absolute inset-0 overflow-hidden rounded-full">
          {/* El recorte de la máscara de Figma: la imagen ocupa su caja y el círculo la corta. */}
          <div
            className={`absolute ${estilos.encuadre}`}
            style={varsEncuadre(encuadre, encuadreMobile)}
          >
            <Image
              src={`${RUTA}/2026-09/${slug}.jpg`}
              alt={name}
              fill
              sizes="(min-width: 1536px) 480px, (min-width: 1024px) 420px, (min-width: 768px) 500px, 400px"
              className="object-cover"
            />
          </div>
        </div>
        {/* El anillo dibujado a mano. Es el mismo trazo en todas las fotos; girarlo un poco en
            cada una evita que se note la repetición (docs/secciones-impacto, D21). */}
        <div
          className="pointer-events-none absolute inset-[-1.1%_-1.4%_-1.1%_-1.1%]"
          style={{ transform: `rotate(${(index * 47) % 360}deg)` }}
        >
          <Image src={`${RUTA}/anillo.svg`} alt="" fill />
        </div>
      </motion.div>
      <PajaroDibujo pajaro={pajaro.mobile} className="md:hidden" variants={v.pajaro} />
      <PajaroDibujo pajaro={pajaro.desktop} className="hidden md:block" variants={v.pajaro} />
    </div>
  );
}

function Persona({
  integrante,
  index,
  base,
  animar,
}: {
  integrante: Integrante;
  index: number;
  base: number;
  animar: boolean;
}) {
  const { t } = useTranslation();
  const { name, role, side, bleed = 0, corrimiento = 0, aire = 0, bajaDesktop = 0 } = integrante;
  const centrado = side === 'center';
  const v = variantes(base, animar);

  // Las medidas propias de cada ficha viajan como variables CSS: un `style` en línea no lo puede
  // pisar una clase de breakpoint, y en desktop el sangrado y el aire de mobile sobran.
  const vars = {
    '--aire': k(aire),
    '--sangra': k(-bleed),
    '--corre': k(corrimiento),
    '--baja': k(bajaDesktop),
  } as CSSProperties;

  const fila =
    side === 'left'
      ? 'flex-row gap-l'
      : side === 'right'
        ? 'flex-row-reverse gap-l'
        : 'flex-col text-center';

  return (
    <motion.li
      initial="oculto"
      whileInView="visible"
      viewport={VISTA}
      className={`flex items-center mt-[var(--aire)] ${fila} md:mt-0 md:w-[var(--ficha)] md:flex-col md:items-center md:gap-0 md:text-center`}
      style={vars}
    >
      <div
        className={`${
          side === 'left'
            ? 'ml-[var(--sangra)]'
            : side === 'right'
              ? 'mr-[var(--sangra)]'
              : 'relative left-[var(--corre)]'
        } md:static md:mx-0 md:mt-[var(--baja)]`}
      >
        <Foto integrante={integrante} index={index} v={v} />
      </div>
      {/* El nombre no se parte nunca. En mobile, con la foto a la izquierda, el bloque se sale un
          poco del margen derecho: en el diseño el chip se acerca al borde más que el texto. */}
      <motion.div
        variants={v.texto}
        onUpdate={sinAceleracion}
        className={`min-w-0 ${centrado ? 'mt-[var(--al-nombre)]' : 'flex-1'} ${
          side === 'left' ? 'mr-[var(--sobra)]' : ''
        } md:mr-0 md:mt-[var(--al-nombre)] md:flex md:w-full md:flex-none md:flex-col md:items-center`}
      >
        <Resaltado
          partir={false}
          className="tracking-[-0.04em]"
          style={{ fontSize: 'var(--nombre)' }}
        >
          {name}
        </Resaltado>
        <p
          className={`mt-s leading-snug text-black [text-wrap:balance] ${centrado ? 'mx-auto' : ''} md:mx-auto`}
          style={{ fontSize: 'var(--cargo)', maxWidth: k(integrante.anchoCargo + 30) }}
        >
          {t(`quienesSomos.roles.${role}`)}
        </p>
      </motion.div>
    </motion.li>
  );
}

/** Las dos conchas rosadas sobre el título (grupo 275 de Figma, 97 x 78). */
function Conchas({ animar }: { animar: boolean }) {
  return (
    <motion.div
      aria-hidden="true"
      className="relative mx-auto"
      style={{ width: k(97.33), height: k(77.62), left: k(10) }}
      initial={{ opacity: 0, y: -10, rotate: -6 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={VISTA}
      transition={animar ? { duration: 0.9, delay: 0.5, ease: CURVA.entrada } : { duration: 0 }}
      onUpdate={sinAceleracion}
    >
      <img
        src={`${RUTA}/concha-a.svg`}
        alt=""
        className="absolute block max-w-none rotate-[-18.06deg]"
        style={{ left: k(3.54), top: k(6.61), width: k(64.86), height: k(48.17) }}
      />
      <img
        src={`${RUTA}/concha-b.svg`}
        alt=""
        className="absolute block max-w-none"
        style={{
          left: k(40.59),
          top: k(32.12),
          width: k(54.15),
          height: k(40.37),
          transform: 'rotate(161.94deg) scaleY(-1)',
        }}
      />
    </motion.div>
  );
}

/**
 * Quiénes somos: el equipo, justo antes del footer. Mobile según Figma `1219:985` (filas con la
 * foto a un lado, dos centradas) y tablet como esa composición agrandada; desktop según
 * `1437:1518`, rejilla centrada de 3, 3 y 2 (docs/quienes-somos/DECISIONES.md).
 */
export default function QuienesSomosSection() {
  const { t } = useTranslation();
  const reducido = useReducedMotion();
  const columnas = useColumnas();
  const animar = !reducido;

  const entradaTexto = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: VISTA,
    transition: animar ? { duration: 0.85, delay, ease: CURVA.entrada } : { duration: 0 },
    onUpdate: sinAceleracion,
  });

  return (
    <section
      id="quienes-somos"
      aria-labelledby="quienes-somos-title"
      className={`w-full overflow-x-clip bg-cream ${estilos.seccion}`}
    >
      <div className="mx-auto w-full px-page-margin" style={{ maxWidth: 'var(--ancho)' }}>
        <Conchas animar={animar} />
        <motion.h2
          {...entradaTexto(0)}
          id="quienes-somos-title"
          className="mt-[var(--al-titulo)] text-center text-h2 font-bold leading-[1.1] tracking-[-0.04em] text-black md:text-h1 md:font-bold md:leading-[1.1]"
        >
          {t('quienesSomos.title')}
        </motion.h2>
        {/* Aire título y texto: el de Figma (unos 45 px en los dos frames). */}
        <motion.p
          {...entradaTexto(0.15)}
          className="mt-xl leading-normal text-black md:mx-auto md:max-w-[51.25rem]"
          style={{ fontSize: 'var(--parrafo)' }}
        >
          {t('quienesSomos.text')}
        </motion.p>

        <ul
          className="flex flex-col md:flex-row md:flex-wrap md:justify-center md:gap-y-l"
          style={{ marginTop: 'var(--antes-equipo)' }}
        >
          {INTEGRANTES.map((integrante, i) => (
            <Persona
              key={integrante.slug}
              integrante={integrante}
              index={i}
              base={columnaDe(i, columnas) * ENTRADA.columna}
              animar={animar}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
