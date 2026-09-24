'use client';

import { Fragment, useMemo, useRef, type CSSProperties, type ReactNode } from 'react';

import { useLineasMedidas } from '../../lib/use-lineas-medidas';

/**
 * El resaltado del sitio: fondo rasgado detrás de una palabra o frase (docs/PATTERNS.md,
 * "Resaltado de palabras: el chip rasgado", y docs/resaltado/DECISIONES.md, D1).
 *
 * Una pieza de fondo por línea visual. El navegador decide dónde corta la frase: un medidor
 * invisible con la misma tipografía coloca las palabras (`useLineasMedidas`) y cada línea se pinta
 * como una pieza que no se parte por dentro. Así no hay fondo a todo el ancho ni cortes escritos a
 * mano por idioma, y si la frase no cabe se parte en dos piezas en vez de achicar la letra.
 *
 * El fondo es un `::before` con `inset` negativos, no `padding`: la pieza mide lo que su texto, así
 * que resaltar no cambia dónde corta la línea. Su alto (`--fondo-alto`) cabe dentro del
 * interlineado, para no pisar nunca las líneas vecinas. Estilos en styles/global.css.
 */

export type VarianteResaltado = 'linea' | 'titulo' | 'etiqueta';
export type TonoResaltado = 'negro' | 'rosa' | 'papel';

export interface OpcionesResaltado {
  /** `linea`: dentro de un párrafo. `titulo`: una pieza por línea, apiladas. `etiqueta`: suelta. */
  variante?: VarianteResaltado;
  /** Giro en grados (CSS). Por defecto el de la variante: -0,54 (y -1,23 en `titulo`). */
  giro?: number;
  tono?: TonoResaltado;
  /** `false` para un texto que nunca se parte (nombres, rótulos del mapa). */
  partir?: boolean;
  /** Clases del texto resaltado (tamaño, tracking). Van en el resaltado y en su medidor. */
  className?: string;
  style?: CSSProperties;
}

/** Espacios entre palabras, sin contar el de no separación (U+00A0): ese une. */
const ESPACIOS = /[^\S\u00A0]+/;
const NBSP = '\u00A0';
const esCorta = (palabra: string) => (palabra.match(/[\p{L}\p{N}]/gu) ?? []).length <= 3;

interface Palabra {
  texto: string;
  /** Va tras un salto de línea escrito en el texto (`\n`): empieza pieza sí o sí. */
  salto: boolean;
}

/**
 * Palabras de un resaltado. Un `\n` del texto es un corte forzado (los nombres de ruta del mapa
 * lo usan para separar título y subtítulo); el resto de cortes los decide el navegador. Una
 * palabra corta en un extremo ("¿por", "de") va pegada a su vecina, para que nunca quede sola en
 * su propia pieza.
 */
function palabrasDe(texto: string): Palabra[] {
  return texto.split(/\s*\n\s*/).flatMap((renglon, r) => {
    const palabras = renglon.split(ESPACIOS).filter(Boolean);
    if (palabras.length >= 2 && esCorta(palabras[0]))
      palabras.splice(0, 2, palabras[0] + NBSP + palabras[1]);
    const n = palabras.length;
    if (n >= 2 && esCorta(palabras[n - 1]))
      palabras.splice(n - 2, 2, palabras[n - 2] + NBSP + palabras[n - 1]);
    return palabras.map((p, j) => ({ texto: p, salto: r > 0 && j === 0 }));
  });
}

interface Segmento {
  resaltado: boolean;
  texto: string;
}

/** `==a== ==b==` seguidos cuentan como una sola frase: el corte lo decide el navegador. */
function segmentar(texto: string): Segmento[] {
  return texto
    .replace(/==(\s+)==/g, '$1')
    .split(/(==[\s\S]*?==)/g)
    .filter(Boolean)
    .map(parte =>
      parte.startsWith('==') && parte.endsWith('==') && parte.length > 4
        ? { resaltado: true, texto: parte.slice(2, -2).trim() }
        : { resaltado: false, texto: parte }
    );
}

/**
 * Texto del medidor sin nodos de texto: cada palabra va en `data-medir-texto` y se pinta con
 * `::before { content: attr(...) }` (styles/global.css). Mide igual, pero no duplica el texto en
 * el HTML (ni para buscadores ni para `textContent`); además el medidor lleva `aria-hidden`.
 */
function paraMedir(texto: string): ReactNode {
  return texto
    .split(/(\*\*.*?\*\*)/g)
    .filter(Boolean)
    .map((parte, i) => {
      const negrita = parte.startsWith('**') && parte.endsWith('**') && parte.length > 4;
      const trozos = (negrita ? parte.slice(2, -2) : parte)
        .split(/([^\S\u00A0]+)/)
        .filter(Boolean)
        .map((t, j) => (/^[^\S\u00A0]+$/.test(t) ? ' ' : <span key={j} data-medir-texto={t} />));
      return negrita ? <strong key={i}>{trozos}</strong> : <Fragment key={i}>{trozos}</Fragment>;
    });
}

function conNegritas(texto: string): ReactNode {
  return texto
    .split(/(\*\*.*?\*\*)/g)
    .filter(Boolean)
    .map((parte, i) =>
      parte.startsWith('**') && parte.endsWith('**') && parte.length > 4 ? (
        <strong key={i}>{parte.slice(2, -2)}</strong>
      ) : (
        <Fragment key={i}>{parte}</Fragment>
      )
    );
}

/**
 * Un texto de `locales` con `==resaltados==` (y `**negritas**`). Va como único contenido de su
 * bloque (`p`, `h3`...): el medidor se añade al final y toma el ancho del bloque.
 */
export function TextoResaltado({
  texto,
  variante = 'linea',
  giro,
  tono = 'negro',
  partir = true,
  className = '',
  style,
}: OpcionesResaltado & { texto: string }) {
  const segmentos = useMemo(() => segmentar(texto), [texto]);
  const hayResaltado = segmentos.some(s => s.resaltado);
  const medidorRef = useRef<HTMLSpanElement>(null);
  const lineas = useLineasMedidas(medidorRef, `${variante}|${texto}`, hayResaltado && partir);

  if (!hayResaltado) return <>{conNegritas(texto)}</>;

  const estilo = {
    ...(giro === undefined ? null : { ['--giro' as string]: `${giro}deg` }),
    ...style,
  } as CSSProperties;
  const clases = `resaltado resaltado--${variante} resaltado--${tono} ${className}`.trim();
  let indice = 0;

  return (
    <>
      {segmentos.map((seg, i) => {
        if (!seg.resaltado) return <Fragment key={i}>{conNegritas(seg.texto)}</Fragment>;
        const palabras = palabrasDe(seg.texto);
        const desde = indice;
        indice += palabras.length;

        let piezas: string[];
        if (!partir) piezas = [seg.texto.replace(/\s+/g, ' ')];
        else if (!lineas) {
          // Antes de medir (servidor, primer render o sin JS): en línea, sin giro ni filtro.
          return (
            <span key={i} className={clases} style={estilo} data-resaltado={variante}>
              <span className="resaltado-pieza resaltado-pieza--sin-medir">
                <span className="resaltado-texto">{seg.texto.replace(/\s+/g, ' ')}</span>
              </span>
            </span>
          );
        } else {
          piezas = [];
          palabras.forEach((palabra, j) => {
            const linea = lineas[desde + j];
            const previa = j > 0 ? lineas[desde + j - 1] : null;
            if (j === 0 || linea !== previa) piezas.push(palabra.texto);
            else piezas[piezas.length - 1] += ` ${palabra.texto}`;
          });
        }

        return (
          <span key={i} className={clases} style={estilo} data-resaltado={variante}>
            {piezas.map((pieza, j) => (
              <Fragment key={`${j}-${pieza}`}>
                {j > 0 && <br />}
                <span
                  className={`resaltado-pieza${j === 0 ? ' resaltado-pieza--inicio' : ''}${
                    j === piezas.length - 1 ? ' resaltado-pieza--fin' : ''
                  }`}
                >
                  <span className="resaltado-texto">{pieza}</span>
                </span>
              </Fragment>
            ))}
          </span>
        );
      })}
      {partir && (
        <span ref={medidorRef} className="resaltado-medidor" aria-hidden="true" data-nosnippet="">
          {segmentos.map((seg, i) =>
            seg.resaltado ? (
              <span key={i} className={clases} style={estilo}>
                {palabrasDe(seg.texto).map((palabra, j) => (
                  <Fragment key={j}>
                    {j > 0 && (palabra.salto ? <br /> : ' ')}
                    <span data-palabra="" data-medir-texto={palabra.texto} />
                  </Fragment>
                ))}
              </span>
            ) : (
              <Fragment key={i}>{paraMedir(seg.texto)}</Fragment>
            )
          )}
        </span>
      )}
    </>
  );
}

/** Un texto resaltado entero (una cinta, un nombre, un rótulo). */
export function Resaltado({
  children,
  variante = 'etiqueta',
  ...opciones
}: OpcionesResaltado & { children: string }) {
  return <TextoResaltado texto={`==${children}==`} variante={variante} {...opciones} />;
}
