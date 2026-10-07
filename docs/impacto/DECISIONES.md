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

---

## D4. Pantalla completa con imán, aire del título y entradas pausadas (2026-09-30)

> REEMPLAZADA por D9 (2026-10-06): Impacto pasó a scroll nativo; esta decisión ya no rige.

**Feedback del 30 de septiembre** (`docs/feedback-30-sep/FEEDBACK.md`, punto 6, y decisión 2 de
`ROADMAP.md`): cada par texto más imagen del alto de la pantalla, navegado con scroll libre con
imán; el título de la sección muy pegado al mapa; las entradas muy rápidas, salvo la luz, que se
queda.

### 1. Una pantalla por par, con imán solo en Impacto

- La cabecera con el mapa y cada uno de los cuatro bloques van en una pantalla `min-h-dvh` (crece
  si el contenido no cabe, nunca lo corta) con `snap-start`. Los bloques se centran en vertical con
  `py-20`, así en reposo nada queda bajo la navegación flotante. Se quitó el aire fijo entre
  bloques (`k(120)` / `lg:mt-24`) y el de abajo de la sección: ahora lo da la pantalla.
- **El imán solo existe mientras Impacto está arriba.** `useIman` (`components/impacto/use-iman.ts`)
  pone `snap-y snap-proximity` en `<html>` cuando la sección cruza una franja del 1 % del alto en
  el borde superior de la pantalla (IntersectionObserver con `rootMargin: 0 0 -99% 0`), y la quita
  al salir. Con la intro o el Mapa educativo arriba, `<html>` tiene `scroll-snap-type: none`, así
  que ni el pin de la intro ni el mapa (que avanza por posición de scroll y llega a Impacto con
  `scrollTo` fotograma a fotograma) ven un imán. No hizo falta ninguna regla global en
  `styles/`: las clases de Tailwind van escritas en el hook.
- **Un último punto de imán** al pie de la sección (un `div` de 1 px en `top-full`), que coincide
  con el tope de Quiénes somos: salir hacia abajo también encaja, sin tocar esa sección.
- **`proximity`, no `mandatory`.** Probado por CDP con `mandatory` puesto en Impacto: un
  `scrollTo(0, 0)` (lo que hace "Inicio" de la navegación flotante) se quedaba atrapado en
  Impacto (scrollY 8616 en vez de 0), porque Chrome encaja también los saltos por código al punto
  de imán más cercano. Con `proximity`, Chrome solo encaja si el reposo cae a menos de un tercio
  de pantalla de un punto: un scroll corto vuelve al bloque, uno a medio camino se queda donde
  quedó (scroll libre) y nunca atrapa.
- Si una pantalla es más alta que el viewport, el imán deja leerla entera (Chrome permite
  cualquier posición dentro de un área de imán más alta que la pantalla).

### 2. Aire del título

- Título a mapa: de `k(12)` a `k(40)` en mobile y tablet (40 y 50 px, el `mt-xl` que separa
  dibujo y texto en todos los bloques, D2) y de `lg:mb-xl` a `lg:mb-xxl` (65) en desktop.
- Aire arriba del título en mobile: de 20 a 80 (`spacing.20`). A 390 el título entero quedaba al
  lado del botón de la navegación flotante (que llega a 64 px; en inglés, la primera línea
  empezaba 1 px a su derecha). Tablet `xl` escalado (50), desktop 48 como antes.
- El encaje de D3 se conserva: `--resto` suma el aire nuevo (`calc(328px * --k + --aire-arriba)`
  en mobile y tablet, 219 px en desktop), y la primera pantalla sigue cabiendo entera. El costo:
  el mapa en mobile baja de 385 a 320 px de ancho a 390x844 (párrafo hasta 794, 818 en francés).

### 3. Entradas: una secuencia por bloque, al asentarse

Antes cada bloque se encendía al 60 % en pantalla, todavía en movimiento, y solo se animaba la
ilustración (agua en 1,6 s, extras a 1,3 s): se llegaba a la mitad. Ahora `useAsentado`
(`components/impacto/use-asentado.ts`) espera a que el scroll se detenga (`scrollend`, o 150 ms
sin `scroll` en Safari) con el 90 % del bloque visible, y arranca una sola línea de tiempo (CSS
en `styles/global.css`, bloque de Impacto):

| ms               | Qué entra                                                                      |
| ---------------- | ------------------------------------------------------------------------------ |
| 0 a 800          | título, aparece y sube 8 px (curva de `FadeIn`)                                |
| 200 a 1000       | párrafo, igual: el texto llega primero (regla 2)                               |
| 350 a 1350       | la ilustración en su estado "antes", aparece y sube 6 px (regla 6)             |
| 1500 en adelante | el cambio: agua 2,2 s, líquido 2 s, color 2,4 s, en sine.inOut (`CURVA.viaje`) |
| 3400 + i x 200   | extras, rebote de 600 ms, uno tras otro                                        |

**La luz no cambia:** mismos keyframes, misma duración (1,5 s, `steps(1, end)`) y mismo desfase
entre lámparas (1,24 s). Solo arranca en su turno de la secuencia (`--inicio`, 1,5 s), como el
resto de los cambios, en vez de a la vez que el bloque aparece. La primera fila (título de
sección y mapa) no cambia: su entrada ya era la pausada de D2 y D3, ajustada al telón.

**Reduced motion:** `useAsentado` enciende todos los bloques al montar y los retrasos van a 0:
todo en su estado final sin entrada. El imán se queda.

### Verificación (CDP a 390x844, 768x1024, 1280x800, 1512x982 y 1920x1080)

- `scroll-snap-type` es `none` en la intro (y 0), en cada parada del mapa y medio viewport antes
  de Impacto; con Impacto arriba, `y proximity`.
- Rueda de 0,2 pantallas desde el tope de cada una de las 5 pantallas: vuelve al tope exacto
  (0 px) en los 5 tamaños. Desde la última, 0,85 pantallas: encaja en el tope de Quiénes somos.
  Hacia arriba desde la primera: queda libre en el mapa, sin volver.
- "Terminar" del mapa (flujo real: última parada, clic en el pie) deja Impacto en su tope, con el
  telón, en los 5 tamaños.
- Cada pantalla mide exactamente el alto del viewport; ningún título, párrafo ni etiqueta queda
  fuera de pantalla ni bajo el botón de la navegación; sin scroll horizontal.
- Línea de tiempo muestreada (piscina y lámparas) y reduced motion sondeado.
- Capturas `<ancho>x<alto>-b<n>.png` y `-terminar.png` en el scratchpad de la sesión (`ola3E/`).

### Ampliación (2026-10-01): el imán pasa a JS y deja de atrapar la rueda; los bloques altos caben

**Qué desmintió la verificación.** El segundo verificador encontró que el imán de CSS
(`scroll-snap-type: y proximity`) atrapaba la rueda del ratón: muesca a muesca (100 px cada 100 a
250 ms), Chrome vuelve a encajar al terminar cada desplazamiento discreto, y como 100 px está
siempre dentro del tercio de pantalla, devolvía al tope del bloque. 10 muescas terminaban en +0.
La verificación original solo había probado eventos sueltos de 0,2 pantallas. Además, en el tope
de Quiénes somos el imán seguía puesto porque el IntersectionObserver contaba como intersección
un contacto de 0 px (Impacto con `bottom = 0`).

**Qué se hizo.** Se abandonó `scroll-snap` de CSS. `useIman` ya no pone clases en `<html>`
(`scroll-snap-type` es `none` en toda la página) y asienta con `scrollTo` suave solo cuando el
movimiento terminó (`scrollend`, con respaldo de 150 ms sin `scroll`, rueda ni toque). Reglas:

- Solo si hubo un gesto de la persona (rueda, toque, tecla, clic en la barra de scroll) desde el
  último reposo. Los `scrollTo` del código ("Inicio", "Terminar" del mapa) no se tocan.
- Solo entre el tope de Impacto y el de Quiénes somos (un rango, no un observador: el hallazgo
  del contacto de 0 px desaparece).
- Solo hacia adelante, en la dirección del último movimiento. Nunca devuelve: por eso ninguna
  muesca puede deshacer la anterior.
- Va al punto siguiente si está a menos del 30 % del alto, o si el gesto salió de un punto y
  recorrió al menos el 15 % (el empujón que pasa de pantalla, la sensación de imán). Un gesto
  menor (0,05 pantallas) se queda donde quedó.
- No asienta con el dedo puesto, ni dentro de una pantalla más alta que el viewport mientras se
  lee dentro de ella, ni con movimiento reducido (ahí el scroll es libre del todo).
- Los puntos son los elementos con `data-iman` y el pie de la sección; se quitó el `div` de 1 px.

Se descartó la alternativa de mantener CSS snap solo en bloques que caben: el atrapado viene del
reasiento de Chrome tras cada muesca, que pasa igual con un solo punto de imán por bloque.

**Bloques altos.** Las lámparas y la copa medían 968 px a 1000x800, 798 a 375x667 y 783 a
360x740. En mobile y tablet la ilustración se topa al alto que deja libre la pantalla
(`--fuera-del-arte` en la pantalla del bloque: 80 arriba, 15 abajo, separación y unos 13 rem de
texto, todo por `--k`) y se encoge centrada; el aire de abajo baja de 80 a `pb-m` (abajo no hay
nada fijo). Desktop (`lg`) no cambia.

**Verificado por CDP (2026-10-01)**, scratchpad `verif2-arreglos/` (`iman.js`, `altos.js`,
`mapa.js`): las cuatro pantallas miden exactamente el viewport en 1000x800, 375x667, 360x740,
1280x800, 1512x982, 1920x1080 y 390x844 (es, en y fr en los tres bajos). Rueda de 100 px cada
150 y 250 ms atraviesa Impacto entero hacia abajo y hacia arriba en 1280x800, 390x844, 1920x1080
y 375x667 (37 a 52 muescas), y desde el tope de Quiénes somos sigue bajando (100, 200 ... 600).
0,2 pantallas desde un punto: asienta en el siguiente (0 px de error) hacia abajo y hacia arriba
en los cuatro tamaños; 0,05: se queda donde quedó. PageDown y Espacio avanzan una pantalla.
"Inicio" llega a 0. "Terminar" del mapa deja Impacto en top 0 a 390, 1000, 1280 y 1920.

## D5. Título fijo, mapa centrado y texto primero en las transiciones (2026-10-01)

> REEMPLAZADA por D9 (2026-10-06): Impacto pasó a scroll nativo; esta decisión ya no rige.

**Feedback** (`docs/feedback-30-sep/FEEDBACK-2.md`, sección Impacto): en desktop el mapa se veía
muy arriba; con el imán quedaba un espacio en blanco durante la transición entre bloques que daba
la percepción de que no pasaba nada; el título de la sección debía acompañar cada impacto, tipo
sticky, como ya lo hacía con el mapa.

### 1. El título de la sección, fijo arriba

- El título sale de `MapaImpacto` a su propio componente, `TituloImpacto`
  (`components/impacto/titulo-impacto.tsx`), hijo directo de la sección, con `sticky top-0`,
  fondo beige opaco y `z-10` (la navegación flotante, `z-[80]`, sigue encima). Como su caja
  contenedora es la sección entera, se queda en top 0 mientras se recorren el mapa y los cuatro
  bloques, y se suelta solo cuando el pie de la sección lo empuja: al llegar a Quiénes somos ya
  está fuera de pantalla (top igual a menos su alto).
- Mide exactamente `--alto-titulo`, definido en la sección: el aire de arriba de D4 (80 en
  mobile, 40 por `--k` en tablet, 48 en desktop), dos líneas del título (2 rem por `--k`) y `s`
  abajo. Da 154 px en mobile, 140 en tablet y 148 en desktop.
- Cada pantalla (la del mapa y las de los bloques) mide al menos el alto útil,
  `100dvh - --alto-titulo`, centra su contenido en él (`flex justify-center`, `py-m`) y lleva
  `scroll-margin-top: --alto-titulo`. El tope de la ilustración en mobile y tablet
  (`--fuera-del-arte`) y el del mapa (`--resto`) restan el título en vez del aire de antes.
- La entrada del título es la de D2 (aparece y sube, sin cortina encima); el mapa la sigue a
  250 ms leyendo el momento en que empezó (`onInicio` en la sección, `inicioTitulo` en el mapa).

### 2. El mapa, centrado en el alto útil

La fila del mapa ya no cuelga del título con `mb-xxl`: es una pantalla más, centrada en el alto
útil. En desktop el mapa mide como mucho el alto útil menos 40 arriba y abajo
(`--resto: --alto-titulo + 2 xl` en `styles/global.css`) y, si su columna es más estrecha (1920),
queda centrado con aire parejo. En mobile `--resto` es el título, `2 m` de la pantalla y 200 por
`--k` del cierre con su separación (con 184, en francés a 390 la pantalla crecía 13 px).

### 3. El imán con el título encima

- Los puntos de imán restan el `scroll-margin-top` de cada pantalla: asientan con la pantalla
  justo debajo del título. El paso entre puntos es el alto útil y el último (al tope de Quiénes
  somos) un viewport, porque ahí el título se suelta.
- La regla de "pantalla más alta que el viewport" compara con el alto útil.
- **Hallazgo:** PageDown y Espacio avanzan el viewport entero, que ahora es más que el alto útil:
  pasaban el punto siguiente por el alto del título y el imán, que solo va hacia adelante, los
  llevaba al de después (saltaban un bloque). Tras una tecla de página, si el movimiento pasó un
  punto por no más que el alto del título, el imán vuelve a ese punto. La rueda no cambia: nunca
  devuelve.

### 4. Texto primero, sin esperar al asentado

`useAsentado` se reemplazó por `useEntradaBloque` (`components/impacto/use-entrada-bloque.ts`),
con dos disparadores:

- `data-entrada`: cuando la pantalla del bloque asoma (IntersectionObserver al 1 % de la
  pantalla, no del bloque: el dibujo de la piscina queda más abajo y tardaba 450 ms en asomar).
  Entran el título (0 a 800 ms), el párrafo (150 a 950) y la ilustración en su estado "antes"
  (200 a 1200), mientras el imán todavía la está trayendo. Con umbral 0 la pantalla siguiente,
  pegada al borde inferior sin un píxel a la vista, ya contaba como intersección y entraba sin
  que nadie la viera: por eso el 1 %.
- `data-encendido` con `--inicio`: cuando el bloque se asienta (90 % visible bajo el título,
  scroll detenido). El cambio a "después" llega a 1,5 s de la entrada, como en D4, pero nunca
  antes de 0,4 s tras asentarse. Así el carácter pausado se mantiene y la ilustración nunca se
  transforma fuera de la vista.
- **La luz no cambia:** mismos keyframes, duración, `steps(1, end)` y desfase; solo arranca en
  su `--inicio`, como en D4.
- Reducido: los dos disparadores se dan al montar y los retrasos van a 0.

### Verificación (CDP, 2026-10-01; scripts en el scratchpad de la sesión, `r2-L/`)

- Centro del mapa contra centro del alto útil: 0 px de diferencia a 1024x768, 1280x800,
  1512x982 y 1920x1080 (`geo.js`).
- Cada bloque cabe bajo el título y la navegación no toca ni el título ni el texto en 390x844,
  375x667, 360x740, 768x1024, 1000x800, 1024x768, 1280x800, 1512x982 y 1920x1080, en es, en y fr
  (0 fallas).
- Top del título: 0 en todo el recorrido; menos su alto al tope de Quiénes somos.
- Transición con rueda (0,2 pantallas, el imán completa): el texto entrante supera opacidad 0 a
  los 153 ms (primera muestra) en los cuatro bloques a 390x844, 375x667, 1280x800 y 1920x1080
  (`trans.js`).
- Rueda de 100 px cada 150 y 250 ms atraviesa Impacto en ambos sentidos a 1280x800 y 390x844;
  0,2 pantallas asienta en el siguiente (0 px); PageDown y Espacio avanzan un bloque; "Inicio"
  llega a 0; "Terminar" y "Saltar mapa" dejan Impacto en top 0 (`iman.js`, `mapa.js`).
- Reducido: título, mapa y los cuatro bloques en opacidad 1 a los 80 ms.
- `npm run type-check` y `npm run lint` limpios.

**Ampliación (2026-10-01, docs/introduccion/DECISIONES.md D14).** El "pegado" del dedo en Impacto
no venía del imán sino de dos listeners de toque no pasivos que cubrían toda la página (el de la
intro en `window` y el de Swiper en `document`): cada arrastre esperaba al hilo principal, y las
entradas de los bloques lo ocupan hasta 220 ms. Arreglado en D14. El imán, además, ya no asienta
si la página se movió desde el último `scroll` visto o si fue hace menos de 150 ms, para no
empujar a media inercia cuando el hilo estuvo ocupado.

## D6. Título centrado en su franja e imán que no toma el mando (2026-10-01)

> REEMPLAZADA por D9 (2026-10-06): Impacto pasó a scroll nativo; esta decisión ya no rige.

**Feedback** (`docs/feedback-30-sep/FEEDBACK-3.md`, sección Impacto): el título se veía muy abajo
y mal acomodado; el imán acomodaba muy rápido y, con alguien haciendo scroll, parecía tomar el
mando. Pedido: esperar al menos medio segundo y acomodar empezando lento y terminando rápido.

### 1. El título, centrado en su franja

Medido antes del cambio: a 1280x800 la franja medía 148 y el texto quedaba con 45 px arriba y 6
abajo; a 390x844, 62 arriba y 7 abajo (a 3,6 px del pie del CTA "Súmate").

- La sección define ahora `--aire-arriba` y `--aire-abajo`, y `--alto-titulo` es su suma más las
  dos líneas (4 rem por `--k`). `TituloImpacto` mide `--alto-titulo` con `pt-[--aire-arriba]` en
  todos los tamaños: se quitó la excepción mobile de la ronda 3.
- **Tablet y desktop:** 25 por `--k` arriba y abajo (31 en tablet, 35 en desktop). El CTA flotante
  (x 40 a 137, y 16 a 58) no cruza en horizontal el título centrado desde 768, así que el título
  sube libre y queda centrado en la franja entera. Franja de 143 (tablet) y 160 (desktop).
- **Mobile:** el CTA sí cae encima de la primera línea en horizontal, así que la franja reserva su
  alto: 64 + 10 arriba, 16 abajo. El título queda centrado entre el pie del CTA y el pie de la
  franja (13,6 y 13 px de aire visible). La franja pasa de 138 a 154; los bloques siguen cabiendo
  porque la ilustración se topa con `--fuera-del-arte`, que ya restaba `--alto-titulo`.
- Descartado centrar en mobile contra el tope de la franja: con el título por debajo del CTA
  exigiría unos 62 px abajo, una franja de 193 que se come un 29 % de la pantalla.

### 2. El imán, con medio segundo de quietud y curva propia

- **Quietud:** `QUIETO_MS` pasa de 150 a 500. Cuenta desde el último `scroll` visto y desde el
  último gesto (rueda, dedo, tecla, clic en la barra), y no corre con el dedo puesto ni durante la
  inercia (la comprobación de D14 de `docs/introduccion/` se conserva con el silencio nuevo).
- **Animación propia con `requestAnimationFrame`**, porque `scrollTo({ behavior: 'smooth' })` no
  admite curva ni se puede cancelar. Curva cúbica de entrada (`t³`): el primer tercio del tiempo
  recorre un 4 % del tramo, el último un 70 %. Así el arranque se lee como continuación del reposo
  y no como un tirón; el final rápido es lo que pidió Johan.
- **Duración** 600 ms más 300 por fracción de pantalla recorrida, con tope en 900 (un tramo de
  0,75 pantallas, el típico tras soltar a un cuarto, dura unos 825). Menos de 600 con `t³` se lee
  como un salto; más de 900, sumado al medio segundo de espera, deja la página más de 1,4 s en
  movimiento sin la persona.
- **Cancelable:** cualquier rueda, toque, tecla o clic, o un `scroll` que no sea el que el propio
  asentado acaba de poner, para la animación en el mismo evento. El gesto siguiente se mide desde
  donde la dejó el asentado (`yAnimado`), no desde `scrollY`: la rueda es pasiva y Chrome ya movió
  la página cuando llega su evento; medido desde `scrollY` el gesto daba 0 y el imán no volvía a
  actuar (hallazgo de la verificación). El `scrollend` que Chrome lanza en cada fotograma del
  asentado se ignora.
- Se conserva todo lo de D4 y D5: nunca hacia atrás, la rueda muesca a muesca atraviesa (con 500
  ms de espera, entre muescas nunca actúa), PageDown/PageUp/Espacio un bloque, sin imán con
  movimiento reducido, y los `scrollTo` del código ("Inicio", "Terminar", "Saltar mapa") no se
  tocan.

### Verificación (CDP, 2026-10-01; scratchpad de la sesión, `r4-P/`)

- Título (`geo.js`, `matriz.txt`): aire arriba y abajo de 32 y 31 (1280x800 y 1920x1080), 28,3 y
  27,5 (768x1024 y 1000x800), y 13,6 desde el CTA y 13 abajo en mobile (390x844, 375x667,
  360x740), en es, en y fr. Ningún renglón del título cruza el CTA. Las cinco pantallas caben
  bajo la franja (arte y texto dentro, alto igual al útil) en los 7 tamaños y 3 idiomas.
- Imán (`traza.js`, muestras cada 16 ms tras una rueda de 0,25 pantallas): primer movimiento a
  575 a 595 ms del fin del scroll (el asentado empieza a 500; el primer píxel con `t³` llega unos
  70 ms después); duración 687 a 722 ms; velocidad por tercios 0,12 a 0,15, 0,55 a 0,62 y 1,19 a
  1,40 px/ms, hacia abajo y hacia arriba, a 1280x800 y 390x844; llega al punto exacto. Una rueda
  a 300 ms de la primera reinicia la espera (el imán se mueve a 649 ms de la segunda). Una rueda
  hacia arriba en pleno asentado lo corta (235 a 90: sigue al usuario) y luego asienta en el punto
  de arriba, que quedó a menos del 30 %. Un clic más `scrollTo(0)` durante el asentado llega a 0.
- `iman.js`: muesca a muesca (100 px cada 150 y 250 ms) atraviesa Impacto en ambos sentidos a
  1280x800 (36 muescas) y 390x844 (39); 0,2 pantallas asienta en el siguiente y en el anterior
  (0 px); 0,05 se queda; PageDown y Espacio avanzan un bloque exacto; desde Quiénes somos sigue
  bajando.
- Toque emulado (`t4/touch.js impacto`, CPU 1 y 4, arrastres cada 700 y 1100 ms, que caen en la
  espera o en pleno asentado): ningún arrastre queda quieto más de 100 ms (máximos 16 a 87 ms; una
  corrida a CPU 4 dio 105 en el primer arrastre, antes de cualquier imán, y la repetición 0
  fallas). Reducido: tras 0,25 pantallas queda donde quedó. "Saltar mapa" y "Terminar" dejan
  Impacto en top 0 (`mapa.js`).
- `npm run type-check` y `npm run lint` limpios. Capturas `titulo-390x844.png` y
  `titulo-1280x800.png`.

## D7. Sin imán en táctil (2026-10-01)

> REEMPLAZADA por D9 (2026-10-06): Impacto pasó a scroll nativo; esta decisión ya no rige.

**Feedback** de Johan (1 de octubre): "en la sección de impacto creo que va a tocar quitar el auto
ajuste de la pantalla en mobile, cada vez que la toco salta, la experiencia es terrible".

**Qué se hizo** (`components/impacto/use-iman.ts`): el imán de D4 a D6 solo existe si el puntero
principal NO es el dedo. Con `(pointer: coarse)` el hook no registra ni un listener (ni `wheel`,
ni `touch*`, ni `scroll`, ni `keydown`): el scroll con el dedo es nativo del todo y nada asienta
tras soltar. Se sigue el `change` de la consulta y se registran o quitan en vivo (un iPad al que
se conecta un trackpad, la emulación de DevTools). En desktop con rueda o trackpad todo sigue
igual.

**Por qué `pointer: coarse`:** describe el puntero principal, así que es verdadero en iPhone,
Android y tablets táctiles, y falso en un portátil con trackpad o ratón aunque tenga pantalla
táctil. Descartados: `hover: none`, porque algunos Android (Samsung Internet) declaran `hover:
hover`; y el ancho (menor a md), porque una tablet de 1024 o más es táctil y una ventana estrecha
de portátil no lo es. Riesgo aceptado: un iPad con teclado y trackpad sigue declarando `coarse` y
queda sin imán, que es lo seguro.

**Lo que dependía del imán:** nada más. El título fijo (`TituloImpacto`, D5) es CSS, y la entrada
de bloques (`use-entrada-bloque.ts`) observa el elemento `[data-iman]` como atributo, no el hook.
Las pantallas siguen midiendo el alto útil y los `scroll-margin-top` siguen puestos (sirven a
"Saltar mapa" y "Terminar").

### Verificación (CDP, 2026-10-01; scratchpad de la sesión, `constructor-b/iman-tactil.js`)

- Con `Emulation.setTouchEmulationEnabled` (`pointer: coarse` verdadero) a 360x740, 390x844,
  430x932 y 1024x1366: `DOMDebugger.getEventListeners(window)` da 0 listeners de `useIman` y 0
  `touchmove`/`wheel`/`touchstart` no pasivos. Un arrastre táctil de 0,22 pantallas desde un
  punto de imán (`Input.synthesizeScrollGesture`, sin inercia) deja la página donde se soltó: 0 px
  de movimiento en los 2 s siguientes (antes el empujón del 15 % la llevaba al punto siguiente).
- Sin táctil a 1280x800 y 1512x982: 9 listeners de `useIman`, y una rueda de 0,2 pantallas asienta
  en el punto siguiente (5848 a 6329 y 6449 a 7075, exactos).
- Captura de Impacto a 390 (`impacto-390.png`): título fijo y bloques como antes.
- `npm run type-check` y `npm run lint` limpios.

## D8. El tembleque del título en mobile: alturas en `svh`, no `dvh` (2026-10-05)

> REEMPLAZADA por D9 (2026-10-06): Impacto pasó a scroll nativo; esta decisión ya no rige.

**Síntoma.** En el móvil, el título fijo de Impacto (D5) "tiembla" al hacer scroll.

**Qué se midió.** El título es `sticky top-0` de CSS puro, sin JS por frame. Por CDP a 390x844,
con táctil, gestos reales de scroll, con CPU 6x más lenta y con scroll programático, su
`getBoundingClientRect().top` vale 0,00 en todos los cuadros (oscilación 0 px): la caja del
título no se mueve en Chrome. Lo que sí depende del alto de la ventana es todo lo que hay debajo:
la fila del mapa y los cuatro pares median `min-h-[calc(100dvh-var(--alto-titulo))]` y el arte
`100dvh`. En un iPhone, la barra de Safari entra y sale mientras se hace scroll y `dvh` cambia
en cada cuadro de esa animación: los cinco bloques se reflowan debajo del título fijo, la
posición del contenido en el documento se corre y Safari, que resuelve el `sticky` aparte, lo
muestra como temblor. Simulando la barra (alto de 844 a 934 en vaivén mientras se avanza), la
posición de un bloque en el documento se corre 360 px con `dvh`.

**Arreglo.** Esas tres alturas pasan de `100dvh` a `100svh` (`impacto-section.tsx` y
`bloque-impacto.tsx`). `svh` es el alto con la barra desplegada y no cambia mientras se hace
scroll: el diseño deja de reflowarse. Con la barra recogida cada par queda una barra más bajo
que la pantalla (unos 80 px del par siguiente asoman); es el precio de la estabilidad, y el
mapa ya medía en `svh` (D3). En escritorio `svh` y `dvh` son iguales. No se tocan ni el imán de
JS ni la decisión de no usar `scroll-snap`.

**Límite de la verificación.** El emulador de Chrome no tiene barra dinámica: ahí `svh`, `dvh` y
`lvh` valen todos el alto emulado, así que el corrimiento de 360 px se ve igual antes y después.
Lo que sí se confirma es que el título sigue en 0,00 px y que el cambio no mueve nada a 390.
Falta confirmar en un iPhone real. Detalle en `docs/feedback-5-oct/PROGRESS.md`.

## D9. Impacto con scroll nativo (2026-10-06)

**Por qué.** Johan: la navegación de Impacto "sigue muy pero muy mal" y el título sigue temblando en
mobile aun con `svh` (D8). Pidió algo simple y nativo. Tras cuatro rondas (imán, título fijo,
alturas de pantalla) la causa común era la mecánica: altura atada al viewport, un título `sticky` y
JS que reposiciona el scroll. Se quita la mecánica.

**Qué se quitó.**

- El imán de JS entero (`use-iman.ts`, borrado) y con él los listeners de `wheel`, `touch*`,
  `keydown`, `pointerdown` y `scroll`. Tampoco hay CSS scroll-snap (decisión vieja de Johan).
- El título `sticky` y `--alto-titulo`: el título va una vez arriba, en flujo normal.
- Las filas del alto de un viewport (`min-h-[calc(100svh-...)]`), el tope de alto de las
  ilustraciones (`--fuera-del-arte`) y el encaje del mapa al alto (`--resto`). Todo mide su
  contenido.
- El `scroll` y `scrollend` de `useEntradaBloque`: ahora usa `useInView` de framer-motion
  (`once`, 30 % visible) y respeta `prefers-reduced-motion`.

**Cómo queda.** Título arriba (`mt-xl`, `lg:mt-xxl` hasta el mapa), y entre el mapa y cada bloque
el aire `xxl` de `docs/feedback-30-sep/AIRE.md`, más `pb-xxl` al cierre. Desktop conserva las dos
columnas alternadas (D1); mobile, imagen arriba y texto abajo a la distancia única (D2). Las
entradas siguen siendo las de CSS (`data-entrada`, `data-encendido`), disparadas una vez al
entrar en vista; el cambio de la ilustración llega 1,2 s después. La entrada tipo telón (D3) no
dependía del imán y se conserva (`useSinCortina`).

**Verificación (CDP, 2026-10-06).** A 390x844 con táctil y a 1280x800, scroll programático por
toda la sección, 287 y 275 elementos: oscilación de `top + scrollY` 0 px a 390 y 0,01 px a 1280
(redondeo de un path SVG), una vez terminadas las entradas. Sin `addEventListener` de
wheel, touch, scroll ni keydown en `components/impacto/`. Capturas a 390, 768, 1280 y 1920 sin
solapes. Pendiente: que Johan lo confirme en iPhone real.

**Ampliación (2026-10-07, revelados en el compositor).** Los revelados de `subir` (piscina),
`llenar` (copa) y `florecer` (persona) ya no animan `clip-path`, que repintaba imágenes grandes en
el hilo principal: ahora el padre recorta con `overflow: clip` y la capa se desliza (o crece) con
`transform`, con el movimiento inverso dentro (`.impacto-ventana` y `.impacto-contenido`,
`Despues` en `bloque-impacto.tsx`). Mismo aspecto (capturas a 390 y 1280 iguales, también a mitad
del círculo de la persona). Frames de más de 20 ms a CPU x4 en la sección: de 3,8 a 4,1 % a 0 a
0,5 %. Detalle en `docs/auditoria/SCROLL-MOBILE-6-OCT.md`.
