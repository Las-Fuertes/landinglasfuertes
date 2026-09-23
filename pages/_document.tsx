import { Html, Head, Main, NextScript, DocumentProps } from 'next/document';

export default function Document(props: DocumentProps) {
  // Refleja el idioma activo (es/en/fr) en el atributo lang del documento.
  const locale = props.__NEXT_DATA__?.locale ?? 'es';

  return (
    <Html lang={locale}>
      <Head>
        <meta name="theme-color" content="#FCF5E9" />
        {/* La Introducción se sirve estática y, al hidratar, pasa al pin con su entrada animada.
            Si va a animarse (mismas condiciones que useIntroPin), la versión estática no se
            pinta, para que no aparezca y desaparezca antes de la entrada. Sin JS no corre y
            se ve la estática. Ver docs/introduccion/DECISIONES.md, D2. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!location.hash)document.documentElement.setAttribute('data-intro-anima','')",
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
