import { Html, Head, Main, NextScript, DocumentProps } from 'next/document';
import { SCRIPT_AVISO } from '../components/aviso/aviso';

export default function Document(props: DocumentProps) {
  // Refleja el idioma activo (es/en/fr) en el atributo lang del documento.
  const locale = props.__NEXT_DATA__?.locale ?? 'es';

  return (
    <Html lang={locale}>
      <Head>
        <meta name="theme-color" content="#FCF5E9" />
        {/* Favicon (docs/introduccion/DECISIONES.md, D16): la luna morada contrasta con la pestaña
            clara del navegador y la crema con la oscura. Primero el respaldo sin `media` (la
            morada, porque casi todas las pestañas son claras); los navegadores que entienden
            `media` se quedan con el que coincide. `public/favicon.ico` es la misma morada a 32 px,
            sin enlace: es para quien lo pide por su cuenta (y quita el 404). El icono de inicio de
            iOS rellena la transparencia de negro: ahí va la crema. */}
        <link rel="icon" type="image/png" href="/images/favicons/favico_purple.png" />
        <link
          rel="icon"
          type="image/png"
          href="/images/favicons/favico_purple.png"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          type="image/png"
          href="/images/favicons/favico_yellow.png"
          media="(prefers-color-scheme: dark)"
        />
        <link rel="apple-touch-icon" href="/images/favicons/favico_yellow.png" />
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
        {/* Alto de pantalla fijo (docs/scroll/DECISIONES.md, D1): se mide una vez antes del primer
            pintado, junto con `--alto-grande` (100lvh, el alto con la barra escondida), y se re-mide si cambia el ANCHO (rotación) o, con ratón (sin barra que se esconda), también el alto.
            Los cambios solo de alto en táctil (barra de Safari, teclado) se ignoran. Sin JS, el CSS cae a 100svh. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var d=document.documentElement,w=innerWidth;function s(){var p=d.appendChild(document.createElement('div'));p.style.cssText='position:absolute;visibility:hidden;height:100lvh';var g=p.offsetHeight;d.removeChild(p);d.style.setProperty('--alto-fijo',innerHeight+'px');d.style.setProperty('--alto-grande',Math.max(g,innerHeight)+'px')}s();addEventListener('resize',function(){if(innerWidth!==w||matchMedia('(hover:hover) and (pointer:fine)').matches){w=innerWidth;s()}})})()",
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
