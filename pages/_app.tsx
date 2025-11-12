import type { AppProps } from 'next/app';
import { GoogleAnalytics } from '@next/third-parties/google';
import '../styles/global.css';
import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={dmSans.className}>
      <Component {...pageProps} />
      <GoogleAnalytics gaId="G-9ZXP5ZNDT1" />
    </div>
  );
}
