'use client';

import Image from 'next/image';
import { type CSSProperties, type RefObject, useEffect, useRef } from 'react';
import { PageGrid } from '../layout/page-grid';
import { useTranslation } from '../../hooks/useTranslation';
import { renderTextWithBold } from '../../lib/render-text-with-bold';
import { useSumateDrawer } from '../sumate';
import { TituloCinta } from './titulo-cinta';
import styles from './donations.module.css';

/**
 * Vida en reposo de Donaciones (docs/donaciones/DECISIONES.md, D3): el barco se mece, sus ondas
 * respiran y cada ola va y viene de lado. Todo es CSS (`donations.module.css`); aquí solo se
 * decide si corre. `data-reposo` en la sección lo enciende: `corre` en pantalla, `pausa` fuera de
 * ella o con la pestaña oculta. Sin el atributo no hay animación, y el primer fotograma es el
 * diseño: no se pone con `prefers-reduced-motion` ni con `?quieto=1` (capturas comparables).
 */
function useReposoTripulantes(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const seccion = ref.current;
    if (!seccion) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (new URLSearchParams(window.location.search).get('quieto') === '1') return;
    let visible = false;
    const actualizar = () => {
      seccion.dataset.reposo = visible && !document.hidden ? 'corre' : 'pausa';
    };
    actualizar();
    const io = new IntersectionObserver(([en]) => {
      visible = !!en?.isIntersecting;
      actualizar();
    });
    io.observe(seccion);
    document.addEventListener('visibilitychange', actualizar);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', actualizar);
      delete seccion.dataset.reposo;
    };
  }, [ref]);
}

/**
 * Las olas, una capa por vector (los archivos `olas-*-<n>.svg` son el export de Figma partido,
 * todos con el mismo viewBox, así que apilados son el dibujo original). `lado` es hacia dónde va
 * cada una: la que toca un borde solo se aleja de él (hacia fuera), para que el vaivén nunca
 * descubra su extremo; las demás alternan. `ciclo` en segundos, ida y vuelta.
 *
 * Pantallas muy anchas (docs/donaciones/DECISIONES.md, D4): pasado 1512 el mar deja de crecer y
 * su dibujo, que es un frame de 1280, se quedaba a la izquierda. Ahí cada ola se corre a la
 * derecha una fracción (`peso`) del ancho que sobra sobre 1512: 0 las que tocan el borde
 * izquierdo (el mar sigue pegado a él), más cuanto más a la derecha está la ola en Figma. Las
 * dos sueltas del extremo derecho del export (`borde`) siguen al borde derecho desde 1920, donde
 * empiezan a verse enteras. Hasta 1512 nada se mueve. Solo cambia la posición, nunca el tamaño.
 */
const OLAS_DESKTOP = [
  { n: 1166, lado: 1, ciclo: 4.6, peso: 0.5 },
  { n: 1167, lado: -1, ciclo: 5.2, peso: 0.8 },
  { n: 1175, lado: -1, ciclo: 3.8, peso: 0.12 },
  { n: 1176, lado: 1, ciclo: 4.2, borde: true },
  { n: 1169, lado: 1, ciclo: 3.6, borde: true },
  { n: 1177, lado: -1, ciclo: 4.4, peso: 0 },
  { n: 1170, lado: 1, ciclo: 3.9, peso: 0.65 },
  { n: 1178, lado: 1, ciclo: 4.8, peso: 0 },
  { n: 1171, lado: -1, ciclo: 5.4, peso: 0.9 },
  { n: 1172, lado: 1, ciclo: 5, peso: 0.22 },
];
const OLAS_MOBILE = [
  { n: 1, lado: -1, ciclo: 4.6 },
  { n: 2, lado: 1, ciclo: 5.2 },
  { n: 3, lado: 1, ciclo: 3.8 },
  { n: 4, lado: -1, ciclo: 4.2 },
  { n: 5, lado: 1, ciclo: 3.6 },
  { n: 6, lado: -1, ciclo: 5 },
  { n: 7, lado: -1, ciclo: 4.4 },
];

function varsOla(lado: number, ciclo: number) {
  return { '--lado': lado, '--ciclo': `${ciclo / 2}s` } as CSSProperties;
}

/** El barco en dos capas del mismo export: las ondas debajo, el casco encima (se mece). */
function Barco({ variante, className }: { variante: 'mobile' | 'desktop'; className: string }) {
  return (
    <div className={className} aria-hidden>
      <div className={`${styles.capa} ${styles.ondasBarco}`}>
        <Image src={`/images/donations/barco-${variante}-ondas.svg`} alt="" fill />
      </div>
      <div className={`${styles.capa} ${styles.flotar}`}>
        <div className={`${styles.capa} ${styles.mecer}`}>
          <Image src={`/images/donations/barco-${variante}-casco.svg`} alt="" fill />
        </div>
      </div>
    </div>
  );
}

/**
 * Donaciones: "Dirigir el cambio con educación menstrual integral requiere tripulantes
 * comprometidos". Mobile según Figma 1288:1478 y desde `md` según el desktop 1288:1594
 * (docs/donaciones/DECISIONES.md). Las medidas del frame viven en donations.module.css.
 */
export default function DonationsSection() {
  const { t } = useTranslation();
  const sumate = useSumateDrawer();
  const ref = useRef<HTMLElement>(null);
  useReposoTripulantes(ref);

  return (
    <section
      ref={ref}
      id="tripulantes"
      // Una pantalla como mínimo (D3): el contenido se centra en el alto que sobra sobre las olas.
      className="relative isolate flex min-h-pantalla flex-col overflow-hidden bg-blue"
      aria-labelledby="donations-title"
    >
      <PageGrid className={styles.contenido}>
        <div className="relative col-span-4 md:col-span-12">
          <div className={styles.columna}>
            <div className="relative">
              <TituloCinta id="donations-title" texto={t('donations.title')} />
              <Barco variante="mobile" className={`${styles.barcoMobile} md:hidden`} />
            </div>

            <div className={styles.parrafos}>
              <p>{renderTextWithBold(t('donations.paragraph1'))}</p>
              <p>{renderTextWithBold(t('donations.paragraph2'))}</p>
            </div>

            <div className={styles.botonFila}>
              {/* Abre el drawer de Súmate (docs/sumate-drawer/DECISIONES.md, D2). */}
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => sumate.open('tripulantes')}
                // Que "Volver arriba" no lo tape (docs/navegacion/DECISIONES.md, D6).
                data-evita-volver-arriba=""
                className={`${styles.boton} inline-flex items-center justify-center rounded bg-papel text-p-lg font-extrabold uppercase leading-normal text-blue transition hover:bg-beige focus:outline-none focus-visible:ring-2 focus-visible:ring-papel focus-visible:ring-offset-2 focus-visible:ring-offset-blue`}
              >
                {t('donations.cta')}
              </button>
            </div>
          </div>

          <Barco variante="desktop" className={`${styles.barcoDesktop} hidden md:block`} />
        </div>
      </PageGrid>

      {/* Olas azul claro al pie, a sangre, una capa por vector (ver OLAS_*). */}
      <div className={`${styles.olasMobile} pointer-events-none md:hidden`} aria-hidden>
        {OLAS_MOBILE.map(o => (
          <div key={o.n} className={styles.olaMobile} style={varsOla(o.lado, o.ciclo)}>
            <Image src={`/images/donations/olas-mobile-${o.n}.svg`} alt="" fill />
          </div>
        ))}
      </div>
      <div className={`${styles.olasDesktop} pointer-events-none hidden md:block`} aria-hidden>
        {OLAS_DESKTOP.map(o => (
          <div
            key={o.n}
            className={`${styles.olaDesktop} ${o.borde ? styles.olaBorde : ''}`}
            style={{ ...varsOla(o.lado, o.ciclo), '--peso': o.peso ?? 1 } as CSSProperties}
          >
            <Image src={`/images/donations/olas-desktop-${o.n}.svg`} alt="" fill />
          </div>
        ))}
      </div>
    </section>
  );
}
