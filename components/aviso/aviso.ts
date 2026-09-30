/**
 * Aviso de protección de menores: la puerta que se pone delante de la landing en la primera
 * visita (docs/aviso/DECISIONES.md, D1).
 *
 * El estado vive en una cookie por dispositivo, `lf_aviso=<versión>`, de un año. Si cambia el
 * texto del aviso y hay que volver a pedirlo, se sube `VERSION_AVISO`: las cookies viejas dejan
 * de valer y la puerta vuelve a aparecer.
 */

export const COOKIE_AVISO = 'lf_aviso';
export const VERSION_AVISO = 'v1';
/** 365 días, en segundos. */
export const DURACION_AVISO = 60 * 60 * 24 * 365;

/** Ruta de la API que repite la cookie desde el servidor (pages/api/aviso.ts). */
export const API_AVISO = '/api/aviso';

/** Estrella de la puerta: se precarga solo cuando la puerta se va a mostrar (ver `SCRIPT_AVISO`). */
export const ESTRELLA_AVISO = '/images/aviso/estrella-de-mar.svg';

/** Se emite en `window` cuando la puerta ya casi se fue: la landing puede empezar a moverse. */
export const EVENTO_AVISO = 'aviso-aceptado';

/**
 * Script en línea de `pages/_document.tsx`, que corre antes de pintar nada. Con la cookie
 * vigente marca `<html data-aviso="aceptado">` y la puerta no se pinta ni un frame (CSS en
 * styles/global.css). Sin ella, marca `data-cortina-puesta`, la misma señal que usa el telón del
 * Mapa educativo (components/education-map/cortina.ts): lo que espera a que no haya cortina
 * (la entrada de Impacto) espera también a la puerta. Sin la cookie, además, pide la estrella con
 * un `preload` para que llegue con el primer frame; con ella no se descarga nunca (la imagen de
 * la puerta es `loading="lazy"` y dentro de un `display: none` no se pide).
 */
export const SCRIPT_AVISO = `(function(){var h=document.documentElement;if(/(?:^|;\\s*)${COOKIE_AVISO}=${VERSION_AVISO}(?:;|$)/.test(document.cookie))h.setAttribute('data-aviso','aceptado');else{h.setAttribute('data-cortina-puesta','');var l=document.createElement('link');l.rel='preload';l.as='image';l.href='${ESTRELLA_AVISO}';document.head.appendChild(l)}})()`;

/** true si el aviso ya está aceptado en este dispositivo (y la puerta se fue o no se puso). */
export const avisoAceptado = () =>
  typeof document !== 'undefined' && document.documentElement.dataset.aviso === 'aceptado';

/**
 * La cabecera de la cookie, igual en el cliente y en la API: un año, en todo el sitio, y
 * `Secure` cuando se sirve por https.
 */
export const cookieAviso = (segura: boolean) =>
  `${COOKIE_AVISO}=${VERSION_AVISO}; Max-Age=${DURACION_AVISO}; Path=/; SameSite=Lax${segura ? '; Secure' : ''}`;

/**
 * Guarda la aceptación. La escribe por JS en el acto (el telón y la landing no esperan a la red)
 * y la pide también al servidor, sin esperar: Safari (ITP) y Brave limitan a 7 días las cookies
 * escritas con `document.cookie`, pero no las que llegan en un `Set-Cookie` del mismo sitio. Si
 * el POST falla, la de JS sigue valiendo (docs/aviso/DECISIONES.md, D1).
 */
export function guardarAceptacion() {
  document.cookie = cookieAviso(window.location.protocol === 'https:');
  fetch(API_AVISO, { method: 'POST', keepalive: true, credentials: 'same-origin' }).catch(
    () => undefined
  );
}

/**
 * Corre `alAceptar` en cuanto el aviso esté aceptado: en el acto si ya lo estaba, o cuando la
 * puerta se vaya. Devuelve la limpieza para un `useEffect`. La usan la intro (para no arrancar
 * detrás de la puerta) y el drawer de Súmate (para abrir `#sumate` después de aceptar).
 */
export function alAceptarAviso(alAceptar: () => void): () => void {
  if (avisoAceptado()) {
    alAceptar();
    return () => undefined;
  }
  const escuchar = () => alAceptar();
  window.addEventListener(EVENTO_AVISO, escuchar, { once: true });
  return () => window.removeEventListener(EVENTO_AVISO, escuchar);
}
