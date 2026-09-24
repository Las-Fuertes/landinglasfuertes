import { forwardRef } from 'react';

export interface MapTitleProps {
  title: string;
  /** Con recorrido, el encabezado flota sobre el mar del mapa en la primera pantalla. */
  overlay: boolean;
}

/**
 * Encabezado del mapa (docs/mapa-educativo/DECISIONES.md, D3), Figma 1311:14: el mapa doblado
 * azul con el pin rosado encima y el título centrado en cuatro líneas, sobre el mar. En móvil y
 * tablet flota sobre la primera pantalla del recorrido, con Talleres en grande debajo; en
 * desktop (sin frame en Figma) es el mismo bloque, más grande, encima del mapa entero.
 *
 * La ilustración es un raster de la exportación de Figma (el SVG pesa 650 KB por el trazo a
 * mano); el SVG fuente está en design-assets/education-map/titulo-mapa-doblado.svg.
 */
const MapTitle = forwardRef<HTMLDivElement, MapTitleProps>(function MapTitle(
  { title, overlay },
  ref
) {
  // Con recorrido en mobile, el encabezado encoge con el alto de la pantalla (D7): a 844 de
  // alto o más queda al px de Figma; en pantallas bajas (un iPhone con las barras de Safari)
  // deja sitio para que Talleres entre entera debajo. Tablet y desktop no cambian.
  const bajo = overlay;
  return (
    <div
      ref={ref}
      className={`pointer-events-none flex flex-col items-center px-l pb-l text-center md:pt-xxl lg:pb-xl ${
        bajo ? 'pt-[clamp(1rem,4.75svh,2.5rem)]' : 'pt-xl'
      } ${overlay ? 'absolute inset-x-0 top-0 z-20' : 'relative'}`}
    >
      {/* Mobile al px de Figma 1311:14: ilustración en y 46 (40 + 6) y título en y 170. */}
      <picture className="mt-1.5 md:mt-0">
        <source type="image/avif" srcSet="/images/education-map/titulo/mapa-pin.avif" />
        <img
          src="/images/education-map/titulo/mapa-pin.webp"
          alt=""
          width={127}
          height={98}
          decoding="async"
          draggable={false}
          className={`h-auto select-none md:w-[9.5rem] lg:w-[11rem] ${
            bajo ? 'w-[clamp(4rem,15.1svh,7.9375rem)]' : 'w-[7.9375rem]'
          }`}
        />
      </picture>
      <h2
        id="education-map-title"
        className={`max-w-[21.5rem] text-balance font-bold leading-[1.0667] tracking-[-0.04em] text-black md:mt-l md:max-w-[30rem] md:text-[1.875rem] lg:max-w-[40rem] lg:text-[2.5rem] lg:leading-[1.1] ${
          bajo
            ? 'mt-[clamp(0.5rem,2.9svh,1.5rem)] text-[length:min(clamp(1.625rem,7.7vw,1.875rem),3.6svh)]'
            : 'mt-6 text-[clamp(1.625rem,7.7vw,1.875rem)]'
        }`}
      >
        {title}
      </h2>
    </div>
  );
});

export default MapTitle;
