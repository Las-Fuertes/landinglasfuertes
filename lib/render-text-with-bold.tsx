import type { ReactNode } from 'react';

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
 * Como `renderTextWithBold`, pero además entiende `==texto==` como resaltado, usando
 * el chip de borde rasgado que ya usa el resto del sitio (`.map-chip` en
 * styles/global.css): fondo #242424 con filtro de papel roto, texto blanco y una
 * inclinación de -1.2 grados.
 *
 * El resaltado va en línea y no como una barra posicionada aparte (que es como lo
 * resuelve Figma) porque el copy se traduce a tres idiomas: una barra de ancho fijo
 * quedaría corrida o sobrando en cuanto cambia el largo de la frase.
 */
export function renderTextWithMarks(text: string): ReactNode[] {
  // Se parte por ambos marcadores a la vez para no depender del orden en que aparezcan.
  const parts = text.split(/(\*\*.*?\*\*|==.*?==)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith('==') && part.endsWith('==') && part.length > 4) {
      return (
        <span key={index} className="map-chip">
          <span className="font-bold text-white">{part.slice(2, -2)}</span>
        </span>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}
