/**
 * El equipo, en el orden del diseño de Figma: desktop `1437:1518` y mobile `1219:985`
 * (docs/quienes-somos/DECISIONES.md, D1 y D2).
 *
 * Todas las medidas en px van en px del lienzo de Figma (mobile de 390, desktop de 1280) y el
 * componente las multiplica por `--k`. Las fotos y los pájaros tienen el mismo tamaño en los dos
 * frames; lo que cambia es la composición.
 */

/** Un par de pájaros dibujados, colocado respecto a la esquina superior izquierda de la foto. */
export interface Pajaro {
  color: 'rosa' | 'azul';
  /** Figma exporta dos trazos: el grande (60 x 75) y el chico (44 x 55). */
  forma: 'grande' | 'chico';
  /** Posición de la imagen (ya sin la caja girada de Figma), en px de lienzo. */
  x: number;
  y: number;
  /** Ancho de la imagen en px de lienzo; el alto sale de su proporción. */
  ancho: number;
}

/**
 * Cómo cae la foto dentro del círculo, en fracciones del diámetro: es el recorte de la máscara de
 * Figma traducido (posición y tamaño de la imagen respecto al círculo).
 */
export interface Encuadre {
  x: number;
  y: number;
  ancho: number;
  alto: number;
}

export type Cargo =
  | 'coordinadora'
  | 'educadora'
  | 'estrategaCrecimiento'
  | 'fundadora'
  | 'estrategaComunicaciones'
  | 'cofundadora'
  | 'estrategaAlianzas'
  | 'disenadora';

export interface Integrante {
  /** Nombre del archivo en `public/images/quienes-somos/2026-09/`. */
  slug: string;
  /** Los nombres propios no se traducen. */
  name: string;
  /** Clave del cargo dentro de `quienesSomos.roles`. */
  role: Cargo;
  /** Mobile y tablet: de qué lado va la foto; `center` la pone sola con el nombre debajo. */
  side: 'left' | 'right' | 'center';
  /** Diámetro de la foto, igual en los dos frames. */
  size: number;
  /** Mobile: cuánto se sale la foto del margen de la página (40 px), hacia su lado. */
  bleed?: number;
  /** Mobile, fichas centradas: corrimiento horizontal de la foto respecto al centro. */
  corrimiento?: number;
  /** Mobile: aire sobre la fila, medido entre filas en Figma. */
  aire?: number;
  /** Desktop: cuánto baja la foto dentro de su fila (las fotos chicas van más abajo). */
  bajaDesktop?: number;
  /** Ancho máximo del cargo, el de su caja de texto en Figma: decide dónde parte la línea. */
  anchoCargo: number;
  /** Nombre del archivo en `2026-09/` si no es `<slug>.jpg`. */
  foto?: string;
  encuadre: Encuadre;
  /** Solo si el encuadre mobile difiere del de desktop. */
  encuadreMobile?: Encuadre;
  pajaro: { mobile: Pajaro; desktop: Pajaro };
}

export const INTEGRANTES: Integrante[] = [
  {
    slug: 'karol-lopez',
    name: 'Karol López',
    role: 'fundadora',
    side: 'center',
    size: 201.5,
    corrimiento: 17,
    aire: 27,
    anchoCargo: 232,
    foto: 'karol-lopez-figma-1064-13452.jpg',
    encuadre: { x: -0.079, y: -0.044, ancho: 1.3, alto: 1.576 },
    pajaro: {
      mobile: { color: 'azul', forma: 'chico', x: -2, y: 26, ancho: 44 },
      desktop: { color: 'azul', forma: 'grande', x: 12, y: 141, ancho: 60 },
    },
  },
  {
    slug: 'erika-cely',
    name: 'Erika Cely',
    role: 'cofundadora',
    side: 'center',
    size: 201.5,
    corrimiento: 18,
    aire: 27,
    anchoCargo: 259,
    encuadre: { x: -0.094, y: -0.44, ancho: 1.183, alto: 1.775 },
    pajaro: {
      mobile: { color: 'azul', forma: 'grande', x: 155, y: 6, ancho: 54.7 },
      desktop: { color: 'azul', forma: 'grande', x: 25, y: 149, ancho: 60 },
    },
  },
  {
    slug: 'mafe-ramirez',
    name: 'Mafe Ramirez',
    role: 'coordinadora',
    side: 'left',
    size: 188,
    bleed: 39,
    aire: 20,
    anchoCargo: 169,
    encuadre: { x: -0.198, y: -0.361, ancho: 1.29, alto: 1.41 },
    pajaro: {
      mobile: { color: 'rosa', forma: 'grande', x: 142, y: 2, ancho: 60 },
      desktop: { color: 'rosa', forma: 'grande', x: 137, y: 129, ancho: 60 },
    },
  },
  {
    slug: 'paola-segnini',
    name: 'Paola Segnini',
    role: 'educadora',
    side: 'right',
    size: 153,
    bleed: 33,
    aire: 12,
    bajaDesktop: 43,
    anchoCargo: 169,
    encuadre: { x: 0.01, y: -0.135, ancho: 1.026, alto: 1.366 },
    pajaro: {
      mobile: { color: 'azul', forma: 'chico', x: -5, y: 3, ancho: 44 },
      desktop: { color: 'azul', forma: 'chico', x: 96, y: -20, ancho: 44 },
    },
  },
  {
    slug: 'lina-lievano',
    name: 'Lina Lievano',
    role: 'estrategaCrecimiento',
    side: 'left',
    size: 201.5,
    bleed: 53,
    aire: 7,
    anchoCargo: 169,
    encuadre: { x: -0.082, y: -0.054, ancho: 1.218, alto: 1.22 },
    pajaro: {
      mobile: { color: 'rosa', forma: 'grande', x: 150, y: 7, ancho: 60 },
      desktop: { color: 'rosa', forma: 'grande', x: 149, y: 143, ancho: 60 },
    },
  },
  {
    slug: 'vanessa-cortes',
    name: 'Vanessa Córtes',
    role: 'estrategaComunicaciones',
    side: 'left',
    size: 169,
    bleed: 53,
    aire: 20,
    bajaDesktop: 17,
    anchoCargo: 130,
    encuadre: { x: -0.157, y: 0.006, ancho: 1.343, alto: 1.343 },
    encuadreMobile: { x: -0.031, y: -0.052, ancho: 1.18, alto: 1.18 },
    pajaro: {
      mobile: { color: 'rosa', forma: 'grande', x: 139, y: 5, ancho: 60 },
      desktop: { color: 'rosa', forma: 'chico', x: -6, y: 15, ancho: 44 },
    },
  },
  {
    slug: 'adriana-chavarro',
    name: 'Adriana Chavarro',
    role: 'estrategaAlianzas',
    side: 'right',
    size: 159.5,
    bleed: 48,
    aire: 30,
    bajaDesktop: 2,
    anchoCargo: 145,
    encuadre: { x: -0.169, y: -0.079, ancho: 1.183, alto: 1.578 },
    pajaro: {
      mobile: { color: 'rosa', forma: 'grande', x: -2, y: -3, ancho: 52.8 },
      desktop: { color: 'rosa', forma: 'chico', x: 133, y: 53, ancho: 44 },
    },
  },
  {
    slug: 'alejandra-villarraga',
    name: 'Alejandra Villarraga',
    role: 'disenadora',
    side: 'left',
    size: 152,
    bleed: 45,
    aire: 26,
    anchoCargo: 169,
    encuadre: { x: 0.036, y: 0.011, ancho: 1.03, alto: 1.03 },
    pajaro: {
      mobile: { color: 'azul', forma: 'chico', x: 114, y: 8, ancho: 44 },
      desktop: { color: 'azul', forma: 'chico', x: 105, y: 113, ancho: 44 },
    },
  },
];
