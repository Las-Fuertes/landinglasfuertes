import { Html, Head, Main, NextScript, DocumentProps } from 'next/document';

export default function Document(props: DocumentProps) {
  // Refleja el idioma activo (es/en/fr) en el atributo lang del documento.
  const locale = props.__NEXT_DATA__?.locale ?? 'es';

  return (
    <Html lang={locale}>
      <Head>
        <meta name="theme-color" content="#FCF5E9" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
