# Decisiones: reconstrucción del primer tramo

Una entrada por decisión, con su porqué. **Cuando el trabajo desmienta o amplíe una decisión, la
ampliación se escribe aquí mismo, debajo de la entrada original.** Lo último que se aprende es
justo lo que se pierde si se queda en el chat.

Iniciado: 2026-09-21.

---

## D1. El primer tramo se reconstruye en 3 secciones

Orden objetivo: Introducción (estática, contenido nuevo) -> Así se ve el impacto en acción (nueva)
-> Quiénes somos (nueva). De ahí en adelante el sitio sigue igual.

**Por qué:** el primer tramo actual es una intro animada larga que no comunica el impacto de la
fundación. El contenido nuevo viene del rediseño en Figma
(`ng8HnnYyaDJ2nTWauh7Otb`, "Las fuertes reloaded").

---

## D2. `?show=all` AÑADE secciones, no las quita

Descubierto leyendo `pages/index.tsx:22`. El comentario en el código dice que el param muestra "la
experiencia completa" mientras que sin param se ve "desde Dirigir el cambio en adelante", y es fácil
leerlo al revés.

| URL          | Qué se ve                                        |
| ------------ | ------------------------------------------------ |
| `/`          | Donaciones -> Mapa educativo -> Súmate           |
| `/?show=all` | Todo, incluyendo el primer tramo en construcción |

**Por qué importa:** la Fase A entera se valida en `/?show=all`. Es el único staging que hay.

### Ampliacion (2026-09-21, encontrado al verificar el refactor)

**El gate solo funciona despues de la hidratacion.** La home es una pagina estatica
(`autoExport: true`), asi que en el servidor `router.query` viene vacio y `router.asPath` no trae
el query. Verificado con `curl "http://localhost:3000/?show=all"`: el HTML del servidor es el de la
rama POR DEFECTO, y el tramo en construccion aparece recien cuando React hidrata.

Consecuencias practicas:

1. **No se puede verificar `?show=all` con `curl`.** Hay que abrirlo en un navegador de verdad.
2. Al cargar `/?show=all` hay un parpadeo: primero se pinta Donaciones y luego salta al sitio
   completo. Es molesto para revisar, pero es preexistente y **desaparece solo en la Fase B**, al
   quitar el gate. No vale la pena arreglarlo antes.
3. El contenido gateado no esta en el HTML del servidor, asi que no lo indexa nadie mientras
   dure la Fase A. Para este caso es una ventaja.

---

## D3. El gate se elimina YA (revisada el 2026-09-21)

**Decision original:** conservar `?show=all` durante toda la Fase A y quitarlo en la Fase B, para
que el publico no viera el tramo a medias.

**Revisada el mismo dia, por peticion de Johan:** "no le metamos mas mente a el show=all,
quitemoslo ya". El param se retiro de `pages/index.tsx` y el sitio completo carga por defecto.

**Lo que esto implica, dicho claro:** hasta que aterrice la Pieza 1, lo primero que carga la web es
la intro animada VIEJA, la de los 3 pasos con GSAP. Eso es lo que vera cualquiera que entre. Johan
lo confirmo sabiendo que main despliega solo.

**Lo que NO cambia:** nada llega a produccion sin que Johan lo pida. No se commitea ni se pushea
por iniciativa propia, asi que el momento de publicar lo sigue eligiendo el.

La Fase A y la Fase B dejan de existir como fases separadas: cada pieza se construye, se valida en
los 3 breakpoints y queda lista para mergear cuando Johan diga.

---

## D4. La composición de página sale de `hero.tsx` y sube a `pages/index.tsx`

**El problema:** `components/hero/hero.tsx` hace dos trabajos a la vez. Es la intro animada Y es la
raíz de composición: al final de su JSX renderiza `WelcomeSection`, `PrinciplesSection`,
`DonationsSection`, `EducationMapSection` y `SumateSection`. Por eso el gate es un `if/else` de
todo o nada, y por eso no había forma de gatear solo las secciones nuevas.

**La decisión:** `Hero` devuelve únicamente su propio markup de intro; `pages/index.tsx` pasa a ser
dueño del orden de secciones y del gate. Es refactor puro: **si se ve distinto, está mal.**

---

## D5. Welcome y Principles se quedan

Confirmado con Johan: de "Bienvenidx a Las Fuertes" (`WelcomeSection`) en adelante, todo sigue. Lo
único que se reemplaza es la introducción de 3 partes.

**Quiénes somos va al final, justo antes del footer** (confirmado por Johan el 2026-09-21). No va
en el primer tramo como decia el plan original.

Orden definitivo de la pagina:

```
Introducción -> Impacto -> Welcome -> Principles -> Donaciones -> Mapa educativo -> Súmate -> Quiénes somos -> Footer
```

---

## D6. Los 3 pasos animados de la intro son las 3 secciones GSAP de `hero.tsx`

`section1Ref` (las manos), `section2Ref` (el splash-monster) y `section3Ref` (el pez koi), todas
scroll-driven con GSAP ScrollTrigger. Eso es lo que hay que dejar estático y con contenido nuevo.

Se elimina con ellas: el `gsap.context` completo, el estado `skipAnimation`, el botón "Saltar
animación", el `localStorage['las-fuertes-visited']`, el `IntersectionObserver` sobre
`#welcome-title`, el hint de SCROLL y el prop `onComplete`.

---

## D7. Tablet y desktop se improvisan escalando, no recomponiendo

Solo hay diseño mobile para Mapa, Bloques y Quiénes somos. Se mantiene la composición mobile y se
le da aire: mismo orden y jerarquía, más margen lateral, tipografía y arte escalados dentro del
`PageGrid`. No se inventan layouts de 2 columnas.

**Por qué:** bajo riesgo de desviarse del diseño, y fácil de revisar cuando lleguen los frames
reales.

---

## D8. El mapa de Colombia va como SVG inline, no como imagen

Los 6 territorios (Isla Fuerte, Atlántico, Guajira, Bolívar, Córdoba, Bogotá D.C.) tienen que
animarse por separado, así que hacen falta paths individuales.

**Complicación encontrada:** en Figma los ~35 paths del mapa se llaman todos `Vector`, sin nombre
de departamento. El mapeo `path -> territorio` se deriva comparando el frame "antes de animar"
(`1102:3`) con el "después" (`1102:60`) por color de relleno, y se documenta en `PATTERNS.md` en
cuanto se sepa, porque volver a derivarlo cuesta caro.

### Ampliacion (2026-09-21, noche, al leer los frames antes de cerrar la sesion)

Lo que hay dentro del frame "despues" (`1102:60`, 390x828), leido con `get_metadata`:

- Un vector grande (`1102:109`, 350x476) que es la silueta completa del pais, y un grupo
  (`1102:110`) con **33 vectores**, uno por departamento, todos llamados `Vector`.
- **Siete etiquetas, no seis:** Isla Fuerte, Atlantico, Guajira, Bolivar, Cordoba, **Ibague** y
  Bogota D.C. Cada etiqueta es un rectangulo (`Rectangle 112` a `118`) mas un texto: es el chip
  rasgado del sitio otra vez (`.map-chip`), en dos tamanos (alto 29 y alto 16-21).
- El titulo del cierre dice "**6 territorios** ahora mas fuertes". Con siete etiquetas en el mapa
  no cuadra: **hay que preguntarle a Johan** si Ibague entra (y el titulo pasa a 7) o si sobra.
- En el frame "antes" (`1102:3`) el mapa es todo gris (`#919191` segun D10) y sin etiquetas; en el
  "despues" los territorios estan en rosa (`pink`, `#FF74BA`) con su etiqueta. La animacion es
  ese paso: los departamentos se encienden en rosa y aparecen las etiquetas.
- Arriba del titulo hay una flor pequena (`Group 163`, 41x40), decorativa.
- **El bloque de la piscina (`1102:286`) tiene un numero de relleno: "2XX ninas, adolescentes y
  mujeres en talleres".** El dato real lo tiene que dar Johan; hasta entonces se deja un
  placeholder visible, no un numero inventado.
- El sitio ya tiene un mapa de Colombia en `components/education-map/` (imagen avif con puntos
  que laten, filtro rasgado, respeto a `prefers-reduced-motion`). No es el mismo mapa ni sirve
  tal cual, pero sus patrones (chips, latido en CSS, reduced-motion) si.

---

## D9. El copy se escribe en los tres idiomas a la vez

`useTranslation` renderiza la clave cruda en pantalla y avisa por consola si falta la traducción,
así que dejar `en`/`fr` pendientes deja texto roto visible. El copy de Figma está en español; `en`
y `fr` se traducen en la misma pasada.

**Confirmado por Johan el 2026-09-21** y elevado a regla permanente: "traduce todo, deberia ser
implicito en cada entrega". Ninguna seccion se da por terminada con claves solo en espanol.
Escrito tambien en `docs/PATTERNS.md`.

---

## D10. Los assets salen de Figma sin intervencion de Johan

Verificado el 2026-09-21 con llamadas reales a `download_assets`, no asumido:

- **SVG por capa vectorial.** Cada ilustracion vuelve partida en sus capas, con sus colores reales.
  El bloque de la piscina (`1102:162`) devolvio 9 SVGs. Las capas del estado "antes" vienen en gris
  `#919191`, lo que confirma que antes y despues se distinguen por color de relleno.
- **PNG del frame completo**, util para comparar el resultado contra el diseno.
- **Las fotos del equipo son reales**: 18 JPEG embebidos en el nodo de Quienes somos (`1219:985`).
  Se bajan con `download_assets`, no hacen falta por otro canal.

**Tres limitaciones conocidas:**

1. Las capas llegan con nombres autogenerados (`Vector 1052`, `Group 184`), asi que emparejar capa
   con significado se hace a ojo contra el screenshot. Es trabajo, pero no bloquea.
2. **Las fotos del equipo miden 512px en su lado largo.** Alcanzan para las caras pequenas en
   mobile; en desktop a 2x pueden verse blandas. Si se quieren nitidas en pantallas grandes, hay
   que pedirle los originales a Johan. Es lo unico que podria necesitarse de su lado.
3. `download_assets` corta en 20 SVGs por nodo. Para nodos grandes hay que bajar por sub-nodo.

---

## D11. El copy de la Introducción YA estaba escrito y traducido

Hallazgo del 2026-09-21 al empezar la Pieza 1. Las claves `hero.section1`, `hero.section2` y
`hero.section3` de `locales/{es,en,fr}.json` **ya contienen exactamente el texto del diseno nuevo**,
en los tres idiomas. El plan asumia que habia que escribir contenido nuevo; no era asi.

La Pieza 1 se reduce entonces a dos cosas: quitar la animacion y cambiar las ilustraciones (de
manos, monstruo y pez koi a burbujas de dialogo, horizonte de mar y barco de papel).

Las claves conservan el prefijo `hero.` aunque el componente ahora se llame `intro`. Renombrarlas
tocaria los tres archivos de idioma sin ganar nada funcional; queda como limpieza opcional.

---

## D12. El resaltado usa el chip que YA existia en el sitio

**Error propio, corregido el 2026-09-21 tras revision de Johan.** En la primera entrega invente un
`<mark>` con fondo negro y esquinas rectas. El sitio **ya tenia** el patron: `.map-chip` en
`styles/global.css:137`, un inline-block con fondo `#242424`, texto blanco, inclinacion de -1.2
grados y borde rasgado con el filtro SVG `#map-rough-edge`. Lo usa el panel del mapa educativo.

**Causa del error:** al explorar busque "componente de titulo reutilizable", no "patron de
resaltado", y entregue sin mirar nunca el resultado renderizado. De ahi sale tambien D15.

Efecto colateral util: el filtro `#map-rough-edge` estaba definido dentro de
`education-map-section.tsx`. Se movio a `components/layout/rough-edge-filter.tsx`, montado una sola
vez en `pages/_app.tsx`. Un `filter: url(#id)` que apunta a un filtro ausente **hace desaparecer el
elemento**, asi que el chip no puede depender de que otra seccion este montada.

### Lo que si se mantiene de la decision original

En Figma el fondo negro detras de "hablar de menstruacion" y "¿por que hablar ahora?" es un
rectangulo aparte, en posicion absoluta y con ancho fijo.

El resaltado va **en linea** sobre el texto y no como la barra posicionada aparte que usa Figma. El
marcador es `==texto==` y lo entiende `renderTextWithMarks` en `lib/render-text-with-bold.tsx`.

**Por que en linea:** el copy va en tres idiomas y esas frases cambian de largo entre ellos. Una barra de
ancho fijo quedaria corrida o sobrando en ingles y frances. De paso, las coordenadas de la barra en
Figma no cuadraban con las del bloque de texto (la barra del paso 3 esta en y=506 y el titulo
empieza en y=545), asi que copiarlas tal cual habria dado un resultado desalineado igual.

Se pierde la rotacion de -0.54 grados que tiene la barra en el diseno. Es imperceptible y no
sobrevive a un texto que se parte en varias lineas.

---

## D13. Las ilustraciones se montan por capas en porcentaje

Figma entrega las 3 ilustraciones como 45 capas en posicion absoluta, medidas en pixeles contra un
lienzo de 390x833.

**Se guardan en `components/intro/intro.data.ts` con sus medidas en px del lienzo** y el componente
las convierte a porcentaje. La tipografia usa `min(Nvw, Npx)` para crecer con el lienzo y
congelarse al llegar al ancho maximo.

**Por que:** un solo juego de datos sirve a cualquier ancho. La alternativa era tener coordenadas
en pixeles repetidas para mobile, tablet y desktop.

Se omite a proposito la capa `Capa 26 1` del paso 3 (`1152:189`): en el diseno esta en `left: -500`
con `width: 500`, o sea que termina exactamente en el borde del lienzo y no se ve nunca.

---

## D14. Los SVG se optimizan con svgo antes de entrar

Las 43 capas pesaban **1.3 MB** recien bajadas de Figma, y son lo primero que carga la web.
Pasadas por `npx svgo@3` con `removeViewBox` desactivado y precision 2, quedan en **480 KB**, un
63% menos.

Verificado que las 43 siguen parseando como XML valido, que todas conservan su `viewBox` y su
`preserveAspectRatio="none"`. El `viewBox` cambia solo por redondeo a dos decimales; el peor caso
es `36.6763 -> 36.68`, un 0.01%, y como las capas se estiran a su caja no afecta la posicion.

**svgo no se instala en el proyecto**, se corre con `npx` cuando entran assets nuevos.

---

## D15. Toda entrega visual se revisa con capturas antes de pasarla

**Origen:** Johan pregunto si habia alguna skill de disenador que revisara las entregas. No la hay,
y el problema real era otro: entregue la Pieza 1 **sin haber visto nunca la pagina renderizada**.
Los dos errores que encontro (el chip inventado y el texto demasiado partido) se veian a simple
vista en la primera captura que tome despues.

**La regla ahora:** ninguna pieza se entrega sin una captura mirada y comparada contra el frame de
Figma, en cada breakpoint que se declare terminado.

**La herramienta:** `pages/dev-revision.tsx`, que solo existe en desarrollo, mas Chrome headless.
El procedimiento y las dos trampas que cuestan tiempo estan en `docs/PATTERNS.md`, seccion
"Verificacion visual antes de entregar".

No se instalo nada: ni Playwright, ni Puppeteer, ni svgo. Chrome ya estaba en la maquina.

---

## D16. Las librerias de animacion se quedan

GSAP quedo sin uso al retirar el Hero animado y propuse desinstalarlo. **Johan pidio no tocarlo:**
mas adelante se implementan transiciones y animaciones y se va a necesitar.

Lo mismo aplica a `public/images/hero/`: no se borra nada por ahora.

---

## D17. Tablet y desktop reutilizan las capas de mobile con una transformacion afin

Al abrir los frames de tablet y desktop del paso 1 se ve que **usan exactamente los mismos SVG que
mobile**, solo escalados y desplazados. Comprobado con cinco capas de control:

| Breakpoint | Lienzo    | Escala | Desplazamiento | Error maximo |
| ---------- | --------- | ------ | -------------- | ------------ |
| mobile     | 390x833   | 1      | (0, 0)         | -            |
| tablet     | 1024x1366 | 1.723  | (179, 34.6)    | 0.05 px      |
| desktop    | 1280x832  | 1.2988 | (92, 66)       | 0.04 px      |

**Consecuencia practica:** no hay que transcribir 45 capas por breakpoint. Se guardan tres numeros
y el componente aplica la transformacion al vuelo (`transformar()` en `intro-section.tsx`). Son 135
entradas de datos que no existen y que por tanto no se pueden desincronizar entre si.

Quedan fuera de la transformacion dos cosas, que van en `own` de cada variante: el garabato amarillo
de fondo (tiene su propia escala en cada breakpoint) y un sol pequeno que solo aparece en tablet y
desktop.

**Antes de aplicar esto a los pasos 2 y 3 hay que verificar la hipotesis con sus propias capas de
control.** No se puede dar por hecho que la relacion sea la misma.

### Composiciones

Mobile y tablet ponen el texto **debajo** de la ilustracion. Desktop lo pone **a la derecha**, con
la ilustracion a la izquierda. No es el mismo layout escalado.

### Un ajuste sobre el diseno

La caja de texto de desktop mide 402 px en Figma, pero ahi "pero" mas el chip se pasan por unos
4 px y el renglon se parte, dando 5 lineas en vez de 3. Se subio a 440 px, que mantiene las 3 lineas
del diseno y sigue cabiendo de sobra en el lienzo.

### Ampliacion (2026-09-21, al hacer los pasos 2 y 3)

**La hipotesis afin se cumple, pero por grupos, no por paso entero.** En el paso 2 el diseno de
tablet y desktop escala el horizonte (x1.04 / x1.12), el agua con el reflejo del sol (x1.32 en
ambos) y el barco (x1.34 / x1.17) cada uno por su lado. En el paso 3 el barco con la persona y las
olas comparten escala (x1.185) pero las olas van corridas 1 px en x y 1.75 px en y. Dentro de cada
grupo el error sigue siendo menor a 0.05 px, asi que el modelo de datos paso a aceptar **varios
grupos por paso, cada uno con su transformacion por breakpoint** (`IntroStep.groups` y
`IntroVariant.groups` en `components/intro/intro.data.ts`). El paso 1 quedo como un unico grupo
`burbujas`, sin cambio visual.

Lo que no se comparte va en `own`, transcrito en px del lienzo de ese breakpoint: el sol, la nube y
el garabato del paso 3 (cada uno con escala propia), cuatro olas sueltas que tablet y desktop anaden
a los lados del barco, y en el paso 2 el sol grande con una espiral nueva.

---

## D18. Los frames mobile cambiaron en Figma: lienzo de 700 y texto del paso 3 mas arriba

Al abrir los frames mobile el 2026-09-21 por la tarde, los tres miden **390x700**, no 390x833 como
se transcribio por la manana, y en el paso 3 el titulo baja de y=545 a **y=458** y el parrafo de
y=654 a **y=550**. El paso 2 no cambio de posiciones. Ademas, en el paso 3 la nube va **por
delante** del sol (el orden de capas de Figma es sol, nube, garabato).

**Que se hizo:** el lienzo mobile de los tres pasos paso a 700 (menos aire muerto bajo cada paso), el
texto del paso 3 se movio a su sitio nuevo y se corrigio el apilado sol/nube. `dev-revision` toma
700 de alto por defecto.

**Por que importa:** el diseno se mueve mientras se construye. Antes de dar un breakpoint por bueno
hay que volver a pedir `get_metadata` del frame, no fiarse de lo transcrito horas antes.

---

## D19. El horizonte del paso 2 se sirve desde el export de tablet

El SVG del horizonte bajado del frame mobile traia dos piezas del extremo izquierdo en azul al 18%
y lavanda (`#D2D4F8`). En mobile no se veian porque el grupo empieza en x=-687 y esas piezas quedan
fuera del lienzo; en tablet y desktop el horizonte entra casi completo y aparecian como una mancha
lila donde el diseno muestra arena.

El mismo grupo en el frame de tablet (`1168:1527`) las trae en `#DCC19D`, el tono de arena del
resto. Se reemplazo `public/images/intro/paso2-horizonte.svg` por ese export, con su `inset`
propio (`-2.68% -0.17% -2.63% -0.19%`). Mobile no cambia: esa parte sigue fuera de pantalla.

**Leccion:** un asset compartido entre breakpoints se baja del frame donde **mas** se ve, no del
primero que se construye.

---

## D20. El sol del paso 2 en tablet y desktop es el sol del paso 3, reescalado

En Figma, "Group 235" del paso 2 mobile es una sola capa con sol y espiral (107x93). En tablet y
desktop el sol es otro nodo, de 106.86x111.6, que resulta ser exactamente el sol del paso 3
(74x77.28) a escala 1.444 y con la misma rotacion de -2.61 grados; la espiral es un vector nuevo
(`Vector 1285`) puesto a su derecha. Se reutiliza `paso3-sol.svg` y se anade `paso2-espiral.svg`.
El sol pequeno de adorno del paso 1 en tablet y desktop es el mismo sol a escala 0.6547.

---

## D21. Quiénes somos se construye en flujo, no sobre un lienzo

A diferencia de la Introducción (capas en porcentaje sobre un lienzo fijo), el equipo va como una
lista normal de HTML: título, párrafo y nueve filas, cada una con la foto a un lado y el nombre con
el cargo al otro (o la foto sola con el nombre debajo, en las dos "centradas").

**Por qué:** los cargos cambian de largo entre idiomas y la lista puede crecer o cambiar de orden;
un lienzo de coordenadas obligaría a retocar posiciones cada vez. Las medidas del diseño (diámetro
de cada foto, cuánto se sale del margen) viven en `components/quienes-somos/quienes-somos.data.ts`
y se multiplican por una variable CSS `--k` (1 en mobile, 1.25 en tablet, 1.4 en desktop), que es
la forma de aplicar D7 sin recomponer nada.

Consecuencia visible: **en desktop la sección mide unos 3400 px de alto** porque sigue siendo una
columna. Si Johan la quiere más corta habría que salirse de D7 (una rejilla de 2 o 3 columnas); es
un cambio pequeño en el componente, pero lo decide él.

Otras piezas:

- **El nombre es el chip rasgado de siempre** (`.map-chip`, D12) con `whitespace-nowrap`: en el
  diseño el chip se acerca más al borde que el resto del texto, así que el bloque de texto de las
  filas con foto a la izquierda se sale 25 px del margen derecho.
- **El anillo de las fotos es un solo SVG** (`public/images/quienes-somos/anillo.svg`). En Figma hay
  siete elipses dibujadas a mano de 44 KB cada una, todas el mismo trazo a distinto tamaño. Se
  usa una, estirada al diámetro de cada foto y girada un ángulo distinto por persona para que no
  se note la repetición.
- **Las fotos se recortan con `border-radius`**, no con la máscara de Figma: el anillo tapa el borde
  y el resultado es el mismo. El encuadre de cada una va en `focus` (object-position).
- **Fondo `bg-cream`** (`#FFEBC6`), color nuevo en `tailwind.config.js`: no existía en la paleta.

### Ampliacion a D10: las fotos del equipo NO miden 512 px

D10 decia que las fotos venian a 512 px de lado largo. Al bajar el nodo completo llegan **18
imagenes, dos por persona**: una pequena (240 a 512 px) y una grande (de 584 hasta 4096 px). Se
usaron las grandes, reducidas a 640 px de lado largo con `sips` a calidad 82 (`next/image` sirve
webp/avif al tamano que toque). No hace falta pedirle originales a Johan.

### Ampliacion a D8 (2026-09-22, madrugada, al construir el mapa)

Construido tal como se decidio, con estos detalles que no estaban previstos:

- El export del grupo de departamentos pesaba **812 KB** porque Figma convierte el trazo de cada
  departamento en un path de relleno cream (720 KB de los 812). Se tiraron esos 33 paths y se
  reemplazaron por `stroke` de 1 px en el `<g>` padre: **36 KB inline**. El mapeo esta en
  `docs/PATTERNS.md` y en `components/impacto/mapa.data.ts`.
- `Vector_31` era un duplicado exacto de `Vector_32` (Bogota) en gris; se descarto.
- Se construyo con las **7 etiquetas del diseno** (incluida Ibague) y el titulo "6 territorios" tal
  cual. La pregunta a Johan sigue abierta; cambiar cualquiera de las dos cosas es una linea.
- El diseno escribe "Bólivar"; en la web va **"Bolívar"**, que es la grafia correcta.
- El encendido va **en CSS puro** (transicion de `fill` y de opacidad, con `--i` por territorio) y
  lo dispara `useInView` de framer-motion una sola vez. Orden: Isla Fuerte, Cordoba, Bolivar,
  Atlantico, Guajira, Ibague, Bogota, o sea "desde Isla Fuerte hacia afuera", como dice el copy.
- Los colores del diseno (`#B3B3B3`, `#FF60AD`) no estaban en la paleta: el gris entro como `ash`
  en `tailwind.config.js` y el rosa se resolvio con `pink` (`#FF74BA`), que es el de la marca.

---

## D22. Los bloques de impacto van en flujo con un aire fijo entre ellos

En Figma cada bloque es una pantalla completa de 390x833 con la ilustracion arriba y el texto
abajo, y mucho aire muerto por encima y por debajo. Apilar cuatro pantallas tal cual habria dejado
huecos de 350 px entre bloques.

**Lo que se hizo:** dentro de cada bloque se conserva el ritmo del frame (la distancia entre la
ilustracion y el titulo sale de `texto - lienzo`, en `bloques.data.ts`) y **entre bloques se deja
un aire fijo de 120 px** (escalado por `--k`), igual que entre el mapa y el primer bloque. Es una
decision de criterio, no del diseno: si Johan quiere cada bloque a pantalla completa, es un numero
en `impacto-section.tsx`.

Otros ajustes de criterio:

- El area de texto de los bloques va de 46 px (izquierda) a 20 px (derecha) del lienzo de 390. Con
  el margen simetrico de 40 el chip "La comprension de la" no cabia y se partia por dentro.
- Los titulos se escriben con un chip por linea (`==...== ==...==`) y las lineas se eligen a mano
  en cada idioma, porque el chip es `inline-block` y si una linea no cabe se parte por dentro, que
  se ve mal (paso en frances con "6 territoires desormais"). **Elegirlas bien importa mas de lo
  que parece: ver D28.**
- Cada bloque tiene su propia forma de cambiar de estado (`entrada` en `bloques.data.ts`):
  `subir` (la piscina: barrido de abajo arriba, ver D25), `parpadeo` (las lamparas, ver D24), `llenar` (la copa: barrido dentro de la caja del liquido) y `florecer` (la persona:
  circulo que crece desde el centro). Queda ademas `fundido`, el cruce de opacidades generico,
  que hoy no usa ningun bloque. Los `extras` (flotadores, brillos) rematan con un rebote
  escalonado. Todo CSS, disparado por `data-encendido` con `useInView` al 60%.

---

## D23. Las capas de los bloques cargan `eager`

`next/image` deja las imagenes en `loading="lazy"` y **Chrome no pide una imagen lazy que esta
recortada por `clip-path`**, asi que las capas "despues" arrancaban su animacion sin haberse
descargado y el barrido no descubria nada. Se verifico con `getComputedStyle` por DevTools: el
`clip-path` transicionaba bien y los `<img>` tenian `complete: false`. Con `loading="eager"` en
las capas de los bloques (son SVG de 3 a 150 KB) se resolvio. El mapa no lo sufre porque es SVG
inline.

---

## D24. Las lamparas no se funden: chispean

**Pedido de Johan el 2026-09-22:** "cuando se prenden las luces de la calle, no prenden
inmediatamente, podemos hacer un parpadeo de luces de una de ellas y luego que prendan las dos
casi de inmediato, las luces no tienen fade-in/out".

Tenia razon: un fundido de opacidad es lo que hace una pantalla, no una lampara de sodio. Se
cambio la `entrada` del bloque de `fundido` a `parpadeo`, con dos keyframes en
`styles/global.css` y `animation-timing-function: steps(1, end)`, que mantiene el valor de cada
tramo hasta el siguiente: **no existe ni un frame de opacidad intermedia.**

Coreografia medida en el navegador (opacidad real de cada cono, leida cada 50 ms):

| ms           | Izquierda | Derecha   |
| ------------ | --------- | --------- |
| 0 - 180      | apagada   | apagada   |
| 180 - 270    | ENCENDIDA | apagada   |
| 270 - 450    | apagada   | apagada   |
| 450 - 540    | ENCENDIDA | apagada   |
| 540 - 660    | apagada   | apagada   |
| 660 - 780    | ENCENDIDA | apagada   |
| 780 - 930    | apagada   | apagada   |
| 930 - 1020   | ENCENDIDA | apagada   |
| 1020 - 1140  | apagada   | apagada   |
| 1140 en ade. | ENCENDIDA | -         |
| 1330 - 1420  | -         | ENCENDIDA |
| 1420 - 1510  | -         | apagada   |
| 1510 en ade. | ENCENDIDA | ENCENDIDA |

O sea: la izquierda titubea cuatro veces antes de enganchar, y la derecha entra de un golpe
justo despues, con un solo pestaneo. El patron de cada capa se declara en los datos
(`anim: 'titilar' | 'encender'` en `bloques.data.ts`), no por posicion en el arreglo.

### La trampa: el keyframe del 100% es obligatorio

Primera version: los keyframes terminaban en `76% { opacity: 1 }` sin declarar el `100%`. **Las
dos lamparas se apagaban al terminar la animacion**, aunque estuviera `forwards`. La razon es que
el `100%` implicito no repite el ultimo valor: toma el valor subyacente de la propiedad, que aqui
es el `opacity: 0` de la regla de base. Se vio en la captura del estado final, no antes.

Cualquier keyframe de este archivo que arranque desde un estado de base tiene que cerrar su
ultimo valor explicitamente.

### Reduced motion

El bloque general del final de `global.css` deja la duracion en casi cero, pero **no toca los
retrasos**, asi que la lampara derecha seguia esperando 1.2 s. Se anadio `animation-delay` y
`transition-delay` a cero para `.impacto-capa` y `.impacto-extra`. Verificado con
`Emulation.setEmulatedMedia`: con `prefers-reduced-motion: reduce` los cuatro bloques llegan a su
estado final de inmediato (lamparas en opacidad 1, piscina y copa con el recorte abierto, persona
con el circulo completo).

---

## D25. La piscina no cambia de estado: solo sube el agua

**Pedido de Johan el 2026-09-22:** "veo que es algo gris antes de que se llene, luego pasa a ser
blanco y azul del agua de la piscina, y por ultimo los flotadores, podemos evitar que la piscina
cambie de gris a blanco y simplemente sea blanco por defecto".

Tenia razon y el problema era de fondo, no de tiempos: el bloque encadenaba **tres cambios**
(gris -> blanco -> agua -> flotadores) cuando lo que la cifra cuenta es uno solo, que se llena.
El gris venia de tomar el frame "antes" de Figma tal cual, y ahi la piscina entera esta dibujada
en gris.

**Lo que se hizo:** el estado "antes" desaparecio del bloque. La piscina se dibuja una sola vez,
ya con los colores finales, y **no cambia nunca**; lo unico que se anima es el agua subiendo, y
detras los flotadores.

Para eso, las capas del frame "despues" se partieron por color de relleno, que es lo mismo que se
hizo con el mapa (D8):

| Relleno              | Que es             | Archivo          | Cuando se ve |
| -------------------- | ------------------ | ---------------- | ------------ |
| `#2CA0FF`, `#78C2FF` | el agua            | `agua-*.svg`     | se anima     |
| `#3D3B3B`, negro     | el borde del plano | `contorno-*.svg` | siempre      |

**El apilado importa**: los contornos van por **delante** del agua, como en el diseno, para que
el filo de cada plano de la piscina se vea desde el primer momento aunque este vacia. Por eso el
modelo de bloque gano `frente`, capas fijas que se pintan **despues** de lo que se anima (`base`
son las fijas de debajo). Orden final: fondo -> agua -> contornos, borde y escalera ->
flotadores.

Se borraron los seis SVG del estado gris (`antes-*.svg`) y los tres que mezclaban agua y contorno
(`despues-pared-izq`, `despues-pared-der`, `despues-suelo`), que ya no usa nadie. Estan en el
historial si alguna vez se quiere volver al estado gris.

**Nota para los otros bloques:** este mismo razonamiento aplicaria a la copa, que tambien viene
de un frame "antes" en gris. Hoy no se toco porque Johan no lo pidio, pero si lo pide, es el
mismo procedimiento: partir el SVG por color y dejar fija la estructura.

---

## D26. El paso 2 de la intro: el horizonte sangra hasta el borde de la pantalla

**Pedido de Johan el 2026-09-22:** desktop no lo ve listo, "más que todo la parte 2 de la intro".

A 1280, que es el ancho del frame de Figma, el paso 2 calcaba el diseño. El problema aparecia
**más ancho**: el lienzo de desktop se congela en 1280 (`ANCHO_MAXIMO`), asi que en una pantalla
de 1920 la ilustracion queda centrada en una caja de 1280 y `overflow-hidden` cortaba el horizonte
justo ahi. El resultado era una franja de arena flotando en mitad de la pantalla, con los cantos
cortados a la vista, y crema a los lados. Nadie lo habia visto porque toda la verificacion se
hizo a 1280 exactos.

**Lo que se hizo**, dos cosas:

1. **`sangra` en la variante** (`IntroVariant.sangra`, lista de grupos). Un grupo que sangra se
   estira a `104vw`, conserva su proporcion y **se ancla por su borde inferior**, de modo que la
   linea donde el horizonte toca el agua no se mueve cuando la pantalla crece. Hoy solo lo usa
   `horizonte` en el desktop del paso 2.
2. **El recorte del lienzo pasa a ser solo vertical** (`overflow-y-clip`) **y unicamente en los
   pasos que tienen `sangra`.** Los demas siguen con `overflow-hidden` exactamente como estaban:
   se probo primero en todos los pasos de desktop y destapaba la cola del garabato del paso 1,
   que el diseno corta. Arriba y abajo se recorta siempre, para que un paso no invada al
   siguiente. La seccion lleva `overflow-x-clip` para que lo que sangra no genere scroll lateral.

### De paso: el reflejo del agua estaba cinco veces mas palido

La mancha difusa del sol en el agua (`paso2-sol.png`) llevaba `opacity: 0.2` encima. Medido pixel
a pixel contra el render de Figma: el diseno oscurece el fondo en 27 niveles y nosotros en 5. El
PNG **ya es un gris neutro (102,102,102) con su propia transparencia al 18% en el alfa**, asi que
la opacidad extra sobraba. Quitada, el reflejo coincide con el diseno.

**Leccion que vale para todo el rediseno:** verificar solo al ancho exacto del frame de Figma no
basta. Los frames son 390, 1024 y 1280; las pantallas reales son mas anchas. Hay que mirar
tambien a 1512 y 1920, que es donde se ve si algo se congela mal.

---

## D27. Quienes somos en desktop: rejilla de 3 dispersa, no una columna

**Pedido de Johan el 2026-09-22:** "podemos dejar una version para desktop un poco mas ancha y
dispersamos las cards de forma mas abierta y creativa"; al concretar, "haz el zigzag, pueden ser
3 filas, ninguna va alineada a otra para que siga el mismo patron de disparcimiento".

Hasta ahora desktop era la columna de mobile escalada (D7 y D21): **1812 px de alto hoy, frente a
unos 3400 antes**, o sea cuatro pantallas de scroll para leer nueve nombres. Ademas el propio copy
de la seccion dice "somos un arrecife de mujeres", y una lista vertical es justo lo contrario de un
arrecife: dispersarlas ilustra el texto, no solo lo acomoda.

**Lo que se hizo, solo en `lg` (>=1024). Mobile y tablet no se tocan.**

- La banda pasa de 546 px (390 x 1.4) a **1200 px**, y el parrafo de entrada se acota a 760 px,
  porque una linea de 1200 px no se lee.
- Las nueve fichas van en una **rejilla de 3 columnas** y cada ficha se convierte en columna:
  foto arriba, chip del nombre y cargo debajo, centrados. En mobile siguen siendo foto a un lado
  y nombre al otro.
- **Cada ficha se corre de su casilla** con un desplazamiento propio (`Integrante.dispersion`, en
  px). Dentro de una fila no se repite ningun desplazamiento vertical y dentro de una columna
  ninguno horizontal: **no hay dos fichas alineadas entre si**, que era la condicion de Johan.

### Dos detalles que costaron

1. **El desplazamiento va en `transform`, que no ocupa espacio.** La rejilla sigue repartiendo el
   alto de forma pareja (bien: no deja huecos raros), pero la ficha mas baja se salia del bloque
   y **quedaba debajo del footer**. Por eso desktop lleva 140 px de aire abajo, calculados sobre
   el desplazamiento mayor.
2. **El sangrado de las fotos y el tamano del nombre viajan como variables CSS**
   (`--sangra`, `--nombre`), no como `style` en linea: un `style` en linea no lo puede pisar una
   clase de breakpoint, y en desktop hay que anular el sangrado y bajar el nombre de 30 a 26 px
   para que quepa en una columna de 356 px.

---

## D28. Las lineas de los chips se eligen por ancho medido, no a ojo

**Pedido de Johan el 2026-09-22:** "en espanol lo veo todo bien pero en otros idiomas sobra
espacio y se ve raro".

Tenia razon. La columna de texto de un bloque mide **324 px** (390 menos 46 de margen izquierdo y
20 del derecho) y cada chip es tan ancho como su texto, asi que un corte de linea desafortunado
deja un chip diminuto flotando con un hueco enorme al lado. Medidos los 17 chips de los cuatro
bloques en los tres idiomas con `getBoundingClientRect`, salieron dos casos malos, los dos fuera
del espanol:

| Idioma | Bloque  | Antes                  | Despues       |
| ------ | ------- | ---------------------- | ------------- |
| en     | copa    | **127**, 204, 193, 227 | 203, 250, 227 |
| en     | persona | 240, **326**, 225      | 240, 269, 297 |
| fr     | persona | **326**, 243, **122**  | 161, 278, 260 |

El "Over 50" de 127 px y el "ateliers" de 122 eran los que se veian raros; los de 326 se pasaban
de la caja por un par de pixeles.

**Como se corrige:** se reescribe el corte de linea, y si hace falta la traduccion misma, hasta
que los chips de un bloque queden en una franja parecida y ninguno baje de ~200 px ni pase de 324.
En ingles la copa paso de "Over 50 / eco-products / delivered for / menstrual care" a
"More than 50 / eco-products for / menstrual care": tres chips parejos en vez de cuatro desiguales.

**Intento fallido, anotado para no repetirlo:** tambien reparti de otra forma la copa en frances y
quedo peor (160, 269, 221, 184, en zigzag) que el original (160, 186, 198, 291, en escalera
ascendente, como el espanol). Se revirtio. **La forma que busca el diseno es una escalera, no
chips iguales**; lo que rompe la pieza es un chip corto aislado, no que crezcan.

La herramienta para esto es un sondeo por DevTools que imprime el ancho de cada chip por idioma;
el procedimiento esta en `docs/PATTERNS.md`.
