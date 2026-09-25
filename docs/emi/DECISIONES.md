# Bienvenida como hero y sección EMI: decisiones

Rama `23-sep-emi`, salida de `origin/main` en `9861451` (PR #21 ya en main). Figma
`ng8HnnYyaDJ2nTWauh7Otb`. Johan lo pidió el 2026-09-23: Bienvenida tenía dos partes (el hero
"Bienvenidx a Las Fuertes" y, debajo, el bloque "EMI / Educación menstrual integral como mapa de
cambio"); se separan.

---

## D1. Bienvenida es un hero de exactamente una pantalla

**Qué se pidió.** Bienvenida ocupa una pantalla y la sección siguiente no asoma por debajo en ningún
ancho. Composición como en Figma (mobile `1278:2`, 390 x 864; desktop `1280:9`, 1280 x 832): el
texto arriba y la ilustración de la playa anclada al fondo.

**Qué se hizo** (`components/welcome/welcome.tsx`):

- La sección es `flex min-h-dvh flex-col`. `dvh` porque es el idiom que ya usa la intro
  (`h-dvh` en el marcador del pin, `intro-section.tsx`) y porque `svh` dejaría asomar la sección
  siguiente cuando la barra del navegador móvil se esconde (la ventana crece y el hero no).
- La ilustración va en un `div` con `mt-auto`: se pega al fondo y todo el sobrante queda entre el
  texto y la playa. El `mt-10` propio de `IlustracionPlaya` es el aire mínimo bajo el texto.
- Aire inferior como en Figma: `pb-[3.3125rem]` (53 px, de 811 a 864 en mobile) y
  `lg:pb-[3.625rem]` (58 px, de 774 a 832 en desktop).
- Se quitó el bloque EMI (pasa a D2) y el rol `emi` de la llegada (`bienvenida.motion.ts`): ya no
  hay nada de EMI dentro de Bienvenida.

**Pantallas más bajas que el contenido: el hero crece, nunca solapa.** Es `min-h`, no `h`: si el
contenido no cabe, la sección se alarga y la siguiente sigue empezando justo en su borde inferior
(fuera de la pantalla). El texto nunca queda tapado por la ilustración. Medido por CDP con
`scripts/captura.js --ancla bienvenida --quieto` (borde inferior de `#bienvenida` = inicio de
`#emi` en todos los casos):

| Ventana   | Alto del hero | Qué pasa                                                        |
| --------- | ------------- | --------------------------------------------------------------- |
| 390x664   | 860           | crece 196; la playa acaba en 807, se corta la mujer por debajo  |
| 390x844   | 860           | crece 16; la playa entera se ve (acaba en 807), solo sobra aire |
| 390x932   | 932           | exacto                                                          |
| 768x1024  | 1081          | crece 57; la ilustración mobile estirada a 768 mide 478 de alto |
| 1024x768  | 776           | crece 8; la playa entera se ve (acaba en 718)                   |
| 1280x720  | 831           | crece 111; la mujer se corta 53 px por debajo                   |
| 1280x832  | 832           | exacto (el lienzo de Figma)                                     |
| 1512x982  | 982           | exacto                                                          |
| 1920x1080 | 1080          | exacto                                                          |

El contenido natural mide 860 en mobile 390 (Figma: 864) y 832 en desktop 1280 (Figma: 832).

**Por qué no se comprime en pantallas bajas.** Lo único comprimible es el aire (arriba, bajo el sol,
entre texto y playa, abajo: unos 130 px en mobile y 210 en desktop). Para 1280x720 harían falta
111 px, casi todo ese aire, y el hero dejaría de parecerse al diseño. Johan pidió explícitamente
preferir que crezca antes que solapar. Queda como opción en PROGRESS.

**La llegada desde la intro no cambia.** Parte 3 + inercia normal a 390x844 y 1280x832: `scrollY`
queda en el alto de la ventana, `#bienvenida` en `top = 0`, sin `data-intro-llegando`, 0 piezas
con opacidad distinta de 1 a los 4,5 s. El reposo (rayos, pelo, gaviotas) no se tocó.

---

## D2. EMI es una sección propia que contiene el slider de principios

**Qué se pidió.** "Educación menstrual integral como mapa de cambio" pasa a su propia sección, entre
Bienvenida y lo que era Principles, y el slider queda dentro de ella como su segunda mitad. Figma:
mobile `1288:913` (390 x 1034), desktop `1288:676` (1280 x 956).

**Qué se hizo** (`components/emi/emi-section.tsx`, id `emi`, montada en `pages/index.tsx`):

- **Fondo `bg-cream`** (`#FFEBC6`, el de Figma exacto). Ya existía el token (el de Quiénes somos);
  Bienvenida sigue sobre el `beige` de la página.
- **Chip "EMI"** sin las palomas: el chip rasgado del sitio (`map-chip`) con una variante nueva,
  `map-chip--emi` en `styles/global.css`: fondo `pink-sol` (`#F57DB7`, el de Figma), -4,09 grados,
  poco aire lateral. Texto `text-beige` a 40 px (52 en desktop). Mide 77 x 43 en mobile (Figma
  79 x 44) y 98 x 55 en desktop (Figma 102 x 57). `emi-dove.svg` queda en `public/` sin uso.
- **Título**: 30 px con interlínea 32 y tracking -0,04 em en mobile (tres líneas, `text-balance`
  para que corte como Figma: "Educación menstrual / integral como / mapa de cambio"); 40 px en
  desktop, dos líneas centradas (caja de 640, Figma 639).
- **Párrafos** alineados a la izquierda, 16 px (18 en desktop), interlínea 1,2, separados por una
  línea en blanco (`mt-[1.2em]`); caja de 806 en desktop (Figma 806).
- **"Así lo comprendimos nosotras:"**: la cinta negra con texto crema es el chip rasgado con la
  variante nueva `map-chip--cinta` (-0,54 grados, como Figma). 20 px en mobile, 25 en desktop.
  Vive en la sección EMI, justo antes del slider, porque el título viejo está dentro de
  `components/principles/` y ese directorio lo trabaja otro constructor en paralelo (ver PROGRESS).
- **Posiciones medidas** (px desde el borde superior de la sección, Figma entre paréntesis).
  Mobile 390: chip 49 (45 a 50), título 114 (114), párrafos 228 (228), cinta 504 (503). Desktop
  1280: chip 72 (70), título 152 (152), párrafos 284 (284), cinta 445 (448).
- **Entrada**: `FadeIn` por piezas, el texto primero y en orden de lectura (chip, título con 0,08 s,
  párrafos con 0,16, cinta con 0,24). Nada más: sin animaciones nuevas. El slider no se envuelve.
- **Copy**: el español coincide palabra por palabra con Figma, así que no cambió. Las claves se
  movieron de `welcome.emiTitle/emiParagraph1/emiParagraph2` a `emi.title/paragraph1/paragraph2`
  en es, en y fr, y se añadió `emi.comprendimos` (mismo texto que `principles.title` en cada
  idioma). En inglés se quitó la raya larga de `paragraph1` ("is born, our ...").

**Fuente de acento.** La fuente de acento pasará a Bradley Hand en otra iteración (Johan,
2026-09-23): no es de Google Fonts, hace falta el archivo con licencia web. Figma ya la usa en las
tarjetas del slider ("Cada niña es un mar de derechos").

## D3. Slider como estampillas y pulgar en vez de SWIPE

**Qué.** Las cuatro fotos del slider "Así lo comprendimos nosotras" pasan a ser estampillas, en
este orden: 1297:5 (Cada niña es un mar de derechos), 1297:6 (Educación menstrual como mapa de
cambio), 1297:4 (Juntas florecemos, juntas somos más fuertes) y 1297:2 (Yo soy fuerte, yo decido).
Cada una es UNA imagen exportada de Figma a 2x (701x669, recortada al rectángulo de la estampilla
de 349x333 porque 1297:4 y 1297:2 traían 11 y 27 px de foto que sobresalían por debajo), en webp
calidad 82 con alfa: entre 56 y 82 KB cada una. Viven en
`public/images/principles/estampillas/`. Las `slide_1..4.jpg` viejas siguen ahí, sin uso.

**Por qué horneadas.** El texto va en letra manuscrita (Bradley Hand), girado y encima de un
degradado; rehacerlo en HTML necesita la fuente con licencia web (pendiente, ver D2) y rompería el
parecido. Por eso el texto se queda SIEMPRE en español, como al principio. Lo que sí se traduce es
el alt (`principles.estampillas.1..4` en es, en y fr), con el texto que se lee en la estampilla.

**El mazo.** Sigue siendo Swiper (arrastre y swipe, loop, autoplay de 4,5 s solo con el slider en
pantalla, flechas, más teclado y A11y, que son módulos de Swiper, sin dependencias nuevas). Lo
nuevo es un efecto propio, `components/principles/efecto-mazo.ts`: cada estampilla toma una pose
según su profundidad en el mazo, medida en Figma contra el ALTO de la de enfrente:

| Profundidad | Desktop y tablet, abanico (1288:676) | Mobile, pila (1288:913)    |
| ----------- | ------------------------------------ | -------------------------- |
| 0 (frente)  | sin giro                             | sin giro                   |
| 1           | x -0,353, y +0,010, -3,83°           | x +0,010, y -0,025, -2,28° |
| 2           | x +0,189, y -0,099, +5,38°           | x -0,024, y -0,073, -3,06° |
| 3           | x +0,567, y +0,025, +5,38°           | escondida tras la 2        |

Al avanzar, la de enfrente sale en arco hacia la izquierda (62 % de su ancho, -9° extra en el punto
medio) y a mitad de camino pasa al fondo, como quien baraja. La transición la interpola el JS
(700 ms, sine.inOut) en vez de una transición CSS, porque con CSS iría en línea recta y cambiaría
de capa al instante. `longSwipesRatio` baja a 0,3: con la estampilla de 360 px, un arrastre lento
de 200 px no llegaba al 0,5 por defecto y la estampilla volvía a su sitio.

Tamaños (`principles.module.css`): mobile `min(349px, 89,5vw)`, tablet 320 px, desktop 360 px. El
diseño desktop dibuja la estampilla apaisada (467x333) y el export es casi cuadrado, así que se
igualó el ALTO (343 contra 333): con 400 px de ancho el abanico crecía 50 px y se salía del frame
de 956. A 1280x956 el abanico ocupa y 505 a 915, como en Figma (506 a 922).

**Flechas.** El diseño no las muestra. Siguen en el DOM, con `sr-only`, y aparecen (44x44, a los
lados) solo al recibir el foco con el teclado. Además funcionan las flechas izquierda y derecha
del teclado cuando el slider está en pantalla (`pageUpDown: false`, para no robar el scroll).

**Pulgar en vez de "SWIPE"** (`pulgar-deslizar.tsx`). Una mano con el índice arriba (trazo del
icono `pointer` de lucide) y una flecha doble, en el color `black`, de 40 px, donde el diseño pone
la palabra: en desktop a la derecha de la estampilla azul del fondo, a la altura del borde de
abajo; en mobile y tablet debajo, alineada a la derecha. Vaivén de 8 px, 1,6 s de ida y vuelta con
sine.inOut y 0,4 s de pausa (ciclo de 2 s), solo con el slider en pantalla. Se va con un fundido
de 0,45 s la primera vez que la persona usa el slider (arrastre, swipe, flecha en pantalla, flecha
del teclado o clic en una estampilla de atrás, que `slideToClickedSlide` trae al frente) y no
vuelve en esa visita (variable del módulo, sin persistir). El autoplay no cuenta como uso. Con
prefers-reduced-motion se queda quieto, el cambio de estampilla es de 250 ms sin arco y no hay
autoplay. Es `aria-hidden`: las instrucciones para lectores de pantalla van en un texto `sr-only`
(`principles.instrucciones`) enlazado con `aria-describedby`.

**Montaje.** Solo la sección EMI monta el slider, así que `PrinciplesSection` dejó de pintar su
`<section>`, el fondo `bg-beige`, el padding y el `<h2>`: ahora es solo el slider. Recibe
`etiquetadoPor` (el id del título que lo nombra); EMI le pasa `emi-title`. La clave
`principles.title` quedó sin uso en locales.

**Cómo se verificó.** Capturas con `scripts/captura.js --ancla estampillas` a 390, 768, 1024,
1280, 1512 y 1920, y `--ancla emi` a 390x1034 y 1280x956 contra 1288:913 y 1288:676. Por CDP: el
swipe táctil (390), el arrastre con ratón (1280) y la flecha derecha del teclado cambian de
estampilla. El pulgar desaparece del DOM antes de 0,7 s y sigue sin estar a los 3,7 s. Antes de
usarlo, su `transform` cambia entre muestras tomadas cada 250 ms; con reduced-motion se queda en
`none`. La flecha oculta mide 44x44 al enfocarla.

**Ampliación tras la verificación independiente (2026-09-23).**

- _Aire como el frame._ Mobile: `--aire-arriba` 0,258 del alto (86 px) y 8 px bajo el pulgar. A
  390x1034 la sección mide 1035 (Figma 1034), el mazo empieza en 609 (608) y el pulgar va de 987
  a 1027 (987 a 1028). Desktop: aire 0,18 y padding inferior 0,155 del alto. A 1280x956 la
  sección mide 957 (956), la de enfrente empieza en 554 (560) y el abanico acaba en 920 (922).
- _Pulgar y botón flotante._ Con el slider centrado a 390x844, el pulgar (329 a 369, 613 a 653)
  queda libre. Solo cuando el final de la sección toca el borde de abajo de la pantalla lo tapa
  el flotante SÚMATE (247 a 365, 771 a 819). Se dejó en la esquina del diseño.
- _Tablet._ El pulgar ya no se pega al borde: `margin-left` con tope de `100% - 5rem`. A 768
  queda en x 669 a 709, dentro del margen del grid.
- _Teclado propio._ Se quitó el módulo Keyboard de Swiper, que escucha en `document` y movía el
  slider por detrás del drawer. Ahora las flechas izquierda y derecha solo mueven el slider si
  está en pantalla, si el foco no está en un campo ni en un `[role=dialog]`, y si no hay ningún
  `[aria-modal="true"]` abierto (el drawer de Súmate, el modal de contacto o la ruta del mapa).
- _Autoplay._ El IntersectionObserver creado en `onSwiper` moría en el doble montaje de
  StrictMode, y en dev el autoplay nunca arrancaba. Ahora un efecto decide `start` o `stop` con
  la instancia en estado, el `useInView` del pulgar y el foco. El autoplay rota solo si el slider
  está en pantalla, no tiene el foco del teclado, no hay reduced-motion y aún no hubo
  interacción. Tras la primera interacción se para y no vuelve (`disableOnInteraction: true`).
  Por CDP en dev: la estampilla avanza a los 6 s, se para con el foco dentro y vuelve al salir.
- _aria-live._ Vale `off` mientras rota solo y `polite` en cualquier otro caso (pausado, con el
  foco dentro, con reduced-motion o tras la interacción).
- _Nombre del carrusel._ `aria-labelledby="principios"`, el id de la cinta "Así lo comprendimos
  nosotras:" (`scroll-mt-xl`). El enlace "Nuestros principios" del footer apunta a `#principios`:
  con un clic se desplaza hasta la cinta.
- _Cinta en francés._ A 390 no cabía en una línea: 335 px de texto con `text-h3` y 299 px de
  columna útil. Bajo `lg`, en francés, pasa a `text-h4 tracking-tighter` (296 px) y queda en una
  línea de 35 px de alto. El espacio antes de ":" es ahora duro (U+00A0).

**Segunda ronda: feedback de Johan con su trackpad y su móvil (2026-09-23).**

- _El pulgar ya no se desmonta._ Al usar el slider, el pulgar salía del DOM (`AnimatePresence`).
  En mobile y tablet ocupa su propia fila, así que la sección perdía 52 px y lo de debajo saltaba
  hacia arriba. Ahora se queda montado y solo baja la opacidad a 0 (0,45 s), sin cambiar el alto.
  Por CDP a 390x844, 768x1024 y 1280x956: el `top` de la sección siguiente es idéntico antes y
  2 s después de usarlo, y el PerformanceObserver de layout-shift no registra nada.
- _El salto al arrastrar._ Muestreo por frame (rAF) con arrastres del ratón por CDP: corto sin
  llegar al umbral, largo, flick, hacia la derecha y con la flecha del teclado, a 1280, 1512 y 390. Swiper no escucha la rueda horizontal: no hay módulo Mousewheel. Tres causas:
  1. La de enfrente cambiaba de capa a mitad de camino (progreso 0,5), encima de las demás: unos
     107.000 px² de solape en ese frame, un 85 % de la estampilla. Era el salto visible.
  2. Iba y volvía contra el gesto: primero a la izquierda y, sin soltar, de vuelta a la derecha
     hacia el fondo, más rápida que el dedo (a 1,4x).
  3. Al soltar, la interpolación arrancaba desde velocidad 0 (sine.inOut). La estampilla se
     frenaba en seco y luego volvía a acelerar.
- _Coreografía nueva_ (`efecto-mazo.ts`, `colocar`):
  1. Hasta 0,3 de progreso (el umbral de avance) la de enfrente va pegada al dedo, 1:1.
  2. De 0,3 a 0,6 sale lanzada con la velocidad que traía y frena hasta parar en un punto libre
     de todas las demás. Ese punto se calcula con las poses que llevan en ese momento, a 1,14
     anchos de la que queda más a la izquierda. Allí cambia de capa sin tapar a ninguna y gira
     -9° como una carta lanzada.
  3. De 0,6 a 1 vuelve por detrás a su pose del fondo, arrancando y llegando sin velocidad.
  4. Las de atrás se reacomodan interpoladas con el progreso.
  5. Al soltar, la curva es una Hermite cúbica: arranca con la velocidad del gesto y termina
     parada (ease-out). Desde quieto (flechas, teclado, autoplay) es ease-in-out, así que todas
     usan la misma coreografía. Si la velocidad pediría rebote, se acorta la duración (mínimo
     280 ms).
  6. La duración pasa de 700 a 1000 ms (ritmo pausado).
- _Números, antes y después_ (máximo por frame de 16,7 ms):
  - Solape en el cambio de capa: unos 107.000 px² en desktop y mobile antes, 0 en desktop
    después. En mobile quedan menos de 500 px² de caja, las esquinas giradas.
  - Arrastre largo a 1280: 14 px antes, 39 px después. La estampilla ahora recorre de verdad
    lo que el dedo manda.
  - Tecla a 1280: 23 px antes, 50 px después. El pico ocurre mientras vuelve por detrás.
  - Flick a 1280: 39 px antes, 55 px después, al ritmo del gesto.
  - Arrastre corto sin llegar al umbral: 7 px antes, 5 px después. Vuelve a su sitio sin
    cambiar de capa.
  - Giro máximo por frame: 1,3° después, contra 1,8° antes.
  - Mobile: tecla 17 px antes y 33 px después; flick 55 px antes y 48 px después.
  - Queda más rápida la vuelta por detrás cuando se arrastra hacia la derecha (58 px por frame),
    porque recorre el mazo entero en el tramo que el dedo tarda en hacer 0,4 anchos. Casi todo
    ese recorrido queda tapado por las de delante.

**Tercera ronda: agarrar el mazo a mitad de una transición (2026-09-23).**

- _Bug._ Con un gesto nuevo antes de que acabara la transición de 1 s (dos flicks a 300 ms, o
  soltar y volver a agarrar), las cuatro estampillas saltaban en un frame a su destino: 293 px a
  1280 y 300 px a 390, según el verificador; 207 px en mi muestreo. Con `virtualTranslate`, al
  empezar el arrastre Swiper ya tiene el `translate` del destino anterior, y el efecto cancelaba
  la interpolación y pintaba ese destino. Además, dos flechas seguidas avanzaban una sola
  estampilla: Swiper descarta la segunda mientras anima en loop.
- _Arreglo (decisión del orquestador: no bloquear la interacción)._ `efecto-mazo.ts` separa tres
  piezas:
  - El `camino` es la transición en curso, en progreso.
  - Si llega algo nuevo a mitad de ese camino, se convierte en un `resto` VISUAL (px y grados
    entre lo que se ve y la base nueva), que se desvanece con la curva que le quedaba. En
    progreso no sirve: la vuelta por detrás es tan larga que sumar progreso la hace saltar
    cientos de px.
  - La estampilla que estaba en vuelo (saliendo o volviendo por detrás) termina su `vuelo` tal
    cual, con su capa y su punto libre, y luego se funde en 400 ms a su sitio nuevo. La que ya
    volaba va por encima de la que sale después.
  - En la vuelta por detrás, la capa crece con el avance (0 a 9, bajo el fondo que es 10), para
    que dos que vuelven a la vez no empaten.
  - A Swiper se le da la transición por terminada enseguida (`transitionend` en el siguiente
    tick): una segunda tecla encadena otro avance desde la pose visible.
  - Los saltos de n en el progreso que provoca el loop de Swiper se descartan (el mazo es
    circular).
  - El punto libre pasa de 1,14 a 1,22 anchos para dejar sitio a dos en vuelo.
- _Números_ (máximo por frame, muestreo rAF por CDP, 1280x832 ratón y 390x844 táctil):
  - Dos flicks a 300 ms: de 207 px (y 4,5°) a 74 px (1,6°) en 1280, y de 145 a 50 px en 390.
  - Agarrar a 350 ms: 57 px en 1280 y 50 en 390.
  - Dos flechas a 300 ms: antes avanzaba una; ahora avanzan dos, con 53 px en 1280 y 39 en 390.
  - En los tres casos el reposo final es idéntico al diseño.
  - Solape en los cambios de capa: 0 en flicks y agarres. Con dos flechas quedan 6.681 y
    3.486 px² de caja (sin girar), un roce de esquinas en diagonal que en la forma girada real
    no se toca.
  - Sin regresiones en los casos de la segunda ronda: capa sin solape, velocidad al soltar,
    vuelta suave bajo el umbral, pulgar sin salto de layout, autoplay cada 4,5 s.

---

## D4. Exploración del indicador de swipe

**Qué se pidió** (Johan, 2026-09-24). No le gustó el pulgar animado de D3 como pista de
"desliza". Se exploran otras opciones, se construyen tres distintas y se dejan conmutables para
que las pruebe en su celular.

**Las tres opciones que se construyeron** (una por archivo; tras la elección de abajo se borraron
`pista-a-amago.tsx`, `pista-b-flecha.tsx`, `pista-c-puntos.tsx`, `pista-amago.ts` y el parámetro
`?swipe`):

- **A. Amago de la estampilla** (`pista-a-amago.tsx`, recomendada, la de por defecto). Sin
  icono: la estampilla de enfrente hace el gesto que se espera de la persona. Anticipación (se
  echa 2 % a la derecha), tirón a la izquierda de un 9 % de su ancho con giro de -4° desde el
  borde de abajo, vuelta con un sobrepaso de 1 % (seguimiento) y reposo exacto. 1,5 s; el primero
  a los 1,8 s de entrar en pantalla o de cada cambio de estampilla (la transición del mazo dura
  1 s), luego cada 4,2 s, así cae una vez entre dos avances del autoplay (4,5 s). En el hueco de
  la pista no se pinta nada.
- **B. Flecha dibujada a mano** (`pista-b-flecha.tsx`). En el sitio del "SWIPE" del diseño, la
  palabra "desliza" (en/fr: "swipe", "glisse"; clave `principles.pista`) en la letra manuscrita
  del sitio (Homemade Apple, la de Bienvenida) y una flecha curva, ambas en `blue`. Primero se
  escribe la palabra (0,9 s, recorte de izquierda a derecha), después se traza la flecha desde la
  palabra hacia la izquierda (0,9 s, `pathLength`, que framer-motion lleva con
  `stroke-dashoffset`) y al final la punta (0,3 s). Ya dibujada, la flecha se mece 6 px hacia la
  izquierda cada 3 s. Se dibuja una sola vez, la primera que el slider entra en pantalla.
- **C. Puntos y la siguiente asomando** (`pista-c-puntos.tsx`). Cuatro puntos de borde
  irregular en `blue` centrados bajo la pila (el de la estampilla de enfrente, relleno). Cada
  4,2 s la estampilla SIGUIENTE sube por detrás un 11 % de su alto con -3°, se sostiene, cae con
  un leve rebote y vuelve exacta; a la vez su punto da un saltito de 5 px. Mismo arranque que A.

**Motor común de A y C** (`pista-amago.ts`, se borra si gana B). El amago se hace con la Web
Animations API sobre un hijo nuevo de cada slide, `[data-estampilla-cuerpo]`, que envuelve la
imagen. El slide lo mueve el efecto mazo con su `transform`; el cuerpo no tiene transform propio,
así que el amago se suma a la pose sin pelearse con el mazo, y al terminar el reposo es el del
diseño (regla 11). Si la persona agarra el mazo a mitad de un amago, el cuerpo vuelve a su sitio
en 200 ms desde donde esté, sin salto; el arrastre y el autoplay no se tocaron.

**Reglas comunes.**

- El hueco de la pista (`.pista` en `principles.module.css`) existe siempre con el mismo alto
  (2,5 rem y 0,75 rem de margen, lo que medía el pulgar), aunque la opción A no pinte nada. Así
  la sección mide lo mismo con las tres opciones y aparecer o irse no mueve nada.
- Se van para siempre en esa visita con el primer uso (arrastre, swipe, flecha en pantalla o de
  teclado, clic en una de atrás), con la misma variable de módulo que tenía el pulgar
  (`pistaUsadaEnEstaVisita`). B y C se funden en 0,45 s y siguen montadas; A deja de disparar y
  su amago en curso vuelve a reposo. El autoplay no cuenta como uso.
- `prefers-reduced-motion`: A no hace nada; B aparece ya dibujada y quieta; C deja los puntos
  quietos y la estampilla no asoma.
- Son `aria-hidden`: las instrucciones para lectores de pantalla siguen en
  `principles.instrucciones`.
- `pulgar-deslizar.tsx` se borró.

**Recomendación: A.** Es la única que no añade nada al diseño: la propia estampilla dice "se me
puede arrastrar" con el gesto exacto que tiene que hacer el dedo, hacia donde sale en el mazo.
Usa los principios que Johan valora (anticipación y seguimiento), vive en la protagonista y no en
un adorno (regla 6), y en reposo la pantalla es idéntica al diseño. Es además el patrón que la
gente ya conoce de las pilas de tarjetas en el móvil. B es la más "de la casa" por la letra y el
trazo, pero es texto y flecha extra que compiten con el título de la estampilla; C explica
también cuántas hay, pero los puntos son un elemento de interfaz que desaparece, lo que se lee
raro, y el asomo de la de atrás dice "hay más" más que "arrastra".

**Cómo probarlas.** Con el dev server: `http://localhost:3000/?swipe=a#principios`, `?swipe=b` y
`?swipe=c` (sin parámetro, A). Como la pista se va para siempre en la visita, para volver a verla
hay que recargar la página.

**Cómo se verificó** (CDP propio, Chrome headless: cargar con el parámetro, llevar el slider al
centro de la pantalla, capturar la secuencia, medir, arrastrar 180 px con el ratón, medir, subir
al principio de la página y volver, medir). Para las tres opciones a 390x844, 390x664 y
768x1024, y A también a 1280x832:

- Salto de layout: 0 px. Título, primer párrafo, cinta, contenedor del mazo, hueco de la pista y
  sección siguiente, medidos contra el borde superior de `#emi`, idénticos antes del arrastre,
  2 s después y tras salir y volver a la sección. El PerformanceObserver de layout-shift no
  registra nada.
- Tras el arrastre la estampilla avanza (índice 0 a 1), la pista se va (`data-visible` fuera,
  opacidad 0 en B y C, ninguna animación corriendo en los cuerpos en A y C) y no vuelve tras
  salir y volver a la sección (6,5 s en pantalla, más que un ciclo).
- Sin desborde horizontal (`scrollWidth` igual al ancho de la ventana en todas).
- Con `prefers-reduced-motion` a 390x844: A y C sin animaciones en los cuerpos; B dibujada y
  quieta desde el primer instante.
- Capturas en
  `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-24-sep/3826136d-6674-498b-b321-d960b35db571/scratchpad/swipe/`:
  `<opcion>-<ms>-<ancho>.png` (cuatro instantes por opción; ms desde que el slider llega a
  pantalla), `<opcion>-reducido-*` y `<opcion>-tras-uso-<ancho>x<alto>.png`.

**Elección de Johan (2026-09-25): la mezcla de A y B.** La estampilla amaga el arrastre y la
flecha manuscrita la acompaña, coreografiadas como un solo gesto. Queda un único componente,
`components/principles/pista-deslizar.tsx`, sin parámetro:

1. El texto primero (regla 2): "desliza" se escribe en 0,9 s.
2. Desde 0,45 s, solapada (regla 1), la flecha se traza de la palabra hacia la izquierda en 0,9 s
   y la punta se marca de 1,3 a 1,6 s.
3. Al cerrar la punta, sin pausa, la estampilla de enfrente hace lo que la flecha dice: el amago
   de A (anticipación a la derecha, tirón de 9 % con -4°, vuelta con sobrepaso, 1,5 s). La flecha
   hace el mismo tirón con los mismos tiempos y curvas (0,4 rem), en vez del vaivén propio que
   tenía B: se leen como un gesto, no como dos cosas moviéndose a destiempo.
4. Luego se repite el amago (estampilla y flecha juntas) a los 1,8 s de cada cambio de
   estampilla y cada 4,2 s, una vez entre dos avances del autoplay.

Desktop: la flecha va SOBRE la palabra (columna) y el hueco pasa de 1,12 a 1,15 altos del centro
del mazo y 1 rem más arriba. En fila, a 1024 se salía de la sección y a 1280 la punta rozaba la
azul de la derecha durante el tirón. Mobile y tablet: fila, flecha a la izquierda de la palabra,
en el hueco de siempre.

Se mantiene todo lo de las reglas comunes: hueco de alto fijo, se va para siempre con el primer
uso (fundido de 0,45 s; el amago en curso vuelve a reposo en 200 ms), con reduced-motion aparece
dibujada, quieta y sin amago, `aria-hidden`. Clave `principles.pista` en es, en y fr (la única
nueva que sigue en uso).

**Verificado (2026-09-25)**, mismo CDP a 390x844, 390x664, 768x1024, 1024x768 y 1280x832:
0 px de cambio en título, párrafo, cinta, mazo, hueco y sección siguiente antes del arrastre,
tras él y tras salir y volver; layout-shift vacío; `scrollWidth` igual al ancho; tras el
arrastre avanza la estampilla, la pista queda en opacidad 0 y sin animaciones, y no vuelve. Con
reduced-motion a 390x844, dibujada desde el primer instante y sin animaciones. Secuencia en
`scratchpad/swipe/mezcla-<ms>-<ancho>.png` a 300 (se escribe la palabra), 1000 (se traza la
flecha), 2300 (tirón) y 2750 ms (sobrepaso), más `mezcla-2300-390x664.png`,
`mezcla-2300-1024x768.png`, `mezcla-reducido-*` y `mezcla-tras-uso-*`.
