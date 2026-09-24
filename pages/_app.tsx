import type { AppProps } from 'next/app';
import { GoogleAnalytics } from '@next/third-parties/google';
import { MotionConfig } from 'framer-motion';
import '../styles/global.css';
import { RoughEdgeFilter } from '../components/layout/rough-edge-filter';
import { Bricolage_Grotesque } from 'next/font/google';

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  // 800: el botón "Quiero aportar" de Donaciones es ExtraBold en Figma.
  weight: ['400', '500', '700', '800'],
});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-9ZXP5ZNDT1';

export default function App({ Component, pageProps }: AppProps) {
  return (
    // reducedMotion="user": framer-motion desactiva sus animaciones de transform
    // cuando el sistema pide movimiento reducido.
    <MotionConfig reducedMotion="user">
      <div className={bricolageGrotesque.className}>
        <RoughEdgeFilter />
        <Component {...pageProps} />
        <GoogleAnalytics gaId={GA_ID} />
      </div>
    </MotionConfig>
  );
}
