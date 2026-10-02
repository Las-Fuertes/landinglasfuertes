import { useEffect, useRef } from 'react';
import { track } from './analytics';

/** id de la sección en el DOM -> `section_name` del plan de eventos (docs/mixpanel). */
const SECCIONES: Record<string, string> = {
  bienvenida: 'welcome',
  emi: 'emi',
  tripulantes: 'donations',
  mapa: 'educational_map',
  impacto: 'impact',
  'quienes-somos': 'who_we_are',
};

/**
 * `section_viewed`, una vez por sección y carga de página (docs/mixpanel/DECISIONES.md, D4).
 * Un solo IntersectionObserver para todas, sin listeners de scroll (D14 de la intro: nada que
 * haga esperar al scroll). Cuenta cuando la sección cruza la franja central de la ventana, así
 * una sección que solo asoma por el borde no cuenta como vista.
 */
export function useSeccionesVistas() {
  // Sobrevive al doble montaje de StrictMode: un observer desmontado no vuelve a contar.
  const vistas = useRef(new Set<string>());

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      entradas => {
        entradas.forEach(entrada => {
          if (!entrada.isIntersecting) return;
          const nombre = SECCIONES[entrada.target.id];
          observer.unobserve(entrada.target);
          if (!nombre || vistas.current.has(nombre)) return;
          vistas.current.add(nombre);
          track('section_viewed', { section_name: nombre });
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    Object.keys(SECCIONES).forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
}
