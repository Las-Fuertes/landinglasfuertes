# Impacto ("Así se ve el impacto en acción"): decisiones

Rama `24-sep-pulido`. El historial anterior de la sección (mapa de Colombia, bloques por capas,
animaciones de cada bloque) está cerrado en `docs/secciones-impacto/DECISIONES.md` (D7, D8, D13,
D17, D22 a D25, D28); aquí sigue lo nuevo.

## D1. Desktop a dos columnas, filas intercaladas (2026-09-24)

**Pedido de Johan el 2026-09-24:** en desktop los bloques se veían flacos, una columna de 546 px
(el lienzo mobile de 390 por 1,4) en medio de una pantalla de 1280 a 1920. Cada bloque es un par
ilustración más título y texto; que desde 1024 px vayan lado a lado, intercalados: el mapa a la
izquierda y el texto a la derecha, la piscina al revés, y así alternando. Libertad para una
propuesta creativa de ubicación, siempre dentro del grid y sin tocar mobile ni tablet.

Esto **reemplaza a D7 de `docs/secciones-impacto/` solo en desktop** ("no se inventan layouts de
2 columnas"): D7 era una decisión de espera, a falta de diseño desktop, y Johan la levantó.

**Qué se hizo, solo en `lg` (>= 1024). Mobile y tablet no cambian ni un píxel** (30 capturas por
tramo a 390 y 768, en los tres idiomas, idénticas byte a byte contra el código de `main`).

- La sección toma la caja del `PageGrid` (1200 de ancho con 40 de margen) y cada bloque es una
  fila de 12 columnas con el gutter de 25, ilustración y texto centrados en vertical entre sí
  (`items-center`; diferencia medida entre centros: 0 o 1 px).
- Filas y columnas (en `DESKTOP` de `components/impacto/bloque-impacto.tsx` y en
  `mapa-impacto.tsx`):

  | Fila | Bloque   | Ilustración               | Texto         |
  | ---- | -------- | ------------------------- | ------------- |
  | 1    | Mapa     | izquierda, columnas 1 a 5 | columnas 7-12 |
  | 2    | Piscina  | derecha, 7 a 12 + sangra  | columnas 1-6  |
  | 3    | Lámparas | izquierda, 2 a 5          | columnas 7-12 |
  | 4    | Copa     | derecha, 9 a 12           | columnas 1-7  |
  | 5    | Persona  | izquierda, 1 a 6 + sangra | columnas 7-12 |

**La propuesta creativa, y por qué:**

1. ~~El título de la sección sube a la columna del mapa~~ (**descartado por Johan el
   2026-09-25**: "es el título de la sección"). Se propuso poner la flor y "Así se ve el impacto
   en acción" a la izquierda, encima del cierre, junto al mapa. **Queda así:** la flor y el título
   centrados arriba a todo el ancho, como título de la sección (`lg:col-span-12`), 65 px
   (`lg:mb-xxl`) por encima de la primera fila. La fila 1 es el mapa (columnas 1 a 5) y a su
   derecha el cierre "7 territorios ahora más fuertes" y su texto, centrados entre sí (diferencia
   de centros 0 px a 1280, 1512 y 1920 en es, en y fr; 0 solapes; `medir-resaltado` 18 de 18 por
   idioma). La entrada de D2 sigue en orden: primero el título de sección y luego la fila 1
   (tras la cortina: título a los 632 ms del salto, mapa a los 882; por scroll: 266 y 783).
2. **Escalas distintas según la forma del dibujo.** Las ilustraciones altas (lámparas y copa)
   van a 4 columnas y dejan una columna de aire; el mapa a 5; las apaisadas (piscina y persona)
   a 6. Así ninguna fila pasa de unos 620 px de alto y el mapa entero cabe en una pantalla de
   832 junto a su texto.
3. **Las apaisadas sangran hacia el borde.** La piscina y la persona se salen de la rejilla los
   40 px del margen de página por su lado (`-mr-page-margin` / `-ml-page-margin`): a 1280 tocan
   casi el borde de la pantalla, y rompen la simetría de la columna sin que el texto pierda su
   margen.
4. **Medida de línea.** El párrafo pasa de 22,4 px (16 x 1,4) a `text-h3` (20 px) en una columna
   de 6 (547 px a partir de 1280), unos 55 caracteres por línea. La copa va en 7 columnas porque
   su frase en francés (64 caracteres) dejaba "an." sola. Los títulos siguen a 42 px (30 x 1,4) con
   su resaltado en tiras.
5. **Aire superior tras el Mapa educativo** (pendiente de `docs/sumate-drawer/PROGRESS.md`): de
   45 px (`k(32)`) a 112 (`lg:pt-28`) en desktop, que tras el bloque azul del mapa se veía
   apretado. Entre filas, 96 px (`lg:mt-24`) más el aire que ya traen los lienzos.

Resultado: la sección baja de unos 5100 px de alto a 2562 en desktop.

**Detalles técnicos que costaron:**

- **Las medidas de mobile van en variables CSS, no en `style` directo.** Un `style` en línea no lo
  puede pisar una clase `lg:` (lo mismo que D27 de Quiénes somos). Por eso `paddingTop`,
  `marginTop`, `fontSize` y compañía pasaron a `--aire-arriba`, `--texto-izq`, `--p-letra`, etc.,
  que se leen con clases (`pt-[var(--aire-arriba)]`) y que `lg:` sustituye por un token.
- **Las etiquetas del mapa escalan con su columna, no con `--k`.** En desktop el mapa mide lo que
  su columna (452 px a 1280, 379 a 1024), no 546. Con `--k: 1.4` las etiquetas quedaban grandes y
  "Isla Fuerte" y "Atlántico" fundían sus fondos (-5,3 px en `medir-resaltado`). La celda del mapa
  es un contenedor (`container-type: inline-size`) y la unidad `--u` vale `100cqw / 390` (1 px del
  lienzo); la etiqueta usa `calc(16 * var(--u))`. **Ojo: `--k: calc(100cqw / 390)` no sirve**:
  da una longitud, y `calc(16px * <longitud>)` es inválido, así que el tamaño caía al heredado sin
  avisar. En mobile y tablet `--u` es `k(1)`, idéntico a antes.
- **Sangrar en una celda de grid** necesita `w-auto` y `justify-self: stretch`: con `w-full` el
  margen negativo no ensancha la celda.

**Animaciones:** nada cambió en el movimiento. Cada bloque sigue encendiéndose al 60 % en
pantalla (`useInView`) y el mapa al 45 %; sondeado por CDP a 150 ms y 3500 ms tras llegar a cada
fila a 1280: el agua de la piscina, las lámparas, la copa y la persona pasan de su estado "antes"
a `inset(0)` / opacidad 1 / `circle(75%)`, el mapa pasa de gris a rosa y las etiquetas a
opacidad 1. El `id="impacto"` y el `h2#impacto-title` no cambiaron (de ellos depende la
transición "Terminar" del Mapa educativo).

---

## D2. Imagen y texto a una sola distancia en mobile, y entrada pausada tras "Terminar" (2026-09-25)

**Feedback de Johan el 2026-09-25**, dos pedidos:

1. "Sube un poco más el texto de la piscina, y revisa los demás, para que cada imagen quede más
   cerca de su texto de forma congruente."
2. "Cuando le doy en el mapa Terminar y entro al mapa de acción todavía siento que entran muy
   rápido las animaciones."

### 1. Una sola distancia imagen-texto (mobile y tablet)

**Qué había.** El aire entre cada dibujo y su título salía del frame de Figma de cada bloque
(`texto - lienzo`, D22 de `docs/secciones-impacto/`), y cada frame tenía el suyo: medido por CDP a
390, del borde inferior visible del dibujo al tope del título, **piscina 138 px, lámparas 50,
copa 75, persona 92**, y el cierre del mapa **-31** (el título pisaba la punta sur del mapa,
también del diseño). A 768, lo mismo por 1,25.

**Qué se hizo.** Una sola distancia, **`mt-xl` (40 px) en los cinco**, en mobile y en tablet. Los
lienzos de los bloques ya van ceñidos al dibujo (escaneo de píxeles de cada lienzo en su estado
final: el dibujo toca los cuatro bordes, sin aire transparente que compensar), así que el borde
inferior de la caja es el del dibujo. En el mapa se mide contra el `getBBox` del SVG, que queda
2 px por encima de su caja. `bloques.data.ts` conserva `texto` solo como referencia de Figma.

Resultado a 360, 390, 428 y 768 en es, en y fr: **mapa 42, piscina 40, lámparas 40, copa 40,
persona 40**; entre bloques sigue 120 (150 en tablet), el triple, así cada dibujo se lee con su
texto. El mapa gana aire (de -31 a 42): deja de pisar su punta sur, que era la única pieza que no
cumplía "0 solapes". Desktop no cambia: allí imagen y texto van lado a lado (D1).

### 2. Entrada de la primera fila, pausada y sin cortina encima

**Qué pasaba.** "Terminar" (y "Saltar mapa") pasan a Impacto con una cortina beige
(`components/education-map/cortina.ts`): sube 520 ms, la página salta debajo, 60 ms de pausa y se
desvanece 520 ms. Pero la entrada de Impacto arrancaba **en el salto, debajo de la cortina**. Línea
de tiempo medida por CDP (muestreo por frame de estilos calculados, a 390x844, en ms desde el
salto; la cortina se va en el 600):

| Pieza           | Antes                              | Después                                  |
| --------------- | ---------------------------------- | ---------------------------------------- |
| Título          | 29 a 329 (terminó bajo la cortina) | 633 a 1083 (visible 98 %; fin real 1433) |
| Flor            | 29 a 329, a la vez que el título   | 783 a 1183                               |
| Mapa gris       | quieto, ya estaba                  | 883 a 1333 (fondo suave: aparece y sube) |
| Territorios (7) | 29 a 2096, fill 0,7 s cada 280     | 1383 a 2599, 450 ms cada 160             |
| Etiquetas (7)   | 379 a 2413                         | 1583 a 2766                              |

Antes, al irse la cortina ya habían terminado el título, la flor y tres territorios: se llegaba
a mitad de la animación, y el resto se atropellaba. Ahora la cortina se va y **32 ms después**
empieza la entrada, que dura **2,1 s** de punta a punta.

**Cómo, según el lenguaje de movimiento de `docs/PATTERNS.md`:**

- **El texto llega primero** (regla 2): título a 0 ms, 800 ms, sube 28 px con la curva de
  `FadeIn`. La flor es un detalle (regla 7) y llega 150 ms después, subiendo 12 px.
- **El fondo es suave** (regla 6): el mapa gris aparece y sube solo 16 px, 250 ms detrás del
  título.
- **Nada en bloque** (regla 1): los siete territorios se encienden en cascada desde Isla Fuerte,
  cada uno 450 ms con 160 de desfase, y cada etiqueta 200 ms después de su territorio. En reposo
  se ve exactamente el diseño (regla 11).
- **Sin cortina encima.** `cortina.ts` marca `<html data-cortina-puesta>` y emite
  `EVENTO_CORTINA` al ponerla y al quitarla; `useSinCortina` (impacto) espera a que se vaya. Solo
  se tocó eso del Mapa educativo (y un comentario de `coreografia.ts`).
- **Igual por scroll normal.** La cabecera arranca al entrar en pantalla y el mapa al estar al
  45 % visible, pero nunca antes de 250 ms detrás del título (`--retraso`). Medido bajando a mano:
  título 173 a 623, mapa 544, territorios 1040 a 2256, etiquetas hasta 2423 (2,25 s).
- **Solo opacidad y `transform`.** Antes el territorio cambiaba de `fill` (repinta). Ahora cada
  territorio va dos veces en su sitio del orden de apilado, gris y encima rosa; el rosa aparece
  por opacidad y, entero, el gris se retira de golpe (opacidad 0 sin transición), así en reposo se
  pinta un solo path por territorio, como antes. Con CPU 4x a 390x844: 0 frames de más de 34 ms
  (el peor, 17).
- **Reduced motion**: todo en su estado final desde el principio, sin esperar a la pantalla
  (sondeado: ninguna pieza cambia).

Medido también con el flujo real (clic en `[data-saltar-mapa]`, que usa la misma cortina): la
cortina se va a los 1149 ms del clic y el título empieza a los 1181.

**Un matiz en desktop:** el reposo del mapa no es idéntico byte a byte al de D1: 289 píxeles del
borde de los departamentos cambian, 264 de ellos en 3 niveles de 255 o menos (el máximo, 19, en un
píxel). Es el antialiasing del SVG al pintar con opacidad; se probó quitando cada pieza nueva por
separado y no desaparece. No se ve. El resto de la sección en desktop sí es idéntico.

### 3. El telón: fundido en vez de cortina que sube (2026-09-25)

**Feedback de Johan el 2026-09-25:** "aunque las animaciones ya están mucho mejor, la intro que
queremos acá es un poco más sutil; ahorita hay como un slide up y luego entran las animaciones;
intentemos un fade, que sea más como una introducción tipo telón".

**Qué se hizo** (`cortina.ts` y `PASO` de `coreografia.ts`; sirve igual a "Terminar" y a "Saltar
mapa", que comparten la función):

- **La cortina ya no se desplaza.** Aparece con un fundido sobre el mapa (opacidad 0 a 1,
  **400 ms**), la página salta a Impacto bajo la cortina opaca, 60 ms de pausa, y se desvanece
  (1 a 0, **500 ms**) descubriendo Impacto. Las dos con sine.inOut (`CURVA.viaje`): un telón
  empieza y termina suave, sin el golpe inicial de la curva de entrada. La salida es más larga que
  la aparición porque lo que importa es lo que descubre (regla 2 del lenguaje de movimiento: el
  contenido manda); las dos quedan en el rango de 350 a 500 ms pedido, y todo el traspaso
  (cierre del modal, telón, entrada) ronda los 3,4 s, en el ritmo pausado de la regla 3.
- **Solape corto:** Impacto recibe el aviso (`EVENTO_CORTINA`) **120 ms** antes de que el telón
  termine (`PASO.cortinaSolape`), con el telón al 14 % de opacidad.
- **Movimiento vertical más sutil** en la entrada de Impacto: título 8 px (antes 28), flor 6
  (12), mapa 6 (16), etiquetas 4 (8). El resto de la línea de tiempo de D2 no cambia.
- Si el paso se interrumpe, `finally` quita la capa y la marca, y el aviso pendiente se cancela.

**Línea de tiempo medida** (flujo real: clic en la última parada y en "Terminar" por CDP, a
390x844, muestreo por frame; ms desde el clic en "Terminar"):

| ms          | Qué pasa                                                          |
| ----------- | ----------------------------------------------------------------- |
| 0 a 460     | el modal se cierra; telón en 0                                    |
| 460 a 850   | el telón aparece (0,07 a los 500, 0,57 a los 650, 0,98 a los 800) |
| 850         | salto: `#impacto` a -0,2 px del borde, con el foco                |
| 910 a 1410  | el telón se abre (0,50 a los 1150, 0,09 a los 1300, 0 a los 1400) |
| 1302 a 1752 | título (8 px, llega a 0 hacia los 1850)                           |
| 1452 a 1852 | flor                                                              |
| 1552 a 2002 | mapa gris                                                         |
| 2052 a 3435 | territorios y etiquetas en cascada                                |

La transformada del telón es `none` en todos los frames; el tope de Impacto se queda en -0,2 px
desde el salto hasta el final (más de 2,5 s). CPU 4x: 0 frames de más de 34 ms (el peor, 17).
Reduced motion: no se crea la cortina, salto directo con foco, nada se anima. Secuencia de
capturas: `telon-<ms>.png` en el scratchpad de la sesión (la de 803 ms es el telón entero, beige
liso, por eso pesa 5 KB).

---

## D3. La primera fila cabe entera en la primera pantalla (2026-09-25)

**Pedido de Johan el 2026-09-25**, tras aprobar el telón: "encajemos un poco más el contenido de
la sección de Impacto para que el mapa y el texto queden visibles en desktop y mobile (podemos
mover la flor del título también para ganar un poco más de espacio)". Criterio: al llegar a
Impacto (tope en 0, entrada terminada), el título de sección, el mapa con sus etiquetas y el
bloque "7 territorios ahora más fuertes" con su párrafo se ven enteros, con el párrafo a 16 px o
más del borde inferior.

**Antes** (medido por CDP): a 390x844 el párrafo acababa en 864 (fuera); a 1280x832 el mapa
acababa en 945 (fuera). Las pantallas bajas (360x640, 390x664, 1280x720) quedaban muy lejos.

**Qué se hizo:**

1. **La flor deja de tener fila propia.** Va al final de la última línea del título, a 1,1 em,
   girada -12 grados como una pegatina (`.impacto-flor`, dentro del `h2`). Al final de la
   última línea porque es la que tiene sitio en los tres idiomas (medido: 247, 246 y 124 px de 321
   a 390). Gana 45 px en mobile y 63 en desktop. En la entrada sigue llegando 150 ms después del
   título.
2. **Menos aire arriba**: mobile y tablet de `k(32)` a `k(20)`; desktop de 112 a 48 (`lg:pt-12`).
   Título a mapa: `k(19)` a `k(12)` en mobile y de 65 a 40 (`lg:mb-xl`) en desktop.
3. **El mapa mide lo que quepa**, sin deformarse: su ancho es
   `min(100%, (100svh - --resto) x 390/531)`, con `--resto` lo que ocupa la fila fuera del mapa
   (`k(320)` en mobile y tablet: aire, título, los 40 px hasta el cierre, el cierre, el párrafo y
   16 de margen; 194 px en desktop). El valor de mobile cubre el párrafo más largo (francés, tres
   líneas a 360); en es y en sobran unos 34 px. En pantallas altas el mapa no crece de más: el
   `min` lo deja en su ancho de siempre.
4. **Las etiquetas no bajan del tamaño de mobile** (16 y 12 px): en mobile y tablet no cambian;
   en desktop escalan con el mapa pero con un mínimo de 1 px de lienzo (`--u: max(1px, ...)`).
   Como en un mapa chico la etiqueta queda proporcionalmente más grande, "Isla Fuerte" se ancla
   ahora por su borde derecho (`hasta: 77` en `mapa.data.ts`): crece hacia afuera del mapa y no
   hacia "Atlántico". A 390 queda donde estaba.

**Resultado** (es, en y fr; tope de Impacto en 0; tras la entrada): pasa en los 11 tamaños
pedidos.

| Tamaño    | Mapa    | Fondo del párrafo (máx.)  |
| --------- | ------- | ------------------------- |
| 360x640   | 235x320 | 590 / 614 fr (624)        |
| 375x667   | 255x347 | 617 / 641 fr (651)        |
| 390x664   | 253x344 | 614 / 638 fr (648)        |
| 390x844   | 385x524 | 794 / 818 fr (828)        |
| 428x746   | 313x426 | 696 / 720 fr (730)        |
| 768x1024  | 458x624 | 952 (1008)                |
| 1280x720  | 386x526 | 517 a 532; mapa hasta 705 |
| 1280x832+ | 452x616 | 562 a 578; mapa hasta 795 |

0 solapes entre título (con la flor), mapa, etiquetas y texto; `medir-resaltado` de Impacto 54 de
54 por idioma en esos tamaños. La entrada del telón no cambia de orden ni de tiempos (título a los
1353 ms del clic en "Terminar", flor 1503, mapa 1603, territorios hasta 3486; CPU 4x sin frames
lentos). A 360x640 cabe sin bajar las etiquetas: el mapa queda al 60 % de su ancho de 390 y las
etiquetas tapan más del dibujo, pero se leen.

**Ojo:** el botón flotante "Súmate" puede tapar el final del párrafo en mobile (se ve en las
capturas a 360). Es un pendiente conocido del botón, no de este encaje.
