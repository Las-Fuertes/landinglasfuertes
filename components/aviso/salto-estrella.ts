import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { CURVA, cssCurva } from '../education-map/coreografia';

/**
 * Salto de la estrella de mar del aviso (docs/aviso/DECISIONES.md, D1, ampliación del
 * 2026-09-30). Pedido de Johan: "animar la estrellita de mar que salte".
 *
 * Sigue el lenguaje de movimiento de docs/PATTERNS.md: anticipación (se aplasta antes de
 * saltar), estiramiento al despegar, un leve giro en el aire, caída con aplastamiento al tocar
 * el suelo y asentamiento con un par de rebotes cortos antes del reposo exacto (regla 11). Solo
 * `transform`, con la Web Animations API (corre en el compositor), sobre una capa interior con
 * el origen en la base: el layout no se mueve.
 *
 * Un salto al aparecer la puerta y luego, en reposo, saltitos esporádicos. El alto del salto va
 * en % del alto de la estrella, así que escala solo de mobile a desktop.
 */
export const SALTO_ESTRELLA = {
  /** Espera tras montar la puerta antes del primer salto: se lee primero la puerta quieta. */
  primero: 700,
  /** Un salto completo, de la anticipación al reposo. */
  duracion: 1150,
  /** Entre saltos en reposo, al azar entre estos dos valores: esporádico, nunca en bucle fijo. */
  pausa: [4500, 7500] as const,
  /** Alto del salto, en % del alto de la estrella (unos 23 px en mobile y 42 en desktop). */
  alto: 45,
  /** Giro en el punto más alto, en grados; alterna de lado en cada salto. */
  giro: 7,
  /** Al pulsar "Acepto", vuelta a reposo desde donde esté, en sine.inOut y a la par que la
   * estrella se funde (los 240 ms de `SALIDA_AVISO.piezas`). */
  alReposo: 240,
} as const;

/** Salida del suelo y subida: la curva de entrada (frena al llegar arriba, como la gravedad). */
const SUBE = cssCurva(CURVA.entrada);
/** Caída: la de salida (acelera hacia el suelo). */
const CAE = cssCurva(CURVA.salida);
/** Anticipación y asentamiento: sine.inOut, la suave. */
const SUAVE = cssCurva(CURVA.viaje);

function keyframes(giro: number): Parameters<Element['animate']>[0] {
  const { alto } = SALTO_ESTRELLA;
  const t = (y: number, sx: number, sy: number, r = 0) =>
    `translateY(${y}%) rotate(${r}deg) scale(${sx}, ${sy})`;
  return [
    { offset: 0, transform: t(0, 1, 1), easing: SUAVE },
    // Anticipación: se agacha.
    { offset: 0.16, transform: t(0, 1.14, 0.84), easing: SUAVE },
    // Despegue: se estira hacia arriba.
    { offset: 0.26, transform: t(-alto * 0.3, 0.9, 1.14, giro * 0.3), easing: SUBE },
    // Arriba: forma normal y el giro al máximo.
    { offset: 0.46, transform: t(-alto, 1, 1, giro), easing: CAE },
    // Cayendo: se vuelve a estirar.
    { offset: 0.64, transform: t(-alto * 0.15, 0.93, 1.09, giro * 0.3), easing: CAE },
    // Toca el suelo: aplastamiento.
    { offset: 0.7, transform: t(0, 1.16, 0.84), easing: SUAVE },
    // Asentamiento: dos rebotes cortos, cada vez menores.
    { offset: 0.82, transform: t(0, 0.96, 1.05), easing: SUAVE },
    { offset: 0.92, transform: t(0, 1.02, 0.98), easing: SUAVE },
    { offset: 1, transform: t(0, 1, 1) },
  ];
}

/**
 * Hace saltar `ref` mientras la puerta está puesta. Devuelve `detener`, que corta los saltos y
 * lleva la estrella a reposo en `alReposo` ms desde donde esté (sin salto brusco bajo el telón).
 * Con `prefers-reduced-motion`, la estrella queda quieta.
 */
export function useSaltoEstrella(ref: RefObject<HTMLElement | null>) {
  const animRef = useRef<Animation | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const activoRef = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el?.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    activoRef.current = true;
    let lado = 1;

    const saltar = () => {
      if (!activoRef.current) return;
      animRef.current = el.animate(keyframes(SALTO_ESTRELLA.giro * lado), {
        duration: SALTO_ESTRELLA.duracion,
      });
      lado = -lado;
      const [min, max] = SALTO_ESTRELLA.pausa;
      timerRef.current = window.setTimeout(
        saltar,
        SALTO_ESTRELLA.duracion + min + Math.random() * (max - min)
      );
    };
    timerRef.current = window.setTimeout(saltar, SALTO_ESTRELLA.primero);

    return () => {
      activoRef.current = false;
      window.clearTimeout(timerRef.current);
      animRef.current?.cancel();
    };
  }, [ref]);

  return useCallback(() => {
    activoRef.current = false;
    window.clearTimeout(timerRef.current);
    const el = ref.current;
    const anim = animRef.current;
    if (!el || !anim || anim.playState !== 'running') return;
    const actual = getComputedStyle(el).transform;
    anim.cancel();
    el.animate([{ transform: actual }, { transform: 'none' }], {
      duration: SALTO_ESTRELLA.alReposo,
      easing: SUAVE,
      fill: 'forwards',
    });
  }, [ref]);
}
