/**
 * Las cinco rutas del mapa educativo (docs/mapa-educativo/DECISIONES.md, D1 y D11).
 *
 * Mapa de Figma 1431:985 (2026-09-30, D11): el frame entero, 1280 x 1039, con la isla dentro y el
 * mar alrededor. Sustituye al lienzo de 966:11627 (1638 x 1520, D1), que se conserva como
 * `mapa-ruta-*`. Todas las coordenadas van en unidades del frame: un px del lienzo es un px de
 * Figma.
 *
 * Cada parada es un grupo de la diseñadora (etiqueta en cinta negra, ilustración y el punto "Haz
 * clic aquí"). `box` es la caja del grupo: es el área de clic y lo que encuadra la cámara. `cx`,
 * `cy` es el centro del punto rosado, donde van los aros que laten.
 */

export const VIEWBOX = { w: 1280, h: 1039 } as const;

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

type Raw = Pick<MapRoute, 'id' | 'figma' | 'image'> & {
  /** Caja del grupo en coordenadas del frame 1431:985. */
  grupo: MapBox;
  /** Caja de la cinta negra con el nombre (la unión de sus rectángulos), en el frame. */
  cinta: MapBox;
  /** Esquina del anillo exterior del punto (Ellipse 40 de 27,71). */
  punto: { x: number; y: number };
};

const ANILLO = 27.7142;

/** El orden es el de la ruta: Talleres, Clubes, Mi ruta, ChiquiFuertes, Voces Soberanas. */
const RAW: Raw[] = [
  {
    id: 'talleres',
    figma: '1431:1411',
    grupo: { x: 192.06, y: 51, w: 358.29, h: 342.17 },
    cinta: { x: 278.15, y: 285.35, w: 146.37, h: 31.77 },
    punto: { x: 264.08, y: 159.8 },
    image: { width: 582, height: 670 },
  },
  {
    id: 'clubes',
    figma: '1431:1004',
    grupo: { x: 608.46, y: 234.3, w: 235.25, h: 222.02 },
    cinta: { x: 658.96, y: 236.05, w: 184.75, h: 54.36 },
    punto: { x: 638.46, y: 374.64 },
    image: { width: 610, height: 670 },
  },
  {
    id: 'ruta',
    figma: '1431:1064',
    grupo: { x: 896.55, y: 447.88, w: 310.95, h: 193.83 },
    cinta: { x: 921.57, y: 448.93, w: 111.07, h: 54.11 },
    punto: { x: 993.87, y: 614 },
    image: { width: 606, height: 670 },
  },
  {
    id: 'chiquifuertes',
    figma: '1431:1259',
    grupo: { x: 502, y: 659, w: 248.63, h: 272.06 },
    cinta: { x: 571, y: 659, w: 156.61, h: 31.87 },
    punto: { x: 576.2, y: 734.81 },
    image: { width: 562, height: 670 },
  },
  {
    id: 'voces',
    figma: '1431:1098',
    grupo: { x: 163, y: 527, w: 252.82, h: 250.84 },
    cinta: { x: 211.01, y: 527, w: 189.31, h: 52.71 },
    punto: { x: 314.69, y: 700.45 },
    image: { width: 608, height: 670 },
  },
];

export const MAP_ROUTES: MapRoute[] = RAW.map(({ grupo, cinta, punto, ...r }) => {
  const cx = punto.x + ANILLO / 2;
  const cy = punto.y + ANILLO / 2;
  return {
    ...r,
    box: grupo,
    label: cinta,
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

/** Anchos de los derivados del mapa que existen en public/images/education-map/mapa-isla-*. */
export const MAP_WIDTHS = [1200, 1600, 2400, 3200, 4000] as const;

/**
 * Modal de parada en desktop, Figma 1335:2046 (Talleres), 1338:2690 (Clubes; 1338:3182 es un
 * duplicado exacto), 1338:3669 (Mi ruta), 1338:4157 (Chiquifuertes) y 1338:4644 (Voces). Ver
 * docs/mapa-educativo/DECISIONES.md, D11.
 *
 * `pajaros` es la caja del adorno (Vector 1313, girado 15°) relativa a la esquina de la foto de
 * 369 x 340, en px de Figma: cambia de esquina según la parada. `unaLinea` junta en desktop las
 * líneas del nombre que en mobile van en dos cintas (Figma las pone en una sola).
 */
export const PAJAROS = { w: 91.2, h: 104.7 } as const;

export const MODAL_DESKTOP: Record<
  MapRouteId,
  { pajaros: { x: number; y: number }; unaLinea: boolean }
> = {
  talleres: { pajaros: { x: -34.4, y: 280.4 }, unaLinea: true },
  clubes: { pajaros: { x: -34.4, y: 280.4 }, unaLinea: true },
  ruta: { pajaros: { x: 291.6, y: 277 }, unaLinea: true },
  chiquifuertes: { pajaros: { x: -26.4, y: -34 }, unaLinea: true },
  voces: { pajaros: { x: -36, y: 276.8 }, unaLinea: false },
};

/** Recorte de la foto del modal desktop (el de Figma, a 2x: 738 x 680). */
export const routePhotoDesktop = (id: MapRouteId, ext: 'avif' | 'webp') =>
  `/images/education-map/routes/${id}-desktop.${ext}`;
