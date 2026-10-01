'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { sendGAEvent } from '@next/third-parties/google';
import { PageGrid } from './page-grid';
import { Resaltado } from './resaltado';
import { MenuTransparencia } from './menu-transparencia';
import { useTranslation } from '../../hooks/useTranslation';
import { useSumateDrawer } from '../sumate/sumate-drawer-context';

const INSTAGRAM_URL = 'https://www.instagram.com/las.fuertes/';
const LINKEDIN_URL = 'https://www.linkedin.com/company/fundaci%C3%B3n-las-fuertes/';

/** Títulos de columna: Bricolage Bold 18 con tracking -4 % (Figma). */
const TITULO = 'text-h4 font-bold tracking-[-0.04em]';

const enlace =
  'inline-flex min-h-8 items-center font-medium text-papel underline-offset-4 transition hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-papel';

/**
 * Footer según Figma `1402:230` (docs/navegacion/DECISIONES.md, D2). Un bloque azul con borde
 * rasgado (filtro `footer-rough-edge` de `rough-edge-filter.tsx`, sobre una capa de fondo sin
 * hijos), logo y lema a la izquierda, dos columnas con título resaltado ("¿Quieres apoyar?" y "La
 * fundación"), olas abajo a la izquierda y pájaros que asoman por arriba a la derecha.
 *
 * Mobile y tablet no tienen frame en Figma; se derivan del de desktop (D5): en mobile la marca
 * va en una fila (logo a la izquierda, lema al lado) y las dos columnas debajo, alineadas a la
 * izquierda; en tablet, las tres columnas de desktop a partes iguales.
 *
 * El borde de arriba se monta sobre el final de la sección anterior (`-mt-s`), así los dientes
 * se ven contra su fondo, sea cual sea.
 */
export default function Footer() {
  const { t } = useTranslation();
  const sumate = useSumateDrawer();
  const router = useRouter();
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="relative z-10 -mt-s overflow-x-clip pb-xs text-p-lg text-papel">
      {/* Franja de papel bajo los dientes de abajo, como en el diseño. */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-l bg-papel" />
      {/* El azul con borde rasgado: más ancho que la pantalla para que los lados no se vean. */}
      <div
        aria-hidden
        className="absolute -inset-x-l bottom-xs top-0 bg-blue [filter:url(#footer-rough-edge)]"
      />

      {/* Pájaros: asoman por encima del borde (Figma: 45 px sobre el azul, girados -15°). */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-xl right-m w-16 rotate-[-15deg] md:right-l lg:-top-[2.8rem] lg:right-m lg:w-[6.2rem]"
      >
        <Image
          src="/images/footer/pajaros.svg"
          alt=""
          width={99}
          height={125}
          className="h-auto w-full"
        />
      </div>

      {/* Olas abajo a la izquierda, cortadas por el borde de la pantalla. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-xl bottom-m w-[17rem] md:w-[22rem] lg:w-[27.65rem]"
      >
        <Image
          src="/images/footer/olas.svg"
          alt=""
          width={442}
          height={89}
          className="h-auto w-full"
        />
      </div>

      <PageGrid className="relative pb-[7.5rem] pt-xxl md:pb-[5.5rem] lg:pb-l">
        {/* Marca */}
        <div className="col-span-4 flex items-center gap-l md:flex-col md:gap-0 md:text-center">
          <Image
            src="/images/footer/logo.svg"
            alt="Las Fuertes"
            width={185}
            height={92}
            className="h-auto w-[7.5rem] shrink-0 md:w-[9.5rem] lg:w-[11.55rem]"
          />
          <p className="font-medium md:mt-s">{t('footer.tagline')}</p>
        </div>

        {/* ¿Quieres apoyar? */}
        <nav
          aria-labelledby="footer-apoyar"
          className="col-span-4 mt-xl flex flex-col items-start md:mt-0 md:pt-s lg:col-span-3 lg:col-start-6"
        >
          <h2 id="footer-apoyar">
            <Resaltado tono="negro" className={TITULO}>
              {t('footer.apoyarTitulo')}
            </Resaltado>
          </h2>
          <ul className="mt-s flex flex-col items-start">
            <li>
              {/* Súmate ya no es una sección: abre el drawer (docs/sumate-drawer/DECISIONES.md, D2). */}
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => sumate.open('footer')}
                data-footer-dona=""
                className={enlace}
              >
                {t('footer.dona')}
              </button>
            </li>
            <li>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sendGAEvent('event', 'instagram_click', { origen: 'footer' })}
                className={enlace}
              >
                {t('footer.instagram')}
              </a>
            </li>
            <li>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sendGAEvent('event', 'linkedin_click', { origen: 'footer' })}
                className={enlace}
              >
                {t('footer.linkedin')}
              </a>
            </li>
          </ul>
        </nav>

        {/* La fundación */}
        <div className="col-span-4 mt-l flex flex-col items-start md:mt-0 md:pt-s lg:col-start-9">
          <h2>
            <Resaltado tono="negro" className={TITULO}>
              {t('footer.fundacionTitulo')}
            </Resaltado>
          </h2>
          <div className="mt-s flex flex-col items-start">
            <MenuTransparencia />
            <Link
              href="/terminos"
              aria-current={router.pathname === '/terminos' ? 'page' : undefined}
              data-footer-terminos=""
              className={enlace}
            >
              {t('footer.terminos')}
            </Link>
          </div>
        </div>

        {/* Legal */}
        <p className="col-span-4 mt-xl text-p-sm font-semibold md:col-span-12 md:text-right md:text-p-lg">
          © {year} {t('footer.legal')}
        </p>
      </PageGrid>
    </footer>
  );
}
