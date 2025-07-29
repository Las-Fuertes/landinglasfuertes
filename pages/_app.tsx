import React from 'react';
import type { AppProps } from 'next/app';
import '../styles/global.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="debug-tailwind">
      <Component {...pageProps} />
    </div>
  );
}
