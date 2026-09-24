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
