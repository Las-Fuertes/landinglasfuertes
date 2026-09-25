# Resaltado (chip rasgado): decisiones

Rama `24-sep-resaltado`. Especificación y evidencia de partida: `AUDITORIA.md` (12 usos, Figma
por uso, hallazgos H1 a H13) y la tabla de maquetación de `COPIES.md`.

## D1. Un solo patrón de resaltado, cortado por el navegador y sin pisar nada (2026-09-24)

**Qué había.** Cada uso armaba su chip con `.map-chip` (un `inline-block` con `padding`, fondo en
`::before`, giro de -1,2 grados para todos) más variantes sueltas (`--emi`, `--cinta`, `--flat`,
`--pink`) y la cinta de papel de Súmate (`.donation-title-chip`, con un filtro que no existía).
Los cortes de línea de los títulos de Impacto se escribían a mano en los locales, un `==...==`
por línea. Resultado medido en la auditoría: fondo que tapa la línea de arriba en la Introducción
(hasta 8,5 px), fondos de Impacto fundidos en una losa, fondo a todo el ancho cuando la frase no
cabía ("des" suelto en francés), palabras sueltas empujadas a otra línea ("but", "ignored,") y
la cinta de EMI con la letra achicada en francés.

**Qué se decidió (Johan, 2026-09-24).**

1. **Giro según Figma por uso**: -0,54 grados en general, -1,23 en los títulos de Impacto, -4,09
   en el sello rosa "EMI". El -1,2 único era parte de por qué el fondo subía sobre la línea de
   arriba: en un chip de 236 px sube 4,9 px el extremo derecho; a -0,54 sube 2,2.
2. **Cortes de línea medidos por el navegador**, una pieza de fondo por línea visual, como ya
   hacía el título de Donaciones (`docs/donaciones/DECISIONES.md`, D1). Nada de cortes a mano por
   idioma: sirven en los tres idiomas y en cualquier ancho, y una traducción nueva no puede
   romper la forma.
3. **Si una frase resaltada no cabe en una línea, se parte en dos piezas; no se achica la
   letra.** Es lo que hace Figma en los títulos y evita una tipografía distinta por idioma. Se
   retiró el `text-h4 tracking-tighter` que la cinta de EMI usaba en francés.
4. **El fondo nunca pisa las líneas de texto vecinas** (prioridad alta). Ni fondo a todo el
   ancho, ni palabras cortas solas en su propio bloque, ni fondos de líneas consecutivas
   fundidos en una losa: en Figma son tiras separadas.

**Cómo quedó.** Un componente, `components/layout/resaltado.tsx`, con tres variantes y el giro
como prop; los estilos en `styles/global.css` (`.resaltado*`). Detalle de uso en
`docs/PATTERNS.md`, "Resaltado de palabras: el chip rasgado".

- `TextoResaltado` recibe el texto de `locales` con `==...==`. Dos resaltados seguidos
  (`==a== ==b==`) cuentan como una sola frase, así los locales que todavía traen el corte a mano
  siguen sirviendo y el corte lo pone el navegador. `renderTextWithMarks` ahora lo devuelve.
- `Resaltado` resalta un texto entero (cinta, nombre, rótulo, etiqueta).
- El corte sale de `lib/use-lineas-medidas.ts`: un medidor invisible al final del bloque, con la
  misma tipografía y el mismo ancho, agrupa las palabras por su posición. Cada grupo se pinta
  como una pieza `inline-block` que no se parte, separada de la siguiente con un `<br>`. El
  título de Donaciones usa el mismo hook.
- **Por qué no pisa**: el fondo es un `::before` centrado en la línea, con alto
  `--fondo-alto` (1,1 em en línea y en títulos) y márgenes laterales `--aire-x`, no `padding`.
  La pieza mide lo que su texto, así que el resaltado no cambia dónde corta la línea. La cuenta
  que lo garantiza: con interlineado de 1,2 a 1,25 em y la letra de Bricolage (caja de 1,2 em,
  tinta entre 0,16 y 1,13 em), un fondo de 1,1 em deja de 0,05 a 0,075 em por lado hasta la
  caja de la línea vecina, y eso tiene que cubrir la subida del giro y lo que derrama el borde
  rasgado. Por eso el giro es pequeño y la región del filtro sigue corta en vertical (3 % del
  alto: menos de 1,5 px). En los títulos el giro se hace sobre el borde izquierdo
  (`--origen: left center`), así las tiras de un título alineado a la izquierda quedan
  paralelas y el hueco entre ellas es el mismo en toda la línea.
- **Etiqueta**: una frase suelta con aire generoso (fondo de 1,7 em, como Figma). Como el fondo es más
  alto que la línea, la pieza reserva ese sitio con `margin-block`, y si se parte (cinta de EMI
  en francés) las dos piezas no se tocan.
- **Tonos**: `negro` (fondo `black`, texto `papel`, el `#FFF5E8` de Figma, que antes salía
  blanco), `rosa` (sello EMI, `pink-sol`) y `papel` (etiquetas del drawer de Súmate, texto
  `blue`). La cinta de Súmate vuelve a verse: su filtro apuntaba a un `#paper-texture` que no
  existía (H12).
- **Sin JS** (servidor y primer render) el resaltado es un `inline` con
  `box-decoration-break: clone`, sin giro ni filtro: no tapa nada.
- **Se mantienen como piezas propias**: el sello "EMI" (giro -4,09, tono rosa, geometría propia
  por variables) y la cinta de papel del título de Donaciones (cada tramo con su medida de
  Figma, `donations.module.css`), que ya era el modelo. Donaciones es el único uso donde los
  fondos se montan entre sí y sobre las líneas vecinas: es el diseño, y ahí todo el texto va por
  encima de todas las cintas, así que nada se tapa.

**Cómo se mide.** `scripts/medir-resaltado.js` (ver `docs/PATTERNS.md`). Criterio: cada pieza en
una sola línea; separación entre el fondo girado, con el borde rasgado, y las líneas de texto
vecinas >= 0 px con tolerancia de 1 px; separación entre fondos apilados >= 0; ancho del fondo
<= ancho del texto + 24 px; ninguna pieza de una sola palabra de 3 letras o menos si la frase
tiene más. En es, en y fr a 390, 768, 1280, 1512 y 1920.

**Ampliado al construir (2026-09-24).**

- **Cortes forzados.** Un `\n` dentro del resaltado se respeta como corte (los nombres de ruta del
  modal del mapa separan título y subtítulo así, y el constructor de copies los colocó a
  propósito); dentro de cada parte, el corte lo sigue decidiendo el navegador.
- **Palabra corta en un extremo.** Una palabra de 3 letras o menos al principio o al final de un
  resaltado ("¿por qué", "why talk") va pegada a su vecina con U+00A0 en el corte, porque la
  intro en español dejaba "¿por" solo en su pieza al final de una línea.
- **U+00A0 une.** El corte de palabras de `TextoResaltado` y de `TituloCinta` ya no parte por el
  espacio de no separación que el francés lleva antes de `: ; ! ? %` (aviso de D2).
- **Una palabra no se parte dentro del medidor** (`white-space: nowrap` por palabra): el guion de
  "eco-products" la partía, la palabra caía en dos líneas del medidor y la pieza salía mal medida.
- **`text-wrap` general.** `h1` a `h6` con `balance` y `p`, `li`, `figcaption`, `blockquote` con
  `pretty`, en `@layer base` de `styles/global.css` (una utilidad lo puede cambiar). El medidor
  hereda el `balance` del título, así que las tiras salen equilibradas. En Impacto, en español,
  el título de las duchas queda "La comprensión de / la menstruación / como ciclo natural / pasó
  del 45% al 95%" en vez de los cortes de Figma: es el precio de la decisión 2. El título de
  Donaciones mantiene sus siete líneas del diseño en español a 390.
- **Sello "EMI" / "CME".** La sigla se traduce (D2): no hay una clave de locale que la tenga sola,
  así que `emi-section.tsx` la elige por `router.locale` (CME en inglés, EMI en español y
  francés).
- **Aire lateral del uso en línea: 0,15 em, reservado.** Con aire y sin reserva el fondo llegaba a
  la palabra siguiente de la misma línea ("sigue"); sin aire, "¿", "?" y la última letra tocaban el
  borde rasgado. La primera y la última pieza de la frase llevan un margen lateral igual al aire, y
  el medidor el mismo `padding-inline`, así el fondo tiene aire y la palabra vecina no se toca.
- **Sello "EMI" en su sitio.** Conserva la caja de antes (interlineado 0,86 y 0,12 rem arriba y
  abajo): el título de la sección queda donde estaba (0,6 px de diferencia a 390, 0,1 a 1280).
- **"Llegue-Llegue" no se parte por el guion.** Con `balance` el título del drawer quedaba "El
  Llegue- / Llegue"; el nombre va en un `whitespace-nowrap` en `donar-cosas.tsx`.
- **El medidor no duplica el texto.** Sus palabras van en `data-medir-texto` y se pintan con
  `::before { content: attr(...) }`: el HTML y el `textContent` del título ya no llevan el texto dos
  veces, y el medidor además va con `aria-hidden` y `data-nosnippet`. Mismo trato en el medidor de
  `TituloCinta`.
- **Excepciones del criterio**: Donaciones (cintas montadas por diseño, texto siempre encima y una
  cinta de desktop 19,8 px más ancha que su texto, Figma 1294:1762).

**Descartado.** Solo CSS (`display: inline` con `box-decoration-break: clone` y el rasgado como
`border-image`): pierde el giro por pieza, porque `transform` no se aplica a un elemento en
línea. Queda como la forma sin JS.

## D2. Copies por idioma: sigla, tuteo, espacios de no separación y rótulos en imágenes (2026-09-24)

Decidido por Johan el 2026-09-24. Aplicado solo en `locales/*.json`, a partir de `COPIES.md`.

**Sigla del programa por idioma.** Se traduce: en español **EMI** (Educación Menstrual Integral),
en inglés **CME** (Comprehensive Menstrual Education), en francés **EMI** (éducation menstruelle
intégrale). Cada archivo usa una sola sigla: `en.json` ya no tiene ninguna "EMI" (se cambiaron
`emi.paragraph1`, `sumate.proyecto.description` y `educationMap.routes.talleres.name`) y `fr.json`
ninguna "CME". El sello gráfico de la sección dice CME en inglés: no hay clave con la sigla sola,
así que `components/emi/emi-section.tsx` la elige por `router.locale` (ver D1, ampliación).

**Francés con "tu" en todo el sitio**, como el tuteo del español. Pasaron a "tu" el formulario de
contacto (`modal.*`, con el título "Contacte-nous", igual que el enlace del footer), las
instrucciones del carrusel (`principles.instrucciones`) y dos claves muertas (`content.thanks`,
`cta.subtitle`). `fr.json` ya no contiene "vous", "votre" ni "vos". Para no tener que elegir el
género de "nous" (la fundación), "Merci de nous avoir contactés" pasó a "Merci de nous avoir écrit".

**Espacios de no separación (U+00A0).**

- En francés, antes de `: ; ! ? %` (también en interpolaciones, por ejemplo
  "Route {n} sur {total} : {name}") y en "5 000". Se usó U+00A0 y no el espacio fino U+202F que
  sugería `COPIES.md` (C28), por indicación de la tarea.
- En los tres idiomas, dentro de "Las Fuertes", "Isla Fuerte" y "802 m²", para que la marca, la
  isla y la cifra con su unidad no se partan en dos líneas.
- Excepción: los textos que salen del sitio (`*.whatsappMessage` y `gracias.shareText`) conservan
  espacios normales, porque viajan a WhatsApp o al portapapeles.
- Ojo: `TituloCinta` y cualquier corte por `\s+` tratan U+00A0 como espacio. Hoy el título de
  Donaciones no lleva ninguna de esas marcas; si alguna entra, hay que excluir U+00A0 del corte
  (ver `COPIES.md`, C29).

**Rótulos dibujados dentro de imágenes** (mapa educativo, estampillas: "Talleres (EMI)", "Haz clic
aquí", "Sede principal"...): se quedan en español y no son tarea de nadie. El `alt` y la barra del
mapa sí van traducidos.

**Grafía.** "Chiquifuertes" con la f en minúscula en los tres idiomas. Nombres de programa en
inglés en Title Case ("Reading and Play Clubs", "My Route, My Destination", "Sovereign Voices:
Youth Leadership"); en francés, minúscula tras los dos puntos ("Voix souveraines : jeunes leaders",
acortado para que el título del modal quepa en dos líneas a 390 px como en es y en).

**Resaltados más cortos donde en/fr no cabía** (medidos en `COPIES.md`): intro parte 3 en francés
"==pourquoi maintenant ?==", Impacto en francés "La compréhension / des règles comme / cycle naturel
est / passée de 45 à 95 %", Impacto en inglés "==growing stronger==" y "==delivered for==" como
cuarto chip de los ecoproductos. Título de Donaciones en inglés reformulado a "Comprehensive
menstrual education needs a committed crew to steer change" (sin "with" ni "crews" sueltas).

**Ampliación 2026-09-24: correcciones de español aprobadas por Johan.** Solo en `locales/es.json`:

- `donations.paragraph1`: "porque nos lleva" pasa a "porque nos llevan" (el sujeto son las
  acciones colectivas).
- `donations.paragraph2`: "Cada aporte crea una ola... aunque tu apoyo constante forma" pasa a
  "... y tu apoyo constante forma" (suma, no contraste).
- `educationMap.routes.ruta.name`: "Mi ruta\nmi destino" pasa a "Mi ruta,\nmi destino" (se conserva
  el salto de línea).
- `quienesSomos.roles.disenadora`: "Diseñadora Gráfica" pasa a "Diseñadora gráfica", como
  "Directora creativa": el cargo lleva mayúscula solo en su primera palabra. "Red ASE" es nombre
  propio y "Project Manager" es el término en inglés: no se tocaron.
- `emi.paragraph2`: "una visión amplia de la integridad" pasa a "de la integralidad".

En inglés y francés no hizo falta ajuste: ya decían "My Route,\nMy Destination" y "Ma route,\nma
destination", "a broad, holistic vision" y "une vision large et globale", y los dos párrafos de
Donaciones ya usaban el plural y "and" / "et".
