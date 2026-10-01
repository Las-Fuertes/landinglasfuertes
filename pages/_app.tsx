import type { AppProps } from 'next/app';
import { GoogleAnalytics } from '@next/third-parties/google';
import { MotionConfig } from 'framer-motion';
import '../styles/global.css';
import { RoughEdgeFilter } from '../components/layout/rough-edge-filter';
import { PuertaAviso } from '../components/aviso';
import { Bricolage_Grotesque, Pangolin } from 'next/font/google';

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

export default function App({ Component, pageProps }: AppProps) {
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
