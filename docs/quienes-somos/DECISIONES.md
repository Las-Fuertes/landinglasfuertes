# Decisiones: sección Quiénes somos

Continúa el historial cerrado de `docs/secciones-impacto/DECISIONES.md` (D5, D7, D21, D27, D28),
que se consulta y no se reescribe. Desde el 2026-09-30 la sección se rige por lo que sigue.

## D1. Diseño final de Figma en desktop y mobile (2026-09-30)

**Pedido** (feedback del 30 de septiembre, punto 7): desktop final en Figma `1437:1518` (frame
de 1280), mobile en `1219:985` (frame de 390). Reemplaza la rejilla dispersa hecha con IA de D27.

**Qué se hizo** (`components/quienes-somos/`):

- **Todo en px de lienzo de Figma multiplicados por `--k`**, definido en
  `quienes-somos.module.css`: 1 en mobile, 1,05 en tablet, 1 en desktop y 1,15 desde 1536 (para
  que a 1920 la rejilla no quede como una isla chica). Las variables con px viven en el módulo CSS,
  no en clases de Tailwind.
- **Cabecera**: las dos conchas rosadas (grupo 275, SVG descargados de Figma) sobre el título, 20
  px encima y corridas 10 px a la derecha como en Figma; título 30 px en mobile y 40 en tablet y
  desktop; párrafo 16 px en mobile, 17 en tablet y 18 en desktop, a 820 px de ancho y alineado a
  la izquierda como en Figma.
- **Aire título y texto**: `mt-xl` (40 px) en todos los anchos. Figma mide unos 44 a 52 px de
  tinta a tinta y EMI usa 18 en mobile y 36 en desktop; 40 queda entre los dos y es un token del
  sistema. Lo revisa el frente H (auditoría global del aire).
- **Mobile**: la misma lista en flujo de D21 (foto a un lado, dos centradas), con las medidas de
  Figma recalculadas: sangrados 39, 33, 53, 53, 48 y 45 px (los de antes estaban 8 px pasados),
  corrimiento de 17 y 18 px a la derecha en las centradas, aire propio de cada fila y el texto de
  las filas con foto a la izquierda llegando hasta 383 de 390.
- **Tablet (768 a 1023)**: en vez de la columna mobile agrandada (unos 2900 px de alto) se usan
  las fichas de desktop en dos columnas con `--k` 1,05. Es el punto medio entre los dos frames:
  la ficha de desktop (foto arriba, nombre y cargo centrados) y el ritmo vertical de mobile.
- **Desktop**: rejilla centrada de 3, 3 y 2 fichas de 310 px (flex con `wrap` y
  `justify-center`, así la última fila queda centrada como en Figma). Las fotos chicas bajan
  dentro de su fila lo que bajan en Figma (Paola 43, Vanessa 17, Adriana 2) y el nombre queda a
  20 px de la foto.
- **Encuadre de cada foto**: el recorte de la máscara de Figma traducido a fracciones del
  diámetro (`Integrante.encuadre`); la imagen ocupa esa caja y el círculo la corta. Vanessa tiene
  otro encuadre en mobile (`encuadreMobile`).
- **Pájaros**: cada foto lleva un par de pájaros (rosa o azul, trazo grande o chico, SVG de
  Figma), con posición y tamaño distintos en mobile y en desktop, como en los dos frames. Tablet
  usa los de desktop.
- **El cargo** se acota al ancho de su caja de Figma más 30 px y se reparte con
  `text-wrap: balance`, así "Estratega de / comunicaciones" y "Estratega de alianzas / y ventas"
  parten donde parten en Figma. En español el cargo de Paola lleva un espacio de no separación en
  "y desarrollo" para que parta como en Figma.
- **Anillo**: se mantiene el SVG único girado por persona (D21): los seis anillos de Figma son el
  mismo trazo.
- **Sin `font-acento`**: los frames finales no tienen texto manuscrito en esta sección.

**Entradas** (lenguaje de movimiento de `docs/PATTERNS.md`): título y párrafo suben 24 px en
0,85 s (el párrafo 0,15 s después); las conchas llegan tarde (0,5 s) con un giro de 6°. En cada
ficha el nombre y el cargo llegan primero (0,8 s), la foto se asienta 0,12 s después (0,95 s,
escala de 0,92 a 1) y los pájaros llegan al final (0,75 s), lineales y sin rebote. En tablet y
desktop las fichas de una fila se escalonan 0,18 s por columna. Con `prefers-reduced-motion` las
variantes pasan a duración y retraso 0: no se usa `initial={false}` porque `useReducedMotion`
puede llegar tarde al primer render y el `initial` solo se lee al montar (se midió: con esa forma
las fichas quedaban invisibles).

## D2. Equipo actualizado (2026-09-30)

Nota de Johan: "algunas chicas salieron del mapa". La lista de Figma actual es la fuente de
verdad: **ocho personas**, en este orden: Mafe Ramirez, Paola Segnini, Lina Lievano, Karol López,
Vanessa Córtes, Erika Cely, Adriana Chavarro y Alejandra Villarraga.

- **Sale Karina Cely** (Project Manager). Su foto (`public/images/quienes-somos/karina-cely.jpg`)
  queda en disco sin uso.
- **Fotos nuevas**: Figma trae otras fotos para todas; se descargaron las originales y quedaron en
  `public/images/quienes-somos/2026-09/<slug>.jpg` (máximo 1000 px de lado). Las anteriores
  (`public/images/quienes-somos/<slug>.jpg`) quedan en disco sin uso.
- **Cargos nuevos** (claves de `quienesSomos.roles`): Paola pasa a "Educadora menstrual y
  desarrollo pedagógico" (`educadora`), Lina a "Estratega de crecimiento"
  (`estrategaCrecimiento`), Vanessa a "Estratega de comunicaciones"
  (`estrategaComunicaciones`), Adriana a "Estratega de alianzas y ventas" (`estrategaAlianzas`).
  Se quitó `projectManager`. Siguen `coordinadora` (Mafe), `fundadora` (Karol), `cofundadora`
  (Erika) y `disenadora` (Alejandra).
- **Grafía**: Figma escribe "Co-Fundadora", "Educadora Menstrual" y "Diseñadora Gráfica"; se
  dejó "Cofundadora" (RAE) y minúsculas en los cargos, como ya estaba. "Vanessa Córtes" se deja
  como está en Figma; si el apellido es Cortés, es un cambio de una línea en
  `quienes-somos.data.ts`.

## D3. El párrafo llena más en mobile (2026-10-01)

**Feedback** de Johan (1 de octubre): "la alineación del contenido de quienes somos necesita
corrección, aunque está alineada al diseño en dispositivos pequeños se ejecutan muy temprano los
saltos de línea, así que reduce el padding de este texto para que llene más horizontalmente".

**Qué se hizo** (`components/quienes-somos/quienes-somos-section.tsx`): solo el párrafo, solo en
mobile. Antes vivía dentro de la caja de 390 con `px-page-margin` (40 px), así que medía 280 a
360 y 310 de 390 en adelante (a 430 la caja centrada le dejaba 60 px por lado). Ahora se sale de
esa caja con un margen negativo y queda a `spacing.l` (25 px) de cada borde de la pantalla a
cualquier ancho mobile: `mx-[calc(50%-50vw+theme(spacing.l))]`, que es 25 menos lo que hay de la
pantalla a la caja de contenido. Desde md vuelve a `md:mx-auto` a 820, como estaba. Título,
conchas y fichas no se tocan: siguen en la composición de Figma.

- Por qué `spacing.l` y no `spacing.m`: 25 sigue leyéndose como margen (es el gutter de la
  rejilla) y no pega el texto al borde; 15 lo deja pegado en 360.
- Por qué contra la pantalla y no solo menos padding: a 430 la caja de 390 es la que limita, y
  bajar el padding apenas ganaba 30 px ahí.

**Medido** (`getBoundingClientRect` del párrafo, es, por CDP):

| Ancho | Antes: ancho, líneas | Después: ancho, líneas |
| ----- | -------------------- | ---------------------- |
| 360   | 280, 11              | 310, 11                |
| 390   | 310, 11              | 340, 10                |
| 430   | 310, 11              | 380, 9                 |
| 1280  | 820, 4               | 820, 4                 |

A 360 las líneas son más largas pero el corte de palabras da las mismas 11. Sin scroll
horizontal (`scrollWidth` igual al ancho) en todos. Capturas `quienes-somos-390.png` y
`quienes-somos-1280.png` en el scratchpad de la sesión (`constructor-b/`).
