import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { MotionConfig } from 'framer-motion';
import '../styles/global.css';
import { RoughEdgeFilter } from '../components/layout/rough-edge-filter';
import { PuertaAviso } from '../components/aviso';
import { Bricolage_Grotesque, Pangolin } from 'next/font/google';
import { claseDispositivo, initAnalytics, registrarSuperPropiedades } from '../lib/analytics';

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  // 800: el botón "Quiero aportar" de Donaciones es ExtraBold en Figma.
  weight: ['400', '500', '700', '800'],
});

/**
 * Letra manuscrita de los acentos ("de Isla Fuerte, Colombia", "desliza", el texto de las
 * estampillas de EMI). Pangolin desde el 2026-10-01, tras el review de la diseñadora (antes Indie
 * Flower). Se expone como la variable `--font-acento`, que usa la clase `font-acento` de Tailwind
 * (docs/navegacion, D3).
 */
const pangolin = Pangolin({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-acento',
});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-9ZXP5ZNDT1';

/**
 * Mixpanel (docs/mixpanel/DECISIONES.md, D4): se inicia una vez en cliente y mantiene al día las
 * súper propiedades `language` (idioma del router) y `device_class` (ancho de la ventana, con
 * los cortes md y lg). El ancho se escucha con `matchMedia`, que solo avisa al cruzar un corte.
 */
function useAnalytics() {
  const { locale } = useRouter();

  useEffect(() => {
    initAnalytics();
    const md = window.matchMedia('(min-width: 768px)');
    const lg = window.matchMedia('(min-width: 1024px)');
    const actualizar = () =>
      registrarSuperPropiedades({ device_class: claseDispositivo(window.innerWidth) });
    actualizar();
    md.addEventListener('change', actualizar);
    lg.addEventListener('change', actualizar);
    return () => {
      md.removeEventListener('change', actualizar);
      lg.removeEventListener('change', actualizar);
    };
  }, []);

  useEffect(() => {
    if (locale) registrarSuperPropiedades({ language: locale });
  }, [locale]);
}

export default function App({ Component, pageProps }: AppProps) {
  useAnalytics();
  return (
    // reducedMotion="user": framer-motion desactiva sus animaciones de transform
    // cuando el sistema pide movimiento reducido.
    <MotionConfig reducedMotion="user">
      <div className={`${bricolageGrotesque.className} ${pangolin.variable}`}>
        {/* Aviso de protección de menores: una capa sobre todo en la primera visita; el resto
            de hermanos de este div queda inerte mientras está puesta (docs/aviso/DECISIONES.md). */}
        <PuertaAviso />
        <RoughEdgeFilter />
        <Component {...pageProps} />
        <GoogleAnalytics gaId={GA_ID} />
      </div>
    </MotionConfig>
  );
}
