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
