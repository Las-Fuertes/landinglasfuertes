/**
 * Las cinco rutas del mapa educativo (docs/mapa-educativo/DECISIONES.md, D1).
 *
 * Mapa de Figma 966:11627, rehecho el 2026-09-24. El lienzo es el rectángulo 966:11635 (x 224,
 * 1638 de ancho) más una franja de mar abajo, hasta y 1520, donde terminan los caminos que en el
 * diseño se salen del rectángulo. Todas las coordenadas van en unidades de ese lienzo: las de la
 * sección de Figma menos 224 en x. Un px del lienzo es un px de Figma.
 *
 * Cada parada es un grupo de la diseñadora (etiqueta en cinta negra, ilustración y el punto "Haz
 * clic aquí"). `box` es la caja del grupo: es el área de clic y lo que encuadra la cámara. `cx`,
 * `cy` es el centro del punto rosado, donde van los aros que laten.
 */

export const VIEWBOX = { w: 1638, h: 1520 } as const;

/** Relación ancho/alto del mapa. Todo el cálculo de tamaño depende de esta constante. */
export const MAP_ASPECT = VIEWBOX.w / VIEWBOX.h;

export type MapRouteId = 'talleres' | 'clubes' | 'ruta' | 'chiquifuertes' | 'voces';

/** Rectángulo en unidades del viewBox. */
export interface MapBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MapRoute {
  id: MapRouteId;
  /** Nodo del grupo en Figma, para volver a medir si el diseño cambia. */
  figma: string;
  /** Caja del grupo entero en unidades del viewBox. */
  box: MapBox;
  /** Caja de la etiqueta (la cinta negra): lo que más distrae si asoma en otra parada. */
  label: MapBox;
  /** Centro del punto "Haz clic aquí" en unidades del viewBox. */
  cx: number;
  cy: number;
  /** El mismo centro normalizado a 0–1. */
  u: number;
  v: number;
  /** Foto del modal. El ancho/alto intrínseco evita saltos de layout. */
  image: { width: number; height: number };
  /** Prefijo de i18n: `${i18n}.name`, `.age`, `.body`, `.imageAlt`. */
  i18n: string;
}

/** Figma da la sección entera; el lienzo empieza en el rectángulo 966:11635. */
const ORIGEN_X = 224;

type Raw = Pick<MapRoute, 'id' | 'figma' | 'image'> & {
  /** Caja del grupo en coordenadas de la sección de Figma. */
  grupo: MapBox;
  /** Caja de la cinta negra con el nombre, en coordenadas de la sección. */
  cinta: MapBox;
  /** Esquina y lado del anillo exterior del punto (Ellipse de 33,48). */
  punto: { x: number; y: number };
};

const ANILLO = 33.4778;

/** El orden es el de la ruta: Talleres, Clubes, Mi ruta, ChiquiFuertes, Voces Soberanas. */
const RAW: Raw[] = [
  {
    id: 'talleres',
    figma: '1310:11',
    grupo: { x: 456, y: 70.95, w: 443.56, h: 447.08 },
    cinta: { x: 560, y: 374, w: 216.99, h: 40.05 },
    punto: { x: 543, y: 224 },
    image: { width: 582, height: 670 },
  },
  {
    id: 'clubes',
    figma: '1310:7',
    grupo: { x: 959, y: 314, w: 284.18, h: 268.19 },
    cinta: { x: 1020, y: 314, w: 223.18, h: 74.8 },
    punto: { x: 995.24, y: 483.52 },
    image: { width: 610, height: 670 },
  },
  {
    id: 'ruta',
    figma: '1310:13',
    grupo: { x: 1307, y: 572, w: 375.62, h: 225 },
    cinta: { x: 1337.23, y: 572, w: 218.77, h: 73.96 },
    punto: { x: 1396.24, y: 763.52 },
    image: { width: 606, height: 670 },
  },
  {
    id: 'chiquifuertes',
    figma: '1310:10',
    grupo: { x: 942, y: 849, w: 296.94, h: 333.73 },
    cinta: { x: 975, y: 849, w: 216.99, h: 38.5 },
    punto: { x: 1036.24, y: 955.64 },
    image: { width: 562, height: 670 },
  },
  {
    id: 'voces',
    figma: '1310:8',
    grupo: { x: 423, y: 679, w: 305.39, h: 303 },
    cinta: { x: 481, y: 679, w: 247.39, h: 63.67 },
    punto: { x: 606.24, y: 888.52 },
    image: { width: 608, height: 670 },
  },
];

const aLienzo = (b: MapBox): MapBox => ({ ...b, x: b.x - ORIGEN_X });

export const MAP_ROUTES: MapRoute[] = RAW.map(({ grupo, cinta, punto, ...r }) => {
  const cx = punto.x + ANILLO / 2 - ORIGEN_X;
  const cy = punto.y + ANILLO / 2;
  return {
    ...r,
    box: aLienzo(grupo),
    label: aLienzo(cinta),
    cx,
    cy,
    u: cx / VIEWBOX.w,
    v: cy / VIEWBOX.h,
    i18n: `educationMap.routes.${r.id}`,
  };
});

export const ROUTE_COUNT = MAP_ROUTES.length;

export const routePhoto = (id: MapRouteId, ext: 'avif' | 'webp') =>
  `/images/education-map/routes/${id}.${ext}`;

/** Anchos de los derivados del mapa que existen en public/images/education-map/mapa-ruta-*. */
export const MAP_WIDTHS = [1200, 1600, 2400, 3200, 4000] as const;
