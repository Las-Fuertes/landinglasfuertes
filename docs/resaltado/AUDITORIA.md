# Auditoría del resaltado (chip rasgado)

Fecha: 2026-09-24. Rama `24-sep-resaltado`, punta `7066bfc` (origin/main), árbol limpio. Solo
lectura: no se tocó código. Dev server del propio worktree en `:3000` (comprobado con `lsof`).

Alcance: el texto resaltado con fondo negro rasgado y texto claro (`.map-chip` y afines), cómo
se comporta al cortar líneas y cuánto se aleja de Figma (archivo `ng8HnnYyaDJ2nTWauh7Otb`). La
calidad de las traducciones la revisa otro auditor (`docs/resaltado/COPIES.md`).

Evidencia en el scratchpad de la sesión
(`/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-24-sep/3826136d-6674-498b-b321-d960b35db571/scratchpad/resaltado/`):

- `<seccion>-<lang>-<ancho>.png`: 72 capturas (6 usos x es/en/fr x 390, 768, 1280, 1920), todas
  por encima de 10 KB.
- `recortes/`: acercamientos de los casos citados abajo.
- `figma/`: capturas de los 14 frames de Figma.
- `resultados.json`, `matriz.txt`, `tabla2.txt`: mediciones por CDP de cada chip.
- `audit.js`: el medidor (basado en `scripts/captura.js`). Si se adopta el criterio de la sección
  5, conviene copiarlo a `scripts/` en la entrega del constructor: el scratchpad no persiste.

## Resumen

- **12 usos** del resaltado en el código (9 con `.map-chip`, la cinta de papel de Donaciones y
  dos títulos del drawer de Súmate con `.donation-title-chip`).
- **Figma usa una sola pieza visual** (fondo `#242424` con textura rasgada, texto `#FFF5E8` en
  negrita) con **tres geometrías**: en línea dentro de un párrafo, título apilado por líneas y
  etiqueta de una línea. Más dos piezas propias (el sello rosa "EMI" y la cinta de papel de
  Donaciones). Solo hay **tres giros**: -0,54° (casi todo), -1,23° (títulos de Impacto) y -4,09°
  (sello EMI). No hay variantes de tamaño: el chip sigue a la letra del contexto.
- **Causa raíz de los dos problemas que reporta Johan:**
  1. _Fondo a todo el ancho_: `.map-chip` es un `inline-block`. Cuando su texto no cabe en una
     línea, el `inline-block` se parte por dentro y pasa a medir el ancho disponible entero, con
     una sola pieza negra detrás de las dos líneas. Pasa en francés en la Introducción (parte 3, 390) y en Impacto ("La compréhension des", los 4 anchos).
  2. _Fondo que tapa las líneas vecinas_: el fondo mide 1,5 em de alto (relleno `0.08em` arriba y
     `0.16em` abajo sobre un interlineado de 1,25) contra 1,15 em en Figma, y gira -1,2° en vez
     de -0,54°. En la Introducción pisa la línea de arriba entre 1,6 y 8,5 px en los 3 idiomas y
     los 4 anchos.

## 1. Inventario

| #   | Uso (sección)                                   | Código                                                                                                               | Texto o clave                                                               | Frame de Figma                                                                                            |
| --- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1   | Introducción, parte 1                           | `components/intro/intro-section.tsx:233` vía `renderTextWithMarks` (`lib/render-text-with-bold.tsx:30`, `.map-chip`) | `hero.section1.text2` (`==hablar de menstruación==`)                        | m `1159:735` (rect `1230:100`) / d `1152:287` (rect `1177:1743`)                                          |
| 2   | Introducción, parte 3                           | igual que 1                                                                                                          | `hero.section3.title` (`==¿por qué hablar ahora?==`)                        | m `1152:186` (rect `1230:104`) / d `1174:1556` (rect `1224:84`)                                           |
| 3   | EMI, sello "EMI"                                | `components/emi/emi-section.tsx:38`, `.map-chip.map-chip--emi`                                                       | "EMI" fijo en el código                                                     | m `1288:913` (rect `1288:982`) / d `1288:676` (rect `1288:1094`)                                          |
| 4   | EMI, cinta del slider                           | `components/emi/emi-section.tsx:65`, `.map-chip.map-chip--cinta`                                                     | `emi.comprendimos`                                                          | m `1288:913` (rect `1288:978`) / d `1288:676` (rect `1288:1097`)                                          |
| 5   | Donaciones, título                              | `components/donations/titulo-cinta.tsx` (`TituloCinta`), estilos en `donations.module.css` (`.linea::before`)        | `donations.title`                                                           | m `1288:1478` (rects `1288:1434` a `1440`) / d `1288:1594` (rects `1288:1722`, `1723`, `1294:1762`)       |
| 6   | Impacto, 4 títulos de bloque                    | `components/impacto/bloque-impacto.tsx:140` vía `renderTextWithMarks`                                                | `impacto.bloques.{piscina,duchas,copa,nina}.title` (un `==...==` por línea) | solo mobile: `1102:162`, `1102:322`, `1103:544`, `1102:400`                                               |
| 7   | Impacto, cierre del mapa                        | `components/impacto/mapa-impacto.tsx:115` vía `renderTextWithMarks`                                                  | `impacto.mapa.cierre`                                                       | solo mobile: `1102:3` (rects `1102:52`, `1102:53`)                                                        |
| 8   | Impacto, 7 etiquetas del mapa                   | `components/impacto/mapa-impacto.tsx:100`, `.map-chip.whitespace-nowrap`                                             | `impacto.mapa.territorios.*`                                                | `1102:60` (fuera de la lista pedida; ver `docs/secciones-impacto/DECISIONES.md`)                          |
| 9   | Quiénes somos, 9 nombres                        | `components/quienes-somos/quienes-somos-section.tsx:73`, `.map-chip.whitespace-nowrap`                               | nombres de `quienes-somos.data.ts` (no se traducen)                         | solo mobile: `1219:985` (rects `1219:910` a `980`)                                                        |
| 10  | Mapa educativo, título del modal                | `components/education-map/route-sheet.tsx:136`, `.map-chip.map-chip--cinta !px-3 !py-1`, una pieza por `\n`          | `educationMap.routes.*.name`                                                | `894:754`, `907:2996`, `910:3589`, `959:8352`, `959:10655` (ya implementado, no se rehízo la comparación) |
| 11  | Súmate (drawer), "Nuestro proyecto ahora mismo" | `components/sumate/proyecto-destacado.tsx:52`, `.donation-title-chip`                                                | clave del drawer                                                            | sin frame                                                                                                 |
| 12  | Súmate (drawer), título de "Donar cosas"        | `components/sumate/donar-cosas.tsx:69`, `.donation-title-chip`                                                       | clave del drawer                                                            | sin frame                                                                                                 |

No usan chip, aunque aparecen en los frames: el título del mapa (`1311:14`, `components/education-map/map-title.tsx`,
texto negro sin fondo) y los nombres de ruta pintados sobre el mapa (rects `1311:199` y
siguientes), que en el código van **dentro del raster** `public/images/education-map/mapa-ruta-*`
y por tanto no se traducen (aviso para el auditor de textos).

## 2. Especificación de Figma por uso

Leída con `use_figma` (lectura) sobre cada rectángulo y cada tramo de texto. Figma gira en
sentido antihorario con valores positivos: su `0.54` es `rotate(-0.54deg)` en CSS. Todos los
fondos negros llevan el efecto `TEXTURE` (borde rasgado) y el texto resaltado es
`#FFF5E8` (`papel` en Tailwind), no blanco.

| Uso                   | Letra                                    | Interlineado              | Fondo (ancho x alto)                                             | Aire lateral                                                  | Giro CSS                                                          | Piezas                                                                                                                              | Mobile vs desktop                                                                     |
| --------------------- | ---------------------------------------- | ------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1 Intro parte 1       | 20 px Bold, tracking -4 %, resto Regular | 24 px (1,2)               | 223,5 x 22,9 (1,15 em; cabe dentro de su línea)                  | casi cero: el fondo mide lo que el texto más el espacio final | -0,54°                                                            | 1 pieza, en línea con "pero"                                                                                                        | desktop: 30 px, interlineado auto (unos 34 px), fondo 331,5 x 33 (1,1 em), mismo giro |
| 2 Intro parte 3       | 20 px Bold                               | auto (24 px)              | 223,5 x 22,9                                                     | casi cero                                                     | -0,54°                                                            | 1 pieza en su propia línea (salto manual)                                                                                           | desktop: 25 px, fondo 280,8 x 33, detrás de "ignorado," en la misma línea             |
| 3 Sello EMI           | 40 px Bold `#FFF5E8`                     | 32 px                     | 79 x 44, rosa `#F57DB7` (`pink-sol`)                             | poco                                                          | -4,09°                                                            | 1                                                                                                                                   | desktop: 51,7 px, 102,2 x 56,9                                                        |
| 4 Cinta EMI           | 20 px Bold, -4 %                         | 32 px                     | 298,8 x 36,7 (1,83 em)                                           | unos 9 px                                                     | -0,54°                                                            | 1, centrada                                                                                                                         | desktop: 25 px, 369,8 x 36,7                                                          |
| 5 Donaciones          | 40 px Bold azul sobre cinta `#FFF5E8`    | 44 px (m), 42,04 (d)      | cinta por línea, 41 a 52 de alto (m)                             | 7 a 15 px                                                     | alterna -1,23°, +1,06°, -2,97°... (m); -0,58° con sesgo 2,03° (d) | **una pieza por línea**, se solapan 2 a 3 px entre sí                                                                               | ya implementado 1:1 en `donations.module.css`                                         |
| 6 y 7 Impacto títulos | 30 px Bold, -4 %                         | auto (paso de 36 a 37 px) | por línea, 32,8 a 37 de alto (1,1 a 1,2 em), ancho de cada línea | 8 px a la izquierda (0,27 em), 8 a 12 a la derecha            | -1,23°                                                            | **una pieza por línea**, cada una con su ancho; entre piezas queda un hueco de unos 3 px (calculado de los rects paralelos girados) | solo mobile                                                                           |
| 8 Etiquetas mapa      | 12 y 16 px Bold                          | una línea                 | según texto                                                      |                                                               | ver `1102:60`                                                     | 1                                                                                                                                   | solo mobile                                                                           |
| 9 Nombres             | 21,3 px Bold, -4 % (texto a -0,46°)      | 23,4 px                   | ej. 150,9 x 34,6 para "Mafe Ramirez" (1,62 em de alto)           | 7 px (0,33 em)                                                | -0,54°                                                            | 1, nunca se parte                                                                                                                   | solo mobile                                                                           |
| 10 Modal del mapa     | 40 px Bold, -4 %                         | 36,4 px                   | por línea, 40,4 a 49,4 de alto                                   | unos 10 a 20 px                                               | -0,54°                                                            | una pieza por línea, apiladas casi tocándose                                                                                        | un solo diseño                                                                        |

**Conclusión: Figma usa una pieza y tres geometrías**, no una variante por sección:

- **En línea** (usos 1 y 2): el resaltado vive dentro de un párrafo. El fondo no sale de su línea
  (alto de fondo menor o igual al interlineado, que es 1,2), aire lateral casi nulo, -0,54°.
- **Título apilado** (usos 6, 7 y 10): una pieza por línea visual, cada una del ancho de su línea,
  apiladas con un hueco mínimo; -1,23° en Impacto y -0,54° en el modal.
- **Etiqueta** (usos 4, 8 y 9): una línea que no se parte, con aire vertical generoso porque no
  tiene vecinas pegadas (1,6 a 1,8 em de alto), -0,54°.
- Piezas propias que se quedan como están: el sello EMI (uso 3) y la cinta de papel (uso 5).

Conjunto mínimo propuesto (nombres de trabajo):

| Clase o prop                      | Cubre                                | Giro      | Alto del fondo                                        | Aire lateral |
| --------------------------------- | ------------------------------------ | --------- | ----------------------------------------------------- | ------------ |
| `.resaltado` + `variante="linea"` | 1, 2                                 | -0,54°    | lo que queda de la línea tras el giro (ver sección 5) | 0,1 em       |
| `variante="titulo"` + `giro`      | 6, 7 (giro -1,23°), 10 (giro -0,54°) | prop      | 1,15 em, interlineado 1,2                             | 0,27 em      |
| `variante="etiqueta"`             | 4, 8, 9                              | -0,54°    | 1,6 a 1,8 em                                          | 0,33 em      |
| `.map-chip--emi` (se mantiene)    | 3                                    | -4,09°    | como hoy                                              | como hoy     |
| `TituloCinta` (se mantiene)       | 5                                    | por línea | como hoy                                              | como hoy     |

## 3. Render actual

Método: `audit.js` abre Chrome por CDP a 390x844, 768x1024, 1280x832 y 1920x1080, en `/`, `/en`
y `/fr`. La Introducción se mide con `?introPaso=1|3&quieto=1`; el resto, recorriendo cada
sección para que disparen sus entradas y esperando 1,5 s (4,5 s en Impacto). Por cada chip:

- **líneas**: `Range.getClientRects` por palabra, con el giro del chip anulado mientras se mide
  (con el giro, las palabras de un chip largo parecen estar en líneas distintas);
- **exceso**: ancho de la caja menos relleno menos ancho real del texto (fondo a todo el ancho si
  pasa de 24 px);
- **separación arriba y abajo**: la caja del fondo sin transformar, girada sobre su
  `transform-origin` y ampliada con lo que derrama el filtro rasgado (±3 px de desplazamiento,
  limitado por la región del filtro al 3 % de la caja), contra los rects de las líneas de texto
  vecinas de toda la sección (incluye líneas de otros párrafos y de otros chips). Negativo =
  solape en px;
- palabra suelta, color calculado, giro calculado.

Matriz (`matriz.txt`; "sep." = peor separación en px, negativo es solape):

| Uso                                                                    | es 390                                                                    | es 768      | es 1280     | es 1920     | en 390                     | en 768      | en 1280                 | en 1920        | fr 390                                    | fr 768               | fr 1280              | fr 1920        |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------- | ----------- | ----------- | -------------------------- | ----------- | ----------------------- | -------------- | ----------------------------------------- | -------------------- | -------------------- | -------------- |
| 1 Intro p1, sep. arriba / abajo                                        | -4,7 / -1,0                                                               | -5,3 / -1,1 | -6,9 / -1,4 | -6,9 / -1,4 | -4,9 / -0,2                | -5,5 / -0,2 | -0,8 / -1,3, "but" solo | igual que 1280 | -4,8 / -1,0                               | -5,3 / -1,1          | -7,1 / -1,4          | -7,1 / -1,4    |
| 2 Intro p3, sep. arriba / abajo                                        | -4,9 / ok                                                                 | -4,1 / ok   | -6,1 / ok   | -6,1 / ok   | -1,6 / ok, "ignored," solo | -4,0 / ok   | -6,0 / ok               | -6,0 / ok      | **2 líneas, exceso 167 px, -5,4 / -14,4** | -5,9 / ok            | -8,5 / ok            | -8,5 / ok      |
| 6 y 7 Impacto títulos, sep. arriba (fondo sobre la línea anterior)     | -1,0                                                                      | -0,5        | -1,0        | -1,0        | -0,3                       | -0,3        | -1,0                    | -1,0           | -0,5, **"des" suelto, exceso 254**        | -0,7, **exceso 318** | -1,3, **exceso 356** | igual que 1280 |
| 6 y 7 Impacto, solape entre fondos (alto del fondo menos interlineado) | 7,5                                                                       | 9,4         | 10,5        | 10,5        | 7,5                        | 9,4         | 10,5                    | 10,5           | 7,5                                       | 9,4                  | 10,5                 | 10,5           |
| 3 Sello EMI                                                            | ok                                                                        | ok          | ok          | ok          | ok                         | ok          | ok                      | ok             | ok                                        | ok                   | ok                   | ok             |
| 4 Cinta EMI                                                            | ok (1 línea)                                                              | ok          | ok          | ok          | ok                         | ok          | ok                      | ok             | ok, pero a 18 px                          | ok, a 18 px          | ok                   | ok             |
| 5 Donaciones                                                           | 1 pieza por línea, sin exceso (los solapes entre cintas son del diseño)   |             |             |             |                            |             |                         |                |                                           |                      |                      |                |
| 8 Etiquetas mapa                                                       | ok, 1 línea, sep. mínima 15 px                                            |             |             |             |                            |             |                         |                |                                           |                      |                      |                |
| 9 Nombres                                                              | ok, 1 línea, sep. con el cargo 9,6 a 9,9 px (3,7 en "Karol López" a 1280) |             |             |             |                            |             |                         |                |                                           |                      |                      |                |

1920 y 1280 dan lo mismo en todos los usos: la Introducción tope a 1280 de ancho e Impacto y
Quiénes somos escalan con `--k` hasta `lg` y no más.

Valores fijos en todos los idiomas y anchos (resultados.json): texto de los chips de
`renderTextWithMarks`, nombres y etiquetas en `rgb(255, 255, 255)` (Figma `#FFF5E8`); giro
calculado -1,2° en usos 1, 2, 6, 7, 8 y 9 (Figma -0,54° salvo 6 y 7); alto del fondo 1,5 em
(30 px a 20 px de letra; Figma 22,9).

Comparación directa con Figma a 390 en español:

| Uso              | Figma (ancho x alto, giro)            | Código                           |
| ---------------- | ------------------------------------- | -------------------------------- |
| 1 Intro p1       | 223,5 x 22,9, -0,54°, interlineado 24 | 236 x 30, -1,2°, interlineado 25 |
| 2 Intro p3       | 223,5 x 22,9, -0,54°                  | 234 x 30, -1,2°                  |
| 4 Cinta EMI      | 298,8 x 36,7, -0,54°                  | 290 x 36, -0,54° (bien)          |
| 3 Sello EMI      | 79 x 44, -4,09°                       | 74 x 38, -4,09° (bien)           |
| 6 "553 niñas,"   | 163,4 x 34,6, -1,23°, paso 36,6       | 158 x 45, -1,2°, paso 37,5       |
| 9 "Mafe Ramirez" | 150,9 x 34,6, -0,54°                  | 145 x 36, -1,2°                  |

## 4. Hallazgos

| #   | Uso                   | Idioma              | Viewport                  | Problema                                                                                                                                                                                                                          | Sev.                           | Evidencia                                                                                                                                                  | Causa técnica probable                                                                                                                                                                                        |
| --- | --------------------- | ------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H1  | 2 Intro p3            | fr                  | 390                       | "pourquoi en parler maintenant ?" no cabe, el chip se parte en 2 líneas y su fondo pasa a una sola pieza de 307 px (exceso 167 px sobre la línea corta) que **tapa 14,4 px del párrafo de abajo** ("La dignité et les droits...") | alta                           | `intro3-fr-390.png`; alto del fondo 55 px, sep. abajo -14,4                                                                                                | `inline-block` que se parte por dentro: su caja pasa a medir el ancho disponible. No hay `box-decoration-break` ni corte por líneas                                                                           |
| H2  | 6 Impacto "duchas"    | fr                  | 390, 768, 1280, 1920      | "La compréhension des" no cabe en la columna: "des" queda solo en la segunda línea dentro de un bloque negro de 324 / 405 / 454 px                                                                                                | alta                           | `recortes/impacto-comprehension-fr-390.png`, `...-fr-1280.png`; exceso 254 / 318 / 356 px                                                                  | la misma del H1, más los cortes de línea escritos a mano en `locales/fr.json` (`==...==` por línea) que no caben al ancho del diseño                                                                          |
| H3  | 1 Intro p1            | es, en, fr          | los 4                     | El fondo **pisa la línea de arriba** ("La mitad del mundo menstrua,": tapa la coma y la base) entre 4,7 y 7,1 px, y la de abajo entre 0,2 y 1,4 px. En Figma no pasa                                                              | alta                           | `intro1-es-390.png`, `intro1-es-1280.png`; sep. arriba -4,7 (es 390), -6,9 (es 1280), -7,1 (fr 1280)                                                       | fondo de 1,5 em (relleno 0,08 + 0,16 em sobre letra de 1,25) contra 1,15 em en Figma; interlineado 1,25 contra 1,2; giro -1,2° que sube 4,9 px el extremo derecho de un chip de 236 px (Figma -0,54°: 2,2 px) |
| H4  | 2 Intro p3            | es, en, fr          | los 4                     | El fondo pisa la línea de arriba ("históricamente ignorado,") entre 1,6 y 8,5 px                                                                                                                                                  | alta                           | `intro3-fr-1280.png`; sep. arriba -8,5 (fr 1280), -6,1 (es 1280)                                                                                           | la misma del H3                                                                                                                                                                                               |
| H5  | 6 y 7 Impacto títulos | es, en, fr          | los 4                     | Los fondos se montan entre sí 7,5 a 10,5 px y forman una plancha negra continua; en Figma son tiras separadas unos 3 px. Además, el fondo de cada línea toca la línea anterior hasta 1,3 px                                       | alta (por el solape con texto) | `recortes/impacto-ciclo-es-390.png` contra `figma/m1102-322.png`; sep. arriba mínima -1,3 (fr 1280)                                                        | alto del fondo 45 px (1,5 em) sobre un paso de 37,5 (interlineado 1,25); Figma: fondo 1,15 em sobre paso 1,2                                                                                                  |
| H6  | 1 y 2 Intro           | en                  | 1280, 1920 (p1); 390 (p3) | El chip no se puede partir, así que salta entero a la línea siguiente y deja una palabra sola: "but" (p1) e "ignored," (p3). En Figma "pero hablar de menstruación" va en una línea                                               | media                          | `intro1-en-1280.png`, `intro3-en-390.png`                                                                                                                  | `inline-block` indivisible dentro de un párrafo                                                                                                                                                               |
| H7  | 1, 2, 8, 9            | todos               | todos                     | Giro -1,2° donde Figma pide -0,54° (Introducción, nombres, y según `1102:60` también las etiquetas)                                                                                                                               | media                          | giro calculado -1,2 en `resultados.json`                                                                                                                   | `.map-chip` tiene un único giro (-1,2°) para todos los usos                                                                                                                                                   |
| H8  | 1, 2, 6 a 9           | todos               | todos                     | Texto blanco puro; Figma `#FFF5E8` (`text-papel`)                                                                                                                                                                                 | baja                           | color calculado `rgb(255, 255, 255)`                                                                                                                       | `text-white` en `renderTextWithMarks` y en los usos directos                                                                                                                                                  |
| H9  | 6 Impacto             | es                  | 390                       | Sin margen: el chip más ancho mide 307 de 324 px de columna. Cualquier ajuste de copy lo lleva al H2                                                                                                                              | media                          | `impacto-h3` en `resultados.json` (anchos 307, 294, 259, 228)                                                                                              | ancho de línea fijado a mano en el locale, sin protección si no cabe                                                                                                                                          |
| H10 | 4 Cinta EMI           | fr                  | 390, 768                  | Para que quepa en una línea se bajó la letra a 18 px (Figma 20). Es el caso "variar tamaño según idioma"                                                                                                                          | media                          | `emi-fr-390.png`; letra 18 px en `matriz.txt`                                                                                                              | parche en `emi-section.tsx` (`cintaMobile`), sin forma de partir la cinta en dos piezas                                                                                                                       |
| H11 | todos los `.map-chip` | todos               | todos                     | El borde rasgado de arriba y abajo sale recortado en recto: la región del filtro deja solo un 3 % de margen (0,9 px en un chip de 30 px) para un desplazamiento de ±3 px                                                          | baja                           | cálculo sobre `rough-edge-filter.tsx` (`y="-3%" height="106%"`, `scale="6"`)                                                                               | región del filtro en unidades de la caja; en piezas bajas y anchas no alcanza                                                                                                                                 |
| H12 | 11 y 12 Súmate        | es (igual en todos) | 390                       | La cinta de papel de `.donation-title-chip` no se pinta: su `filter: url(#paper-texture)` apunta a un filtro que no existe, y eso hace desaparecer el `::before`                                                                  | baja                           | `document.getElementById('paper-texture')` da `false`; `recortes/sumate-chip-recorte-es-390.png` (5 KB porque el recorte es solo el título, 20 px de alto) | filtro nunca definido; `PATTERNS.md` ya avisa de este fallo                                                                                                                                                   |
| H13 | 10 Modal              | todos               | no medido                 | Mismo riesgo que H1 y H2 si una línea escrita a mano no cabe: "Voix souveraines :" y "Sovereign Voices:" a 40 px en 390                                                                                                           | sin medir                      | nombres en `locales/*.json`                                                                                                                                | cortes manuales con `\n` y `.map-chip` indivisible                                                                                                                                                            |

Falsos positivos descartados: los "solapes" de los nombres con `anillo.svg` son la caja del
adorno de la foto, sin solape visible (`recortes/quienes-karol-es-390.png`); los de Donaciones
con el barco y entre cintas son del diseño; las etiquetas del mapa se superponen al SVG del mapa
porque van encima a propósito.

## 5. Propuesta técnica

### 5.1 Un componente con corte por líneas medido

Generalizar lo que ya funciona en Donaciones (`TituloCinta`, `docs/donaciones/DECISIONES.md` D1)
en un componente único, por ejemplo `components/layout/resaltado.tsx`, que usen
`renderTextWithMarks` y los usos directos:

1. Un medidor invisible con la misma tipografía coloca las palabras y las agrupa por
   `offsetTop`. Cada grupo se pinta como **una pieza por línea visual** (`inline-block`,
   `white-space: nowrap`). Una pieza nunca se parte por dentro, así que **no puede quedar un
   fondo a todo el ancho** en ningún idioma (corrige H1, H2, H9, H13) y la frase puede cortar a
   mitad como en Figma, sin palabras solas (H6).
2. El fondo sale de un `::before` con **insets negativos** (`--aire-x`, `--aire-arriba`,
   `--aire-abajo`), no de `padding`. Así la caja del chip mide lo mismo que el texto: resaltar no
   cambia dónde corta la línea y la medición no entra en bucle. Es lo que ya hace
   `.linea::before` en `donations.module.css`.
3. Sin JS (servidor y primer render): `display: inline` con `box-decoration-break: clone` y
   `-webkit-box-decoration-break: clone`, fondo plano por línea y sin filtro. Degrada bien y no
   tapa nada.

Alternativa solo CSS (sin JS): `display: inline` + `box-decoration-break: clone` para la pieza
por línea, con el rasgado como `border-image` de un SVG de papel en vez de `filter` (un filtro en
un elemento en línea deformaría también el texto). Pierde el giro por pieza: `transform` no se
aplica a elementos en línea. Sirve para el uso en línea (1 y 2, donde el giro es solo -0,54°),
no para los títulos de Impacto.

### 5.2 Variantes (tokens en CSS, nombres por Tailwind)

```css
.resaltado {
  --giro: -0.54deg;
  --aire-x: 0.1em;
}
.resaltado--titulo {
  --giro: -1.23deg;
  --aire-x: 0.27em;
} /* Impacto; el modal pasa giro -0.54 */
.resaltado--etiqueta {
  --aire-x: 0.33em;
  --aire-arriba: 0.25em;
  --aire-abajo: 0.25em;
}
.resaltado > span {
  color: theme('colors.papel.DEFAULT');
} /* H8 */
```

- **En línea** (usos 1 y 2): interlineado del párrafo 1,2 (hoy `leading-[1.25]` en
  `intro-section.tsx:223`), `transform-origin: center` y un fondo que no salga de su línea:
  `alto del fondo <= interlineado - ancho x sen|giro| - 2 x derrame del filtro`. A 20 px con
  interlineado 24 y una pieza de 224 px: 24 - 2,1 - 2 = unos 20 px, en la línea de Figma
  (22,9). Corrige H3 y H4.
- **Título** (usos 6, 7 y 10): interlineado 1,2, fondo 1,15 em, hueco entre piezas de 1 a 3 px.
  Corrige H5.
- **Etiqueta** (usos 4, 8 y 9): `white-space: nowrap`, giro -0,54° (H7). La cinta EMI en
  francés pasa a partirse en dos piezas a 20 px en vez de bajar a 18 (H10), si Johan lo aprueba.
- Filtro: ampliar la región de `#map-rough-edge` (por ejemplo `y="-20%" height="140%"`, o
  `filterUnits="userSpaceOnUse"`) y contar ese derrame en el presupuesto de alto (H11).
- `.donation-title-chip`: apuntar a `#map-rough-edge` o definir `#paper-texture` (H12).
- Impacto: con el corte medido, cada título puede ir con un solo `==...==` (o sin marcas) y un
  ancho máximo igual a la caja de Figma (300 px x `--k`), como hace `TituloCinta` con 295 px.

### 5.3 Qué cambia en cada uso

| Uso           | Cambio                                                                                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1, 2 Intro    | variante en línea, interlineado 1,2, giro -0,54°, fondo dentro de la línea, texto `papel`; el resaltado puede partirse entre líneas |
| 3 Sello EMI   | nada                                                                                                                                |
| 4 Cinta EMI   | variante etiqueta; en fr a 20 px en dos piezas (decisión 3)                                                                         |
| 5 Donaciones  | nada (ya es el modelo); opcional: que `TituloCinta` pase a usar el componente común                                                 |
| 6, 7 Impacto  | variante título, giro -1,23°, fondo 1,15 em, interlineado 1,2; cortes medidos (decisión 1)                                          |
| 8 Etiquetas   | variante etiqueta, giro según `1102:60`                                                                                             |
| 9 Nombres     | variante etiqueta, giro -0,54°                                                                                                      |
| 10 Modal      | variante título con giro -0,54°; los `\n` pueden quedarse como cortes forzados                                                      |
| 11, 12 Súmate | arreglar el filtro                                                                                                                  |

### 5.4 Criterio verificable para el constructor

Medido con `audit.js` (copiado a `scripts/`) en es, en y fr a 390, 768, 1280 y 1920:

1. **Cero piezas de más de una línea** (`lineas === 1` en todos los chips).
2. **Exceso <= 2 x aire lateral + 2 px** en cada pieza (nada de fondo a todo el ancho).
3. **Separación con las líneas vecinas >= 0 px** (`gapArriba` y `gapAbajo`): el fondo girado,
   con el derrame del filtro, contra los `Range.getClientRects` de las líneas de arriba y abajo,
   de cualquier párrafo. Tolerancia de 1 px: Figma mismo llega a -1,1 px en la esquina inferior
   izquierda de la Introducción (rect `1230:100` contra la caja de línea de 24 px).
4. **Entre piezas apiladas, separación >= 0 px** (Figma deja unos 3 px).
5. Ninguna línea de un párrafo con una sola palabra por culpa del chip.
6. Giro calculado igual al de Figma por variante (±0,05°) y color `rgb(255, 245, 232)`.
7. Capturas comparadas con `figma/*.png` en los frames con diseño.

### 5.5 Decisiones para Johan

1. **Cortes de línea de los títulos de Impacto.** (a) Medidos por el navegador al ancho de la
   caja de Figma, iguales en los 3 idiomas y sin mantenimiento; (b) escritos a mano por idioma en
   los locales, como hoy, con la pieza protegida para que no se parta. **Recomendado: (a)**; en
   español reproduce los cortes del diseño (igual que en Donaciones) y en francés no vuelve a
   dejar "des" suelto.
2. **Giros.** (a) Los de Figma: -0,54° general, -1,23° en títulos de Impacto, -4,09° en el sello;
   (b) mantener -1,2° en todo. **Recomendado: (a)**; -1,2° es parte de por qué el fondo pisa la
   línea de arriba en la Introducción.
3. **Frase resaltada que no cabe en una línea** (cinta EMI en francés, y cualquier traducción
   futura). (a) Partirla en dos piezas con la letra del diseño; (b) bajar la letra hasta que
   quepa, como hoy en la cinta EMI. **Recomendado: (a)**; es lo que hace Figma en los títulos y
   evita una tipografía distinta por idioma.
