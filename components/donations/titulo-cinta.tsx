'use client';

import { useRef } from 'react';

import { useLineasMedidas } from '../../lib/use-lineas-medidas';
import styles from './donations.module.css';

interface TituloCintaProps {
  id: string;
  texto: string;
  className?: string;
}

/**
 * Título de Donaciones: cada línea lleva su propio tramo de cinta de papel (Figma 1288:1478 y
 * 1288:1594). Las líneas salen del corte natural del texto al ancho disponible, no de claves
 * partidas a mano, así que sirven en los tres idiomas y en cualquier ancho: un medidor invisible
 * con la misma tipografía coloca las palabras, se agrupan por su posición y cada grupo se pinta
 * como una línea con su cinta. Ver docs/donaciones/DECISIONES.md, D1, y el hook compartido con el
 * resaltado del sitio (docs/resaltado/DECISIONES.md, D1).
 */
export function TituloCinta({ id, texto, className = '' }: TituloCintaProps) {
  const medidorRef = useRef<HTMLSpanElement>(null);
  // El espacio de no separación (U+00A0) une: no se parte por ahí.
  const palabras = texto.split(/[^\S\u00A0]+/).filter(Boolean);
  // El mismo corte medido que el resaltado del sitio (lib/use-lineas-medidas.ts).
  const porPalabra = useLineasMedidas(medidorRef, texto);
  const lineas = porPalabra
    ? palabras.reduce<string[]>((acc, palabra, i) => {
        if (i === 0 || porPalabra[i] !== porPalabra[i - 1]) acc.push(palabra);
        else acc[acc.length - 1] += ` ${palabra}`;
        return acc;
      }, [])
    : null;

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
            <span data-palabra data-medir-texto={palabra} />{' '}
          </span>
        ))}
      </span>
    </h2>
  );
}
