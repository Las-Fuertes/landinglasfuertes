# Arranque de sesión nueva

Pega esto como primer mensaje en un chat nuevo. Está escrito para alguien sin ningún contexto
previo de la conversación.

---

````
Trabajamos en la web de Fundación Las Fuertes, una organización de educación menstrual integral.
Es un Next.js 16 con Pages Router (carpeta `pages/`, NO App Router), TypeScript y Tailwind 3.

El primer tramo de la página ya está reconstruido y **publicado**: la Introducción de 3 pasos, la
sección "Así se ve el impacto en acción" (mapa de Colombia que se enciende + 4 bloques animados) y
"Quiénes somos". Todo está en `main` y en producción.

EL TRABAJO DE ESTA SESIÓN: LA INTRODUCCIÓN PASA A SER UNA SECUENCIA CON SCROLL

Hoy los 3 pasos de la Introducción son tres bloques estáticos, uno debajo del otro: al hacer
scroll el contenido sube como en cualquier página. Johan quiere otra cosa, descrita con sus
palabras (2026-09-22):

  "llego al hero, veo la primera parte de la intro, y cuando hago scroll, necesito que haya una
  transición a la segunda parte, las piezas se van y el texto hace un fade out y luego llegan las
  piezas y el texto de la siguiente sección, luego hago scroll de nuevo y vuelvo a ver un
  comportamiento similar a la tercera parte de la intro, luego si llego al contenido de la página
  en si, si hago scroll hacia arriba después de ver la intro vuelvo al primer paso y todo se
  repite de nuevo"

O sea: la Introducción se queda fija ocupando la pantalla mientras el scroll avanza, y **el scroll
no desplaza el contenido: cambia de paso**. Cada cambio es una salida (las piezas se van y el
texto se desvanece) seguida de una entrada. Al terminar el paso 3 la página sigue normal hacia
Impacto; y hacia arriba el recorrido se deshace, paso 3 -> 2 -> 1, tantas veces como se quiera.

Johan dijo explícitamente que esta parte es muy importante. **Antes de construir, acuerda con él
la mecánica**: cuánto scroll cuesta cada paso, si el cambio es continuo (ligado a la posición del
scroll) o por tramos (un gesto = un paso completo), y qué hace en móvil.

ANTES DE TOCAR NADA, lee en este orden:
  1. CLAUDE.md                              qué es el proyecto y cómo se corre
  2. docs/secciones-impacto/PROGRESS.md     el estado vivo y lo que falta
  3. docs/secciones-impacto/DECISIONES.md   qué se decidió y por qué. Para ESTA tarea mandan
                                            D6, D13, D16, D17 (con su ampliación) y D26
  4. docs/PATTERNS.md                       convenciones, y la sección "Animación"

LO QUE TIENES QUE SABER ANTES DE DISEÑAR LA SOLUCIÓN

1. **Esto ya existió y se quitó a propósito.** La Introducción original era exactamente eso: tres
   secciones animadas con GSAP + ScrollTrigger. Se eliminó al reconstruirla (D6) junto con el
   botón de saltar animación y el `localStorage` de visitante. **El código viejo sigue en el
   commit `92fda5e`, en `components/hero/hero.tsx`**: léelo antes de inventar nada, porque
   resuelve el mismo problema sobre esta misma página. Hoy no queda ni una línea de ScrollTrigger
   en el repo.

2. **GSAP sigue instalado y permitido** (D16: Johan pidió no desinstalarlo justo porque venían
   animaciones). `framer-motion` es el patrón por defecto del sitio y también sabe hacer esto.
   Elige con criterio y deja escrito el porqué.

3. **Hay tres juegos de pasos montados a la vez, no uno.** `components/intro/intro-section.tsx`
   renderiza los 3 pasos por cada breakpoint (9 bloques) y esconde los que no tocan con clases
   (`md:hidden`, `hidden md:block lg:hidden`, `hidden lg:block`). Cualquier cosa que mida alturas
   o fije posiciones tiene que contar con que 6 de esos 9 bloques están ocultos pero existen en el
   DOM. Es la trampa más probable de esta tarea.

4. **Cada paso es un lienzo con capas en porcentaje** (D13): las capas viven en
   `components/intro/intro.data.ts` en px del lienzo de Figma y el componente las pasa a
   porcentaje. Lienzos: mobile 390x700, tablet 1024x1366, desktop 1280x832. Tablet y desktop
   reutilizan las capas de mobile con una transformación afín por grupos (D17), así que animar
   "las piezas" es animar esos grupos, no imágenes sueltas.

5. **Las anclas existen y son las que usa la herramienta de captura**: `intro-paso-1`,
   `intro-paso-2`, `intro-paso-3` en mobile, y con sufijo `-tablet` / `-desktop` en los otros dos
   anchos. Si el nuevo montaje las cambia, actualiza `docs/PATTERNS.md`.

6. **Una capa puede sangrar hasta el borde de la pantalla** (D26, `IntroVariant.sangra`): el paso 2
   en desktop lo usa para el horizonte. Si cambias el contenedor o su recorte, compruébalo a 1920,
   no solo a 1280.

LO QUE NO SE PUEDE ROMPER

- **`prefers-reduced-motion`.** Todo el sitio lo respeta. Con movimiento reducido la Introducción
  tiene que ser navegable sin secuencia: lo más probable es caer a los 3 pasos estáticos de hoy.
  Se verifica con `Emulation.setEmulatedMedia` por DevTools; hay ejemplos en la bitácora.
- **Que se pueda salir.** Una sección que se apropia del scroll atrapa a quien usa teclado, lector
  de pantalla o un trackpad que manda eventos raros. Piensa en teclado (tab, flechas, av pág) y en
  qué pasa si alguien llega con `#impacto` en la URL.
- **Los tres idiomas** (`locales/es.json`, `en.json`, `fr.json`). El copy ya está; si añades algo,
  va en los tres.

CÓMO SE VERIFICA (no se entrega nada sin mirarlo)

`scripts/captura.js` fija el viewport al ancho que pidas, desplaza hasta un ancla y guarda un PNG:

```bash
npm run dev   # en :3000
node scripts/captura.js --ancla intro-paso-2-desktop --w 1280 --h 832 --out /tmp/p2.png
node scripts/captura.js --ancla impacto --w 390 --h 828 --tras 4500 --out /tmp/i.png
````

`--tras` son los ms entre el desplazamiento y la captura: sirve para ver el final de una animación.
Un PNG de menos de 10 KB es una captura fallida. Para una secuencia con scroll vas a necesitar
además mover el scroll por pasos y capturar en varios momentos; el script es corto y se extiende
fácil, y en la bitácora hay ejemplos de sondeos que leen estilos calculados por DevTools en vez de
mirar una imagen (es más fiable para comprobar tiempos).

REGLAS QUE CUESTAN SI SE SALTAN

1. **Verifica a anchos reales, no solo al del frame de Figma** (D26). Los frames son 390, 1024 y
   1280; las pantallas son 1512 y 1920. Ahí es donde se ve lo que se congela mal.
2. **Busca el patrón antes de inventarlo**: chip rasgado `.map-chip` (`==texto==` en locales),
   `FadeIn`, `useInView` + CSS para animar, `--k` para escalar.
3. **El dev server va SIEMPRE en localhost:3000**, que es donde prueba Johan. Si el puerto lo tiene
   otro worktree (`lsof -p <pid> | grep cwd`), mátalo y arranca el tuyo.
4. **Si el dev server dice `Can't resolve '@vercel/turbopack-next/internal/font/google/font'` y no
   renderiza nada**, es caché rancia de Turbopack, no un error tuyo: `rm -rf .next node_modules/.cache`
   y arrancar otra vez. Sale sobre todo al alternar `npm run build` con `npm run dev`.
5. **No borres librerías ni assets que parezcan huérfanos** (GSAP, `public/images/hero/`).
6. **No hagas commits ni push a menos que se pidan en ese mismo mensaje.** Cuando se pidan: rama,
   PR y merge a `main`, que despliega solo a producción. Antes de `gh`:
   `gh auth switch --user johanmendezb`. No agregues dependencias sin preguntar.

DÓNDE ESTÁ TODO

Rama de trabajo: `21-sep-round-2-2`, en `~/orca/workspaces/landinglasfuertes/21-sep-round-2-2/`.
Está al día con `main` y sin nada sin commitear. El repo vive repartido en varios worktrees; un
cambio en uno no se ve en el checkout de `main` hasta mergear y hacer `git pull` ahí.

Escribe `PROGRESS.md` al terminar cada sub-paso y lleva a `DECISIONES.md` cualquier hallazgo que
cambie una decisión, en el momento. Lo que quede solo en el chat se pierde.

LO QUE QUEDA PENDIENTE, APARTE DE ESTO

- Los bloques de impacto en desktop se ven flacos (columna de 546 px centrada). Johan lo dejó a la
  espera de feedback de diseño: no se toca por iniciativa propia.
- El tablet (768) de los bloques de impacto no lo ha mirado nadie.
- Limpieza opcional: las claves de copy de la Introducción siguen con prefijo `hero.` (D11).

```

```
