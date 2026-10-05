import Image from 'next/image';

import { useTranslation } from '../../hooks/useTranslation';
import {
  ESTAMPILLA_ALTO_PX as ALTO,
  ESTAMPILLA_ANCHO_PX as ANCHO,
  type Estampilla as DatosEstampilla,
  type Pieza,
} from './estampillas.data';
import estilos from './principles.module.css';

/** Caja de Figma (px del frame de 349 x 333) a porcentajes de la estampilla. */
const caja = (x: number, y: number, w: number, h: number) => ({
  left: `${(x / ANCHO) * 100}%`,
  top: `${(y / ALTO) * 100}%`,
  width: `${(w / ANCHO) * 100}%`,
  height: `${(h / ALTO) * 100}%`,
});

/** Papel (Rectangle 93), foto (Rectangle 68) y cuadro del icono (Rectangle 137): iguales en las cuatro. */
const PAPEL = caja(7.97, 7.95, 332.63, 318.08);
const FOTO = caja(12.7, 13.24, 323.93, 309.21);
const CUADRO = caja(27, 22, 54, 54);

function Icono({ pieza }: { pieza: Pieza }) {
  return (
    <span
      className="absolute"
      style={{
        ...caja(pieza.x, pieza.y, pieza.w, pieza.h),
        transform: pieza.giro ? `rotate(${pieza.giro}deg)` : undefined,
      }}
    >
      <Image src={pieza.src} alt="" fill draggable={false} className="select-none" />
    </span>
  );
}

/**
 * Una estampilla del mazo según su frame de Figma (docs/emi/DECISIONES.md, D5). El texto es
 * texto de verdad: se traduce y lo leen los lectores de pantalla; la foto y el icono son
 * decorativos (alt vacío).
 */
export default function Estampilla({ estampilla }: { estampilla: DatosEstampilla }) {
  const { t } = useTranslation();
  const { texto } = estampilla;

  return (
    <div
      className={estilos.estampilla}
      data-tono={estampilla.tono}
      data-nodo-figma={estampilla.nodoFigma}
    >
      <span className="absolute bg-papel" style={PAPEL} />
      <span className="absolute overflow-hidden" style={FOTO}>
        <Image
          src={estampilla.foto}
          alt=""
          fill
          draggable={false}
          className="select-none object-cover"
          sizes="(min-width: 1024px) 360px, (min-width: 768px) 320px, 90vw"
        />
        <span className={`absolute inset-0 ${estilos.degradado}`} />
      </span>
      <span className={`absolute ${estilos.cuadro}`} style={CUADRO} />
      {estampilla.iconos.map(pieza => (
        <Icono key={`${pieza.src}-${pieza.y}`} pieza={pieza} />
      ))}
      <p
        className={`font-acento absolute whitespace-pre-line text-center text-papel ${estilos.texto}`}
        style={{
          left: `${(texto.cx / ANCHO) * 100}%`,
          top: `${(texto.cy / ALTO) * 100}%`,
          width: `${(texto.w / ANCHO) * 100}%`,
          lineHeight: texto.interlineado,
          letterSpacing: texto.tracking ? `${texto.tracking}em` : undefined,
        }}
      >
        {t(estampilla.textoKey)}{' '}
      </p>
    </div>
  );
}
