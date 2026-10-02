import { MAP_ROUTES, routePhoto, routePhotoDesktop } from './education-map.data';

/**
 * Precarga de las fotos de los modales de parada (docs/mapa-educativo/DECISIONES.md, D15).
 *
 * El modal espera a tener su foto decodificada antes de subir (D9), con un tope de 250 ms. Si la
 * foto se pide recién en el toque, en un celular esa espera es casi todo el retraso entre el toque
 * y el primer frame del modal. Por eso las cinco se piden y se decodifican cuando el mapa se
 * acerca a la pantalla, y en el toque la promesa ya está resuelta.
 *
 * Se pide la misma variante que muestra el `<picture>` de `route-sheet.tsx` a ese ancho (el
 * recorte desktop desde `lg`), en AVIF. Los `Image` se guardan para que el navegador no suelte la
 * foto decodificada; la clave es la URL, así un cambio de ancho pide la otra variante.
 */

const DESKTOP_QUERY = '(min-width: 1024px)';

const cache = new Map<string, { foto: HTMLImageElement; lista: Promise<void> }>();

function urlFoto(index: number) {
  const id = MAP_ROUTES[index].id;
  return window.matchMedia(DESKTOP_QUERY).matches
    ? routePhotoDesktop(id, 'avif')
    : routePhoto(id, 'avif');
}

/** Pide y decodifica la foto del modal `index`; la segunda vez devuelve la misma promesa. */
export function precargarFoto(index: number): Promise<void> {
  const url = urlFoto(index);
  const previa = cache.get(url);
  if (previa) return previa.lista;
  const foto = new Image();
  foto.decoding = 'async';
  foto.src = url;
  // Si falla (sin AVIF, sin red), se olvida para reintentar en el toque; el modal no la espera
  // más que el tope del secuenciador.
  const lista = foto.decode().catch(error => {
    cache.delete(url);
    throw error;
  });
  cache.set(url, { foto, lista });
  return lista;
}

/** Las cinco, una tras otra para no competir entre ellas por la red. */
export function precargarTodas() {
  void MAP_ROUTES.reduce<Promise<void>>(
    (cadena, _, i) => cadena.then(() => precargarFoto(i).catch(() => undefined)),
    Promise.resolve()
  );
}
