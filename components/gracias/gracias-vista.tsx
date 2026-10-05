'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Share2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { track } from '../../lib/analytics';
import { PageGrid } from '../layout/page-grid';
import { Resaltado, type TonoResaltado } from '../layout/resaltado';
import Footer from '../layout/footer';
import LanguageSwitcher from '../layout/language-switcher';
import { useSaltoEstrella } from '../aviso/salto-estrella';
import { ESTRELLA_AVISO } from '../aviso/aviso';
import { instagramHref } from '../sumate/sumate.data';
import { SumateDrawer, SumateDrawerProvider } from '../sumate';
import { FadeIn } from '../sumate/fade-in';
import { CTA_BASE } from '../sumate/ui';
import type { Outcome } from './resultado';

/** `confirmando` es el estado de espera, mientras se consulta la pasarela. */
export type PantallaGracias = Outcome | 'confirmando';

type Grupo = 'exito' | 'espera' | 'falla';

/**
 * Cada pantalla pertenece a un grupo que decide el tono del título, el dibujo y la frase
 * manuscrita (docs/gracias/DECISIONES.md, D1). El éxito es rosa y con la estrella que salta; la
 * espera, negro y el sol quieto; la falla, negro y la gaviota.
 */
const GRUPO: Record<PantallaGracias, Grupo> = {
  confirmando: 'espera',
  approved: 'exito',
  suscripcion: 'exito',
  pending: 'espera',
  suscripcionPending: 'espera',
  suscripcionPaused: 'espera',
  rejected: 'falla',
};

const TONO: Record<Grupo, TonoResaltado> = { exito: 'rosa', espera: 'negro', falla: 'negro' };
const ACENTO: Record<Grupo, string> = {
  exito: 'gracias.acentoExito',
  espera: 'gracias.acentoEspera',
  falla: 'gracias.acentoFalla',
};

const P = '/images/welcome/';

/** Nubes de fondo: las mismas de Bienvenida, quietas y sin competir con el texto. */
function Nubes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-x-clip">
      <Image
        src={`${P}left-cloud.svg`}
        alt=""
        width={154}
        height={65}
        className="absolute left-s top-[12%] mt-xl h-auto w-24 opacity-90 md:mt-0 md:left-xl md:top-[22%] md:w-36 lg:top-[26%]"
      />
      <Image
        src={`${P}right-cloud.svg`}
        alt=""
        width={110}
        height={44}
        className="absolute right-s top-[14%] h-auto w-20 opacity-90 md:right-xxl md:top-[18%] md:w-28"
      />
      <Image
        src={`${P}nube-derecha-alta.svg`}
        alt=""
        width={142}
        height={50}
        className="absolute bottom-[10%] right-xl hidden h-auto w-32 opacity-80 md:block"
      />
    </div>
  );
}

/** La estrella de mar del aviso, con su salto esporádico (se queda quieta con movimiento reducido). */
function Estrella() {
  const saltoRef = useRef<HTMLDivElement>(null);
  useSaltoEstrella(saltoRef);
  return (
    <div ref={saltoRef} className="origin-bottom">
      <Image
        src={ESTRELLA_AVISO}
        alt=""
        width={108}
        height={93}
        unoptimized
        priority
        className="block h-auto w-full"
      />
    </div>
  );
}

function Dibujo({ grupo, pantalla }: { grupo: Grupo; pantalla: PantallaGracias }) {
  if (grupo === 'falla') {
    return (
      <Image
        src={`${P}gaviota-1.svg`}
        alt=""
        width={90}
        height={60}
        unoptimized
        className="block h-auto w-full"
      />
    );
  }
  if (pantalla === 'confirmando' || grupo === 'exito') return <Estrella />;
  return (
    <Image
      src={`${P}pink-sun.svg`}
      alt=""
      width={150}
      height={150}
      unoptimized
      className="block h-auto w-full"
    />
  );
}

export interface GraciasVistaProps {
  pantalla: PantallaGracias;
  orderId: string | null;
  onShare: () => void;
  copied: boolean;
}

/**
 * Pantalla de resultado del pago con el look del sitio (docs/gracias/DECISIONES.md, D1):
 * fondo beige con las nubes de Bienvenida, dibujo arriba, frase manuscrita (Pangolin), título en
 * chip rasgado, texto, referencia, botones con la forma de los CTA de Súmate y el footer del
 * sitio. Solo presentación: no consulta nada ni mide nada.
 */
export default function GraciasVista({ pantalla, orderId, onShare, copied }: GraciasVistaProps) {
  const { t } = useTranslation();
  const grupo = GRUPO[pantalla];
  const espera = pantalla === 'confirmando';
  const igHref = instagramHref();
  const titulo = t(`gracias.${pantalla}Title`);
  const tituloRef = useRef<HTMLHeadingElement>(null);

  // Foco inicial: el título (tabIndex -1, sin anillo), al cargar y cada vez que cambia el
  // resultado, para que teclado y lectores de pantalla arranquen en lo importante y no en el
  // selector de idioma. El cambio de "Confirmando" al resultado además se anuncia (aria-live).
  useEffect(() => {
    tituloRef.current?.focus({ preventScroll: true });
  }, [pantalla]);

  return (
    <SumateDrawerProvider>
      <LanguageSwitcher />
      <main className="relative flex min-h-dvh items-center overflow-x-clip bg-beige py-xxl text-black">
        <Nubes />
        <PageGrid className="relative w-full">
          {/* Región viva permanente: anuncia "Confirmando tu pago" y luego el resultado. */}
          <p aria-live="polite" role="status" className="sr-only">
            {titulo}
          </p>
          <div className="col-span-4 flex flex-col items-center text-center md:col-span-10 md:col-start-2 lg:col-span-6 lg:col-start-4">
            <div className="w-24 md:w-32">
              <Dibujo grupo={grupo} pantalla={pantalla} />
            </div>

            <FadeIn delay={0.1}>
              <p className="mt-m font-acento text-h3 text-blue md:text-h2">{t(ACENTO[grupo])}</p>
              <h1 ref={tituloRef} tabIndex={-1} className="mt-s focus:outline-none">
                <Resaltado
                  variante="titulo"
                  tono={TONO[grupo]}
                  className="text-h2 font-bold tracking-[-0.04em] md:text-h1"
                >
                  {titulo}
                </Resaltado>
              </h1>
              <p className="mx-auto mt-xl max-w-xl text-p-lg leading-relaxed md:text-h4">
                {t(`gracias.${pantalla}Text`)}
              </p>

              {orderId && !espera && (
                <p className="mt-m text-p-sm text-black/70">
                  {t('gracias.orderLabel')}: <span className="font-mono">{orderId}</span>
                </p>
              )}
            </FadeIn>

            {!espera && (
              <FadeIn delay={0.25} className="mt-xl flex w-full flex-col items-center gap-s">
                <div className="flex w-full flex-col items-center gap-s md:w-auto md:flex-row">
                  {grupo === 'falla' ? (
                    <Link
                      href="/#sumate"
                      className={`${CTA_BASE} bg-blue text-papel hover:bg-blue-300`}
                    >
                      {t('gracias.retry')}
                    </Link>
                  ) : (
                    /* Momento de máxima emoción: convertir al donante en difusor */
                    <button
                      type="button"
                      onClick={onShare}
                      className={`${CTA_BASE} gap-s bg-blue text-papel hover:bg-blue-300`}
                    >
                      <Share2 className="h-5 w-5" aria-hidden />
                      {copied ? t('gracias.copied') : t('gracias.shareCta')}
                    </button>
                  )}
                  <Link href="/" className={`${CTA_BASE} bg-black text-papel hover:bg-black/80`}>
                    {t('gracias.back')}
                  </Link>
                </div>
                {grupo !== 'falla' && igHref && (
                  <a
                    href={igHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      track(
                        'social_click',
                        { network: 'instagram', location: 'thank_you' },
                        undefined,
                        { saliente: true }
                      )
                    }
                    className="mt-s rounded px-m py-xs text-p-lg font-bold text-blue underline underline-offset-4 hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue"
                  >
                    {t('gracias.share')}
                  </a>
                )}
              </FadeIn>
            )}
          </div>
        </PageGrid>
      </main>
      <Footer />
      <SumateDrawer />
    </SumateDrawerProvider>
  );
}
