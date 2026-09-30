import { Html, Head, Main, NextScript, DocumentProps } from 'next/document';
import { SCRIPT_AVISO } from '../components/aviso/aviso';

export default function Document(props: DocumentProps) {
  // Refleja el idioma activo (es/en/fr) en el atributo lang del documento.
  const locale = props.__NEXT_DATA__?.locale ?? 'es';

  return (
    <Html lang={locale}>
      <Head>
        <meta name="theme-color" content="#FCF5E9" />
        {/* Aviso de protección de menores (docs/aviso/DECISIONES.md, D1): lee la cookie antes de
            pintar. Con ella, `data-aviso="aceptado"` y la puerta no se pinta ni un frame; sin
            ella, el primer frame ya es la puerta y la página de fondo no se desplaza. */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_AVISO }} />
        {/* Sin JavaScript no hay forma de aceptar el aviso: en vez de dejar la web bloqueada, la
            puerta no se muestra y la página vuelve a desplazarse (D1). */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              '<style>html{overflow:auto!important}[data-aviso-puerta]{display:none!important}</style>',
          }}
        />
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
