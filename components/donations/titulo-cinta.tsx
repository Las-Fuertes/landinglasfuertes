'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './donations.module.css';

// En el servidor useLayoutEffect avisa; en el cliente medimos antes de pintar.
const useMedirAntesDePintar = typeof window === 'undefined' ? useEffect : useLayoutEffect;

interface TituloCintaProps {
  id: string;
  texto: string;
  className?: string;
}

/**
 * Título de Donaciones: cada línea lleva su propio tramo de cinta de papel (Figma 1288:1478 y
 * 1288:1594). Las líneas salen del corte natural del texto al ancho disponible, no de claves
 * partidas a mano, así que sirven en los tres idiomas y en cualquier ancho: un medidor invisible
 * con la misma tipografía coloca las palabras, se agrupan por su `offsetTop` y cada grupo se pinta
 * como una línea con su cinta. Ver docs/donaciones/DECISIONES.md, D1.
 */
export function TituloCinta({ id, texto, className = '' }: TituloCintaProps) {
  const medidorRef = useRef<HTMLSpanElement>(null);
  const [lineas, setLineas] = useState<string[] | null>(null);
  const palabras = texto.split(/\s+/).filter(Boolean);

  useMedirAntesDePintar(() => {
    const medidor = medidorRef.current;
    if (!medidor) return;

    const medir = () => {
      const grupos: string[][] = [];
      let arriba: number | null = null;
      medidor.querySelectorAll<HTMLElement>('[data-palabra]').forEach(palabra => {
        const top = palabra.offsetTop;
        if (arriba === null || Math.abs(top - arriba) > 4) {
          grupos.push([]);
          arriba = top;
        }
        grupos[grupos.length - 1].push(palabra.textContent ?? '');
      });
      const nuevas = grupos.map(g => g.join(' '));
      setLineas(previas =>
        previas && previas.join('\n') === nuevas.join('\n') ? previas : nuevas
      );
    };

    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(medidor);
    document.fonts?.ready.then(medir).catch(() => undefined);
    return () => observador.disconnect();
  }, [texto]);

  return (
    <h2 id={id} className={`${styles.titulo} ${className}`.trim()}>
      {lineas ? (
        lineas.map((linea, i) => (
          <span key={`${i}-${linea}`} className={styles.linea}>
            <span className={styles.lineaTexto}>{linea}</span>
          </span>
        ))
      ) : (
        // Antes de medir (servidor y primer render): una sola cinta con el texto entero.
        <span className={`${styles.linea} ${styles.lineaSinMedir}`}>
          <span className={styles.lineaTexto}>{texto}</span>
        </span>
      )}
      <span ref={medidorRef} className={styles.medidor} aria-hidden="true">
        {palabras.map((palabra, i) => (
          <span key={i}>
            <span data-palabra>{palabra}</span>{' '}
          </span>
        ))}
      </span>
    </h2>
  );
}
