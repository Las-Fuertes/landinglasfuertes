/**
 * Detección de gestos de rueda y de scroll fuerte, compartida por la Introducción
 * (`components/intro/use-intro-pin.ts`) y el Mapa educativo
 * (`components/education-map/use-saltar-mapa.ts`). Se extrajo tal cual de la intro el
 * 2026-09-24 (docs/mapa-educativo/DECISIONES.md, D4): los números y la lógica son los mismos,
 * así que la intro se comporta igual que antes.
 */

/**
 * Silencio que cierra un gesto de rueda. La inercia de un trackpad manda eventos seguidos
 * durante 1,5 a 2 s; mientras lleguen con menos de esta separación es el mismo gesto.
 */
export const FIN_DE_GESTO_MS = 180;
/** `deltaY` acumulado en un gesto a partir del cual cuenta como scroll fuerte. */
export const SCROLL_FUERTE_PX = 1500;
/** Gestos nuevos durante una misma transición a partir de los cuales cuenta como scroll fuerte. */
export const GESTOS_FUERTES = 2;
/**
 * Nuevo impulso sin silencio: si alguien vuelve a hacer scroll mientras la inercia del gesto
 * anterior aún decae, los eventos nunca dejan 180 ms de hueco. Cuenta como gesto nuevo cuando,
 * tras haber bajado del pico a menos de `IMPULSO_DECAIDO` de él, `|deltaY|` vuelve a crecer
 * `IMPULSO_FACTOR` veces sobre el valle y pasa de `IMPULSO_MIN_PX`.
 */
export const IMPULSO_DECAIDO = 0.4;
export const IMPULSO_FACTOR = 3;
export const IMPULSO_MIN_PX = 12;

export type SentidoRueda = 1 | -1;

export interface GestoRueda {
  vivo: boolean;
  /** Ya disparó algo: el resto del gesto, inercia incluida, se traga. */
  consumido: boolean;
  acumulado: number;
  sentido: SentidoRueda;
  /** Mayor `|deltaY|` del gesto y menor desde ese pico: sirven para detectar un impulso nuevo. */
  pico: number;
  valle: number;
}

export const gestoRuedaInicial = (): GestoRueda => ({
  vivo: false,
  consumido: false,
  acumulado: 0,
  sentido: 1,
  pico: 0,
  valle: 0,
});

/**
 * Registra un evento de rueda en el gesto `g` (lo muta). Devuelve si el evento abrió un gesto
 * nuevo. Un gesto nuevo empieza tras un silencio (el llamador pone `vivo = false` pasados
 * `FIN_DE_GESTO_MS` sin eventos), SIEMPRE que cambia el sentido, o con un impulso nuevo sobre
 * una inercia que ya decaía. `sentido` es el signo de `deltaY`, que no puede ser 0.
 */
export function registrarRueda(g: GestoRueda, sentido: SentidoRueda, abs: number): boolean {
  const impulso =
    g.consumido &&
    g.valle <= g.pico * IMPULSO_DECAIDO &&
    abs >= Math.max(g.valle * IMPULSO_FACTOR, IMPULSO_MIN_PX);
  const nuevo = !g.vivo || sentido !== g.sentido || impulso;
  if (nuevo) {
    g.vivo = true;
    g.consumido = false;
    g.acumulado = 0;
    g.sentido = sentido;
    g.pico = abs;
    g.valle = abs;
  } else if (abs > g.pico) {
    g.pico = abs;
    g.valle = abs;
  } else {
    g.valle = Math.min(g.valle, abs);
  }
  return nuevo;
}
