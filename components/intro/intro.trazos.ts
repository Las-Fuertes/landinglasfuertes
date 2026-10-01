/**
 * Líneas centrales de los trazos amarillos de la Introducción, para dibujarlos "como si se
 * escribieran" (docs/introduccion/DECISIONES.md, D10).
 *
 * En Figma cada trazo amarillo es un vector con un pincel ("HEIST", tipo STRETCH): el SVG que se
 * sirve es ese pincel ya convertido a relleno, así que no tiene un `stroke` que animar. Lo que sí
 * guarda Figma es el vector original, la línea por la que pasa el pincel. Aquí va esa línea tal
 * cual la da `vectorPaths` (use_figma de solo lectura, 2026-09-30), en coordenadas locales del
 * vector. Se usa de dos maneras:
 *
 * - Como máscara: un `stroke` blanco, algo más grueso que el pincel, que se va desplegando con
 *   `stroke-dashoffset` y deja ver el relleno de debajo a medida que avanza.
 * - Como guía: la bolita roja de la parte 1 recorre esta misma línea hacia la parte 2.
 *
 * Nodos de origen (archivo ng8HnnYyaDJ2nTWauh7Otb): parte 1 `1230:94` (el mismo vector que el
 * `1177:1705` de desktop, a otra escala), espiral de la parte 2 `1230:96` (el de mobile, que es
 * el mismo dibujo que el espiral de tablet y desktop), trazo de la parte 3 `1230:98`.
 */

export interface Trazo {
  /** La línea central, en unidades locales del vector de Figma. */
  d: string;
  /**
   * Tamaño de la caja de la capa en esas mismas unidades (la caja interior, si la capa va
   * girada). La capa puede medir otra cosa en pantalla: el trazo escala con ella.
   */
  caja: { w: number; h: number };
  /** Dónde empieza el vector dentro de esa caja, cuando no ocupa la caja entera. */
  dx?: number;
  dy?: number;
  /** Grosor nominal del pincel en Figma (`strokeWeight`), en unidades del vector. */
  grosor: number;
}

/** Parte 1: la línea grande que da la vuelta al racimo de burbujas. Empieza en el bucle de arriba. */
export const TRAZO_PASO_1: Trazo = {
  caja: { w: 700.885, h: 345.531 },
  grosor: 8.766,
  d: 'M105.05 0.89C103.16 0.2 94.12 -1.12 72.27 1.89C51.98 4.68 38.04 12.4 32.56 14.36C23.5 17.62 15.6 22.81 9.71 28.6C0.98 37.16 -0.05 46.34 0 52.5C0.06 58.44 4.42 63.08 8.48 67.76C12.8 72.73 23.28 75.32 40.75 78.79C64.11 83.43 82.94 79.65 91.87 77.78C113.17 73.33 132.58 56.34 137.62 51.12C139.94 48.72 139.97 45.01 139.43 42.22C138.85 39.18 134.17 38.14 130.19 37.56C122.87 36.49 110.17 41.37 92.61 51.12C80.01 58.11 73.59 65.38 70.02 70.12C54.44 90.8 50.03 102.18 48.29 109.01C46.74 115.09 48.69 122.33 50.91 127.4C53.48 133.27 61.04 135.01 68.03 136.88C71.68 137.86 75.05 137.47 81.36 136.81C86.32 136.29 94.83 135.06 129.81 133.55C164.8 132.04 226 130.19 260.92 129.78C295.83 129.37 302.61 130.46 307.36 131.38C319.64 133.78 330.17 140.58 342.49 150.31C348.72 155.23 351.51 162.29 353.01 167.69C353.79 170.51 353.15 174.57 352.27 178.84C351.6 182.06 347.62 186.49 342 192.46C337.23 197.53 324.41 205.97 307.11 218.7C285.57 234.54 281.31 247.62 278.69 255.4C276.35 262.37 278.21 271.39 284.38 289.97C289.63 305.8 298.79 313.54 307.39 321C315.35 327.91 330.56 333.58 347.87 339.56C356.25 342.45 364.2 343.85 378.62 344.76C393.04 345.67 413.79 345.74 428.81 345.14C443.83 344.54 452.5 343.26 462.9 340.57C485.44 334.75 500.27 328.2 511.93 320.37C520.96 314.3 535.4 302.67 547.69 294.16C568.91 279.47 579.79 275.68 584.65 273.91C591.19 271.52 604.53 268.73 623.43 269.01C634.43 269.18 648.2 271.55 659.26 273.91C678.24 279.09 688.36 282.97 692.36 284.69C694.4 285.44 696.45 285.97 700.88 287.52',
};

/**
 * Parte 2: el espiral amarillo junto al sol. En mobile vive dentro de la caja del grupo sol +
 * espiral (107,919 x 93, `Group 235`), desplazado (53, 15); en tablet y desktop es una capa propia.
 */
const D_ESPIRAL_2 =
  'M25.72 0C21.62 0.31 11.13 3.29 5.71 7.25C3.28 9.02 1.59 12.81 0.24 17.27C-0.41 19.44 0.38 21.73 1.2 23.4C2.69 26.45 5.97 27.95 9.64 29.16C14.2 30.65 19.07 29.6 22.81 28.14C24.68 27.42 26.08 25.85 26.67 24.3C27.25 22.75 26.88 21.04 25.98 19.89C25.08 18.75 23.65 18.24 22.01 18.2C18.5 18.11 14.53 20.35 10.78 22.79C7.85 24.7 5.85 28.09 4.36 32.74C3.57 35.18 4.04 38.14 5.03 40.48C6.01 42.81 7.82 44.51 9.55 45.55C12.63 47.4 17.14 46.92 21.97 45.84C24.23 45.33 25.87 44.01 27.1 42.7C28.33 41.4 29.03 39.91 28.78 38.57C28.53 37.22 27.31 36.06 25.58 35.93C23.85 35.8 21.65 36.75 19.94 38.15C16.59 40.87 15.74 46.09 16.31 51.55C16.58 54.21 18.44 56.37 20.37 58.04C22.29 59.71 24.64 60.76 27.05 61.08C31.8 61.7 36.33 58.97 39.01 55.99C40.09 54.8 38.87 53.16 37.69 53.39C34.33 54.04 33.03 59.63 32.54 63.75C32.15 67.07 33.67 70.72 35.73 74.3C37.35 77.13 40.87 77.66 44.22 78C46.08 78 48.28 77.67 50.02 76.98C51.77 76.28 52.99 75.23 54.92 72.49';

export const TRAZO_ESPIRAL_2: Trazo = {
  caja: { w: 54.919, h: 78 },
  grosor: 11.863,
  d: D_ESPIRAL_2,
};

export const TRAZO_ESPIRAL_2_MOBILE: Trazo = {
  caja: { w: 107.919, h: 93 },
  dx: 53,
  dy: 15,
  grosor: 11.863,
  d: D_ESPIRAL_2,
};

/** Parte 3: el trazo ondulado del cielo. */
export const TRAZO_PASO_3: Trazo = {
  caja: { w: 124.583, h: 13 },
  grosor: 8.667,
  d: 'M0.12 13C-0.13 12.16 -0.06 9.24 1.09 6.98C1.38 6.42 2.15 6.16 2.78 6.2C5.53 6.37 6.51 9.53 7.94 11.44C8.27 11.89 9.18 11.61 9.76 11.34C12.05 10.29 12.3 6.56 14.23 4.12C14.67 3.56 15.74 3.87 16.43 4.1C19.15 4.99 19.97 8.25 21 10.54C21.24 11.07 22.34 10.86 23.07 10.55C26.71 8.97 26.72 4.13 27.74 3.23C28.27 2.77 29.24 2.82 29.92 3.01C34.26 4.26 35.38 11.34 36.62 11.78C39.05 12.65 41.35 6.75 44.39 3.46C45.02 2.79 46 2.7 46.74 2.66C47.48 2.62 48.12 2.82 48.75 3.32C52.07 5.96 53.16 9.47 54.16 10.13C54.67 10.47 55.49 10.4 56.08 10.22C59.71 9.09 60.17 2.94 61.25 1.97C61.8 1.46 62.74 1.32 63.47 1.33C64.2 1.34 64.79 1.61 65.26 2.08C68.08 4.82 68.73 9.29 70.02 9.91C73.03 11.38 76.12 4.88 78.97 1.41C79.57 0.69 80.56 0.34 81.34 0.13C82.12 -0.09 82.82 -0.03 83.4 0.33C85.85 1.85 85.71 6.45 87.44 9.32C87.77 9.85 88.83 9.31 89.49 8.86C92.38 6.83 93.71 3.07 97.26 1.65C98.09 1.32 98.92 1.73 99.6 2.12C102.59 3.83 102.93 7.85 104.47 9.76C104.89 10.28 106 10.16 106.8 9.99C110.41 9.25 112.65 5.21 115.45 4.66C117.68 5.86 119.75 7.75 122.67 8.08C123.38 7.99 123.97 7.79 124.58 7.58',
};
