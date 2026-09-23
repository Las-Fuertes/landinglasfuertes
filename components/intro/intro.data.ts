/**
 * Datos de las 3 ilustraciones de la Introducción, transcritos del diseño de Figma
 * (archivo ng8HnnYyaDJ2nTWauh7Otb, frames mobile 1159:735, 1152:221 y 1152:186).
 *
 * Todas las medidas están en píxeles del lienzo mobile de 390x700. El componente las
 * convierte a porcentaje, así el mismo dato sirve a cualquier ancho sin recalcular nada.
 *
 * El orden del arreglo ES el orden de apilado: el primero queda al fondo.
 */

/** Lienzo del frame mobile de Figma. Todo lo de aquí se mide contra esto. */
export const CANVAS = { width: 390, height: 700 } as const;

/**
 * Papel de cada pieza en la coreografía de las transiciones (`intro.motion.ts`). No cambia
 * nada en reposo: solo decide cómo entra y sale la pieza.
 */
export type Rol =
  | 'burbuja'
  | 'garabato'
  | 'horizonte'
  | 'sol'
  | 'nube'
  | 'agua'
  | 'reflejo'
  | 'ola'
  | 'barco'
  | 'persona'
  | 'texto';

export interface IntroLayer {
  /** Ruta dentro de /public. */
  src: string;
  /**
   * Papel en las transiciones. `agua` son las olas sueltas que solo entran y salen; `ola` son
   * las que rodean al barco y viajan con él entre las partes 2 y 3; `reflejo`, el del sol en el
   * agua de la parte 2 (entra como `agua` y en reposo respira en opacidad).
   */
  rol?: Rol;
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
    rol: 'garabato',
    box: { left: -70, top: 59, width: 735.246, height: 422.035 },
    rotate: 6.45,
    inner: { width: 700.885, height: 345.531 },
    inset: '-0.47% 0 -1.35% -0.71%',
  },
  {
    src: `${P}paso1-burbuja-a.svg`,
    rol: 'burbuja',
    box: { left: 246.27, top: 204.97, width: 140.234, height: 138.186 },
  },
  {
    src: `${P}paso1-burbuja-b.svg`,
    rol: 'burbuja',
    box: { left: 140.63, top: 136.44, width: 133.025, height: 141.104 },
    rotate: -2.61,
    inner: { width: 126.989, height: 135.463 },
  },
  {
    src: `${P}paso1-elipse-73.svg`,
    rol: 'burbuja',
    box: { left: 107.57, top: 168.09, width: 105.317, height: 105.317 },
    rotate: -2.61,
    inner: { width: 100.831, height: 100.831 },
  },
  {
    src: `${P}paso1-burbuja-c.svg`,
    rol: 'burbuja',
    box: { left: 58.42, top: 148.16, width: 142.144, height: 142.553 },
    rotate: -2.61,
    inner: { width: 136.07, height: 136.499 },
    inset: '0 0 -1.6% -1.09%',
  },
  {
    src: `${P}paso1-burbuja-d.svg`,
    rol: 'burbuja',
    box: { left: 194.27, top: 296.69, width: 146.59, height: 146.898 },
    inset: '0 0 -0.74% 0',
  },
  {
    src: `${P}paso1-detalle-1248.svg`,
    rol: 'garabato',
    box: { left: 305.84, top: 310.98, width: 35.812, height: 7.729 },
    inset: '-8.78% 0 -3.59% 0.22%',
  },
  {
    src: `${P}paso1-detalle-1251.svg`,
    rol: 'garabato',
    box: { left: 205.86, top: 297.53, width: 11.373, height: 34.972 },
    inset: '-1.24% -9.87% 0 -2.67%',
  },
  {
    src: `${P}paso1-burbuja-e.svg`,
    rol: 'burbuja',
    box: { left: 162.31, top: 176.48, width: 198.424, height: 198.424 },
  },
  {
    src: `${P}paso1-burbuja-f.svg`,
    rol: 'burbuja',
    box: { left: 97.81, top: 330.06, width: 142.142, height: 144.945 },
  },
  {
    src: `${P}paso1-detalle-1256.svg`,
    rol: 'garabato',
    box: { left: 192.32, top: 197.49, width: 5.49, height: 38.968 },
    inset: '-0.88% -11.51% 0 -2.93%',
  },
  {
    src: `${P}paso1-detalle-1257.svg`,
    rol: 'garabato',
    box: { left: 70.34, top: 288.99, width: 35.088, height: 6.08 },
    inset: '-11.58% 0.31% 0 0',
  },
  {
    src: `${P}paso1-espiral-1259.svg`,
    rol: 'garabato',
    box: { left: 285.59, top: 163.7, width: 32.769, height: 30.8 },
    inset: '-1.63% -3.57% -4.17% -3.92%',
  },
  {
    src: `${P}paso1-espiral-1261.svg`,
    rol: 'garabato',
    box: { left: 336.59, top: 383.39, width: 28.556, height: 31.525 },
    inset: '-2.69% -3.64% -3.5% -3.85%',
  },
  {
    src: `${P}paso1-espiral-1266.svg`,
    rol: 'garabato',
    box: { left: 63.09, top: 434.3, width: 27.62, height: 27.088 },
    inset: '-3.21% -3.88% -5.3% -3.28%',
  },
  {
    src: `${P}paso1-burbuja-g.svg`,
    rol: 'burbuja',
    box: { left: 0, top: 198.46, width: 136.293, height: 133.296 },
  },
  {
    src: `${P}paso1-elipse-73.svg`,
    rol: 'burbuja',
    box: { left: 140.63, top: 232.48, width: 105.317, height: 105.317 },
    rotate: -2.61,
    inner: { width: 100.831, height: 100.831 },
  },
  {
    src: `${P}paso1-burbuja-h.svg`,
    rol: 'burbuja',
    box: { left: 104.09, top: 227.05, width: 128.166, height: 128.593 },
    rotate: -2.61,
    inner: { width: 122.687, height: 123.135 },
    inset: '0 0 -1.6% -1.09%',
  },
  {
    src: `${P}paso1-burbuja-i.svg`,
    rol: 'burbuja',
    box: { left: 27.41, top: 286.99, width: 128.166, height: 128.593 },
    rotate: -2.61,
    inner: { width: 122.687, height: 123.135 },
    inset: '0 0 -1.6% -1.09%',
  },
  {
    src: `${P}paso1-elipse-71.svg`,
    rol: 'burbuja',
    box: { left: 113.19, top: 301.07, width: 110.807, height: 110.807 },
    rotate: -2.61,
    inner: { width: 106.087, height: 106.087 },
  },
  {
    src: `${P}paso1-burbuja-j.svg`,
    rol: 'burbuja',
    box: { left: 78.53, top: 263.96, width: 142.144, height: 144.998 },
  },
  {
    src: `${P}paso1-espiral-1282.svg`,
    rol: 'garabato',
    box: { left: 54, top: 107, width: 41.502, height: 48.496 },
    inset: '-0.83% -1.55% -1.33% -3.02%',
  },
];

/*
 * Paso 2: el horizonte de mar con el sol y el barquito.
 *
 * Va partido en tres grupos porque en tablet y desktop cada uno se escala y se
 * desplaza por su cuenta (ver la sección "Breakpoints" más abajo).
 */

const PASO_2_HORIZONTE: IntroLayer[] = [
  {
    src: `${P}paso2-horizonte.svg`,
    rol: 'horizonte',
    box: { left: -687, top: 159, width: 1163, height: 97.442 },
    inset: '-2.68% -0.17% -2.63% -0.19%',
  },
];

/** El reflejo del sol en el agua y las olas pequeñas del horizonte. */
const PASO_2_AGUA: IntroLayer[] = [
  // El reflejo difuso del sol en el agua. El PNG ya es un gris neutro con su propia
  // transparencia en el alfa (102,102,102 al 18%), así que NO lleva `opacity` encima: con el
  // 0.2 que tenía antes quedaba cinco veces más pálido que el diseño.
  {
    src: `${P}paso2-sol.png`,
    rol: 'reflejo',
    box: { left: 147, top: 261, width: 79.011, height: 79.405 },
    rotate: -165,
    inner: { width: 64.394, height: 64.952 },
    flipY: true,
  },
  {
    src: `${P}paso2-ola-1182.svg`,
    rol: 'agua',
    box: { left: 47, top: 272, width: 63.647, height: 8.313 },
    inset: '-20.3% 0 -7.39% -0.18%',
  },
  {
    src: `${P}paso2-ola-1184.svg`,
    rol: 'agua',
    box: { left: 266.06, top: 288.83, width: 97.474, height: 9.874 },
    inset: '-27.03% 0 -9% 0',
  },
  {
    src: `${P}paso2-ola-1185.svg`,
    rol: 'agua',
    box: { left: 140.5, top: 305.65, width: 26.23, height: 5.518 },
    inset: '-24.52% 0 -8.11% -2.38%',
  },
  {
    src: `${P}paso2-ola-1186.svg`,
    rol: 'agua',
    box: { left: 184.8, top: 307.76, width: 17.272, height: 1.301 },
    inset: '-136.01% 0 -109.95% -0.56%',
  },
  {
    src: `${P}paso2-ola-1187.svg`,
    rol: 'agua',
    box: { left: 210.01, top: 293.03, width: 28.082, height: 1.996 },
    inset: '-102.25% 0 -89.28% 0',
  },
  {
    src: `${P}paso2-ola-1188.svg`,
    rol: 'agua',
    box: { left: 203.81, top: 319.21, width: 31.03, height: 3.633 },
    inset: '-45.99% 0 -59.32% -0.75%',
  },
];

/** El barquito de papel con sus olas. */
const PASO_2_BARCO: IntroLayer[] = [
  {
    src: `${P}paso2-barco.svg`,
    rol: 'barco',
    box: { left: 86, top: 505, width: 227, height: 127.12 },
    inset: '-10.22% -8.53% -20.12% -8.73%',
  },
  {
    src: `${P}paso2-ola-1175.svg`,
    rol: 'ola',
    box: { left: 284, top: 599.86, width: 27.206, height: 23.029 },
    inset: '-1.52% -5.63% -3.5% 0',
  },
  {
    src: `${P}paso2-ola-1176.svg`,
    rol: 'ola',
    box: { left: 123.64, top: 620.68, width: 84.276, height: 26.81 },
    inset: '-0.81% 0 -5.32% -2.78%',
  },
  {
    src: `${P}paso2-ola-1177.svg`,
    rol: 'ola',
    box: { left: 230.29, top: 629.78, width: 43.03, height: 5.707 },
    inset: '-3.33% 0 -30.57% -0.14%',
  },
  {
    src: `${P}paso2-ola-1178.svg`,
    rol: 'ola',
    box: { left: 93.48, top: 627.36, width: 119.457, height: 50.437 },
    inset: '0 0 -3.36% -1.23%',
  },
  {
    src: `${P}paso2-ola-1179.svg`,
    rol: 'ola',
    box: { left: 106.49, top: 600.11, width: 17.934, height: 9.626 },
    inset: '-11.41% 0 -3.59% -4.55%',
  },
  {
    src: `${P}paso2-ola-1180.svg`,
    rol: 'ola',
    box: { left: 234.41, top: 662.38, width: 34.45, height: 4.583 },
    inset: '-18.6% 0 -43.98% 0',
  },
  {
    src: `${P}paso2-ola-1181.svg`,
    rol: 'ola',
    box: { left: 285.62, top: 591.41, width: 46.515, height: 62.793 },
    inset: '-0.74% -3.64% -0.13% 0',
  },
];

/** El sol con su espiral amarilla, tal cual viene en mobile (una sola capa). */
const PASO_2_SOL_MOBILE: IntroLayer = {
  src: `${P}paso2-sol-squiggle.svg`,
  rol: 'sol',
  box: { left: 149, top: 66, width: 107.919, height: 93 },
  inset: '0 0 -2.29% 0',
};

/**
 * Paso 3: el barco grande con la persona a bordo.
 *
 * Se omite a propósito la capa `Capa 26 1` (1152:189): en el diseño está en
 * left -500 con ancho 500, o sea que termina exactamente en el borde izquierdo
 * del lienzo y no se ve un solo píxel de ella.
 */

const PASO_3_BARCO: IntroLayer[] = [
  {
    src: `${P}paso3-barco.svg`,
    rol: 'barco',
    box: { left: 42, top: 194, width: 306.191, height: 178.111 },
    inset: '-0.18% -0.52% -1.44% 0',
  },
  {
    src: `${P}paso3-persona.svg`,
    rol: 'persona',
    box: { left: 225.59, top: 235.24, width: 68.834, height: 67.718 },
    rotate: -17.62,
    inner: { width: 55.227, height: 53.511 },
    inset: '-1.9% -1.67% -1.67% -1.59%',
  },
];

const PASO_3_OLAS: IntroLayer[] = [
  {
    src: `${P}paso3-olas.svg`,
    rol: 'ola',
    box: { left: -3.92, top: 342.28, width: 363.968, height: 80.72 },
    inset: '-3.37% 0 -4.76% 0',
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Piezas del cielo del paso 3 (sol, nube y garabato)
   ─────────────────────────────────────────────────────────────────────────── */

/** El sol está girado -2.61 grados en Figma; `k` escala la caja de mobile. */
const PASO_3_SOL = (left: number, top: number, k = 1): IntroLayer => ({
  src: `${P}paso3-sol.svg`,
  rol: 'sol',
  box: { left, top, width: 74.001 * k, height: 77.282 * k },
  rotate: -2.61,
  inner: { width: 70.699 * k, height: 74.14 * k },
});

const PASO_3_NUBE = (left: number, top: number, width: number, height: number): IntroLayer => ({
  src: `${P}paso3-nube.svg`,
  rol: 'nube',
  box: { left, top, width, height },
  inset: '-3.05% -1.59% -4.82% -1.58%',
});

const PASO_3_GARABATO = (left: number, top: number, width: number, height: number): IntroLayer => ({
  src: `${P}paso3-squiggle.svg`,
  rol: 'garabato',
  box: { left, top, width, height },
  inset: '-5.41% 0 -28.64% -2.06%',
});

/**
 * Olas sueltas que tablet y desktop añaden a los lados del barco. Son copias de tres
 * olas del grupo de mobile, así que las medidas ya vienen en px de esos lienzos.
 */
const OLA_A = (left: number, top: number): IntroLayer => ({
  src: `${P}paso3-ola-1168.svg`,
  rol: 'agua',
  box: { left, top, width: 65.988, height: 6.535 },
  inset: '-62.11% 0 -38.22% -1.79%',
});
const OLA_B = (left: number, top: number): IntroLayer => ({
  src: `${P}paso3-ola-1169.svg`,
  rol: 'agua',
  box: { left, top, width: 42.857, height: 5.269 },
  inset: '-61.73% -1.33% -31.04% -3.57%',
});
const OLA_C = (left: number, top: number): IntroLayer => ({
  src: `${P}paso3-ola-1171.svg`,
  rol: 'agua',
  box: { left, top, width: 207.723, height: 11.302 },
  inset: '-27.53% 0 -40.29% -0.31%',
});

/* ─────────────────────────────────────────────────────────────────────────────
   Breakpoints
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * Cada breakpoint tiene su propio lienzo y su propia composición, pero **reutiliza
 * las mismas capas**: la ilustración de tablet y la de desktop son la de mobile
 * escalada y desplazada. Cada paso reparte sus capas en grupos, porque en tablet y
 * desktop el diseño no mueve la ilustración entera de una pieza sino por partes
 * (en el paso 2, el horizonte, el agua y el barco llevan escalas distintas).
 *
 * Verificado contra capas de control de Figma con `get_metadata`: dentro de cada
 * grupo el error máximo es de 0.05 px sobre lienzos de 1024 y 1280 (D17 y D18).
 * Por eso aquí solo se guardan tres números por grupo y breakpoint en vez de
 * transcribir las capas otra vez.
 */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

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
  /** Papel en las transiciones: siempre `texto`, entra y sale por párrafo. */
  rol?: Rol;
  /** Claves de `locales` que componen cada párrafo. Se unen con un espacio. */
  paragraphs: string[][];
}

export interface IntroVariant {
  canvas: { width: number; height: number };
  /**
   * Grupos que se estiran hasta el borde de la pantalla en vez de cortarse en el lienzo. Se usa
   * en desktop, donde el lienzo se congela a 1280 y en una pantalla más ancha el horizonte
   * quedaba flotando, con los cantos cortados a media pantalla.
   */
  sangra?: string[];
  /**
   * Escala y desplazamiento de cada grupo compartido del paso, respecto al lienzo
   * mobile. En mobile se omite: los grupos se pintan tal cual.
   */
  groups?: Record<string, GroupTransform>;
  /** Capas propias de este breakpoint, ya en px de SU lienzo. Van debajo de los grupos. */
  own: IntroLayer[];
  texts: IntroText[];
}

export interface IntroStep {
  /** Id del ancla en mobile; tablet y desktop le añaden el sufijo del breakpoint. */
  id: string;
  /**
   * Grupos de capas que comparten los tres breakpoints, en px del lienzo mobile.
   * El orden de las claves es el orden de apilado.
   */
  groups: Record<string, IntroLayer[]>;
  variants: Partial<Record<Breakpoint, IntroVariant>> & { mobile: IntroVariant };
}

const MOBILE = { width: 390, height: 700 };
const TABLET = { width: 1024, height: 1366 };
const DESKTOP = { width: 1280, height: 832 };

const PASO_1_TEXTO = [['hero.section1.text1'], ['hero.section1.text2', 'hero.section1.text3']];

const PASO_1: IntroStep = {
  id: 'intro-paso-1',
  /** Todo menos el garabato de fondo, que tiene su propia escala en cada breakpoint. */
  groups: { burbujas: STEP_1_LAYERS.slice(1) },
  variants: {
    mobile: {
      canvas: MOBILE,
      own: [STEP_1_LAYERS[0]],
      texts: [
        {
          left: 30,
          top: 536,
          width: 330,
          size: 20,
          align: 'center',
          rol: 'texto',
          tracking: '-0.03em',
          paragraphs: PASO_1_TEXTO,
        },
      ],
    },
    tablet: {
      canvas: TABLET,
      groups: { burbujas: { scale: 1.723, dx: 179, dy: 34.6 } },
      own: [
        {
          src: `${P}paso1-squiggle-grande.svg`,
          rol: 'garabato',
          box: { left: 6.255, top: 84, width: 1393.172, height: 919.065 },
          inset: '-0.47% 0 -1.35% -0.71%',
        },
        PASO_3_SOL(939, 806, 0.6547),
      ],
      texts: [
        {
          left: 315,
          top: 1027,
          width: 454,
          size: 30,
          align: 'center',
          rol: 'texto',
          tracking: '-0.04em',
          paragraphs: PASO_1_TEXTO,
        },
      ],
    },
    desktop: {
      canvas: DESKTOP,
      groups: { burbujas: { scale: 1.2988, dx: 92, dy: 66 } },
      own: [
        {
          src: `${P}paso1-squiggle-grande.svg`,
          rol: 'garabato',
          box: { left: 10.9, top: 80.47, width: 1279.254, height: 630.662 },
          inset: '-0.47% 0 -1.35% -0.71%',
        },
        PASO_3_SOL(1171, 550, 0.6547),
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
          rol: 'texto',
          tracking: '-0.04em',
          paragraphs: PASO_1_TEXTO,
        },
      ],
    },
  },
};

const PASO_2_TEXTO = [['hero.section2.paragraph']];

/**
 * En tablet y desktop el sol de arriba deja de ser una capa única: es el mismo sol
 * del paso 3 (a escala 1.444) más una espiral nueva, colocada a su derecha.
 */
const PASO_2_SOL_GRANDE = (left: number, top: number) => PASO_3_SOL(left, top, 1.444);
const PASO_2_ESPIRAL = (left: number, top: number): IntroLayer => ({
  src: `${P}paso2-espiral.svg`,
  rol: 'garabato',
  box: { left, top, width: 74.069, height: 105.197 },
  inset: '-2.33% 0 -2.73% -5.86%',
});

const PASO_2: IntroStep = {
  id: 'intro-paso-2',
  groups: { horizonte: PASO_2_HORIZONTE, agua: PASO_2_AGUA, barco: PASO_2_BARCO },
  variants: {
    mobile: {
      canvas: MOBILE,
      own: [PASO_2_SOL_MOBILE],
      texts: [
        {
          left: 53,
          top: 387,
          width: 293,
          size: 14,
          align: 'left',
          rol: 'texto',
          paragraphs: PASO_2_TEXTO,
        },
      ],
    },
    tablet: {
      canvas: TABLET,
      groups: {
        horizonte: { scale: 1.0417, dx: 547.15, dy: 367.33 },
        agua: { scale: 1.3192, dx: 227, dy: 356.68 },
        barco: { scale: 1.3368, dx: -5.97, dy: 322.9 },
      },
      own: [PASO_2_SOL_GRANDE(449, 170), PASO_2_ESPIRAL(527, 170)],
      texts: [
        {
          left: 512,
          top: 1057,
          width: 430,
          size: 20,
          align: 'left',
          rol: 'texto',
          paragraphs: PASO_2_TEXTO,
        },
      ],
    },
    desktop: {
      canvas: DESKTOP,
      sangra: ['horizonte'],
      groups: {
        horizonte: { scale: 1.1234, dx: 758.25, dy: 113.38 },
        agua: { scale: 1.3192, dx: 359, dy: 74.93 },
        barco: { scale: 1.1748, dx: 72.97, dy: -41.27 },
      },
      own: [PASO_2_SOL_GRANDE(561, 103), PASO_2_ESPIRAL(632, 92)],
      texts: [
        {
          left: 710,
          top: 611,
          width: 430,
          size: 20,
          align: 'left',
          rol: 'texto',
          paragraphs: PASO_2_TEXTO,
        },
      ],
    },
  },
};

const PASO_3_TITULO: Omit<IntroText, 'left' | 'top' | 'width' | 'size'> = {
  align: 'left',
  rol: 'texto',
  bold: true,
  paragraphs: [['hero.section3.title']],
};
const PASO_3_PARRAFO: Omit<IntroText, 'left' | 'top' | 'width' | 'size'> = {
  align: 'left',
  rol: 'texto',
  paragraphs: [['hero.section3.text']],
};

/** Tablet y desktop mueven el barco y sus olas 1 px en x y 1.75 px en y entre sí. */
const PASO_3: IntroStep = {
  id: 'intro-paso-3',
  groups: { barco: PASO_3_BARCO, olas: PASO_3_OLAS },
  variants: {
    mobile: {
      canvas: MOBILE,
      // Orden de Figma: la nube tapa al sol y el garabato va encima de los dos.
      own: [
        PASO_3_SOL(46, 56),
        PASO_3_NUBE(-19, 99, 93, 34),
        PASO_3_GARABATO(102, 86, 124.583, 13),
      ],
      texts: [
        { left: 51, top: 458, width: 307, size: 20, ...PASO_3_TITULO },
        { left: 51, top: 550, width: 307, size: 14, ...PASO_3_PARRAFO },
      ],
    },
    tablet: {
      canvas: TABLET,
      groups: {
        barco: { scale: 1.18525, dx: 425.25, dy: 656.06 },
        olas: { scale: 1.18525, dx: 424.25, dy: 654.31 },
      },
      own: [
        PASO_3_SOL(175.03, 193, 1.5657),
        PASO_3_NUBE(102, 261, 145.609, 53.233),
        PASO_3_GARABATO(269, 230, 230, 24),
        OLA_A(329.73, 1107.14),
        OLA_A(851, 1175.25),
        OLA_B(611, 1185),
        OLA_C(212, 1163.76),
      ],
      texts: [
        // Figma da 821 de ancho al título, pero lo parte a mano tras "históricamente".
        // Con el ancho del párrafo cae solo en las mismas dos líneas.
        { left: 221, top: 544, width: 524, size: 25, ...PASO_3_TITULO },
        { left: 221, top: 635, width: 524, size: 20, ...PASO_3_PARRAFO },
      ],
    },
    desktop: {
      canvas: DESKTOP,
      groups: {
        barco: { scale: 1.18525, dx: 125.25, dy: 140.06 },
        olas: { scale: 1.18525, dx: 124.25, dy: 138.31 },
      },
      own: [
        PASO_3_SOL(159.03, 122, 1.5657),
        PASO_3_NUBE(86, 190, 145.609, 53.233),
        PASO_3_GARABATO(250, 166, 230, 24),
        OLA_A(29.73, 591.14),
        OLA_A(551, 659.25),
        OLA_B(311, 669),
        OLA_C(-88, 647.76),
      ],
      texts: [
        { left: 673, top: 435, width: 524, size: 25, ...PASO_3_TITULO },
        { left: 673, top: 526, width: 524, size: 20, ...PASO_3_PARRAFO },
      ],
    },
  },
};

/** Los 3 pasos, en el orden en que se muestran. */
export const INTRO_STEPS: IntroStep[] = [PASO_1, PASO_2, PASO_3];
