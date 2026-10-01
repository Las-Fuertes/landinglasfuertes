/**
 * Filtros de borde rasgado. El primero (`map-rough-edge`) lo usan el resaltado (`.resaltado-pieza` en styles/global.css), la
 * cinta del título de Donaciones y el marco del panel del mapa educativo.
 *
 * La región vertical (3 % del alto) es corta a propósito: limita lo que el borde rasgado sale por
 * arriba y por abajo a menos de 1,5 px, y eso entra en la cuenta de que el fondo del resaltado no
 * pise las líneas vecinas (docs/resaltado/DECISIONES.md, D1). No la amplíes sin volver a medir.
 *
 * Se monta una sola vez en `pages/_app.tsx` y no dentro de una sección: un
 * `filter: url(#id)` que apunta a un filtro ausente no degrada a "sin filtro",
 * hace desaparecer el elemento. Teniéndolo en el layout, cualquier sección puede
 * usar el chip sin depender de que otra esté montada.
 */
export function RoughEdgeFilter() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        <filter id="map-rough-edge" x="-3%" y="-3%" width="106%" height="106%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.028"
            numOctaves="4"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="6"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        {/* Borde rasgado del bloque azul del footer (Figma `1402:248`, docs/navegacion, D2):
            dientes más finos y más hondos que los del chip, porque el bloque es mucho mayor.
            Solo se aplica a una capa de fondo sin hijos, así el texto no se deforma. */}
        <filter id="footer-rough-edge" x="-2%" y="-10%" width="104%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.22"
            numOctaves="3"
            seed="11"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="9"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
