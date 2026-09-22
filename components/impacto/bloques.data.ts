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
  /** Segundos de espera antes de entrar (en `despues` y en `extras`). */
  delay?: number;
  /**
   * Patrón de encendido, solo en los bloques con `entrada: 'parpadeo'`. `titilar` es la lámpara
   * que chispea varias veces antes de enganchar; `encender` es el golpe corto de la otra.
   */
  anim?: 'titilar' | 'encender';
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
   * Cómo cambia de estado: `subir` es un barrido de abajo arriba sobre todo el lienzo que
   * descubre `despues` y recorta `antes` (el agua de la piscina); `llenar` es el mismo barrido
   * pero dentro de la caja de cada capa (el líquido de la copa); `fundido` funde cada capa de
   * `despues` por su cuenta, con su `delay`, y apaga `antes` a la vez; `parpadeo` las enciende
   * a golpes, sin fundido, como un tubo que arranca mal (las lámparas); `florecer` descubre
   * `despues` en un círculo que crece desde el centro (el color de la persona).
   */
  entrada: 'subir' | 'llenar' | 'fundido' | 'parpadeo' | 'florecer';
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
  entrada: 'parpadeo',
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
    // La de la izquierda chispea sola un rato; la de la derecha entra de golpe justo cuando la
    // primera engancha, así que acaban encendidas casi a la vez.
    { src: `${P}luces/cono-izq.svg`, box: LUCES_BOX, inset: LUCES_INSET, anim: 'titilar' },
    {
      src: `${P}luces/cono-der.svg`,
      box: LUCES_BOX,
      inset: LUCES_INSET,
      anim: 'encender',
      delay: 1.2,
    },
  ],
};

/** Bloque 3: la copa menstrual que se llena. Antes `1103:544`, después `1103:558`. */
const COPA: Bloque = {
  id: 'copa',
  figma: { antes: '1103:544', despues: '1103:558' },
  lienzo: { top: 39, height: 404 },
  texto: 518,
  entrada: 'llenar',
  base: [
    {
      src: `${P}copa/cuerpo.svg`,
      box: { left: 82.9, top: 172.14, width: 214.84, height: 270.455 },
      rotate: -1.04,
      inner: { width: 210.054, height: 266.703 },
      inset: '-0.24% 0 -0.23% -0.23%',
    },
    {
      src: `${P}copa/borde.svg`,
      box: { left: 76.31, top: 139, width: 224.849, height: 53.04 },
      rotate: -1.04,
      inner: { width: 224, height: 49 },
      inset: '-1.41% -0.32% -1.16% -0.31%',
    },
  ],
  antes: [],
  despues: [
    {
      src: `${P}copa/liquido.svg`,
      box: { left: 118, top: 267, width: 135.5, height: 89.251 },
      inset: '-0.8% -1.07% -0.74% -0.68%',
    },
  ],
  extras: [
    {
      src: `${P}copa/brillo-c.svg`,
      box: { left: 176, top: 39, width: 19, height: 33 },
      inset: '-0.42% -8.65% -0.13% -1.02%',
    },
    {
      src: `${P}copa/brillo-a.svg`,
      box: { left: 239, top: 95, width: 22, height: 38.5 },
      inset: '-0.36% -7.43% -0.11% -0.85%',
    },
    {
      src: `${P}copa/brillo-c.svg`,
      box: { left: 76, top: 106, width: 19, height: 33 },
      inset: '-0.42% -8.65% -0.13% -1.02%',
    },
    {
      src: `${P}copa/brillo-b.svg`,
      box: { left: 293, top: 267, width: 21, height: 36 },
      inset: '-0.39% -7.9% -0.12% -0.89%',
    },
  ],
};

/** Bloque 4: la persona que toma color. Antes `1102:400`, después `1102:414`. */
const PERSONA_BOX = { left: -3.46, top: 197, width: 392.544, height: 247 };
const PERSONA: Bloque = {
  id: 'persona',
  figma: { antes: '1102:400', despues: '1102:414' },
  lienzo: { top: 197, height: 247 },
  texto: 536,
  entrada: 'florecer',
  antes: [{ src: `${P}persona/antes.svg`, box: PERSONA_BOX, inset: '-0.19% 0 0 0' }],
  despues: [{ src: `${P}persona/despues.svg`, box: PERSONA_BOX, inset: '-0.19% 0 0 0' }],
};

export const BLOQUES: Bloque[] = [PISCINA, LUCES, COPA, PERSONA];
