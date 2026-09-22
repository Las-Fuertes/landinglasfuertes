import { useEffect, useRef } from 'react';
import type { GetStaticProps } from 'next';

/**
 * Banco de revisión visual. Solo existe en desarrollo: en producción devuelve 404.
 *
 * Muestra varios recortes de la página, cada uno en un iframe del ancho que se pida y
 * desplazado hasta un elemento concreto. Sirve para capturar una sección a un ancho
 * exacto y compararla contra el frame de Figma.
 *
 * Tiene que vivir dentro de la app y no en un archivo suelto: el iframe se controla
 * por JavaScript y eso exige compartir origen con la página.
 *
 * Uso:
 *   /dev-revision?anclas=intro-paso-1,intro-paso-2,intro-paso-3
 *   /dev-revision?anclas=intro-paso-1&w=768     (tablet)
 *   /dev-revision?anclas=intro-paso-1&w=1280&h=900  (desktop)
 */
export default function DevRevision() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const q = new URLSearchParams(window.location.search);
    const anclas = (q.get('anclas') || '').split(',').filter(Boolean);
    const width = q.get('w') || '390';
    const height = q.get('h') || '833';

    const marcos = anclas.map(ancla => {
      const frame = document.createElement('iframe');
      frame.src = '/';
      frame.style.cssText = `width:${width}px;height:${height}px;border:0;background:#fff`;
      // El desplazamiento se aplica tarde a propósito: las capas son imágenes y hasta
      // que no resuelven su alto, la posición del ancla todavía no es la definitiva.
      frame.onload = () => {
        window.setTimeout(() => {
          const doc = frame.contentDocument;
          const win = frame.contentWindow;
          const el = doc?.getElementById(ancla.trim());
          if (el && win) win.scrollTo(0, el.getBoundingClientRect().top + win.scrollY);
        }, 2500);
      };
      host.appendChild(frame);
      return frame;
    });

    return () => marcos.forEach(f => f.remove());
  }, []);

  return (
    <div
      ref={hostRef}
      style={{ display: 'flex', gap: 10, padding: 10, background: '#888', minHeight: '100vh' }}
    />
  );
}

/** Fuera de desarrollo esta ruta no existe. */
export const getStaticProps: GetStaticProps = async () => {
  if (process.env.NODE_ENV === 'production') {
    return { notFound: true };
  }
  return { props: {} };
};
