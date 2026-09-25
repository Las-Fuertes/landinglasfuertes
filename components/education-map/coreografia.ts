/**
 * Tiempos y curvas de las transiciones del Mapa educativo (docs/mapa-educativo/DECISIONES.md, D9):
 * "Siguiente ruta" (cierre, viaje del mapa, llegada, apertura) y "Terminar" (cierre y paso a
 * Impacto). Parten del lenguaje de movimiento de docs/PATTERNS.md: ritmo pausado, fases que se
 * leen de una en una, el texto es lo primero en llegar y lo último en irse.
 *
 * Todo lo que se anima aquí es `transform` u `opacity`: en un celular lento es lo único que el
 * compositor mueve sin volver a pintar.
 */

/** Curvas como `cubic-bezier`, en el formato de framer-motion. */
export const CURVA = {
  /** Salidas: arrancan despacio y se van (power2.in de GSAP, la de las salidas de la intro). */
  salida: [0.32, 0, 0.67, 0] as const,
  /** Entradas: llegan rápido y se posan (la misma de `FadeIn`). */
  entrada: [0.22, 1, 0.36, 1] as const,
  /**
   * Viajes: sine.inOut. De las simétricas es la de menor velocidad punta (1,57 veces la media;
   * cubic.inOut llega a 3), y eso es lo que evita que un viaje largo maree.
   */
  viaje: [0.37, 0, 0.63, 1] as const,
};

/**
 * Para el `onUpdate` de los `motion.div` que animan opacidad. Con él, framer-motion 11 anima la
 * opacidad en JS en vez de con la Web Animations API. Con la WAAPI, al terminar la animación
 * quedaba un frame con la opacidad de `initial` (la animación ya no existe y framer escribe el
 * valor final en el frame siguiente): la tarjeta parpadeaba al acabar de entrar (medido por
 * frame, D9).
 */
export const sinAceleracion = () => undefined;

/** La misma curva en CSS, para la Web Animations API. */
export const cssCurva = (c: readonly number[]) => `cubic-bezier(${c.join(', ')})`;

/** Duraciones en ms. */
export const TIEMPO = {
  /** El modal se va: la tarjeta baja (o se desvanece en desktop) y el velo se aclara. */
  cierre: 420,
  /** El velo oscuro se aclara un poco más rápido que la tarjeta, para que el mapa asome antes. */
  veloCierre: 340,
  /** Viaje del mapa entre paradas: proporcional a la distancia, dentro de este rango. */
  viajeMin: 900,
  viajeMax: 1400,
  /** Ms de viaje por px de pantalla recorrido, sobre `viajeBase`. */
  viajeBase: 650,
  viajePorPx: 0.6,
  /** Llegada: el mapa quieto en la parada nueva antes de que suba el modal. */
  asiento: 200,
  /** El modal entra: la tarjeta sube con el texto; la foto llega después. */
  apertura: 600,
  veloApertura: 420,
  fotoRetraso: 160,
  foto: 460,
} as const;

/** Duración del viaje del mapa para una distancia en px de pantalla. */
export function duracionViaje(distancia: number) {
  const ms = TIEMPO.viajeBase + distancia * TIEMPO.viajePorPx;
  return Math.round(Math.min(TIEMPO.viajeMax, Math.max(TIEMPO.viajeMin, ms)));
}

/**
 * Paso a otra sección ("Terminar" y "Saltar mapa"). Si la sección está a menos de
 * `umbralPantallas` pantallas, la página se desplaza hasta ella; si está más lejos, recorrer
 * miles de px a la vista marea, y se usa una cortina como un telón: aparece con un fundido sobre
 * el mapa, la página salta debajo y la cortina se desvanece descubriendo la sección, que empieza
 * su entrada cuando la cortina ya casi se fue (docs/impacto/DECISIONES.md, D2).
 */
export const PASO = {
  umbralPantallas: 1.2,
  desplazaMin: 600,
  desplazaMax: 1100,
  desplazaBase: 420,
  desplazaPorPx: 0.55,
  /**
   * El telón aparece (opacidad 0 a 1, sine.inOut). 400 ms: lo bastante para leerse como un
   * fundido y no como un parpadeo, y más corto que la salida, porque lo que importa es lo que
   * descubre.
   */
  cortinaAparece: 400,
  /**
   * Pausa con la cortina puesta tras el salto. Impacto espera a que la cortina se vaya para
   * empezar su entrada (docs/impacto/DECISIONES.md, D2).
   */
  cortinaPausa: 60,
  /** El telón se abre (opacidad 1 a 0, sine.inOut): suave al empezar y al terminar. */
  cortinaSeVa: 500,
  /**
   * Cuánto antes del final del fundido de salida se avisa a la sección para que empiece su
   * entrada: un solape corto, con la cortina ya casi transparente (un 14 % de opacidad).
   */
  cortinaSolape: 120,
} as const;

export function duracionDesplaza(distancia: number) {
  const ms = PASO.desplazaBase + distancia * PASO.desplazaPorPx;
  return Math.round(Math.min(PASO.desplazaMax, Math.max(PASO.desplazaMin, ms)));
}
