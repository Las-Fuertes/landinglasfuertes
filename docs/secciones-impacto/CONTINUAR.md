# Arranque de sesión nueva

Pega esto como primer mensaje en un chat nuevo. Está escrito para alguien sin ningún contexto
previo de la conversación.

---

````
Trabajamos en la web de Fundación Las Fuertes, una organización de educación menstrual integral.
Es un Next.js 16 con Pages Router (carpeta `pages/`, NO App Router), TypeScript y Tailwind 3.

El primer tramo de la página está reconstruido, **aprobado por Johan y publicado**: la Introducción
de 3 pasos, la sección "Así se ve el impacto en acción" (mapa de Colombia que se enciende + 4
bloques animados) y "Quiénes somos". Todo está en `main` y en producción.

EL TRABAJO DE ESTA SESIÓN: AÑADIR LAS TRANSICIONES DE LA INTRODUCCIÓN

**Lo que hay construido está bien y no se rediseña.** Las 3 partes de la Introducción son el
diseño nuevo, se hicieron el 2026-09-21, Johan las revisó y las dio por buenas. No se tocan la
composición, ni los assets, ni el copy, ni las medidas. Lo único que falta es **cómo se pasa de
una parte a la siguiente**, que era el paso que quedaba pendiente del rediseño.

Hoy las 3 partes son tres bloques estáticos, uno debajo del otro: al hacer scroll el contenido
sube como en cualquier página. Johan quiere esto, en sus palabras (2026-09-22):

  "llego al hero, veo la primera parte de la intro, y cuando hago scroll, necesito que haya una
  transición a la segunda parte, las piezas se van y el texto hace un fade out y luego llegan las
  piezas y el texto de la siguiente sección, luego hago scroll de nuevo y vuelvo a ver un
  comportamiento similar a la tercera parte de la intro, luego si llego al contenido de la página
  en si, si hago scroll hacia arriba después de ver la intro vuelvo al primer paso y todo se
  repite de nuevo"

O sea: la Introducción se queda fija ocupando la pantalla mientras el scroll avanza, y **el scroll
no desplaza el contenido: cambia de parte**. Cada cambio es una salida (las piezas se van y el
texto se desvanece) seguida de una entrada. Al terminar la parte 3 la página sigue normal hacia
Impacto; y hacia arriba el recorrido se deshace, 3 -> 2 -> 1, tantas veces como se quiera.

Johan dijo explícitamente que esta parte es muy importante. **Antes de construir, acuerda con él
la mecánica**: cuánto scroll cuesta cada paso, si el cambio es continuo (ligado a la posición del
scroll) o por tramos (un gesto = un paso completo), cómo entran y salen las piezas (¿todas a la
vez?, ¿por grupos?, ¿hacia dónde?) y qué hace en móvil.

ANTES DE TOCAR NADA, lee en este orden:
  1. CLAUDE.md                              qué es el proyecto y cómo se corre
  2. docs/secciones-impacto/PROGRESS.md     el estado vivo y lo que falta
  3. docs/secciones-impacto/DECISIONES.md   qué se decidió y por qué. Para ESTA tarea mandan
                                            D13, D16, D17 (con su ampliación) y D26
  4. docs/PATTERNS.md                       convenciones, y la sección "Animación"

UN AVISO PARA NO PERDER EL TIEMPO

En el historial vas a encontrar una intro vieja con GSAP + ScrollTrigger (commit `92fda5e`,
`components/hero/hero.tsx`), que también se movía con el scroll. **Es de un diseño anterior que ya
no existe: no la restaures, no la tomes como base y no copies su estructura.** Se eliminó a
propósito (D6) junto con el botón de saltar animación y el `localStorage` de visitante, y hoy no
queda ni una línea de ScrollTrigger en el repo. Se menciona solo para que no la "descubras"
pensando que es un atajo. El punto de partida es lo que hay hoy en `components/intro/`.

Lo que sí se conserva de aquella época: **GSAP sigue instalado y permitido** (D16, Johan pidió no
desinstalarlo justo porque venían estas animaciones). `framer-motion` es el patrón por defecto del
sitio y también sabe hacer esto. Elige con criterio y deja escrito el porqué.

LO QUE TIENES QUE SABER DE LO QUE HAY HOY

1. **Hay tres juegos de partes montados a la vez, no uno.** `components/intro/intro-section.tsx`
   renderiza las 3 partes por cada breakpoint (9 bloques) y esconde las que no tocan con clases
   (`md:hidden`, `hidden md:block lg:hidden`, `hidden lg:block`). Cualquier cosa que mida alturas
   o fije posiciones tiene que contar con que 6 de esos 9 bloques están ocultos pero existen en el
   DOM. Es la trampa más probable de esta tarea.

2. **Cada parte es un lienzo con capas en porcentaje** (D13): las capas viven en
   `components/intro/intro.data.ts` en px del lienzo de Figma y el componente las pasa a
   porcentaje. Lienzos: mobile 390x700, tablet 1024x1366, desktop 1280x832. Tablet y desktop
   reutilizan las capas de mobile con una transformación afín **por grupos** (D17): en el paso 2,
   por ejemplo, el horizonte, el agua y el barco son grupos distintos. Eso es justo lo que
   necesitas para animar "las piezas": el grupo es la unidad natural de entrada y salida, no la
   imagen suelta.

3. **Las anclas existen y son las que usa la herramienta de captura**: `intro-paso-1`,
   `intro-paso-2`, `intro-paso-3` en mobile, y con sufijo `-tablet` / `-desktop` en los otros dos
   anchos. Si el nuevo montaje las cambia, actualiza `docs/PATTERNS.md`.

4. **Una capa puede sangrar hasta el borde de la pantalla** (D26, `IntroVariant.sangra`): el paso 2
   en desktop lo usa para el horizonte. Si cambias el contenedor o su recorte, compruébalo a 1920,
   no solo a 1280.

LO QUE NO SE PUEDE ROMPER

- **El resultado visual de cada parte.** Está aprobado: al final de cada transición, lo que se ve
  tiene que ser exactamente lo que se ve hoy. Compáralo con una captura antes y después.
- **`prefers-reduced-motion`.** Todo el sitio lo respeta. Con movimiento reducido la Introducción
  tiene que ser navegable sin secuencia: lo más probable es caer a las 3 partes estáticas de hoy.
  Se verifica con `Emulation.setEmulatedMedia` por DevTools; hay ejemplos en la bitácora.
- **Que se pueda salir.** Una sección que se apropia del scroll atrapa a quien usa teclado, lector
  de pantalla o un trackpad que manda eventos en ráfaga. Piensa en teclado (tab, flechas, av pág)
  y en qué pasa si alguien llega con `#impacto` en la URL.
- **Los tres idiomas** (`locales/es.json`, `en.json`, `fr.json`). El copy ya está; si añades algo,
  va en los tres.

CÓMO SE VERIFICA (no se entrega nada sin mirarlo)

`scripts/captura.js` fija el viewport al ancho que pidas, desplaza hasta un ancla y guarda un PNG:

```bash
npm run dev   # en :3000
node scripts/captura.js --ancla intro-paso-2-desktop --w 1280 --h 832 --out /tmp/p2.png
node scripts/captura.js --ancla impacto --w 390 --h 828 --tras 4500 --out /tmp/i.png
```

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
````
