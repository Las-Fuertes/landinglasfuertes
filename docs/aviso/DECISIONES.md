# Aviso de protección de menores: decisiones

Rama `29-sep-aviso` desde `origin/main` `2122c29`. Figma (fileKey `ng8HnnYyaDJ2nTWauh7Otb`):
mobile `1425:537`, desktop `1425:699`.

## D1. La puerta: aviso antes de la landing (2026-09-29)

**Por qué.** La web muestra fotos de niñas de la fundación. Johan pidió avisarlo antes de entrar y
que el visitante acepte que no usará ese material (ni para IA). Es un aviso de buena fe, no un
control de acceso: quien lo acepta ve la landing tal cual.

**Qué es.** `components/aviso/puerta-aviso.tsx`, montada en `pages/_app.tsx` (todas las rutas y los
tres idiomas: `/`, `/en`, `/fr`, también `/gracias`). Capa `fixed inset-0 z-[200]`, opaca, fondo
`arena` (`#FDDEB5`, token nuevo en `tailwind.config.js`), por encima del botón flotante, del
drawer de Súmate (z-100) y de la cortina del mapa (z-120). Estrella de mar, aviso, llamado en
negrita y botón "Acepto".

- **Fiel a Figma.** Medidas exactas en `puerta-aviso.module.css` (como `donations.module.css`):
  columna de 312 px en mobile y 722 desde `md`, 13 y 16 px, interlineado medido en el render de
  Figma (16,25 y 19,5 px), el bloque desplazado 5 y 12 px a la derecha como en el frame. Medido
  contra el render de Figma, bandas de tinta: a 1280x832 la misma `y` y la misma `x` en los seis
  bloques (diferencias de 0 a 1 px); a 390 las distancias relativas desde la estrella difieren
  en 0 a 1 px (Figma tiene 700 de alto, así que la posición absoluta no se compara).
- **Cortes de línea.** Figma desktop pone "NO AUTORIZAMOS" en su propia línea y mobile parte el
  llamado en dos. En `locales` van como `\n`: el del aviso solo corta desde `lg`, el del llamado
  solo por debajo de `md` (`TextoConCortes`). Espacios de no separación para que no quede una
  palabra sola al final: "inteligencia artificial." (es), "artificial intelligence." (en),
  "l'intelligence artificielle." y "NOUS N'AUTORISONS" (fr). (Hasta el 2026-09-30 eran "de IA." y
  "the use of AI."; ver la ampliación de la frase de IA, abajo.)
- **Estrella.** `public/images/aviso/estrella-de-mar.svg` es el SVG de Figma con las coordenadas
  de los trazos redondeadas a 0,1 (655 KB a 399 KB, 80 KB con gzip). El original sin tocar está en
  `design-assets/aviso/estrella-de-mar.svg`. Ver la ampliación "Revisión del verificador" (abajo):
  hoy pesa 180 KB (31 KB con gzip) y solo se descarga si la puerta se va a mostrar.

**Cookie versionada, por dispositivo, de un año.** Al pulsar "Acepto":
`lf_aviso=v1; Max-Age=31536000; Path=/; SameSite=Lax` (+ `Secure` en https). Si cambia el texto y
hay que volver a pedirlo, se sube `VERSION_AVISO` en `components/aviso/aviso.ts`: la cookie vieja
deja de valer. Vencido el año, en incógnito o borrando cookies, el aviso vuelve a salir. Nada de
librerías: `document.cookie`, y desde el 2026-09-30 también un `Set-Cookie` del servidor (ver la
ampliación "Revisión del verificador": Safari recorta a 7 días las cookies de JS).

**Sin parpadeo.** El sitio es estático, así que la puerta va siempre en el HTML y la decisión se
toma antes de pintar: un script en línea de `pages/_document.tsx` (`SCRIPT_AVISO`) lee la cookie.

- Con ella: `<html data-aviso="aceptado">`, y el CSS de `styles/global.css` pone la puerta en
  `display: none`: no se pinta ni un frame. Tras hidratar, el componente se desmonta.
- Sin ella: `<html data-cortina-puesta>` y `overflow: hidden` en `html`; el primer frame ya es la
  puerta.
- La hidratación ve lo mismo que el servidor (la puerta siempre se renderiza al principio): 0
  errores de hidratación en los dos casos.

Medido por CDP (screencast desde el primer frame y un registro por `requestAnimationFrame` desde
el inicio del documento): tras navegar sale un frame en blanco sin contenido (el del navegador
antes de pintar) y el siguiente ya es arena sin cookie o beige de la landing con cookie. Sin cookie
todos los frames con contenido tienen la puerta a opacidad 1; con cookie, ninguno la muestra.

**Mientras la puerta está puesta.** Los hermanos de la puerta en `_app` llevan `inert` (ni foco
ni clic ni lector de pantalla); la página no se desplaza. La intro no arranca: `useIntroPin`
espera a `alAceptarAviso` para pasar a `pin` y pedir su entrada, así que GSAP no corre detrás. El
drawer de Súmate espera igual para abrir `#sumate`/`#donar`. Impacto (`useSinCortina`) espera
también, porque la puerta reutiliza la marca `data-cortina-puesta` y el `EVENTO_CORTINA` del telón
del mapa. Las fotos se descargan pero no se ven: la puerta es opaca.

**Accesibilidad.** `role="dialog"`, `aria-modal`, `aria-labelledby` a un título oculto
(`aviso.titulo`), `aria-describedby` al aviso. Foco inicial en "Acepto" sin anillo (el diseño);
Tab y Shift+Tab recorren solo los controles de la puerta y muestran el anillo; Escape no cierra
(desde el 2026-09-30 incluyen el selector de idioma: ver la ampliación al final de D1).

**Entrada tras aceptar: el telón.** Pedido de Johan: "a la página entras con un muy buen fade tipo
telón introduciendo nuestra gran landing". Solo opacidad, con la Web Animations API (corre en el
compositor), siguiendo el lenguaje de movimiento de `docs/PATTERNS.md`. `SALIDA_AVISO`, en ms
desde el clic:

| ms        | Qué pasa                                                                     |
| --------- | ---------------------------------------------------------------------------- |
| 0 a 240   | la estrella y el botón se van (curva de salida)                              |
| 80 a 340  | el texto se va, el último de la puerta (regla 2)                             |
| 300 a 800 | el fondo arena se desvanece: el `cortinaSeVa` de Impacto, 500 ms, sine.inOut |
| 680       | se suelta la landing y la intro arranca (el `cortinaSolape` de Impacto, 120) |

Medido por frame a 390x844: la intro empieza su texto a los 732 ms con la puerta al 13 %, la
puerta llega a 0 hacia los 807 y se desmonta a los 858. Con `prefers-reduced-motion`, sin
fundido: todo en el mismo frame (36 ms).

**Deep links.** `/#sumate`: puerta primero, al aceptar se abre el drawer (731 ms). `/#impacto`:
el navegador ya dejó la página en el ancla debajo de la puerta (y=9808, lo mismo que con la
cookie), y la entrada de Impacto espera al telón.

**Buscadores.** El HTML de la landing sigue entero en el documento: la puerta es una capa. Las
metaetiquetas OG no se tocaron.

**Ampliación (2026-09-30): selector de idioma en la puerta.** Feedback de Johan: "necesitamos el
switch del lenguaje en esta nueva página también". La puerta tapaba el selector de la landing, así
que quien llegaba en el idioma equivocado no podía cambiarlo antes de aceptar.

- Es el mismo `components/layout/language-switcher.tsx`, montado dentro de la puerta con
  `enPuerta`: misma apariencia (píldora blanca sobre el arena, activo en `blue`) y la misma esquina
  que en la landing (`fixed left-page-margin top-4`, x=40, y=16, en todos los anchos). Con
  `enPuerta` no escucha el scroll y siempre se ve: con un deep link como `/#impacto` la página de
  fondo está desplazada y el selector de la landing estaría escondido. Sin la prop, la landing
  sigue igual (capturas `--quieto` antes y después: 0 px distintos a 1280 y 6 px de ruido de
  antialias a 390, lejos del selector; dos capturas seguidas del mismo código difieren más).
- El contenedor de la columna lleva `py-xxl` arriba y abajo: el bloque queda centrado igual que
  antes (la estrella sigue en y=226 a 1280x832, como en Figma) y, si una pantalla muy baja hace
  desplazar la puerta, el texto no pasa por debajo del selector.
- Cambiar de idioma es un `router.push` al mismo path con otro `locale`: `_app` no se remonta, la
  puerta sigue puesta con su estado, los hermanos siguen `inert` y solo cambia el texto. El hash se
  toma ahora de `window.location.hash` (`router.asPath` no siempre lo trae tras la carga), así que
  `/#sumate` sigue siendo `/fr#sumate` y al aceptar se abre el drawer. Aplica también a la landing.
- Foco: el inicial sigue en "Acepto" sin anillo. Tab y Shift+Tab recorren en ciclo solo los
  botones de la puerta (ES, EN, FR, Acepto), con anillo; Escape sigue sin cerrar. El selector no
  abre menú, así que no hay capas extra.
- Al irse la puerta, el selector se desvanece con el telón y descubre el de la landing en el mismo
  sitio.

Medido por CDP (`scratchpad/aviso-idioma/`): a 360x640, 390x844, 768x1024, 1280x832 y 1920x1080
en es, en y fr, 0 px de solape entre el selector y la estrella, el aviso, el llamado y el botón,
sin scroll en la puerta ni desborde. Desde `/#sumate`: es, EN, FR con la puerta puesta y el aviso
traducido cada vez, hash conservado; tras aceptar en fr, `lang=fr`, `/fr#sumate`, drawer abierto y
cookie `lf_aviso=v1`. Tab: ES, EN, FR, Acepto, ES; Shift+Tab al revés. Consola sin errores nuevos
(solo el 404 de `favicon.ico` y avisos de `next/image` de la intro, que ya estaban).

**Ampliación (2026-09-30): la estrella de mar salta.** Pedido de Johan: "animar la estrellita de
mar que salte". `components/aviso/salto-estrella.ts` (`useSaltoEstrella`, constantes en
`SALTO_ESTRELLA`), siguiendo el lenguaje de movimiento de `docs/PATTERNS.md` (reglas 5, 8, 10 y 11):

- Un salto de 1150 ms: anticipación (se aplasta a 1,14 x 0,84 hasta el 16 %), despegue estirado
  (0,9 x 1,14), punto alto al 46 % subiendo un 45 % de su alto (23 px en mobile, unos 42 en
  desktop) con un giro de 7° que alterna de lado en cada salto, caída estirada, aplastamiento al
  tocar el suelo (1,16 x 0,84 al 70 %) y dos rebotes de asentamiento hasta el reposo exacto.
  Curvas de `coreografia.ts`: subida con la de entrada `[0.22, 1, 0.36, 1]` (frena arriba), caída
  con la de salida `[0.32, 0, 0.67, 0]` (acelera hacia el suelo), anticipación y asentamiento con
  sine.inOut `[0.37, 0, 0.63, 1]`.
- Un salto a los 700 ms de montar la puerta y luego, en reposo, uno cada 4,5 a 7,5 s al azar
  (más la duración del salto): se nota que está viva sin ser insistente.
- Solo `transform`, con la Web Animations API, en una capa interior (`origin-bottom`, el
  aplastamiento se apoya en la base). La capa de fuera conserva el fundido de salida. El layout no
  se mueve: por CDP, en todos los frames el texto, el botón y la caja de la estrella tienen la
  misma posición.
- Al pulsar "Acepto", `detenerSalto()` corta los saltos y lleva la estrella a reposo desde donde
  esté en 240 ms con sine.inOut, a la par que se funde: pulsando en el punto alto, como mucho 2,5 px
  por frame (con la curva de entrada eran 7,9; se cambió).
- Con `prefers-reduced-motion`, quieta: 0 animaciones.

Medido a 390x844 con CPU 4x (sonda `scratchpad/aviso-idioma/sonda-salto.js`): 0 frames de más de
34 ms durante los saltos (los 5 lentos de la carga caen antes del primer salto, que empieza a los
1,8 s). Capturas congeladas en el salto: `estrella-180.png` (anticipación), `estrella-300.png`
(despegue), `estrella-530.png` (arriba, girada), `estrella-810.png` (aterrizaje aplastado).

**Ampliación (2026-09-30): revisión del verificador.** Cuatro ajustes menores, sin bloqueantes:

- **La cookie la pone también el servidor.** Safari (ITP) y Brave limitan a 7 días las cookies
  escritas con `document.cookie`: en iPhone el aviso habría vuelto cada semana. Las que llegan en
  un `Set-Cookie` de una respuesta del mismo sitio duran lo que dicen. `pages/api/aviso.ts` (POST)
  responde 204 con `Set-Cookie: lf_aviso=v1; Max-Age=31536000; Path=/; SameSite=Lax` (+ `Secure`
  si `x-forwarded-proto` es https, como en Vercel) y `Cache-Control: no-store`; otro método, 405.
  Al pulsar "Acepto", `guardarAceptacion` escribe la cookie por JS en el acto (el telón y la
  landing no esperan a la red) y lanza el POST en paralelo con `keepalive`, sin esperarlo; si
  falla, la de JS sigue valiendo. Nombre, versión y duración salen de una sola función,
  `cookieAviso` en `components/aviso/aviso.ts`, que usan el cliente y la API. Medido: `curl -i -X
POST` da la cabecera exacta (con `x-forwarded-proto: https`, con `Secure`); por CDP, tras
  "Acepto" el POST responde 204 y la cookie queda con 31 535 996 s de vida. El telón no cambió
  (texto de la intro a los 731 ms, puerta desmontada a los 862).
- **Sin JavaScript, la puerta no se muestra.** Sin JS no hay forma de aceptar, y dejar la web
  bloqueada no protege mejor a nadie (la foto sigue en el HTML): un `<noscript>` en
  `pages/_document.tsx` pone la puerta en `display: none` y devuelve el scroll a `html`. Medido
  con los scripts desactivados por CDP: puerta `none`, `overflow: auto`, la página entera
  desplazable.
- **Inglés.** "girls under 18 years of age under Colombian law" repetía "under": ahora "photos of
  **girls who are minors (under 18)** according to Colombian law". Sin solapes ni scroll a 360,
  390 y 1280.
- **La estrella solo se descarga si la puerta se va a ver.** Ya no lleva `priority` (que la
  precargaba siempre): la imagen es `loading="lazy"`, y dentro de un `display: none` el navegador
  no la pide. Sin la cookie, `SCRIPT_AVISO` añade un `<link rel="preload">` antes de pintar, así
  que llega con el primer frame igual que antes. Medido por CDP: con la cookie, 0 peticiones a la
  estrella; sin ella, una. Además el SVG se optimizó (sin tocar la forma): se quitaron los
  segmentos de longitud cero y los trazos pasaron a coordenadas relativas, de 399 KB a 180 KB y de
  80 KB a 31 KB con gzip. Render de Chrome a 2x contra el anterior: a 108 y 60 px de ancho, 50 px
  distintos, todos por debajo de 20/255 (suavizado de bordes). El script está en
  `scratchpad/aviso-idioma/opt-svg.py`.

Re-probado: primer frame sin cookie arena y con cookie beige de la landing, 0 errores de
hidratación, estrella y salto iguales (capturas `estrella-<ms>.png` rehechas).

**Ampliación (2026-09-30): la frase de la IA, más precisa.** Decisión de Johan: la segunda
frase del aviso dice ahora que no se autoriza usar las fotos con inteligencia artificial (antes,
"ni autorizamos el uso de IA", que podía leerse como una prohibición de usar IA en general).
Textos, con la negrita y las mayúsculas de siempre:

- es: "**NO AUTORIZAMOS** el uso de las mismas bajo ninguna circunstancia, ni su uso con
  inteligencia artificial."
- en: "**WE DO NOT AUTHORIZE** their use under any circumstances, nor their use with artificial
  intelligence."
- fr: "**NOUS N'AUTORISONS PAS** leur utilisation, en aucune circonstance, ni leur utilisation
  avec l'intelligence artificielle."

Espacio de no separación entre las dos palabras finales en los tres. Medido a 360x640, 390x844,
768x1024, 1280x832 y 1920x1080: 0 px de solape con el selector, sin scroll ni desborde. El texto
es más largo que el de Figma: en español desktop el aviso pasa de 3 a 4 líneas (el bloque se
recentra solo); `text-wrap: pretty` reparte los cortes sin palabras sueltas.

## D2. Bloqueo solo de las imágenes a los rastreadores de IA (2026-09-29)

**Por qué.** Johan quiere que los LLM lean e indexen el texto de la fundación, pero no las fotos.

**`public/robots.txt`.** Se conserva el grupo `*` (`Allow: /`, `Disallow: /gracias`) y se añade un
grupo para rastreadores y tokens de IA con `Allow: /`, `Disallow: /images/`,
`Disallow: /_next/image` y otra vez `Disallow: /gracias` (un bot que casa con un grupo propio ya
no lee el de `*`). Todas las fotos del sitio están bajo `public/images/` (no hay imágenes
importadas que salgan por `/_next/static/media`); `next/image` las sirve por `/_next/image`.

Lista y por qué cada uno:

- OpenAI: `GPTBot` (entrenamiento), `OAI-SearchBot` (búsqueda de ChatGPT), `ChatGPT-User`
  (lecturas que pide un usuario).
- Anthropic: `ClaudeBot` (entrenamiento), `Claude-User`, `Claude-SearchBot`, y los antiguos
  `anthropic-ai` y `Claude-Web`.
- Google: `Google-Extended` (token que controla el uso para Gemini; no es un rastreador). **No**
  se bloquea `Googlebot`: la búsqueda normal sigue igual. `Googlebot-Image` sí, desde el
  2026-09-30, en su propio grupo (ver "Google Imágenes", abajo).
- Apple: `Applebot-Extended` (token de uso para IA; `Applebot` sigue libre).
- Meta: `meta-externalagent` (entrenamiento) y `meta-externalfetcher`. `facebookexternalhit`
  (las tarjetas al compartir) no se toca, para que la imagen OG siga saliendo.
- `CCBot` (Common Crawl, base de muchos entrenamientos), `PerplexityBot` y `Perplexity-User`,
  `Bytespider` (ByteDance), `Amazonbot`, `cohere-ai` y `cohere-training-data-crawler`, `Diffbot`,
  `ImagesiftBot` (raspador de imágenes), `omgili`, `omgilibot` y `Webzio-Extended` (Webz.io),
  `Timpibot`, `AI2Bot` y `Ai2Bot-Dolma` (Allen AI), `YouBot`, `MistralAI-User`,
  `DuckAssistBot`.

**Cabecera `X-Robots-Tag: noimageai, noai`** en `next.config.js` (`headers()`), solo para
`/images/:path*` y `/_next/image`. El HTML no la lleva (medido con curl: la página responde sin
ella). **Límite medido:** en local, con `next dev` y con `next start`, el optimizador
`/_next/image` responde antes de aplicar las cabeceras de `next.config.js`, y un `proxy.ts` con
ese `matcher` tampoco llega (Next excluye esa ruta). En Vercel las cabeceras se aplican en su
capa de rutas; hay que comprobarlo en el preview con
`curl -sD - -o /dev/null "<preview>/_next/image?url=%2Fimages%2F...&w=640&q=75"`. `robots.txt` sí
cubre `/_next/image` en cualquier caso.

**Google Imágenes (ampliación del 2026-09-30).** Decisión de Johan: las fotos no deben salir en
Google Imágenes. `robots.txt` tiene un grupo propio para `Googlebot-Image` con las mismas reglas
(`Allow: /`, `Disallow: /images/`, `Disallow: /_next/image`, `Disallow: /gracias`). `Googlebot`
(la búsqueda normal) sigue sin bloquear: el texto se indexa igual. Lo que ya esté en Google
Imágenes sale al recrawl, no en el acto.

**Límites que hay que tener claros.** `robots.txt` y `noai` son una petición que las empresas
serias respetan, no una barrera técnica: un raspador que los ignore (Bytespider tiene fama de
hacerlo) sigue pudiendo bajar las fotos, igual que cualquier persona. Lo mismo con la puerta:
incógnito o borrar cookies vuelve a mostrar el aviso, y no impide técnicamente guardar una foto.
