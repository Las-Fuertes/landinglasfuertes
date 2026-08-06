/**
 * Las cinco rutas del mapa educativo.
 *
 * Las coordenadas salen de los <circle> del arte original
 * (design-assets/education-map/map.svg, viewBox 1584×1432), así que el punto
 * interactivo cae exactamente sobre el anillo rosado dibujado.
 */

export const VIEWBOX = { w: 1584, h: 1432 } as const;

/** Relación ancho/alto del mapa. Todo el cálculo de tamaño depende de esta constante. */
export const MAP_ASPECT = VIEWBOX.w / VIEWBOX.h;

export type MapRouteId = 'talleres' | 'clubes' | 'ruta' | 'chiquifuertes' | 'voces';

export interface MapRoute {
  id: MapRouteId;
  /** Centro del hotspot en unidades del viewBox. */
  cx: number;
  cy: number;
  /** El mismo centro normalizado a 0–1. Es lo que consume la geometría. */
  u: number;
  v: number;
  /** Foto del modal. El ancho/alto intrínseco evita saltos de layout. */
  image: { width: number; height: number };
  /** Prefijo de i18n: `${i18n}.name`, `.age`, `.body`, `.imageAlt`. */
  i18n: string;
}

const RAW: Array<Pick<MapRoute, 'id' | 'cx' | 'cy'> & { image: MapRoute['image'] }> = [
  { id: 'talleres', cx: 352.739, cy: 308.739, image: { width: 582, height: 670 } },
  { id: 'clubes', cx: 736.977, cy: 513.258, image: { width: 610, height: 670 } },
  { id: 'ruta', cx: 1249.98, cy: 716.258, image: { width: 606, height: 670 } },
  { id: 'chiquifuertes', cx: 308.977, cy: 782.257, image: { width: 562, height: 670 } },
  { id: 'voces', cx: 810.977, cy: 1079.26, image: { width: 608, height: 670 } },
];

export const MAP_ROUTES: MapRoute[] = RAW.map(r => ({
  ...r,
  u: r.cx / VIEWBOX.w,
  v: r.cy / VIEWBOX.h,
  i18n: `educationMap.routes.${r.id}`,
}));

export const ROUTE_COUNT = MAP_ROUTES.length;

export const routePhoto = (id: MapRouteId, ext: 'avif' | 'webp') =>
  `/images/education-map/routes/${id}.${ext}`;

/** Anchos de los derivados del mapa que existen en public/images/education-map/. */
export const MAP_WIDTHS = [1200, 1600, 2000, 2400] as const;
