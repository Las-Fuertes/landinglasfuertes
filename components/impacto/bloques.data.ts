/**
 * Los 4 bloques ilustrados de "Así se ve el impacto en acción", transcritos de Figma
 * (archivo ng8HnnYyaDJ2nTWauh7Otb). Cada bloque tiene un frame "antes" y uno "después" de
 * animar; aquí van las capas de los dos estados, medidas en px del frame mobile de 390 de ancho.
 *
 * El orden de cada arreglo ES el orden de apilado: el primero queda al fondo. Las capas de
 * `despues` se pintan encima de las de `antes`, así que no hace falta apagar nada.
 */

export type BloqueId = 'piscina' | 'luces' | 'copa' | 'persona';

export interface Capa {
  /** Ruta dentro de /public. */
  src: string;
  /** Caja de la capa en px del frame mobile (coordenadas del frame, no del lienzo). */
  box: { left: number; top: number; width: number; height: number };
  /** `inset` del <img> dentro de su caja, tal cual lo da Figma (el trazo se sale). */
  inset?: string;
  rotate?: number;
  inner?: { width: number; height: number };
  /** Segundos de espera antes de entrar (solo en `despues` con fundido, y en `extras`). */
  delay?: number;
}

export interface Bloque {
  id: BloqueId;
  /** Frames de Figma, por si hay que volver. */
  figma: { antes: string; despues: string };
  /** Franja del frame que ocupa la ilustración; las capas se posicionan dentro de ella. */
  lienzo: { top: number; height: number };
  /** Dónde empieza el título en el frame; el aire hasta la ilustración sale de aquí. */
  texto: number;
  /**
   * Cómo cambia de estado: `subir` es un barrido de abajo arriba que descubre `despues` y
   * recorta `antes` (el agua de la piscina); `fundido` funde cada capa de `despues` por su
   * cuenta, con su `delay`, y apaga `antes` a la vez.
   */
  entrada: 'subir' | 'fundido';
  /** Capas que están en los dos estados y no cambian. */
  base?: Capa[];
  /** Capas que solo están en el estado "antes". */
  antes: Capa[];
  /** Capas que solo están en el estado "después". */
  despues: Capa[];
  /** Capas que aparecen al final, una a una, con un pequeño rebote. */
  extras?: Capa[];
}

const P = '/images/impacto/';

/** Bloque 1: la piscina que se llena. Antes `1102:162`, después `1102:286`. */
const PISCINA: Bloque = {
  id: 'piscina',
  figma: { antes: '1102:162', despues: '1102:286' },
  lienzo: { top: 197, height: 168 },
  texto: 503,
  entrada: 'subir',
  antes: [
    {
      src: `${P}piscina/antes-fondo.svg`,
      box: { left: 9, top: 205, width: 370, height: 151 },
      inset: '-0.36% -0.44% -0.51% 0',
    },
    {
      src: `${P}piscina/antes-pared-izq.svg`,
      box: { left: 40, top: 229, width: 108, height: 72 },
      inset: '-1.38% -0.73% -0.95% -0.17%',
    },
    {
      src: `${P}piscina/antes-pared-der.svg`,
      box: { left: 148, top: 229, width: 202, height: 115 },
      inset: '-0.46% -0.95% -0.67% -0.5%',
    },
    {
      src: `${P}piscina/antes-suelo.svg`,
      box: { left: 115, top: 289, width: 159, height: 67 },
      inset: '-1.12% -1.02% -1.15% -0.12%',
    },
    {
      src: `${P}piscina/antes-borde.svg`,
      box: { left: -10, top: 197, width: 409, height: 168 },
      inset: '-0.15% -0.2% -0.23% 0',
    },
    {
      src: `${P}piscina/antes-escalera.svg`,
      box: { left: 68.74, top: 213.22, width: 26.777, height: 51.559 },
      inset: '-1.12% -2.57% 0 -2.68%',
    },
  ],
  despues: [
    {
      src: `${P}piscina/despues-fondo.svg`,
      box: { left: 9, top: 205, width: 370, height: 151 },
      inset: '-0.18% -0.22% -0.26% 0',
    },
    {
      src: `${P}piscina/despues-pared-izq.svg`,
      box: { left: 40, top: 229, width: 108, height: 72 },
      inset: '-1.38% -0.73% -0.95% -0.17%',
    },
    {
      src: `${P}piscina/despues-pared-der.svg`,
      box: { left: 148, top: 229, width: 202, height: 115 },
      inset: '-0.46% -0.95% -0.67% -0.5%',
    },
    {
      src: `${P}piscina/despues-suelo.svg`,
      box: { left: 115, top: 289, width: 159, height: 67 },
      inset: '-1.12% -1.02% -1.15% -0.12%',
    },
    {
      src: `${P}piscina/despues-borde.svg`,
      box: { left: -10, top: 197, width: 409, height: 168 },
      inset: '-0.29% -0.4% -0.46% 0',
    },
    {
      src: `${P}piscina/despues-escalera.svg`,
      box: { left: 68.74, top: 213.22, width: 26.777, height: 51.559 },
      inset: '-1.12% -2.57% 0 -2.68%',
    },
  ],
  extras: [
    {
      src: `${P}piscina/flotador-1.svg`,
      box: { left: 168, top: 275, width: 47, height: 25 },
      inset: '-8% -4.26%',
    },
    {
      src: `${P}piscina/flotador-1-centro.svg`,
      box: { left: 180, top: 282, width: 22, height: 11 },
    },
    {
      src: `${P}piscina/flotador-2.svg`,
      box: { left: 225, top: 289, width: 44, height: 24 },
      inset: '-8.33% -4.55%',
    },
    {
      src: `${P}piscina/flotador-2-centro.svg`,
      box: { left: 237, top: 295, width: 21, height: 11 },
    },
  ],
};

/** Bloque 2: las lámparas que se encienden. Antes `1102:322`, después `1102:363`. */
const LUCES_BOX = { left: 30, top: 93, width: 360, height: 406 };
const LUCES_INSET = '0 -0.23% -0.14% -0.25%';
const LUCES: Bloque = {
  id: 'luces',
  figma: { antes: '1102:322', despues: '1102:363' },
  lienzo: { top: 93, height: 406 },
  texto: 549,
  entrada: 'fundido',
  base: [
    { src: `${P}luces/postes.svg`, box: LUCES_BOX, inset: LUCES_INSET },
    // La cabeza de la lámpara derecha solo está en el frame "antes"; en el "después" la tapa el
    // cono. Se deja siempre, que es lo que se ve en los dos.
    {
      src: `${P}luces/cabeza.svg`,
      box: { left: 342, top: 195, width: 40, height: 26.5 },
      inset: '-2.22% -1.81% -4.1% -4.12%',
    },
  ],
  antes: [],
  despues: [
    { src: `${P}luces/cono-izq.svg`, box: LUCES_BOX, inset: LUCES_INSET },
    { src: `${P}luces/cono-der.svg`, box: LUCES_BOX, inset: LUCES_INSET, delay: 0.45 },
  ],
};

export const BLOQUES: Bloque[] = [PISCINA, LUCES];
