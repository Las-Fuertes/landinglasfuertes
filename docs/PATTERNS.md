# Convenciones del repo

Todo lo de aquí está verificado leyendo el código, no asumido. Si algo cambia, actualiza este
archivo en el mismo commit. La idea es que ninguna sesión tenga que volver a derivar esto.

## Grid y layout

`components/layout/page-grid.tsx` exporta `PageGrid`, el contenedor de toda sección:

- 4 columnas en mobile, 12 desde `md`
- inset lateral de 40px (`px-page-margin`), que baja a 24px bajo los 380px de ancho
- gutter de 25px (`gap-x-grid-gutter`)
- ancho máximo 1200px, centrado

Uso típico: `<PageGrid><div className="col-span-4 md:col-span-12">...</div></PageGrid>`.

También existe `components/layout/grid-column.tsx`.

## Breakpoints

`tailwind.config.js` NO define `screens`, así que son los de Tailwind por defecto:

| Nombre | Ancho   | Qué llamamos así |
| ------ | ------- | ---------------- |
| (base) | < 640px | mobile           |
| `sm`   | 640px   | mobile grande    |
| `md`   | 768px   | tablet           |
| `lg`   | 1024px  | desktop          |
| `xl`   | 1280px  | desktop grande   |

Para validar contra Figma: mobile < 768, tablet 768 a 1023, desktop >= 1024.

## Colores de marca

Definidos en `tailwind.config.js`. **Se usan por nombre (`bg-blue`, `text-red`), nunca el hex.**

| Nombre Tailwind | Hex                                                        |
| --------------- | ---------------------------------------------------------- |
| `blue`          | `#0413D8`                                                  |
| `blue-700`      | `#78C2FF` (azul claro, ojo: el número no indica oscuridad) |
| `blue-300`      | `#030fa5` (azul oscuro)                                    |
| `purple`        | `#b3b8f0`                                                  |
| `red`           | `#F57087`                                                  |
| `pink`          | `#FF74BA`                                                  |
| `yellow`        | `#FFD700`                                                  |
| `orange`        | `#FF7E37`                                                  |
| `black`         | `#242424`                                                  |
| `beige`         | `#FCF5E9` (fondo del sitio)                                |
| `beige-light`   | `#FAF9F6`                                                  |
| `cream`         | `#FFEBC6` (fondo de "Quiénes somos")                       |

## Tipografía y espaciado

Escala de texto: `text-h1` (40px), `text-h2` (30px), `text-h3` (20px), `text-h4` (18px),
`text-p-lg` (14px), `text-p-sm` (13px). Todas con `font-weight: 400` por defecto.

Espaciado: `xs` 5px, `s` 10px, `m` 15px, `l` 25px, `xl` 40px, `xxl` 65px. Más
`page-margin` (40px) y `grid-gutter` (25px), que usa el `PageGrid`.

Cortes de línea: todos los títulos (`h1` a `h6`) llevan `text-wrap: balance` y los párrafos
(`p`, `li`) `text-wrap: pretty`, desde `@layer base` de `styles/global.css`. No hace falta
`text-balance` en cada título; para quitarlo en un uso, `text-wrap` (utilidad de Tailwind).

Fuente manuscrita puntual: `Homemade_Apple` vía `next/font/google`, ver `components/welcome/welcome.tsx`.

## Copy e i18n

Los textos NO van hardcodeados en el componente. Viven en `locales/es.json`, `locales/en.json` y
`locales/fr.json`, y se leen con el hook propio:

```tsx
import { useTranslation } from '../../hooks/useTranslation';

const { t } = useTranslation();
t('hero.section1.text1');
t('alguna.clave', { emi: 'EMI' }); // interpolación con {emi}
```

`hooks/useTranslation.ts` resuelve la clave por puntos. **Si falta la clave en el idioma activo,
imprime un warning en consola y renderiza la clave cruda en pantalla.** Por eso conviene agregar la
clave en los tres idiomas a la vez.

Para negritas embebidas en un texto de `locales`, usa `renderTextWithBold` de
`lib/render-text-with-bold.tsx` en lugar de partir el string.

### Regla: los tres idiomas van en la misma entrega

**Ninguna sección se da por terminada con claves solo en español.** Toda entrega incluye `es`, `en`
y `fr` completos. No es un paso aparte ni algo que se pregunte cada vez: es parte de la definición
de "hecho". El copy de referencia viene del diseño en español; `en` y `fr` se traducen en la misma
pasada.

## Resaltado de palabras: el chip rasgado

**Este es el patrón del sitio para una palabra o frase resaltada. No inventes otro.** Un solo
componente, `components/layout/resaltado.tsx`, con los estilos `.resaltado*` de
`styles/global.css`. Por qué es así: `docs/resaltado/DECISIONES.md`, D1.

```tsx
import { Resaltado, TextoResaltado } from '../layout/resaltado';

// Texto de locales con ==resaltado== (y **negrita**), como único contenido de su bloque:
<p><TextoResaltado texto={t('hero.section1.text2')} /></p>
<h3><TextoResaltado texto={t('impacto.bloques.duchas.title')} variante="titulo" /></h3>
// o, lo mismo: {renderTextWithMarks(t('...'), { variante: 'titulo' })}

// Un texto resaltado entero:
<h3><Resaltado className="text-h3">{t('emi.comprendimos')}</Resaltado></h3>
<Resaltado partir={false}>{nombre}</Resaltado>
```

**Una pieza de fondo por línea visual, cortada por el navegador.** Un medidor invisible al final
del bloque (`lib/use-lineas-medidas.ts`) coloca las palabras con la misma tipografía y el mismo
ancho; cada línea se pinta como una pieza `inline-block` que no se parte. Nunca hay fondo a todo el
ancho y los cortes no se escriben a mano por idioma: dos resaltados seguidos (`==a== ==b==`)
cuentan como una sola frase. Si la frase no cabe, se parte en dos piezas; **no se achica la
letra**. Un `\n` dentro del resaltado es un corte forzado (título y subtítulo de las rutas del
mapa). Una palabra de 3 letras o menos en un extremo va pegada a su vecina, y el espacio de no
separación (U+00A0) no se parte: nunca queda "¿por" solo en su pieza.

| Variante                                  | Para                                                                               | Giro                             | Fondo                                | Aire lateral                                              |
| ----------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------ | --------------------------------------------------------- |
| `linea` (por defecto en `TextoResaltado`) | dentro de un párrafo (Introducción)                                                | -0,54°                           | 1,1 em, centrado en la línea         | 0,15 em, reservado con margen en los extremos de la frase |
| `titulo`                                  | título apilado, una tira por línea (Impacto; el modal del mapa con `giro={-0.54}`) | -1,23°, sobre el borde izquierdo | 1,1 em                               | 0,27 em                                                   |
| `etiqueta` (por defecto en `Resaltado`)   | una frase suelta (cinta de EMI, nombres, rótulos del mapa, etiquetas de Súmate)    | -0,54°                           | 1,7 em, reservado con `margin-block` | 0,33 em                                                   |

Props: `giro` (grados), `tono` (`negro`: fondo `black` y texto `papel`, el `#FFF5E8` de Figma;
`rosa`: `pink-sol`; `papel`: fondo `papel` y texto `blue`), `partir={false}` para lo que nunca se
parte (nombres, rótulos), `className` para el tamaño y el tracking del texto (va en el resaltado y
en su medidor; no lo pongas en un hijo). Un uso con geometría propia sobrescribe las variables:
el sello "EMI" es `variante="etiqueta" tono="rosa" giro={-4.09}` con
las variables `--fondo-alto: 1.1em`, `--aire-x: 0.15em`, `--linea: 0.86` y `--hueco` (ver `SELLO`
en `components/emi/emi-section.tsx`), que conservan su caja de antes para no mover el título.

**Regla de no solape (prioridad de Johan).** El fondo nunca pisa las líneas de texto vecinas ni
se funde con el fondo de la línea de al lado. Por eso:

- El fondo es un `::before` con `inset` negativos, no `padding`: la pieza mide lo que su texto y
  resaltar no cambia dónde corta la línea.
- Su alto cabe en el interlineado. Con Bricolage la caja de una línea mide 1,2 em y la tinta va
  de 0,16 a 1,13 em; un fondo de 1,1 em con interlineado de 1,2 a 1,25 deja 0,05 a 0,075 em por
  lado, que tienen que alcanzar para la subida del giro (ancho x sen(giro) / 2) y para lo que
  derrama el borde rasgado (la región de `#map-rough-edge` es un 3 % del alto: menos de 1,5 px).
  **No subas el giro, el alto del fondo ni la región del filtro sin volver a medir**, y no bajes
  el interlineado de un bloque con resaltado por debajo de 1,2.
- Una etiqueta tiene fondo más alto que su línea: la pieza reserva el sitio con `margin-block`.

**Cuidado con el filtro.** Un `filter: url(#map-rough-edge)` que apunta a un filtro inexistente no
degrada a "sin filtro": hace **desaparecer** el elemento. Por eso el filtro se monta una sola vez
en `pages/_app.tsx` vía `components/layout/rough-edge-filter.tsx`, y no dentro de una sección.

Piezas propias que no usan el componente: la cinta de papel del título de Donaciones
(`components/donations/titulo-cinta.tsx`, cada tramo con su medida de Figma; comparte el hook de
corte) y los chips del panel del mapa educativo que no son texto resaltado.

## Verificación visual antes de entregar

**La herramienta es `scripts/captura.js`.** Habla con el Chrome de la máquina por el protocolo de
DevTools (usa el `ws` que Next trae compilado, no instala nada), fija el viewport al ancho exacto y
desplaza hasta el ancla:

```bash
npm run dev   # en :3000
node scripts/captura.js --ancla quienes-somos --w 390 --h 1240 --out /tmp/q.png
node scripts/captura.js --ancla intro-paso-2-desktop --w 1280 --h 832 --lang fr --out /tmp/p2.png
node scripts/captura.js --ancla quienes-somos --w 390 --h 1240 --y 1240 --out /tmp/q2.png  # 2.º tramo
```

Si el PNG pesa menos de 10 KB, algo salió mal (ancla inexistente o página sin hidratar): míralo.

**Antes de arrancar `npm run dev` después de un `npm run build`, borra `.next`.** El build deja
artefactos de producción ahí y el dev server que los hereda sirve páginas que no hidratan.

Lo que sigue es el método anterior, con Chrome a pelo y el banco de iframes. Sigue funcionando pero
se volvió intermitente (capturas grises o en blanco sin causa visible); úsalo solo si el script no
sirve:

```bash
npm run dev
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars \
  --window-size=810,860 --virtual-time-budget=15000 \
  --screenshot=/tmp/revision.png \
  "http://localhost:3000/dev-revision?anclas=intro-paso-1,intro-paso-2"
```

`pages/dev-revision.tsx` monta un iframe por ancla, del ancho que se le pida (`w`, `h`, por
defecto 390x700), en el idioma que se le pida (`lang=en`, `lang=fr`; sin él, español), y lo
desplaza hasta ese elemento. Solo existe en desarrollo: en producción la ruta es 404.

Las anclas de la Introducción son `intro-paso-N` en mobile y `intro-paso-N-tablet` /
`intro-paso-N-desktop` en los otros dos anchos.

**Trampas que cuestan tiempo:**

1. **No uses `--force-device-scale-factor` junto con `--window-size`.** Le cambia el viewport CSS a
   Chrome y la captura sale recortada, como si el layout estuviera roto cuando no lo está.
2. **El banco tiene que servirse desde la propia app.** Un HTML en `file://` no puede tocar el
   iframe de `localhost` por política de mismo origen, y el desplazamiento falla en silencio.
3. **La ventana tiene que ser más ancha que la suma de los iframes.** Si no caben, no se ve el
   sobrante; y antes de que los iframes llevaran `flex:none`, flex los encogía y un iframe pedido a
   768 caía por debajo de `md` y mostraba la variante mobile sin avisar. Para tablet y desktop,
   una ancla por captura.
4. **Chrome headless a veces devuelve una captura gris de 4-5 KB** (la página cargó pero el efecto
   que monta los iframes no llegó a correr) o en blanco justo después de que el dev server
   recompile. No es un bug de la página: repite la captura. Un `ls -la` del PNG lo delata.
5. **Si el dev server muestra `Can't resolve '@vercel/turbopack-next/internal/font/google/font'`
   y la página no renderiza**, es caché rancia de Turbopack, no un error del código. Se cura con
   `rm -rf .next node_modules/.cache` y arrancar de nuevo. Sale sobre todo después de alternar
   `npm run build` y `npm run dev`.
6. **Si el puerto 3000 ya responde, puede ser el dev server de OTRO worktree.** Compruébalo con
   `lsof -p <pid> | grep cwd` y levanta el tuyo en otro puerto (`npx next dev -p 3111`).

### Medir el resaltado antes de dar por buena una traducción o un cambio de estilo

`scripts/medir-resaltado.js` mide los 12 usos del resaltado en los tres idiomas y cinco anchos, y
captura cada uno. Con el dev server en `:3000`:

```bash
node scripts/medir-resaltado.js --out /tmp/chip --prefijo despues          # todo (unos 10 min)
node scripts/medir-resaltado.js --langs fr --anchos 390x844 --usos intro3,impacto-titulo
```

Por cada pieza de fondo da: en cuántas líneas cae (tiene que ser 1), el exceso de fondo sobre el
texto (máximo 24 px), si es una palabra de 3 letras o menos sola, la separación con las líneas de
texto vecinas y con los otros fondos (>= 0, tolerancia 1 px). La geometría es la real: quita los
giros, mide y vuelve a girar cada caja con su matriz; el fondo es el `::before` más lo que derrama
el filtro rasgado. Termina con una tabla PASA / FALLA por uso, idioma y ancho, y deja
`<prefijo>-<uso>-<lang>-<ancho>.png` y `<prefijo>-medidas-<langs>.json` en `--out`. Para ir más
rápido, lanza un proceso por idioma en paralelo. Donaciones está exento de la separación: sus
cintas se montan por diseño y todo su texto va por encima de todas las cintas.

## Animación

- **Entrada al hacer scroll**: `FadeIn` (framer-motion, `whileInView`, `once: true`, fade + 28px
  desde abajo). Es el patrón por defecto para secciones nuevas; acepta `delay` para stagger.
- **GSAP (solo el núcleo, sin ScrollTrigger)**: solo en las transiciones de la Introducción
  (`components/intro/intro.motion.ts`). El avance es por gesto, no por posición del scroll, así que
  ScrollTrigger no se usa. Todo timeline va dentro de `gsap.context()` y se deshace con
  `ctx.revert()` al desmontar (StrictMode monta dos veces). No lo extiendas a secciones nuevas sin
  razón. Ver `docs/introduccion/DECISIONES.md`, D2.
- **Swiper**: solo en el carrusel de `components/principles/`.
- **Gestos de rueda y scroll fuerte**: `lib/gesto-rueda.ts` (constantes y `registrarRueda`). Lo
  comparten la intro y el "Saltar mapa" del Mapa educativo. Una sección nueva que necesite
  distinguir gestos o detectar un scroll fuerte parte de ahí, no de otra copia.
- **`prefers-reduced-motion`**: el repo ya lo respeta en varios sitios (por ejemplo
  `components/education-map/education-map-section.tsx`). Toda animación nueva debe respetarlo.

### Lenguaje de movimiento del sitio (preferencias de Johan)

Destilado de 6 rondas de feedback sobre la Introducción y Bienvenida (2026-09-22 y 23; detalle y
números en `docs/introduccion/DECISIONES.md`, D2 a D6). **Toda animación nueva de una sección
parte de aquí**, y si Johan corrige algo que contradiga esta lista, se actualiza la lista.

1. **Nada lineal ni en bloque.** Cada pieza tiene un rol y su propio tiempo; las salidas y las
   entradas se solapan. Un fade de todo a la vez es lo que se rechazó en el primer intento.
2. **El texto manda, porque la intro cuenta una historia.** Al salir, el texto es lo ÚLTIMO en
   irse; al entrar, lo PRIMERO en llegar. Las piezas nunca compiten con el texto.
3. **Ritmo pausado.** La diseñadora pidió más lento: las transiciones de la intro rondan 1,7 a
   1,9 s. Todo el ritmo cuelga de una sola constante (`ESCALA_TIEMPO`), para ajustar sin tocar cada
   animación.
4. **Un gesto, un paso.** Rápido o lento, un scroll avanza un paso. La inercia del trackpad no
   cuenta como gesto nuevo; un cambio de sentido o un impulso nuevo sí. Nunca se bloquea más de lo
   que dura la transición. Salir siempre es posible ("Saltar animación" ante scroll fuerte, Tab o
   Escape).
5. **Continuidad entre partes, sin duplicados.** Lo que se repite de una parte a otra (sol, barco,
   olas) viaja a su nuevo sitio. Si el dibujo cambia de forma, se hace el relevo con **squash and
   stretch** (se aplasta, se cambia en el punto de máximo aplastamiento y se estira con `back.out`).
   Un fundido cruzado entre dos dibujos distintos se lee como "fantasma" o como imagen doble: no.
6. **Los fondos son suaves.** Tierra, nubes y elementos de fondo entran y salen solo con opacidad o
   con muy poco desplazamiento. Los movimientos fuertes son para las protagonistas.
7. **Los detalles llegan tarde y lineales.** Un personaje que se asoma (la persona del barco) es
   una "nota coqueta": entra medio segundo después de la transición, lineal, sin rebote, sin
   escalar, recortado exactamente por el borde del dibujo del que sale (si el borde es inclinado,
   el recorte también) y sin frenar el scroll.
8. **Vida en reposo: "sutil, pero que se vea que se mueve".** Mientras se está en un paso, algo
   se mueve: flotar, mecerse, derivar, respirar, rayos que giran. Quien mira 3 s cualquier paso
   tiene que notar al menos dos piezas moviéndose. Amplitud de 5 a 10 px de lienzo mobile (escalada
   por alto), giros de 3° a 4° en piezas grandes y hasta 7° a 10° en garabatos chicos, opacidad que
   respira hasta 0,55 a 0,65, ciclos de 2,5 a 5,5 s (o una vuelta en más de un minuto para
   rotaciones). La versión de 2 a 3 px (D5) no se percibía. Arranca después de la entrada, vuelve a
   neutro antes de una salida, se pausa fuera de pantalla y nunca descubre el extremo de una pieza
   que el lienzo corta. Ver D8.
9. **Solo se anima lo que es vector.** Animar una parte de un raster con trucos (filtros sobre una
   zona) se retiró: se espera a que la diseñadora exporte la pieza como SVG aparte.
10. **Principios clásicos de animación.** Johan los reconoce y los valora (squash and stretch,
    anticipación, desfase, seguimiento). Proponerlos por su nombre ayuda a decidir.
11. **El reposo es sagrado.** Al terminar cualquier animación, lo que se ve es exactamente el
    diseño aprobado. Se verifica con capturas `--quieto` contra las de antes.
12. **Decidir mirando.** Ante dos opciones de movimiento, se construyen las dos detrás de un
    parámetro temporal (`?barco=a|b`) para que Johan y la diseñadora las comparen en el navegador,
    y luego se borra la perdedora.

### Drawer de Súmate: cómo abrirlo desde cualquier componente

"Súmate a Las Fuertes" ya no es una sección: es un drawer (`components/sumate/sumate-drawer.tsx`)
con un solo estado global (`components/sumate/sumate-drawer-context.tsx`). El provider envuelve la
página y el footer en `pages/index.tsx`, y ahí mismo se montan el drawer y el botón flotante.

```tsx
import { useSumateDrawer } from '../sumate';

const sumate = useSumateDrawer();
<button type="button" aria-haspopup="dialog" onClick={() => sumate.open('tripulantes')}>
```

- `open(origen)` registra `sumate_open` en GA con `origen` (`'tripulantes' | 'footer' |
'flotante' | 'hash'`); si añades un disparador, suma su origen al tipo `SumateOrigen`.
- Abrir pone `#sumate` en la URL con `history.replaceState` y cerrar lo quita, sin scroll.
  `/#sumate` y `/#donar` abren el drawer al cargar (el segundo baja hasta "¿Cómo quieres ayudar?").
- Fuera del provider (otra página), `open()` navega a `/#sumate`.
- Forma: lateral derecho `lg:max-w-xl` en desktop; sheet de `92dvh` desde abajo en móvil y
  tablet, como `education-map/route-sheet.tsx`. Trampa de foco con el mismo `FOCUSABLE`.
- Dentro del drawer, `useEnDrawer()` vale `true`: `FadeIn` se muestra sin entrada. Las piezas de
  Súmate no usan clases `lg:`, así que en el drawer desktop (576 px) se ven en su versión `md:`.
  Si una pieza necesita otro trato ahí, usa `enDrawer ? 'lg:...' : ''` (ver el barco de
  `proyecto-destacado.tsx`).
- Un enlace a un ancla interna (`#donar`) dentro del drawer se desplaza a mano con
  `scrollIntoView` y `preventDefault`: un `href="#..."` normal cambiaría el hash de la URL.
- Para capturarlo: `node scripts/captura.js --clic "footer nav button" --w 1440 --h 900 --tras 900`
  o `--hash sumate`. El scroll interno es `[data-drawer-scroll]`.

**Secciones que retiran el botón flotante: `data-oculta-flotante`.** Una sección con este
atributo esconde el botón "Súmate" mientras está en pantalla y lo devuelve al salir (hoy, el Mapa
educativo; ver `docs/mapa-educativo/DECISIONES.md`, D5). Para sumar otra no hay que tocar el botón:

```tsx
<section id="mi-seccion" data-oculta-flotante="">
```

`sumate-flotante.tsx` observa todas con un `IntersectionObserver` (`rootMargin -10% 0px -10% 0px`,
así una franja que apenas asoma no cuenta) y las vuelve a buscar con un `MutationObserver` si se
montan tarde. Se oculta con opacidad y un `translate` corto (300 ms), sin mover el layout ni
desmontarse. Se suma a las otras dos razones para ocultarlo: antes de terminar la intro y con el
drawer abierto.

### Verificar la Introducción con pin

Con el pin solo está montada la parte actual, así que para la intro no sirve `--ancla`. Flags de
`scripts/captura.js` (detalle en la cabecera del script):

- `--paso N`: agrega `?introPaso=N`, fuerza la parte (1 a 3) ya enganchada y sin entrada.
- `--gesto dY`, `--rafaga N:dY`: un evento de rueda real por CDP, o N seguidos cada 16 ms.
- `--inercia A:r`: simula un trackpad, 60 eventos cada 30 ms (1,8 s) desde `A` decayendo por `r`.
  `120:0.9` es un gesto normal (unos 1200 px); `200:0.95` es un scroll fuerte (unos 3700 px).
- `--tecla K`: keydown y keyup reales (`Tab`, `Escape`, `ArrowDown`...).
- `--tras-lista 0,300,600,900,1200`: una captura por cada ms tras el gesto, con sufijo `-<ms>`.
- `--recorte id`: recorta a la caja de ese elemento, para comparar una parte aunque se mueva.
- `--reducido` emula `prefers-reduced-motion`; `--hash h` carga con `#h`; `--leer expr` imprime.
- `--quieto`: agrega `?quieto=1`, que congela el movimiento en reposo de la intro. Úsalo en toda
  comparación de capturas en reposo, si no cada captura sale con las piezas en otro punto.
- `--param k=v`: añade cualquier otro parámetro a la URL.
- `--clic sel`: clic real de ratón en el elemento que casa con el selector CSS (abre el drawer).

Tablet se verifica a 1000 de ancho, nunca a 1024 (a 1024 exacto gana desktop).

## Assets

- `design-assets/<seccion>/` guarda el SVG fuente editable, el que vino del diseño.
- `public/images/<seccion>/` guarda lo que sirve producción, en kebab-case, con variantes
  responsive cuando hace falta (ver `public/images/education-map/map-1200.avif` y compañía).
- **No hay svgr configurado**: un `.svg` importado no se vuelve componente React. Si el SVG
  necesita animarse por path (como el mapa de Colombia), va escrito como componente React inline en
  `components/`, no como archivo en `public/`.
- Las imágenes se renderizan con `next/image`. Existe además `components/app-image/`, un wrapper
  con caché propia; mira su `README.md` antes de usarlo.

## Mapa de impacto: mapeo path -> territorio

Derivado el 2026-09-21 comparando el color de relleno del frame "después" (`1102:60`) y escrito en
`components/impacto/mapa.data.ts`. **No hace falta volver a sacarlo.** Los 33 vectores de Figma
se llaman todos `Vector`; en el export del grupo `1102:110` salen numerados `Vector_1..33` en el
mismo orden que el árbol de `get_metadata`:

| Figma       | Nodo       | Territorio      |
| ----------- | ---------- | --------------- |
| `Vector_1`  | `1102:111` | Guajira         |
| `Vector_2`  | `1102:112` | Atlántico       |
| `Vector_13` | `1102:123` | Córdoba         |
| `Vector_25` | `1102:135` | Bolívar         |
| `Vector_30` | `1102:140` | Ibagué (Tolima) |
| `Vector_32` | `1102:142` | Bogotá D.C.     |
| `Group 183` | `1102:144` | Isla Fuerte     |

`Vector_31` (`1102:141`) es un duplicado exacto de `Vector_32` en gris y se descartó. El export de
Figma trae además un path cream por departamento que es el trazo convertido a relleno (720 KB de
los 812 del archivo); se tiró y se reemplazó por `stroke` de 1 px en el `<g>` padre. Colores del
diseño: gris `#B3B3B3` (`ash` en Tailwind), rosa `#FF60AD` (se usa `pink`, `#FF74BA`).

El encendido es CSS puro (`.impacto-territorio` y `.impacto-etiqueta` en `styles/global.css`):
cada path y cada chip llevan su turno en `--i` y el contenedor recibe `data-encendido` cuando
`useInView` (framer-motion, `once`) lo ve. Reduced-motion quita duración y escalonado.

Para capturar el estado final: `node scripts/captura.js --ancla impacto --w 390 --h 828 --tras 4500`.

## Patrón de componente

- Archivo en kebab-case dentro de una carpeta por sección: `components/<seccion>/<nombre>.tsx`.
- Un `index.ts` por carpeta que reexporta, para importar `from '../seccion'`.
- `'use client'` arriba en todo componente con estado, efectos o animación.
- Export default para el componente de sección, named export para las piezas internas.
- Responsive con clases de Tailwind (`md:`, `lg:`), no con JavaScript, salvo cuando la animación
  realmente lo exige.
