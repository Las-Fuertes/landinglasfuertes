'use client';

import Image from 'next/image';
import { PageGrid } from '../layout/page-grid';
import { useTranslation } from '../../hooks/useTranslation';
import { renderTextWithBold } from '../../lib/render-text-with-bold';
import { useSumateDrawer } from '../sumate';
import { TituloCinta } from './titulo-cinta';
import styles from './donations.module.css';

/**
 * Donaciones: "Dirigir el cambio con educación menstrual integral requiere tripulantes
 * comprometidos". Mobile según Figma 1288:1478 y desde `md` según el desktop 1288:1594
 * (docs/donaciones/DECISIONES.md). Las medidas del frame viven en donations.module.css.
 */
export default function DonationsSection() {
  const { t } = useTranslation();
  const sumate = useSumateDrawer();

  return (
    <section
      id="tripulantes"
      className="relative isolate overflow-hidden bg-blue"
      aria-labelledby="donations-title"
    >
      <PageGrid className={styles.contenido}>
        <div className="relative col-span-4 md:col-span-12">
          <div className={styles.columna}>
            <div className="relative">
              <TituloCinta id="donations-title" texto={t('donations.title')} />
              <Image
                src="/images/donations/barco-mobile.svg"
                alt=""
                width={223.704}
                height={174.175}
                className={`${styles.barcoMobile} md:hidden`}
                aria-hidden
              />
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
                className={`${styles.boton} inline-flex items-center justify-center rounded bg-papel text-p-lg font-extrabold uppercase leading-normal text-blue transition hover:bg-beige focus:outline-none focus-visible:ring-2 focus-visible:ring-papel focus-visible:ring-offset-2 focus-visible:ring-offset-blue`}
              >
                {t('donations.cta')}
              </button>
            </div>
          </div>

          <Image
            src="/images/donations/barco-desktop.svg"
            alt=""
            width={413.684}
            height={323.134}
            className={`${styles.barcoDesktop} hidden md:block`}
            aria-hidden
          />
        </div>
      </PageGrid>

      {/* Olas azul claro al pie, a sangre. Mobile: los vectores del frame compuestos en un SVG. */}
      <div className={`${styles.olasMobile} pointer-events-none md:hidden`} aria-hidden>
        <Image
          src="/images/donations/olas-mobile.svg"
          alt=""
          width={390}
          height={163}
          className="block h-auto w-full"
        />
      </div>
      <div className={`${styles.olasDesktop} pointer-events-none hidden md:block`} aria-hidden>
        <Image
          src="/images/donations/olas-desktop.svg"
          alt=""
          width={1714.34}
          height={245.039}
          className={styles.olasDesktopImagen}
        />
      </div>
    </section>
  );
}
