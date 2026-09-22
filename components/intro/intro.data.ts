/**
 * Datos de las 3 ilustraciones de la Introducción, transcritos del diseño de Figma
 * (archivo ng8HnnYyaDJ2nTWauh7Otb, frames mobile 1159:735, 1152:221 y 1152:186).
 *
 * Todas las medidas están en píxeles del lienzo mobile de 390x833. El componente las
 * convierte a porcentaje, así el mismo dato sirve a cualquier ancho sin recalcular nada.
 *
 * El orden del arreglo ES el orden de apilado: el primero queda al fondo.
 */

/** Lienzo del frame mobile de Figma. Todo lo de aquí se mide contra esto. */
export const CANVAS = { width: 390, height: 833 } as const;

export interface IntroLayer {
  /** Ruta dentro de /public. */
  src: string;
  /** Caja de la capa en px del lienzo. */
  box: { left: number; top: number; width: number; height: number };
  /**
   * Figma envuelve las capas rotadas en una caja exterior (el bounding box) y rota
   * una caja interior centrada. `rotate` y `inner` reproducen ese par.
   */
  rotate?: number;
  inner?: { width: number; height: number };
  /**
   * `inset` del <img> dentro de su caja, tal cual lo da Figma. Los valores negativos
   * dejan que el trazo se salga sin recortarse.
   */
  inset?: string;
  /** Opacidad, cuando el diseño la baja. */
  opacity?: number;
  /** Transformación extra (espejado), cuando el diseño la aplica. */
  flipY?: boolean;
}

const P = '/images/intro/';

/** Paso 1: el racimo de burbujas de diálogo. */
export const STEP_1_LAYERS: IntroLayer[] = [
  {
    src: `${P}paso1-squiggle-grande.svg`,
    box: { left: -70, top: 59, width: 735.246, height: 422.035 },
    rotate: 6.45,
    inner: { width: 700.885, height: 345.531 },
    inset: '-0.47% 0 -1.35% -0.71%',
  },
  {
    src: `${P}paso1-burbuja-a.svg`,
    box: { left: 246.27, top: 204.97, width: 140.234, height: 138.186 },
  },
  {
    src: `${P}paso1-burbuja-b.svg`,
    box: { left: 140.63, top: 136.44, width: 133.025, height: 141.104 },
    rotate: -2.61,
    inner: { width: 126.989, height: 135.463 },
  },
  {
    src: `${P}paso1-elipse-73.svg`,
    box: { left: 107.57, top: 168.09, width: 105.317, height: 105.317 },
    rotate: -2.61,
    inner: { width: 100.831, height: 100.831 },
  },
  {
    src: `${P}paso1-burbuja-c.svg`,
    box: { left: 58.42, top: 148.16, width: 142.144, height: 142.553 },
    rotate: -2.61,
    inner: { width: 136.07, height: 136.499 },
    inset: '0 0 -1.6% -1.09%',
  },
  {
    src: `${P}paso1-burbuja-d.svg`,
    box: { left: 194.27, top: 296.69, width: 146.59, height: 146.898 },
    inset: '0 0 -0.74% 0',
  },
  {
    src: `${P}paso1-detalle-1248.svg`,
    box: { left: 305.84, top: 310.98, width: 35.812, height: 7.729 },
    inset: '-8.78% 0 -3.59% 0.22%',
  },
  {
    src: `${P}paso1-detalle-1251.svg`,
    box: { left: 205.86, top: 297.53, width: 11.373, height: 34.972 },
    inset: '-1.24% -9.87% 0 -2.67%',
  },
  {
    src: `${P}paso1-burbuja-e.svg`,
    box: { left: 162.31, top: 176.48, width: 198.424, height: 198.424 },
  },
  {
    src: `${P}paso1-burbuja-f.svg`,
    box: { left: 97.81, top: 330.06, width: 142.142, height: 144.945 },
  },
  {
    src: `${P}paso1-detalle-1256.svg`,
    box: { left: 192.32, top: 197.49, width: 5.49, height: 38.968 },
    inset: '-0.88% -11.51% 0 -2.93%',
  },
  {
    src: `${P}paso1-detalle-1257.svg`,
    box: { left: 70.34, top: 288.99, width: 35.088, height: 6.08 },
    inset: '-11.58% 0.31% 0 0',
  },
  {
    src: `${P}paso1-espiral-1259.svg`,
    box: { left: 285.59, top: 163.7, width: 32.769, height: 30.8 },
    inset: '-1.63% -3.57% -4.17% -3.92%',
  },
  {
    src: `${P}paso1-espiral-1261.svg`,
    box: { left: 336.59, top: 383.39, width: 28.556, height: 31.525 },
    inset: '-2.69% -3.64% -3.5% -3.85%',
  },
  {
    src: `${P}paso1-espiral-1266.svg`,
    box: { left: 63.09, top: 434.3, width: 27.62, height: 27.088 },
    inset: '-3.21% -3.88% -5.3% -3.28%',
  },
  {
    src: `${P}paso1-burbuja-g.svg`,
    box: { left: 0, top: 198.46, width: 136.293, height: 133.296 },
  },
  {
    src: `${P}paso1-elipse-73.svg`,
    box: { left: 140.63, top: 232.48, width: 105.317, height: 105.317 },
    rotate: -2.61,
    inner: { width: 100.831, height: 100.831 },
  },
  {
    src: `${P}paso1-burbuja-h.svg`,
    box: { left: 104.09, top: 227.05, width: 128.166, height: 128.593 },
    rotate: -2.61,
    inner: { width: 122.687, height: 123.135 },
    inset: '0 0 -1.6% -1.09%',
  },
  {
    src: `${P}paso1-burbuja-i.svg`,
    box: { left: 27.41, top: 286.99, width: 128.166, height: 128.593 },
    rotate: -2.61,
    inner: { width: 122.687, height: 123.135 },
    inset: '0 0 -1.6% -1.09%',
  },
  {
    src: `${P}paso1-elipse-71.svg`,
    box: { left: 113.19, top: 301.07, width: 110.807, height: 110.807 },
    rotate: -2.61,
    inner: { width: 106.087, height: 106.087 },
  },
  {
    src: `${P}paso1-burbuja-j.svg`,
    box: { left: 78.53, top: 263.96, width: 142.144, height: 144.998 },
  },
  {
    src: `${P}paso1-espiral-1282.svg`,
    box: { left: 54, top: 107, width: 41.502, height: 48.496 },
    inset: '-0.83% -1.55% -1.33% -3.02%',
  },
];

/** Paso 2: el horizonte de mar con el sol y el barquito. */
export const STEP_2_LAYERS: IntroLayer[] = [
  {
    src: `${P}paso2-horizonte.svg`,
    box: { left: -687, top: 159, width: 1163, height: 97.442 },
    inset: '-2.47% -0.16% -1.98% -0.14%',
  },
  // El mismo círculo rojo del sitio, girado y casi transparente: hace de mancha difusa en el agua.
  {
    src: `${P}paso2-sol.png`,
    box: { left: 147, top: 261, width: 79.011, height: 79.405 },
    rotate: -165,
    inner: { width: 64.394, height: 64.952 },
    opacity: 0.2,
    flipY: true,
  },
  {
    src: `${P}paso2-ola-1182.svg`,
    box: { left: 47, top: 272, width: 63.647, height: 8.313 },
    inset: '-20.3% 0 -7.39% -0.18%',
  },
  {
    src: `${P}paso2-ola-1184.svg`,
    box: { left: 266.06, top: 288.83, width: 97.474, height: 9.874 },
    inset: '-27.03% 0 -9% 0',
  },
  {
    src: `${P}paso2-ola-1185.svg`,
    box: { left: 140.5, top: 305.65, width: 26.23, height: 5.518 },
    inset: '-24.52% 0 -8.11% -2.38%',
  },
  {
    src: `${P}paso2-ola-1186.svg`,
    box: { left: 184.8, top: 307.76, width: 17.272, height: 1.301 },
    inset: '-136.01% 0 -109.95% -0.56%',
  },
  {
    src: `${P}paso2-ola-1187.svg`,
    box: { left: 210.01, top: 293.03, width: 28.082, height: 1.996 },
    inset: '-102.25% 0 -89.28% 0',
  },
  {
    src: `${P}paso2-ola-1188.svg`,
    box: { left: 203.81, top: 319.21, width: 31.03, height: 3.633 },
    inset: '-45.99% 0 -59.32% -0.75%',
  },
  {
    src: `${P}paso2-barco.svg`,
    box: { left: 86, top: 505, width: 227, height: 127.12 },
    inset: '-10.22% -8.53% -20.12% -8.73%',
  },
  {
    src: `${P}paso2-ola-1175.svg`,
    box: { left: 284, top: 599.86, width: 27.206, height: 23.029 },
    inset: '-1.52% -5.63% -3.5% 0',
  },
  {
    src: `${P}paso2-ola-1176.svg`,
    box: { left: 123.64, top: 620.68, width: 84.276, height: 26.81 },
    inset: '-0.81% 0 -5.32% -2.78%',
  },
  {
    src: `${P}paso2-ola-1177.svg`,
    box: { left: 230.29, top: 629.78, width: 43.03, height: 5.707 },
    inset: '-3.33% 0 -30.57% -0.14%',
  },
  {
    src: `${P}paso2-ola-1178.svg`,
    box: { left: 93.48, top: 627.36, width: 119.457, height: 50.437 },
    inset: '0 0 -3.36% -1.23%',
  },
  {
    src: `${P}paso2-ola-1179.svg`,
    box: { left: 106.49, top: 600.11, width: 17.934, height: 9.626 },
    inset: '-11.41% 0 -3.59% -4.55%',
  },
  {
    src: `${P}paso2-ola-1180.svg`,
    box: { left: 234.41, top: 662.38, width: 34.45, height: 4.583 },
    inset: '-18.6% 0 -43.98% 0',
  },
  {
    src: `${P}paso2-ola-1181.svg`,
    box: { left: 285.62, top: 591.41, width: 46.515, height: 62.793 },
    inset: '-0.74% -3.64% -0.13% 0',
  },
  {
    src: `${P}paso2-sol-squiggle.svg`,
    box: { left: 149, top: 66, width: 107.919, height: 93 },
    inset: '0 0 -2.29% 0',
  },
];

/**
 * Paso 3: el barco grande con la persona a bordo.
 *
 * Se omite a propósito la capa `Capa 26 1` (1152:189): en el diseño está en
 * left -500 con ancho 500, o sea que termina exactamente en el borde izquierdo
 * del lienzo y no se ve un solo píxel de ella.
 */
export const STEP_3_LAYERS: IntroLayer[] = [
  {
    src: `${P}paso3-nube.svg`,
    box: { left: -19, top: 99, width: 93, height: 34 },
    inset: '-3.05% -1.59% -4.82% -1.58%',
  },
  {
    src: `${P}paso3-sol.svg`,
    box: { left: 46, top: 56, width: 74.001, height: 77.282 },
    rotate: -2.61,
    inner: { width: 70.699, height: 74.14 },
  },
  {
    src: `${P}paso3-squiggle.svg`,
    box: { left: 102, top: 86, width: 124.583, height: 13 },
    inset: '-5.41% 0 -28.64% -2.06%',
  },
  {
    src: `${P}paso3-barco.svg`,
    box: { left: 42, top: 194, width: 306.191, height: 178.111 },
    inset: '-0.18% -0.52% -1.44% 0',
  },
  {
    src: `${P}paso3-persona.svg`,
    box: { left: 225.59, top: 235.24, width: 68.834, height: 67.718 },
    rotate: -17.62,
    inner: { width: 55.227, height: 53.511 },
    inset: '-1.9% -1.67% -1.67% -1.59%',
  },
  {
    src: `${P}paso3-olas.svg`,
    box: { left: -3.92, top: 342.28, width: 363.968, height: 80.72 },
    inset: '-3.37% 0 -4.76% 0',
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Breakpoints
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * Cada breakpoint tiene su propio lienzo y su propia composición, pero **reutiliza
 * las mismas capas**: la ilustración de tablet y la de desktop son la de mobile
 * escalada y desplazada.
 *
 * Verificado contra cinco capas de control de Figma: el error máximo es de 0.05 px
 * sobre lienzos de 1024 y 1280. Por eso aquí solo se guardan tres números por
 * breakpoint en vez de transcribir las 45 capas otras dos veces.
 */
export interface GroupTransform {
  scale: number;
  dx: number;
  dy: number;
}

export interface IntroText {
  /** Caja en px del lienzo de ESTE breakpoint. */
  left: number;
  top: number;
  width: number;
  /** Tamaño de fuente en px del lienzo. */
  size: number;
  align: 'left' | 'center';
  tracking?: string;
  bold?: boolean;
  /** Claves de `locales` que componen cada párrafo. Se unen con un espacio. */
  paragraphs: string[][];
}

export interface IntroVariant {
  canvas: { width: number; height: number };
  /** Transformación del grupo de capas compartido, respecto al lienzo mobile. */
  group: GroupTransform;
  /** Capas propias de este breakpoint, ya en px de SU lienzo. */
  own: IntroLayer[];
  texts: IntroText[];
}

const SIN_TRANSFORMAR: GroupTransform = { scale: 1, dx: 0, dy: 0 };

/** El sol pequeño que solo aparece en tablet y desktop. */
const SOL_ADORNO = (left: number, top: number): IntroLayer => ({
  src: `${P}paso3-sol.svg`,
  box: { left, top, width: 48.448, height: 50.597 },
  rotate: -2.61,
  inner: { width: 46.286, height: 48.54 },
});

const PASO_1_TEXTO = [['hero.section1.text1'], ['hero.section1.text2', 'hero.section1.text3']];

export const STEP_1_VARIANTS: Record<'mobile' | 'tablet' | 'desktop', IntroVariant> = {
  mobile: {
    canvas: { width: 390, height: 833 },
    group: SIN_TRANSFORMAR,
    own: [STEP_1_LAYERS[0]],
    texts: [
      {
        left: 30,
        top: 536,
        width: 330,
        size: 20,
        align: 'center',
        tracking: '-0.03em',
        paragraphs: PASO_1_TEXTO,
      },
    ],
  },
  tablet: {
    canvas: { width: 1024, height: 1366 },
    group: { scale: 1.723, dx: 179, dy: 34.6 },
    own: [
      {
        src: `${P}paso1-squiggle-grande.svg`,
        box: { left: 6.255, top: 84, width: 1393.172, height: 919.065 },
        inset: '-0.47% 0 -1.35% -0.71%',
      },
      SOL_ADORNO(939, 806),
    ],
    texts: [
      {
        left: 315,
        top: 1027,
        width: 454,
        size: 30,
        align: 'center',
        tracking: '-0.04em',
        paragraphs: PASO_1_TEXTO,
      },
    ],
  },
  desktop: {
    canvas: { width: 1280, height: 832 },
    group: { scale: 1.2988, dx: 92, dy: 66 },
    own: [
      {
        src: `${P}paso1-squiggle-grande.svg`,
        box: { left: 10.9, top: 80.47, width: 1279.254, height: 630.662 },
        inset: '-0.47% 0 -1.35% -0.71%',
      },
      SOL_ADORNO(1171, 550),
    ],
    texts: [
      {
        left: 736,
        top: 438,
        // Figma dice 402, pero ahi "pero" + el chip se pasan por unos 4 px y el
        // renglon se parte. 440 mantiene las 3 lineas del diseno y sigue cabiendo.
        width: 440,
        size: 30,
        align: 'left',
        tracking: '-0.04em',
        paragraphs: PASO_1_TEXTO,
      },
    ],
  },
};

/** Las capas que comparten los tres breakpoints (todo menos el garabato de fondo). */
export const STEP_1_CLUSTER = STEP_1_LAYERS.slice(1);

/**
 * Pasos 2 y 3: todavía solo con datos de mobile. Mientras no tengan variante propia
 * se muestra la de mobile en todos los anchos, que es el comportamiento actual.
 */
export const STEP_2_VARIANTS: Partial<Record<'mobile' | 'tablet' | 'desktop', IntroVariant>> = {
  mobile: {
    canvas: { width: 390, height: 833 },
    group: SIN_TRANSFORMAR,
    own: STEP_2_LAYERS,
    texts: [
      {
        left: 53,
        top: 387,
        width: 293,
        size: 14,
        align: 'left',
        paragraphs: [['hero.section2.paragraph']],
      },
    ],
  },
};

export const STEP_3_VARIANTS: Partial<Record<'mobile' | 'tablet' | 'desktop', IntroVariant>> = {
  mobile: {
    canvas: { width: 390, height: 833 },
    group: SIN_TRANSFORMAR,
    own: STEP_3_LAYERS,
    texts: [
      {
        left: 51,
        top: 545,
        width: 307,
        size: 20,
        align: 'left',
        bold: true,
        paragraphs: [['hero.section3.title']],
      },
      {
        left: 51,
        top: 654,
        width: 307,
        size: 14,
        align: 'left',
        paragraphs: [['hero.section3.text']],
      },
    ],
  },
};
