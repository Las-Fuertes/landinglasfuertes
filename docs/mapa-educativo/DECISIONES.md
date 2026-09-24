# Mapa educativo: decisiones

Rama `24-sep-mapa`, salida de `origin/main` en `5bae81e` (PR #22 en producción). Figma
`ng8HnnYyaDJ2nTWauh7Otb`. Johan lo pidió el 2026-09-24, con el foco en mobile: mapa nuevo de la
diseñadora, más zoom para que cada parada se vea sola, título con "cariño", salida ante scroll
fuerte y el botón flotante de Súmate fuera del mapa.

Código: `components/education-map/`. Id de la sección: `mapa` (sin cambios). El salto lleva a
`impacto`, la sección siguiente.

---

## D1. Mapa nuevo, orden nuevo y cada parada clicable entera

**Qué se pidió.** Sección Figma `966:11627` (2112 x 1416). Lienzo útil: el rectángulo `966:11635`
(x 224, 1638 x 1416) con la isla `966:11639`. La diseñadora agrupó cada parada (etiqueta en cinta
negra, ilustración y el punto "Haz clic aquí"):

| Orden | Parada                             | Grupo     | Caja en la sección (x, y, ancho, alto) |
| ----- | ---------------------------------- | --------- | -------------------------------------- |
| 1     | Talleres (EMI)                     | `1310:11` | 456, 71, 444 x 447                     |
| 2     | Clubes de lectura y diversión      | `1310:7`  | 959, 314, 284 x 268                    |
| 3     | Mi ruta mi destino                 | `1310:13` | 1307, 572, 376 x 225                   |
| 4     | ChiquiFuertes                      | `1310:10` | 942, 849, 297 x 334                    |
| 5     | Voces Soberanas: Liderazgo Juvenil | `1310:8`  | 423, 679, 305 x 303                    |

El orden cambió: antes ChiquiFuertes estaba al otro lado de la isla y el tramo "Mi ruta" ->
"ChiquiFuertes" cruzaba el mapa entero. Ahora el recorrido da una vuelta: arriba a la izquierda,
centro, derecha, centro abajo, izquierda abajo. **Comparado con el diseño, el orden que dio Johan
es coherente con la geografía nueva (cada tramo va a la parada vecina); no se cambió nada por
cuenta propia.** El id `ruta` sigue siendo "Mi ruta mi destino" y el contenido de cada modal es el
mismo; solo cambió el orden de la lista (el `routes` de los `locales` no depende del orden).

**Assets.** El componente pinta el mapa como una sola imagen (como antes) y encima un botón
transparente por parada, así que no hizo falta exportar cada grupo como pieza propia: el área de
clic es la caja del grupo.

- Export a 3x de la sección (`design-assets/education-map/figma-966-11627-3x.png`). El export trae
  40 px de margen blanco y el fondo gris de la sección; se recorta al rectángulo (x 224 a 1862).
- **Los caminos de abajo se salen del rectángulo** (hasta y ~1500). Para que la cámara pueda bajar
  sin que se corten en seco, el lienzo se alarga hasta y 1520: bajo y 1416 el blanco del export se
  cambia por el mar (`#78C2FF`, el mismo `blue-700` del fondo) interpolando por el canal azul,
  porque los caminos son crema (255, 245, 232) sobre blanco puro: así el antialiasing queda limpio.
  Fuente procesada: `design-assets/education-map/mapa-ruta-3x.png` (4914 x 4560).
- Derivados `public/images/education-map/mapa-ruta-{1200,1600,2400,3200,4000}.{avif,webp}`. El 4000
  existe porque en mobile el mapa mide ~1320 px CSS y a DPR 3 pide ~3960.
- Los assets viejos (`map-*.avif|webp`, `design-assets/education-map/map.svg`) se conservan.

**Datos** (`education-map.data.ts`): `VIEWBOX` 1638 x 1520; por parada, `box` (el grupo),
`label` (la cinta negra) y `cx, cy` (centro del punto), todo en px del lienzo = coordenada de la
sección menos 224 en x. Cada entrada lleva su nodo de Figma en `figma` para volver a medir.

**Clic.** `map-hotspot.tsx`: un `<button>` del tamaño del grupo (porcentajes del lienzo, así
sigue al zoom), transparente, con `aria-label` "Abrir la ruta X" (es, en, fr ya existían),
`aria-haspopup="dialog"` y `data-parada=<id>`. Los aros que laten salen del punto rosado. Con
teclado se ve un marco `ring-4 ring-black` con `ring-offset` blanco alrededor del grupo.

## D2. Zoom en mobile: una parada por pantalla

**Qué se pidió.** En cada parada, a 390x844 y 360x800, la caja del grupo activo entera dentro del
área visible y ninguna otra parada con más de ~15 % de su caja dentro. Tablet igual con zoom
intermedio. Desktop con su dinámica de siempre.

**Qué se hizo** (`map-geometry.ts`, `computeLayout`):

- **El zoom sale del grupo más grande, no de los puntos.** `fit` es el zoom con el que Talleres
  (444 x 447, el mayor) cabe con `pad` de aire en el área visible; el mapa mide
  `fit * factor * 1638` px. Mobile `factor 1` (Talleres llena el ancho), tablet `factor 0.8`.
- **Área visible = el stage menos la barra de abajo** (nombre y puntos, se mide su `offsetHeight`).
- **La cámara puede salirse del lienzo.** Fuera del mapa solo hay mar del mismo azul que el fondo
  del stage, así que se quitó el recorte a "traslaciones válidas" que tenía la versión anterior. Es
  lo que permite, por ejemplo, poner Talleres abajo con mar encima (como el frame `1311:14`).
- **Posición de cada parada por búsqueda**, no por centro: se prueban 33 x 33 posiciones de la caja
  activa dentro del área visible y gana la que (1) no pasa de 15 % de ninguna otra caja ni de 5 % de
  ninguna otra cinta (criterio duro), (2) muestra menos de las demás, con las cintas pesando 4 veces
  y contando también la franja del degradado de abajo, y (3) queda más centrada.
- **Si con el `factor` pedido el criterio no se cumple, el zoom sube de a 0,05 hasta 1.** Por eso
  tablet, que pide 0,8, termina en ~0,95: las paradas vecinas están tan cerca (Talleres y Clubes
  quedan a 59 px de Figma) que con más contexto asomaría otra cinta.
- La primera parada deja arriba el alto del encabezado (`reservaPrimera`, se mide), para que el
  título quepa sobre el mar y Talleres quede debajo (D3). Si no cabe entera, baja lo que se pueda.
- El camino entre paradas no cambió de forma: interpolación con `easeInOutSine` entre las
  traslaciones de cada parada y tramos de scroll proporcionales a lo que se mueve el mapa
  (`computeTrack`).

**Medido por CDP** en la página, sobre las cajas reales de los botones (porcentaje de la caja
dentro del stage menos la barra):

| Ventana  | Zoom (ancho mapa / ancho stage) | Activa | Peor otra por parada (1 a 5)    |
| -------- | ------------------------------- | ------ | ------------------------------- |
| 390x844  | 3,39                            | 100 %  | 0 · 11,4 (Talleres) · 0 · 0 · 0 |
| 360x800  | 3,36                            | 100 %  | 0 · 11,8 (Talleres) · 0 · 0 · 0 |
| 768x1024 | 3,21                            | 100 %  | 0 · 14,7 (Talleres) · 0 · 0 · 0 |

Antes el rango era 2,2 a 2,9 en mobile y 1,5 a 1,8 en tablet. Lo único que asoma en Clubes es la
punta derecha de la caja de Talleres (el rótulo "Sede principal" y caminos), nunca su cinta. En
una tablet apaisada (1000x700) el criterio no se alcanza ni con el zoom máximo (17 %).

**Desktop (>= 1024) no cambió de dinámica:** sin recorrido, el mapa entero de un vistazo
(`clamp(1150px, 88svh * aspecto, 1600px)`), con las paradas clicables enteras.

## D3. Título con "cariño"

**Qué se pidió.** Figma `1311:14` (mobile 390 x 1034): el título sobre el mar azul, con un mapa
doblado azul y un pin rosado encima, centrado en cuatro líneas, y el mapa debajo mostrando Talleres
en grande.

**Qué se hizo** (`map-title.tsx`):

- Toda la sección es `bg-blue-700` (antes el título iba en beige). Viene de Donaciones, que termina
  en el azul oscuro con olas: el mar claro entra como orilla.
- Ilustración: el grupo `1311:75` (SVG) más el pin `1311:156` (PNG), compuestos a 3x en
  `public/images/education-map/titulo/mapa-pin.{avif,webp}` (127 x 98 de Figma, pin en 90, 65).
  Se sirve raster porque el SVG pesa 650 KB por el trazo a mano; el SVG limpio (sin los fondos del
  frame) queda en `design-assets/education-map/titulo-mapa-doblado.svg` y el pin en
  `titulo-pin.png`.
- Título: 30 px a 390 (`clamp(1.625rem, 7.7vw, 1.875rem)`, 27,7 px a 360), interlineado 32/30,
  `tracking -0.04em`, ancho máximo 21,5 rem (343 de Figma). A 390 quedan cuatro líneas en es y en,
  cinco en fr. **A 360 en es también parte en cinco** (medido por el verificador; el clamp no lo
  evita). No se rompe nada: la primera parada se encuadra debajo con el alto real del encabezado.
- **Con recorrido (mobile y tablet) el encabezado flota sobre la primera pantalla del stage** y se
  va con el scroll; el stage queda fijo desde el borde de la sección. Así se ve como el frame:
  título arriba y Talleres grande abajo. `pointer-events-none`, así no tapa clics.
- **Desktop (sin frame en Figma):** el mismo bloque en flujo, encima del mapa, más grande
  (ilustración 11 rem, título 2,5 rem en tres líneas, ancho 40 rem). El mapa entra sin aire arriba
  porque su propio mar continúa el del título. **Decisión a confirmar con Johan y la diseñadora.**

**Ampliación (2026-09-24, tras la verificación independiente).**

- **Posición vertical en mobile al px de Figma.** La ilustración quedaba 6 px arriba y el título
  4 px arriba del frame `1311:14`. Ahora la ilustración lleva `mt-1.5` (6 px) sobre el `pt-xl`
  (40), así su caja empieza en y 46 como el grupo `1311:75`, y el título `mt-6` (24) en vez de
  `mt-l` (25): la caja del texto empieza en y 168 (Figma 167). Tablet y desktop no cambian
  (`md:mt-0`, `md:mt-l`). Medido por CDP a 390: imagen en 46,4, título en 168,4.
- **Centrado.** En Figma el texto está 14 px a la derecha del centro del frame; se toma como
  imprecisión del frame y el título queda centrado (decisión del coordinador).
- **Zoom de Talleres.** En el frame Talleres sale algo más grande (cinta de 182 px frente a ~140).
  Se queda como está: el zoom sale de que el grupo entero quepa en el ancho (D2).

## D4. Saltar el mapa con scroll fuerte

**Cómo avanza el mapa hoy.** Por posición de scroll, no por gestos: el stage queda fijo y el scroll
mueve la cámara (`use-map-pan.ts`). **Se conservó ese modelo** y solo se añadió la salida, como
pidió Johan para ese caso. Consecuencia que conviene saber: un gesto normal de trackpad (~1200 px)
recorre algo más de una parada (los tramos miden 0,7 a 1,6 veces el alto de pantalla, ~650 a 1050
px a 844), así que "un gesto, un paso" no aplica aquí. Pasarlo a gestos sería un cambio de modelo.

**Qué se hizo:**

- `lib/gesto-rueda.ts`: la detección de gestos de rueda de la intro (silencio de 180 ms, cambio de
  sentido, impulso nuevo sobre inercia que decae, `SCROLL_FUERTE_PX` = 1500) extraída tal cual.
  `use-intro-pin.ts` la usa sin cambiar números ni orden; verificado recorriendo la intro 1 -> 3 ->
  Bienvenida, volviendo arriba, scroll fuerte + "Saltar animación" y Escape, a 390 y 1280.
- `use-saltar-mapa.ts`: con el mapa fijado, "Saltar mapa" (es) / "Skip map" (en) / "Passer la
  carte" (fr) aparece si:
  - un gesto de rueda suma más de 1500 px mientras el mapa está fijado;
  - un arrastre táctil, con su inercia, desplaza la página más de 1500 px con el mapa fijado;
  - Tab (lo muestra sin robar el foco: las paradas siguen alcanzables) o Escape (lo muestra y le da
    el foco; Escape otra vez salta), como en la intro.
- Se esconde al salir del tramo fijado (salvo que tenga el foco) y mientras un modal de ruta está
  abierto. Va arriba a la derecha del stage (abajo están el nombre y los puntos), con el mismo
  estilo que el de la intro. Está en el DOM antes que las paradas: con Tab es lo primero que se
  alcanza, como un enlace de "saltar contenido", y al recibir foco se muestra.
- Al usarlo: `scrollIntoView` suave hasta `#impacto` y el foco pasa a esa sección (`tabindex -1`),
  igual que el "Saltar animación" de la intro.
- Un scroll fuerte que atraviesa el mapa entero muestra el botón mientras dura y lo retira al
  salir: medido, aparece a los ~1600 px del gesto y desaparece al pasar el final del tramo.

**Ampliación (2026-09-24, tras la verificación independiente).**

- **Solo un gesto fuerte ÚNICO lo dispara.** Antes, dos flicks encadenados o una rueda de ratón
  constante sumaban como un solo gesto: el hook nunca marcaba el gesto como `consumido`, así que la
  detección de impulso nuevo de `registrarRueda` no cortaba, y las muescas de un ratón (cada ~120
  ms) nunca dejan los 180 ms de silencio. Ahora la cuenta vuelve a cero con cada gesto nuevo, con
  el criterio de la intro (silencio de 180 ms, cambio de sentido, impulso nuevo; el gesto se marca
  `consumido` desde su primer evento, como la intro tras disparar una parte) **más una regla propia
  del mapa: una pausa de más de 90 ms entre dos eventos cierra el gesto.** Esa regla hace falta
  porque el criterio de la intro, por sí solo, trata una rueda de ratón constante como un único
  gesto (en la intro da igual: el primer evento ya dispara la parte). La inercia de un trackpad
  manda eventos cada 16 a 30 ms, así que no la corta. La intro no cambia (`PAUSA_ENTRE_EVENTOS_MS`
  vive en `use-saltar-mapa.ts`, no en `lib/gesto-rueda.ts`).
  Medido a 390: ráfaga única de 1680 px sí; gesto de trackpad de ~2000 px sí; gesto normal de
  ~1200 px no; dos flicks encadenados no; ratón a una muesca de 100 px cada 120 ms durante 3 s no;
  touch: un swipe fuerte sí, dos swipes normales seguidos no (touch ya reiniciaba con cada dedo).
  Intro recorrida de nuevo 1 -> 3 -> Bienvenida, scroll fuerte y Escape: igual.
- **Con el drawer de Súmate abierto no cuenta ni se muestra.** `bloqueado` suma el `isOpen` de
  `useSumateDrawer()`; al abrirse, el botón se retira, y al cerrar no reaparece. Medido: con el mapa
  fijado, `#sumate` en el hash y una ráfaga de 14 x 140 dentro del drawer, el botón no aparece; tras
  Escape sigue oculto. (Al cerrar, el foco vuelve a la última parada enfocada y su `onFocus` mueve
  el mapa hasta ella: comportamiento previo del punto, no de esta tanda.)

## D5. El botón flotante de Súmate se retira del mapa

**Mecanismo reutilizable.** Toda sección con `data-oculta-flotante=""` retira el botón mientras
está en pantalla. `sumate-flotante.tsx` observa todas con un `IntersectionObserver`
(`rootMargin -10% 0px -10% 0px`: una franja que apenas asoma no cuenta) y un `MutationObserver`
sobre `body` vuelve a buscarlas si se montan o desmontan. El botón se oculta como ya lo hacía con el
drawer: opacidad y 12 px de `translate`, en 300 ms, sin tocar el layout y sin desmontarse.

Medido por CDP (opacidad del botón) a 390x844: Donaciones 1, entrando al mapa 0, mapa fijado 0,
parada 3 0, Impacto 1, Quiénes somos 1. A 1280x832 igual, salvo que el mapa estático sale antes.

Documentado en `docs/PATTERNS.md`, sección del drawer de Súmate.

## D6. "Terminar" saca del mapa hacia Impacto

**Qué se pidió (2026-09-24).** Al recorrer las paradas con el modal y pulsar "Terminar" en Voces
Soberanas, el sitio volvía por scroll a Talleres. Debe cerrar el modal y llevar a `#impacto`, como
"Saltar mapa", también con `prefers-reduced-motion`.

**Por qué volvía.** `close()` del secuenciador devuelve el foco a la parada que abrió el modal
(Talleres, si se entró por ahí) y el `onFocus` de esa parada (`revealStop`) trae el recorrido hasta
ella.

**Qué se hizo:**

- `use-route-sequencer.ts`: `leave(after)` cierra el modal como `close()`, pero **no devuelve el
  foco a la parada** (olvida el disparador) y al terminar la salida del modal llama a `after`.
- `education-map-section.tsx`: `after` es el mismo `saltar` de `use-saltar-mapa.ts` (scroll hasta
  `#impacto`, `tabindex -1` y foco en la sección); no hay una segunda copia de esa lógica.
- `route-sheet.tsx` (reescrito en paralelo para D8) no se tocó en esta tanda; lo único que se usa
  de él son sus atributos `data-sheet-back` y `data-sheet-next`. El modal solo avisa con `onClose`, que comparten la X, Escape, el
  fondo, el "Atrás" de la primera parada y "Terminar". El contenedor del modal anota en fase de
  captura si el clic salió de un botón del `footer` que no es `[data-sheet-back]` y lo borra al
  terminar el clic; `onClose` en la última parada con esa marca es "Terminar".
- **Cerrar con Escape, la X o el fondo devuelve el foco a la parada ACTIVA**, no a la que abrió el
  modal (`getReturnFocus` del secuenciador, que busca `#mapa [data-parada=<id>]`). Antes, tras
  recorrer con "Siguiente ruta" hasta Voces y cerrar, el foco volvía a Talleres y su `onFocus`
  arrastraba el mapa 2656 px hacia atrás (390x664). Ahora el mapa ya está en la parada activa y su
  `revealStop` no mueve nada.
- `saltar` usa `behavior: 'auto'` con `prefers-reduced-motion` (el `smooth` explícito no respeta el
  CSS global). Afecta también a "Saltar mapa", que con reduced-motion no se muestra.

**Medido por CDP** (clic en Talleres, "Siguiente ruta" x4, "Atrás" y "Siguiente ruta" en la última
para probar las intermedias, luego "Terminar"; `getBoundingClientRect().top` de `#impacto` cada
100 ms durante 3 s):

| Ventana          | Llega a  | Top durante los 1500 ms siguientes | Foco      |
| ---------------- | -------- | ---------------------------------- | --------- |
| 390x664          | ~920 ms  | -0,2 a 0,8                         | `impacto` |
| 428x746          | ~1010 ms | 0,4                                | `impacto` |
| 1440x900         | ~910 ms  | -0,3 a 0,7                         | `impacto` |
| 390x664 reduced  | ~300 ms  | -0,4 (salto sin animación)         | `impacto` |
| 1440x900 reduced | ~300 ms  | -0,3                               | `impacto` |

Cerrar tras recorrer de Talleres a Voces (Escape y X) y con "Atrás" en Talleres, a 390x664, 428x746
y 1440x900: diferencia de `scrollY` 1500 ms después, 0 px en los nueve casos; foco en `voces` (o
`talleres` con "Atrás"). "Terminar" medido de nuevo tras el cambio: igual que la tabla.

## D7. Título y barra inferior en pantallas bajas

**Qué se vio.** En el iPhone 12 Pro Max de Johan (Safari, 428 de ancho y ~746 de alto visible con
las barras) el encabezado quedaba encima de la casa de Talleres: la antena y el tejado cruzaban el
texto. Con alto de sobra (390x844) no pasa. La causa: el encabezado (~296 px), Talleres entera
(~400 px a 428) y la barra de abajo (109 px) no caben juntos en 746, y el encuadre de la parada 1
(D2) prefiere que Talleres entre entera antes que dejar hueco al título. Además la reserva del
título era su caja entera y no miraba la tierra: la costa sube hacia la derecha y bajo el extremo
derecho del texto la tierra está más alta que la antena.

**Qué se hizo:**

- **Encuadre de entrada** (`map-geometry.ts`, `entrada` en `MapLayout`): la primera pantalla, antes
  de avanzar, ya no es por fuerza el encuadre de la parada 1. Se mide la caja real del texto del
  título por líneas (`medirTitulo` en la sección, con un `Range`) y se baja el mapa lo justo para
  que todo lo dibujado bajo esas letras (tierra, casa, antena, "Haz clic aquí") quede
  `AIRE_TITULO` (16 px) por debajo. Nunca lo sube: con alto de sobra, entrada y parada 1 coinciden
  y nada cambia. Si difieren, el tramo de entrada (`LEAD_IN`, mientras el título se va con el
  scroll) lleva el mapa de la entrada al encuadre de la parada 1, que sigue cumpliendo D2.
- **Silueta del mapa** (`SILUETA` en `map-geometry.ts`): para cada franja de 20 unidades del lienzo,
  la y más alta que no es mar, medida en `mapa-ruta-4000.webp` con el mínimo de cada franja
  (conservadora). Si cambia el arte, se vuelve a medir.
- **Título más compacto en pantallas bajas, solo con recorrido en mobile** (`map-title.tsx`): el
  aire de arriba, la ilustración, el hueco y la letra escalan con `svh` y a 844 de alto o más quedan
  al px de Figma como en D3 (40, 127, 24 y 30 px). A 746: 35, 113, 22 y 27 px; a 560: 27, 85, 16 y
  20 px (tres líneas). Tablet y desktop no cambian (sus `md:` mandan).
- **Barra inferior más baja**: de 109 a 77 px (`pt-l pb-m gap-s` en vez de `pt-12 pb-6 gap-3`).
  El degradado sigue entrando desde arriba; el nombre y los puntos no cambian de tamaño. Como el
  alto de la barra se resta del área visible de cada parada, todas ganan 32 px.

**Medido por CDP** en la primera pantalla (página al principio de `#mapa`). Aire tierra: del borde
inferior del texto a lo primero dibujado bajo el texto, medido sobre el raster. Aire casa: al borde
superior del grupo de Talleres, que es la punta de la antena. Cinta/barra: del borde inferior de
la cinta "Talleres (EMI)" al borde superior de la barra.

| Ventana  | Líneas | Letra | Aire tierra | Aire casa | Cinta/barra |
| -------- | ------ | ----- | ----------- | --------- | ----------- |
| 428x746  | 4      | 26,9  | 19,6        | 24,0      | 72,9        |
| 390x664  | 3      | 23,9  | 16,4        | 25,6      | 73,3        |
| 375x560  | 3      | 20,2  | 17,2        | 22,9      | 15,8        |
| 360x640  | 4      | 23,0  | 17,7        | 22,8      | 58,5        |
| 428x926  | 4      | 30    | 79,5        | 87,5      | 157,3       |
| 768x1024 | 3      | 30    | 16,1        | 16,1      | 108,6       |

Antes, a 428x746 y 375x560 el texto cruzaba la casa (capturas `antes-*-titulo.png`). D2 medido de
nuevo en esas seis ventanas más 390x844: parada activa 100 % en las cinco, peor otra 9,8 a 14,7 %
(siempre la punta de Talleres vista desde Clubes).

**Límite.** Si una pantalla es tan baja que título, casa y cinta no caben (por debajo de ~540 de
alto a 375), gana el aire del título y la cinta de Talleres puede quedar bajo la barra en la
primera pantalla; la barra repite el nombre.

## D8. Modales de parada fieles a Figma en mobile; en desktop, la misma tarjeta centrada

**Fecha:** 2026-09-24. **Figma (mobile, 411x809):** Talleres `894:754`, Clubes `907:2996`, Mi ruta
`910:3589`, ChiquiFuertes `959:8352`, Voces `959:10655`. **Desktop y tablet no tienen diseño:** por
decisión de Johan (2026-09-24) se usa la MISMA tarjeta de mobile, centrada, con ancho máximo
`max-w-md` (448 px) y todo el contenido visible sin scroll interno.

**Qué se hizo** (`components/education-map/route-sheet.tsx`, sin cambiar sus props):

- Una sola columna en todos los anchos: cerrar (círculo rosado claro de 20 px con área de toque de
  40), título centrado en cinta negra (`map-chip--cinta`, 40 px, una cinta por línea, las líneas
  las marca `\n` en `locales`), chip "Edades" `bg-pink-sol` plano superpuesto 12 px al borde de la
  foto, foto `rounded-xl` en `aspect-[9/10]`, párrafo de 16 px regular con interlineado 1,2, y abajo
  a la derecha "ATRÁS" en texto y el botón oscuro "SIGUIENTE RUTA >" (10 px extrabold).
- "Atrás" aparece también en Talleres: como no hay ruta anterior, vuelve al mapa (cierra, igual
  que la X). En la última parada el botón oscuro dice "Terminar", sin flecha.
- Si la tarjeta no cabe en el alto (`max-h: 100dvh - 3rem`), **primero se encoge la foto**
  (flex, hasta `min-h-40`) y solo después aparece el scroll de `[data-sheet-scroll]`. Así desktop
  queda sin scroll y la foto sale algo más baja que su 9:10 cuando hace falta.
- Posición: en mobile la hoja sigue subiendo desde abajo, a 12 px de los lados (a 390 la tarjeta
  mide 366, la de Figma 367) y 32 px del borde inferior. En tablet se centra en vertical con un
  `translate` en un envoltorio propio (el contenedor de la sección la apoya abajo y framer-motion
  escribe el transform del panel). En desktop ya la centra el contenedor.
- Copy corregido contra Figma en es, en y fr: Talleres "10 a 14 años" (antes 11 a 13),
  ChiquiFuertes "6 a 10 años" (antes 5 a 10), "Voces soberanas: / Liderazgo juvenil" en minúscula
  como el modal de Figma. En fr, "Leadership des jeunes" se parte en dos cintas para no envolver
  dentro de una. Las fotos ya eran los recortes de Figma a 2x: no hubo assets nuevos.
- Colores fuera de la paleta: el círculo de cerrar de Figma es `#FED4E8` (se usa `bg-pink/25`) y
  el botón oscuro `#3D3B3B` (se usa `bg-black`). El chip `#F57DB7` es exactamente `pink-sol`.

**No se siguió de Figma, a propósito:** "Chiquifuertes" (el modal de Figma lo escribe así, el mapa
y el resto del sitio "ChiquiFuertes"; se deja ChiquiFuertes) y las erratas del diseño ("a a
fortalecer", "una sola una voz", "Su cuerpo" tras dos puntos).

**Medido por CDP** (`getBoundingClientRect`, relativo a la tarjeta, 390x844 contra Figma): título,
chip, foto y párrafo de Clubes y Voces a menos de 8 px; sus botones, a menos de diez. Los frames de Figma no son consistentes entre sí (el hueco foto-párrafo va de 1 px en Mi ruta
a 35 en Talleres), así que con una sola maqueta Talleres queda 18 px más arriba en el párrafo y
Mi ruta 19 px más abajo. 1280x800 y 1440x900: `scrollHeight == clientHeight` en las cinco paradas,
tarjeta centrada. 390x844 y 428x926 caben enteras; 390x664 cabe encogiendo la foto; 375x560
hace scroll en Clubes, Mi ruta y Voces.

Ampliación (Johan, 2026-09-24, al aprobar): el nombre de la parada es "Chiquifuertes" (con f
minúscula), como en el modal de Figma. Se cambió `educationMap.stops[].name` en es, en y fr; el
rótulo dibujado dentro del SVG del mapa no se tocó. Johan aprobó también los colores aproximados
(`pink/25` en el círculo de cerrar, `black` en el botón) y el hueco único foto-párrafo.
