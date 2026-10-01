import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Botón del formulario según Figma `1300:1865` (docs/sumate-drawer/DECISIONES.md, D3): esquina
 * apenas redondeada, 48 px de alto, extrabold 14 en mayúsculas, texto `papel`. Todos los CTA van
 * en azul: el blanco sobre naranja o rosa no llega al contraste AA.
 */
const CTA_BASE =
  'inline-flex min-h-12 w-full items-center justify-center rounded px-7 py-s text-center text-sm font-extrabold uppercase leading-tight tracking-tight transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-papel md:w-auto';

/** Tonos del marco rasgado. El fondo de dentro es un papel apenas más claro que el del modal. */
const TONOS_MARCO = {
  azul: 'bg-blue',
  negro: 'bg-black',
  /** Figma `rgba(102,102,102,0.44)` sobre papel: un gris tibio, para la caja de Estados Unidos. */
  gris: 'bg-black/30',
} as const;

const GROSOR_MARCO = {
  fino: 'inset-0.5',
  grueso: 'inset-[0.1875rem]',
} as const;

/**
 * Marco de papel rasgado, el borde de las tarjetas del sitio (el modal del mapa, la cinta de
 * Donaciones): una capa de color con el filtro `map-rough-edge` y encima un recuadro de papel con
 * el mismo filtro, más chico por el grosor del borde. Va detrás del contenido como capa aparte,
 * así el texto no se deforma. El padre tiene que ser `relative` y llevar su contenido en `relative`.
 */
export function MarcoRasgado({
  tono = 'azul',
  grosor = 'grueso',
  sombra = false,
  relleno = 'bg-white/50',
}: {
  tono?: keyof typeof TONOS_MARCO;
  grosor?: keyof typeof GROSOR_MARCO;
  sombra?: boolean;
  /** Fondo de dentro. Por defecto, papel aclarado (Figma #FFF8F0 sobre #FFF5E8). */
  relleno?: string;
}) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      <span
        className={`absolute inset-0 ${TONOS_MARCO[tono]} ${
          sombra
            ? '[filter:url(#map-rough-edge)_drop-shadow(0.25rem_0.25rem_0.4rem_rgb(0_0_0/0.11))]'
            : '[filter:url(#map-rough-edge)]'
        }`}
      />
      {/* El relleno va dentro del recuadro filtrado: así se rasga con él y no asoma recto
          sobre el borde. */}
      <span className={`absolute ${GROSOR_MARCO[grosor]} bg-papel [filter:url(#map-rough-edge)]`}>
        <span className={`absolute inset-0 ${relleno}`} />
      </span>
    </span>
  );
}

export function CtaLink({
  children,
  className = '',
  colorClassName = 'bg-blue text-papel hover:bg-blue-300',
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; colorClassName?: string }) {
  return (
    <a className={`${CTA_BASE} ${colorClassName} ${className}`.trim()} {...rest}>
      {children}
    </a>
  );
}

export function CtaButton({
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="button"
      className={`${CTA_BASE} bg-blue text-papel hover:bg-blue-300 disabled:cursor-not-allowed disabled:bg-black/15 disabled:text-black ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

/** CTA deshabilitado con microcopy cuando falta configuración ("Pronto disponible").
 *  Sin altura fija: el microcopy puede ocupar dos líneas en mobile. Texto negro sobre gris
 *  claro, para que se lea (AA) aunque esté apagado. `sobreAzul` es para los bloques de fondo
 *  azul (Llegue-Llegue): el negro sobre azul daba 1,44:1, así que va texto papel sobre un velo
 *  papel (AA de sobra). */
export function DisabledCta({
  children,
  sobreAzul = false,
}: {
  children: ReactNode;
  sobreAzul?: boolean;
}) {
  const tono = sobreAzul ? 'bg-papel/15 text-papel' : 'bg-black/10 text-black';
  return (
    <span
      aria-disabled="true"
      className={`inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded px-7 py-s text-center text-sm font-extrabold uppercase leading-snug tracking-tight md:w-auto ${tono}`}
    >
      {children}
    </span>
  );
}
