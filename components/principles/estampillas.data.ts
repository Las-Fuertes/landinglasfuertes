/**
 * Datos del slider "Así lo comprendimos nosotras": las cuatro estampillas y las poses del mazo.
 *
 * Cada estampilla es UNA imagen exportada de Figma a 2x (foto, marco con borde dentado, icono y
 * texto manuscrito horneados, siempre en español). El alt sí se traduce: vive en
 * `locales/*.json` bajo `principles.estampillas.<n>`. Ver docs/emi/DECISIONES.md, D3.
 */

export type Estampilla = {
  src: string;
  /** Clave de locales con el texto que se lee en la estampilla (alt traducido). */
  altKey: string;
  /** Nodo de Figma del que se exportó, para rehacer el export sin buscar. */
  nodoFigma: string;
};

export const ESTAMPILLAS: readonly Estampilla[] = [
  {
    src: '/images/principles/estampillas/estampilla-1-mar-de-derechos.webp',
    altKey: 'principles.estampillas.1',
    nodoFigma: '1297:5',
  },
  {
    src: '/images/principles/estampillas/estampilla-2-mapa-de-cambio.webp',
    altKey: 'principles.estampillas.2',
    nodoFigma: '1297:6',
  },
  {
    src: '/images/principles/estampillas/estampilla-3-juntas-florecemos.webp',
    altKey: 'principles.estampillas.3',
    nodoFigma: '1297:4',
  },
  {
    src: '/images/principles/estampillas/estampilla-4-yo-decido.webp',
    altKey: 'principles.estampillas.4',
    nodoFigma: '1297:2',
  },
];

/** Tamaño del export (2x de 349x333 en Figma). */
export const ESTAMPILLA_ANCHO_PX = 701;
export const ESTAMPILLA_ALTO_PX = 669;

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
