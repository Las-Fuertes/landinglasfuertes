# Decisiones: sección Donaciones ("Dirigir el cambio...")

Pedido de Johan del 2026-09-23, rama `23-sep-emi`. Figma `ng8HnnYyaDJ2nTWauh7Otb`: mobile
`1288:1478` (390x871) y desktop `1288:1594` (1280x956, nuevo: antes no había desktop).

Código: `components/donations/donations-section.tsx`, `titulo-cinta.tsx` y
`donations.module.css` (toda la geometría del frame, comentada con su origen). La sección tiene
ahora el id estable `tripulantes` (nada apuntaba antes a la sección; el botón sigue abriendo el
drawer con `useSumateDrawer().open('tripulantes')`).

---

## D1. Mobile fiel a 1288:1478

Diferencias encontradas contra el frame y corregidas:

1. **Título partido a mano en 6 claves** (`titleLine1..6`, "tripulantes comprometidos" en una
   línea, cintas desbordando a 390). Ahora es una sola clave `donations.title` y las líneas salen
   del corte natural del texto: `TituloCinta` mide las palabras con un medidor invisible de la misma
   tipografía, las agrupa por `offsetTop` y pinta cada línea con su tramo de cinta. Sirve en los
   tres idiomas y en cualquier ancho. Las claves viejas se retiraron de `es`, `en` y `fr`.
2. **Tipografía del título**: 40 px, bold, interlineado 44, tracking -0,04 em, texto en x=34 (6 px
   antes de la columna del grid). Antes era `clamp(...)` con 1,22 de interlineado.
   Caja de 295 px en vez de los 311 del frame: con las métricas del navegador "integral requiere"
   (299 px) cabía en una línea y en Figma va partida; 295 reproduce los siete cortes.
3. **Cintas**: cada línea tiene su rectángulo con el giro de Figma (-1,23; -2,97; -1,23; +1,06;
   -1,23; +1,17; -1,23 grados) y lo que sobresale por cada lado medido contra la caja de su línea.
   La cinta está detrás del barco y el texto delante, como el orden de capas del frame (antes todo
   el chip giraba -1,2 grados con el texto dentro). Color `papel` (#FFF5E8, token nuevo). El borde
   rasgado usa el filtro global `#map-rough-edge`; el filtro `#paper-texture` que la sección montaba
   dentro de sí se retiró (ver PATTERNS, "Cuidado con el filtro").
4. **Barco**: antes un PNG de 224x175 a `clamp(9rem,26vw,15rem)` a la derecha del bloque. Ahora el
   SVG exportado del grupo 1288:1445 en su caja exacta (x=247,27 y=178,64, 223,7 de ancho), sangrando
   por la derecha, anclado al inicio del título para que su relación con el texto no cambie en 360
   ni en 430.
5. **Párrafos**: 16 px con interlineado `normal` (19 px), color `papel` (antes blanco y
   `clamp(1.5rem,...)`), 300 px de ancho, en y=456. La negrita es la primera frase entera
   ("Convierte tu dinero en acciones colectivas."), no solo "acciones colectivas": cambio de marcado
   en `paragraph1` de los tres idiomas. El aire entre párrafos es un interlineado (`1lh`), como el
   salto en blanco del frame.
6. **Botón**: 144x40 en x=111, y=657; `papel` con texto azul 14 px ExtraBold, radio 4 (antes
   blanco, 52 de alto, centrado, texto de hasta 24 px). En el frame no está centrado (111 de 390,
   28,46 %) y así se dejó. Se cargó el peso 800 de Bricolage en `pages/_app.tsx`.
7. **Olas**: antes el SVG viejo de 390 recortado y solo en mobile. Ahora los siete vectores del
   frame (1288:1539, 1541, 1542, 1540, 1544, 1547, 1545), exportados tal cual y colocados en su
   posición en un único `public/images/donations/olas-mobile.svg` (y=708 a 871 del frame), a todo el
   ancho. El alto de la sección queda en 871.

Medido por CDP a 390 (sección, x, y, ancho): sección 871; líneas del título en x=34 con paso de 44
desde 101; párrafo 40/456/300; botón 111/657/144x40; barco 247,3/178,6/223,7; olas 0/708/390x163.
Todo a 0 o 1 px del frame.

## D2. Desktop nuevo (1288:1594), tablet y pantallas grandes

**Desktop.** Título en tres líneas con cintas de -0,58 grados y sesgo de 2,03 (interlineado 42,04,
caja de 657), párrafos de 18 px y 546 de ancho, botón debajo, todo en una columna que empieza en
x=120 (80 del PageGrid más 40). Barco (SVG del grupo 1288:1726) a la derecha en proporción al
contenido del PageGrid (64,75 % a la izquierda, 36,94 % de ancho), 72 px bajo la primera línea.
Olas: el grupo 1294:1752 exportado entero, en x=42 y 29 px bajo el botón, más ancho que la pantalla
(1,34 veces) para que sangre por la derecha.

Medido a 1280: sección 956; título 127/205 (líneas "Dirigir el cambio con educación", "menstrual
integral requiere", "tripulantes comprometidos"); párrafo 120/400/546; botón 120/583/144x40;
barco 805,2/277,4/413,7; olas 42,1/651,8/1714,3. Todo a 0 o 1 px.

**Tablet (768 a 1023): composición desktop desde `md`.** La columna de texto termina 16 px antes
del barco (`calc(64,754 % - 56px)`), así que se estrecha con el ancho: a 768 el título baja a cinco
líneas y los párrafos a siete, y el barco mide 254 px. Se eligió sobre "mobile ensanchado" porque
el layout mobile a 768 deja media pantalla vacía a la derecha del título y un botón descentrado
sin razón; el desktop a esa escala se lee bien y el paso a 1024 no cambia de forma.

**1512 y 1920.** Título, párrafos, botón y barco siguen el contenedor del PageGrid (1200 máximo),
así que a 1920 la columna empieza en x=440. Las olas van a sangre completa y escalan con el ancho
de pantalla con tope en 1512 (a 1920 miden 2025 de ancho desde x=50 y cubren ambos bordes sin
crecer de más en alto).

**Entrada al scroll.** La sección no tenía `FadeIn` y no se le añadió.

## D3. Olas y barco animados, mar al borde izquierdo y una pantalla de alto (feedback del 30 de septiembre)

**Lo que pidió Johan (2026-09-30, punto 4 de `docs/feedback-30-sep/FEEDBACK.md`):** animar las olas
y el barco como se viene haciendo, pegar el mar al borde izquierdo donde haga falta y más aire
arriba y abajo para que la sección ocupe la pantalla como las demás. Rama `30-sep`, sin commitear.

### Mar al borde izquierdo

En Figma el grupo de olas desktop (`1294:1752`) se movió de x 42 a **x -13**: la diseñadora ya lo
pegó al borde. El export sigue siendo el mismo archivo (comparado byte a byte). Ahora la capa
empieza en `base * -15,91 / 1280` (el inset del export incluido), con la misma escala por ancho y
el mismo tope en 1512. Medido: el borde izquierdo de las olas queda en -10, -13, -16, -19 y -19 a
768, 1024, 1280, 1512 y 1920 (antes 25 a 50 px despegado). En mobile ya salía del borde (x 0).

### Olas y barco partidos en capas (todo vector, regla 9)

No se redibujó nada: un script (`/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-30-sep/4a102619-4612-4f9a-b653-f5d38898f6f9/scratchpad/ola2D/partir.js`) copia los nodos del export tal cual a archivos con
el **mismo viewBox**, así que apilados son el dibujo original:

- `olas-desktop-<vector>.svg`: los 10 vectores del grupo `1294:1752`, uno por archivo.
- `olas-mobile-1..7.svg`: las 7 piezas de `olas-mobile.svg`, con el viewBox ensanchado 24 px por
  lado y 8 arriba y abajo (`-24 700 438 179`): así el vaivén nunca deja ver el corte del viewBox.
- `barco-{mobile,desktop}-casco.svg` (vectores 65 a 73 y 88: el barco y su relleno) y
  `-ondas.svg` (74 a 87: los anillos de agua). Las ondas van debajo; como son del mismo color que
  los bordes del casco, el cambio de orden de pintado no se ve.

Los archivos enteros (`olas-*.svg`, `barco-*.svg`) quedan en disco sin uso (regla de no borrar).

### Movimiento (CSS en `donations.module.css`, cifras del punto 8 del lenguaje de movimiento)

- **Olas:** cada una va de su sitio 7 px (mobile) o 10 px de 1280 (desktop, escalado) hacia un lado
  y vuelve, con ciclos de 3,6 a 5,4 s. **La que toca un borde se aleja de él**: así nunca asoma su
  extremo (la 1177 de desktop y la primera de mobile, cortadas por la izquierda, van a la
  izquierda; la segunda de mobile, que acaba en 390, a la derecha). Las demás alternan.
- **Barco:** el casco se mece ±3 grados alrededor del centro de su línea de flotación (49 % 78 %)
  cada 4,6 s, con un seno sin frenar en el cero (sine.out, sine.inOut y sine.in por tramo), y sube
  4 px (mobile) o 6 px (desktop) cada 3,8 s; las ondas respiran hasta 0,6 de opacidad cada 3,4 s.
  Es la propuesta anotada en PROGRESS (pendiente 4), ya con las piezas separadas.
- **Cuándo corre:** `useReposoTripulantes` pone `data-reposo="corre"` en pantalla y `"pausa"`
  fuera (IntersectionObserver) o con la pestaña oculta. Sin el atributo no hay animación y el
  diseño queda quieto: no se pone con `prefers-reduced-motion` ni con `?quieto=1`. A diferencia de
  Bienvenida, no depende de `data-intro-anima`: un deep link (`/#sumate`) no debe apagarla.

### Una pantalla de alto

La sección es `flex min-h-dvh flex-col`; el bloque de contenido (`.contenido`) crece en el alto que
sobra sobre las olas y se centra en él. Más aire que el frame: mobile 128 arriba (antes 101) y 48
entre el botón y las olas (antes 11); desde `md`, 220 arriba (antes 205) y 80 (antes 28,77).
Medido (alto de sección): 935 a 390x844, 1029 a 768x1024, 1003 a 1024x768, 1022 a 1280x800, 1077 a
1512x982 y 1080 a 1920x1080 (antes 956 a 1920 y la sección siguiente asomaba).

### Medido por CDP (`/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-30-sep/4a102619-4612-4f9a-b653-f5d38898f6f9/scratchpad/ola2D/sonda.js`, transform y opacidad a 0, 1,5 y 3 s)

- 1280x800 y 390x844: las 10 (7) olas cambian su `translateX` en el tiempo (hasta ±10 y ±7 px), el
  casco gira entre +2,5 y -2,7 grados, el flote baja a -5,6 (-3,7) px y las ondas van de 0,84 a 0,69
  y 0,97 de opacidad. Con `--reducido`: todo `none` y opacidad 1 en las tres muestras.
- Página arriba del todo: `data-reposo="pausa"`.
- Sin scroll horizontal a 390, 768, 1024, 1280, 1512 y 1920.
- Capturas `trip-<ancho>x<alto>.png` antes y después en `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-30-sep/4a102619-4612-4f9a-b653-f5d38898f6f9/scratchpad/ola2D/antes/` y `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-30-sep/4a102619-4612-4f9a-b653-f5d38898f6f9/scratchpad/ola2D/despues/`
  (`trip-1280-abajo.png` y `trip-390-abajo.png`, el mar entero).

## D4. El mar en pantallas muy anchas (ronda 3 del 1 de octubre, frente O)

**Lo que pidió Johan:** en pantallas muy anchas (1512, 1728, 1920, 2560) el mar de Tripulantes
quedaba casi todo a la izquierda. Repartirlo, sin despegarlo del borde izquierdo en anchos
normales y con olas y barco animados.

**Causa.** El mar escala con el ancho hasta 1512 y ahí se detiene (D2). El dibujo de Figma tiene
sus olas entre x 0 y 1235 del export (más dos olas sueltas en 1519 a 1714, fuera del frame): a
1920 todo acababa en x 1440 con un hueco de 335 px hasta las sueltas, y a 2560 terminaba en 2006
con 554 px de azul vacío a la derecha.

**Qué se hizo** (`donations-section.tsx` y `donations.module.css`): sin redibujar ni escalar nada,
cada ola se corre a la derecha una fracción (`peso`) de lo que la sección mide de más sobre 1512
(`--sobra: max(0px, 100% - 1512px)`, sumado al `left` de la capa; el vaivén sigue en `transform`).
Pesos: 0 las dos que tocan el borde izquierdo (1177 y 1178, el mar sigue pegado a él), 0,12 y 0,22
las de la izquierda (1175, 1172), 0,5 (1166), 0,65 (1170), 0,8 (1167) y 0,9 (1171). Las dos sueltas
del extremo (1176 y 1169, clase `.olaBorde`) siguen al borde derecho desde 1920, donde asoman
enteras: `--sobra: max(0px, 100% - 1920px)`. Hasta 1512 nada cambia. Mobile no se tocó.

**Medido por CDP** (`/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-30-sep/4a102619-4612-4f9a-b653-f5d38898f6f9/scratchpad/r3-O/sonda.js mar`: posición real de cada vector en pantalla con su caja
dentro del export; "antes" es la misma página con `--sobra: 0`):

| Ancho | Extremo izq. | Extremo der. visible antes / después | Mayor hueco sin olas antes / después |
| ----- | ------------ | ------------------------------------ | ------------------------------------ |
| 1024  | -13          | 975 / 975                            | 74 / 74                              |
| 1280  | -16          | 1219 / 1219                          | 92 / 92                              |
| 1512  | -19          | 1440 / 1440                          | 109 / 109                            |
| 1728  | -19          | 1440 / 1634                          | 288 (a la derecha) / 152             |
| 1920  | -19          | 1920 / 1920                          | 335 (a la derecha) / 175             |
| 2560  | -19          | 2006 / 2560                          | 554 (a la derecha) / 252             |

A 1920 las 10 olas tienen la animación corriendo (`getAnimations`, `data-reposo="corre"`) y el
casco se mece; con `--reducido` sin errores. Sin scroll horizontal en ningún ancho. Capturas
`antes/mar-<ancho>x<alto>.png` y `despues/mar-*.png` en `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-30-sep/4a102619-4612-4f9a-b653-f5d38898f6f9/scratchpad/r3-O/` (la sección vista desde su pie).

**Para Johan.** Los pesos son de ojo, para que el hueco más grande quede entre las olas de la
izquierda y no al final; si alguna se ve rara se cambian en `OLAS_DESKTOP`.
