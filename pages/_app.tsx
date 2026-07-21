import type { AppProps } from 'next/app';
import { GoogleAnalytics } from '@next/third-parties/google';
import { MotionConfig } from 'framer-motion';
import '../styles/global.css';
import { Bricolage_Grotesque } from 'next/font/google';

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-9ZXP5ZNDT1';

export default function App({ Component, pageProps }: AppProps) {
  return (
    // reducedMotion="user": framer-motion desactiva sus animaciones de transform
    // cuando el sistema pide movimiento reducido.
    <MotionConfig reducedMotion="user">
      <div className={bricolageGrotesque.className}>
        <Component {...pageProps} />
        <GoogleAnalytics gaId={GA_ID} />
      </div>
    </MotionConfig>
  );
}
