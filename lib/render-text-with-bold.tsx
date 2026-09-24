import type { ReactNode } from 'react';

import { TextoResaltado, type OpcionesResaltado } from '../components/layout/resaltado';

export function renderTextWithBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index}>{part}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

/**
 * Como `renderTextWithBold`, pero además entiende `==texto==` como resaltado: el chip rasgado del
 * sitio (`TextoResaltado` en components/layout/resaltado.tsx, docs/PATTERNS.md). Una pieza de
 * fondo por línea visual, cortada por el navegador; `==a== ==b==` seguidos son una sola frase.
 * Va como único contenido de su bloque (`p`, `h3`...), porque el corte se mide a su ancho.
 */
export function renderTextWithMarks(text: string, opciones?: OpcionesResaltado): ReactNode {
  return <TextoResaltado texto={text} {...opciones} />;
}
