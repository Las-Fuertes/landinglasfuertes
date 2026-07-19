import type { AppProps } from 'next/app';
import { GoogleAnalytics } from '@next/third-parties/google';
import '../styles/global.css';
import { Bricolage_Grotesque } from 'next/font/google';

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={bricolageGrotesque.className}>
      <Component {...pageProps} />
      <GoogleAnalytics gaId="G-9ZXP5ZNDT1" />
    </div>
  );
}
