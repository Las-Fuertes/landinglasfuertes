/**
 * Datos del slider "Así lo comprendimos nosotras": las cuatro estampillas y las poses del mazo.
 *
 * Desde el 2026-10-01 (docs/emi/DECISIONES.md, D5) cada estampilla se compone en HTML a partir de
 * los frames de Figma `1297:5`, `1297:6`, `1297:4` y `1297:2`: marco de color, papel, la foto
 * (export 2x del rectángulo de la foto, sin texto), el degradado oscuro, el cuadro del icono con
 * su SVG y el texto en vivo en Pangolin (`font-acento`), traducido en `locales/*.json` bajo
 * `principles.estampillas.<n>`. Antes eran una imagen con el texto en español horneado.
 *
 * Todas las medidas van en px del frame de Figma (349 x 333); el componente las pasa a
 * porcentajes, así la estampilla escala con `--ancho` sin recalcular nada.
 */

/** Tamaño de la estampilla en Figma: el marco de color (Rectangle 71 y sus hermanos). */
export const ESTAMPILLA_ANCHO_PX = 349;
export const ESTAMPILLA_ALTO_PX = 333;

/** Una imagen colocada sobre la estampilla: caja SIN girar y giro alrededor de su centro. */
export type Pieza = { src: string; x: number; y: number; w: number; h: number; giro?: number };

export type Estampilla = {
  /** Foto recortada como en Figma (export 2x del rectángulo `Rectangle 68`). */
  foto: string;
  /** Clave de locales con el texto de la estampilla (`\n` marca el salto de línea). */
  textoKey: string;
  /** Nodo de Figma del frame, para rehacer el export sin buscar. */
  nodoFigma: string;
  /** Color del marco y del cuadro del icono: rosa del sol o azul cielo. */
  tono: 'rosa' | 'azul';
  /** Iconos del cuadro de arriba a la izquierda, en orden de pintado. */
  iconos: readonly Pieza[];
  /**
   * Texto: centro de la caja (cx, cy) y ancho de la caja sin girar (w), girada -5,11 grados
   * como en Figma. `interlineado` en múltiplos del cuerpo (19 o 20,1 sobre 25), `tracking` en em.
   */
  texto: { cx: number; cy: number; w: number; interlineado: number; tracking?: number };
};

const DIR = '/images/principles/estampillas';

export const ESTAMPILLAS: readonly Estampilla[] = [
  {
    foto: `${DIR}/fotos/foto-1-mar-de-derechos.webp`,
    textoKey: 'principles.estampillas.1',
    nodoFigma: '1297:5',
    tono: 'rosa',
    // Group 50: caja 72,96 x 28,94 en (13,95; 35); dentro, la ola de 72,05 x 27,66 girada 2,07.
    iconos: [
      { src: `${DIR}/iconos/icono-1-ola.svg`, x: 14.41, y: 35.64, w: 72.05, h: 27.66, giro: 2.07 },
    ],
    texto: { cx: 213, cy: 279, w: 209, interlineado: 0.76 },
  },
  {
    foto: `${DIR}/fotos/foto-2-mapa-de-cambio.webp`,
    textoKey: 'principles.estampillas.2',
    nodoFigma: '1297:6',
    tono: 'azul',
    // Group 85: caja 50,94 x 34,57 en (27; 34,67); dentro, el mapa de 49,95 x 31,99 girado -3,11.
    iconos: [
      { src: `${DIR}/iconos/icono-2-mapa.svg`, x: 27.5, y: 35.97, w: 49.95, h: 31.99, giro: -3.11 },
    ],
    texto: { cx: 200, cy: 282, w: 257, interlineado: 0.76 },
  },
  {
    foto: `${DIR}/fotos/foto-3-juntas-florecemos.webp`,
    textoKey: 'principles.estampillas.3',
    nodoFigma: '1297:4',
    tono: 'rosa',
    // Group 88 (la flor) y Ellipse 15 (el punto azul).
    iconos: [
      { src: `${DIR}/iconos/icono-3-flor.svg`, x: 42, y: 25.34, w: 25.21, h: 45.98 },
      { src: `${DIR}/iconos/icono-3-punto.svg`, x: 58.82, y: 33.82, w: 4.48, h: 4.48 },
    ],
    texto: { cx: 188, cy: 277, w: 280, interlineado: 0.804 },
  },
  {
    foto: `${DIR}/fotos/foto-4-yo-decido.webp`,
    textoKey: 'principles.estampillas.4',
    nodoFigma: '1297:2',
    tono: 'azul',
    // Group 224 y Group 96: la misma chancla dos veces, 2 px una sobre otra (así en Figma).
    iconos: [
      { src: `${DIR}/iconos/icono-4-chancla-a.svg`, x: 30.86, y: 40.67, w: 46.5, h: 26.98 },
      { src: `${DIR}/iconos/icono-4-chancla-b.svg`, x: 30.86, y: 38.67, w: 46.5, h: 26.98 },
    ],
    texto: { cx: 211, cy: 272, w: 245, interlineado: 0.804, tracking: -0.04 },
  },
];

/**
 * Pose de una estampilla según su profundidad en el mazo (0 = al frente).
 * `x` e `y` son fracciones del ALTO de la estampilla (el alto es lo que comparten el frame
 * desktop y el mobile), `r` son grados. Medidas del centro de cada grupo contra el de la de
 * enfrente, con los giros que da get_design_context.
 */
export type Pose = { x: number; y: number; r: number };

/**
 * Desktop y tablet (frame 1288:676): abanico. Detrás de la de enfrente (sin giro) asoman una
 * azul a la izquierda (-3,83°), una rosa arriba al centro (+5,38°) y otra azul a la derecha
 * (+5,38°), en ese orden de apilado.
 */
export const POSES_ABANICO: readonly Pose[] = [
  { x: 0, y: 0, r: 0 },
  { x: -0.3526, y: 0.0103, r: -3.83 },
  { x: 0.1886, y: -0.0986, r: 5.38 },
  { x: 0.567, y: 0.0245, r: 5.38 },
];

/**
 * Mobile (frame 1288:913): pila. Las de detrás asoman arriba y a la derecha con giros cortos
 * (-2,28° y -3,06°). La cuarta queda escondida exactamente detrás de la tercera.
 */
export const POSES_PILA: readonly Pose[] = [
  { x: 0, y: 0, r: 0 },
  { x: 0.0104, y: -0.025, r: -2.28 },
  { x: -0.024, y: -0.0732, r: -3.06 },
  { x: -0.024, y: -0.0732, r: -3.06 },
];

/**
 * Giro de la estampilla que sale del frente en el punto en que queda libre del mazo (donde
 * cambia de capa), como una carta lanzada. El recorrido está en `efecto-mazo.ts`.
 */
export const ARCO_SALIDA = { r: -9 } as const;
