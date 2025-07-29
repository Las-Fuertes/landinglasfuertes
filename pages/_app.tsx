import React from 'react';
import type { AppProps } from 'next/app';
import { GoogleAnalytics } from '@next/third-parties/google';
import '../styles/global.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <GoogleAnalytics gaId="G-9ZXP5ZNDT1" />
    </>
  );
}
