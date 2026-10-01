import type { CSSProperties, ReactNode } from 'react';
import styles from './nubes.module.css';

/** Cuánto y a qué ritmo deriva una nube: px hacia la izquierda y segundos de ida y vuelta. */
export type Deriva = { px: number; s: number };

/**
 * Caja interior de una nube que deriva de derecha a izquierda y vuelve (`nubes.module.css`).
 * Ocupa toda la caja de la nube; la de fuera sigue siendo la que anima la entrada.
 */
export function NubeDeriva({ deriva, children }: { deriva: Deriva; children: ReactNode }) {
  const vars = { '--amplitud': `${deriva.px}px`, '--ciclo': `${deriva.s}s` } as CSSProperties;
  return (
    <div className={`absolute inset-0 ${styles.deriva}`} style={vars}>
      {children}
    </div>
  );
}
