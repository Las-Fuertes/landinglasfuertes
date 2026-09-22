# Estado vivo: reconstrucción del primer tramo

> **En producción (`main` = `2ef6879`, PR #7):** la Introducción con el paso 1 en los 3 breakpoints y
> los pasos 2 y 3 solo en mobile. **Commiteado y sin publicar, en la rama `21-sep-round-2-2`:**
> los pasos 2 y 3 en tablet y desktop, Quiénes somos completa, el script de captura, los docs y la
> sección de impacto completa (mapa + 4 bloques). Johan dio por buena la Introducción; Quiénes
> somos la vio y pidió cerrar la sesión sin más ajustes; **la sección de impacto no la ha visto
> todavía**: se construyó entera de noche, por su pedido, y es lo primero que tiene que revisar.

Última actualización: 2026-09-21 (madrugada del 22).
Rama de trabajo: `21-sep-round-2-2`, en el worktree
`~/orca/workspaces/landinglasfuertes/21-sep-round-2-2/`. Es la continuación de `21-sep-round-2`
(misma historia; aquella rama quedó tres commits atrás y ya no se usa). Todo está commiteado;
Johan pidió el 2026-09-21 por la noche que se commitee seguido.

## Dónde vamos

| #   | Pieza                      | Mobile  | Tablet  | Desktop | Estado                                |
| --- | -------------------------- | ------- | ------- | ------- | ------------------------------------- |
| 0   | State layer (docs)         | -       | -       | -       | **Hecho**                             |
| 0.5 | Refactor de composición    | -       | -       | -       | **Hecho**                             |
| 1   | Introducción estática      | **[x]** | **[x]** | **[x]** | **Hecha en los 3, falta visto bueno** |
| 2   | Quiénes somos              | [ ]     | [ ]     | [ ]     | Pendiente                             |
| 3   | Mapa de impacto            | **[x]** | [~]     | [~]     | Mobile hecho; tablet/desktop escalan  |
| 4   | Bloques de impacto         | **[x]** | [~]     | [~]     | Mobile hecho; tablet/desktop escalan  |
| B   | Quitar el gate `?show=all` | -       | -       | -       | **Hecho** (adelantado, ver D3)        |

Regla: una pieza a la vez, y dentro de cada una mobile -> validar con Johan -> tablet -> desktop.
No se empieza la siguiente sin aprobación en los 3 breakpoints. Cada pieza entrega el copy en
`es`, `en` y `fr`; sin los tres idiomas no está terminada.

Orden definitivo de la página (D5):

```
Introducción -> Impacto -> Welcome -> Principles -> Donaciones -> Mapa educativo -> Súmate -> Quiénes somos -> Footer
```

## Siguiente paso concreto

0. **Que Johan mire la sección de impacto** (`localhost:3000/#impacto`, entre la Introducción y
   Welcome) y responda las dos preguntas abiertas (5 y 6). Lo que decide él: el aire de 120 px
   entre bloques (D22), el orden y velocidad de las animaciones, y si Ibagué entra.
1. **Que Johan mire Quiénes somos en los 3 breakpoints** (`localhost:3000/#quienes-somos`, está
   justo antes del footer). Dos cosas que decide él: si en desktop la columna de 3400 px le parece
   demasiado larga (D21) y si el encuadre de alguna foto no le gusta (`focus` en
   `quienes-somos.data.ts`). La Introducción ya la dio por buena.
2. **Publicar** cuando lo pida: todo está commiteado en la rama `21-sep-round-2-2`, 10 commits por
   encima de `main`. PR contra `main`, merge. `gh auth switch --user johanmendezb` antes de `gh`.
3. Verificar tablet y desktop de la sección de impacto con captura contra criterio (no hay frame):
   a 1280 el mapa y el cierre se ven bien escalados con `--k` 1.4; los bloques no se miraron.
4. Limpieza opcional: el "2XX" del bloque de la piscina cuando Johan dé el número.

Antes de transcribir cualquier frame, volver a pedir su `get_metadata`: los frames se mueven
mientras se construye (D18).

## Lo que falta, en orden

1. **Los bloques de impacto en desktop se ven flacos.** Cada bloque es una columna de 546 px
   (390 x 1.4) centrada en una pantalla de 1280 o más, así que queda mucho vacío a los lados y la
   ilustración se lee pequeña. Es consecuencia de D7 (escalar en vez de recomponer). **Johan lo
   deja a la espera de feedback de diseño** (2026-09-22); no se toca por iniciativa propia.
2. **Quiénes somos en desktop**: Johan propuso (2026-09-22) ensancharlo y repartir las fichas de
   forma más abierta, en vez de la columna de ~3400 px de alto que hay hoy (D21). Pendiente de
   acordar la forma exacta.
3. **Tablet (768) de los bloques de impacto**: sin mirar. Solo se verificó el mapa a ese ancho.
4. Limpieza opcional: las claves de copy de la Introducción siguen con prefijo `hero.` (D11).

### Resuelto el 2026-09-22

- **Las cifras ya son reales**: 7 territorios (entra Ibagué) y 550 niñas, adolescentes y mujeres.
  Se acabaron los dos placeholders del diseño.
- **El paso 2 de la intro en pantallas anchas** (D26): el horizonte ya llega al borde y el reflejo
  del agua recupera su intensidad.
- **La copa NO tenía el problema de la piscina.** Se dijo que sí sin comprobarlo; verificado con
  capturas del estado inicial y final, el cuerpo de la copa es el mismo gris en los dos (es el
  color de la silicona en el diseño, no un estado "apagado"). Lo único que cambia es el líquido
  y los destellos, que es lo que se quiere. No hay nada que arreglar.

## Preguntas abiertas

1. ~~GSAP sin uso~~ **Resuelto (D16): se queda.** Vienen transiciones y animaciones más adelante.
   Tampoco se toca `public/images/hero/`.
2. **Las claves de copy siguen con prefijo `hero.`** aunque el componente ahora sea `intro`. Ver
   D11. Limpieza opcional.
3. ~~Resolución de las fotos del equipo~~ **Resuelto (D10 ampliada):** vienen a 4096 px, no 512.
4. **Quiénes somos en desktop es una columna de ~3400 px** (D21). Johan decide si vale una rejilla.
5. **Mapa de impacto: el diseño tiene 7 etiquetas y el título dice "6 territorios"** (D8 ampliada).
   ¿Entra Ibagué? Preguntar antes de construir.
6. **Bloque de la piscina: "2XX niñas"** es un placeholder del diseño. Hace falta el número real.

## Bitácora

### 2026-09-22 (décima tanda): publicado, y las lámparas chispean

- **Mergeado a `main`**: PR #8, merge `f779cf2`. Entraron los 10 commits que faltaban (la
  Introducción en tablet/desktop, Quiénes somos, el script de captura y la sección de impacto
  entera). Producción despliega desde `main`, así que la sección ya está publicada **sin que
  Johan la haya revisado**; él pidió el merge para no perder nada.
- Verificado antes de mergear que no se perdía nada: el worktree `21-sep-round-2` no tenía nada
  sin commitear y sus tres commits son la base de la rama. El checkout de `~/Sites/personal/`
  quedó actualizado con `git pull`.
- **Animación de las lámparas rehecha a petición de Johan** (D24): ya no se funden, chispean.
  Solo la izquierda parpadea (cuatro veces, engancha a los 1.14 s) y la derecha prende limpia
  100 ms después. `steps(1, end)`, sin un solo frame de opacidad intermedia.
- **Bug encontrado y corregido en el camino:** sin un keyframe explícito al 100%, las dos
  lámparas se apagaban al terminar la animación. Se vio en la captura del estado final.
- **La piscina dejó de cambiar de gris a blanco** (D25), también a petición de Johan: la piscina
  se dibuja una vez con sus colores finales y lo único que se anima es el agua subiendo y los
  flotadores. Las capas se partieron por color (`agua-*` y `contorno-*`) y el modelo de bloque
  ganó `frente`, las capas fijas que van por delante de lo que se anima.

### 2026-09-22 (novena tanda, madrugada): los 4 bloques de impacto

- **Pieza 4 construida en mobile**, un commit por bloque: piscina `43b551b`, lámparas `a5f659f`,
  copa `9f48b33`, persona `af44c52`. Modelo de datos en `components/impacto/bloques.data.ts`
  (capas `base`/`antes`/`despues`/`extras`, medidas en px del frame; `entrada` por bloque) y
  componente `bloque-impacto.tsx`. CSS en `styles/global.css`, sección "MAPA DE IMPACTO".
- Cada bloque cambia de estado a su manera (D22): agua que sube, luces que se encienden una tras
  otra, copa que se llena, persona que toma color desde el centro.
- **Trampa que costó una hora (D23):** las capas "después" no se descargaban porque `next/image`
  las deja lazy y Chrome no pide una imagen recortada por `clip-path`. `loading="eager"`.
- Assets en `public/images/impacto/{piscina,luces,copa,persona}/`, todos por svgo. Las lámparas
  vinieron como un solo grupo y se partieron a mano en postes / cono izquierdo / cono derecho
  (script en el chat, no guardado: es cortar los `<g id>` hijos y repetir la cabecera del svg).
- Copy de los 4 bloques en es/en/fr, con las líneas de los chips elegidas a mano por idioma. El
  "2XX" de la piscina sigue siendo placeholder (pregunta 6).
- Verificado con capturas a 390 de cada bloque (estado final y a mitad de animación) contra sus
  frames "después"; mapa a 1280 y 768; `type-check`, `lint` y `build` limpios.

### 2026-09-21 (octava tanda, de noche): mapa de impacto

- **Commiteado todo lo de las tandas 6 y 7** en tres commits (`a35ec31`, `aedceab`, `68b4d67`) y
  el trabajo siguió en el worktree `21-sep-round-2-2`, que Orca abrió al lado del anterior.
- **Pieza 3 construida en mobile** (`components/impacto/`), montada en `pages/index.tsx` entre
  la Introducción y Welcome. Commit `bab6bfb`.
- Mapeo path -> territorio derivado por color y escrito en `docs/PATTERNS.md` y en
  `components/impacto/mapa.data.ts`. El export de Figma pesaba 812 KB; sin los trazos
  convertidos a relleno y con svgo queda en 36 KB inline.
- Encendido en cascada desde Isla Fuerte hacia afuera, CSS puro con `--i` por territorio y
  `useInView` de framer-motion para disparar una sola vez. Reduced-motion respetado.
- El título lleva salto de línea manual en el diseño; el copy lo escribe como `\n` y el
  componente lo parte en `<span class="block">`.
- En francés el cierre se partió en "==6 territoires== ==désormais plus forts==" porque el chip
  es `inline-block` y si una línea no cabe se parte por dentro (chip de dos líneas, feo).
- Verificado con capturas a 390 en es/en/fr contra `1102:60`; `type-check` y `lint` limpios.
- `scripts/captura.js` tiene ahora `--tras` (ms entre el scroll al ancla y la captura) para
  esperar el final de una animación que arranca en viewport.
- Tablet y desktop solo escalan con `--k` (1.25 / 1.4), sin verificar con captura todavía.

### 2026-09-21 (séptima tanda): Quiénes somos

- **Pieza 2 construida en los 3 breakpoints** (`components/quienes-somos/`), montada en
  `pages/index.tsx` justo antes del footer. Copy en `quienesSomos.*` de los tres idiomas.
- Va en flujo con una variable `--k` por breakpoint, no sobre lienzo (D21). Nueve fotos en
  `public/images/quienes-somos/` a 640 px, más un anillo SVG.
- **Herramienta nueva de captura: `scripts/captura.js`.** Habla con Chrome por DevTools Protocol
  (usa el `ws` compilado de Next, sin instalar nada) y fija el viewport exacto. Nació porque Chrome
  con `--virtual-time-budget` empezó a devolver capturas grises o en blanco de forma intermitente y
  el banco de iframes dejó de ser fiable. Es lo que hay que usar de ahora en adelante.
- **Trampa encontrada:** un `npm run build` deja artefactos de producción en `.next` y el dev server
  que lo comparte se pone raro (páginas que no hidratan). Antes de arrancar `npm run dev` después
  de un build: `rm -rf .next`.
- El dev server de la rama corre en **:3000** (regla de Johan). Si el puerto lo tiene otro
  worktree, se mata ese proceso.
- Verificado con capturas a 390 (es/en/fr), 768 y 1280 contra el frame; `type-check`, `lint`,
  `prettier` y `build` limpios.

### 2026-09-21 (sexta tanda): pasos 2 y 3 en tablet y desktop

- **La Introducción está completa en los 3 breakpoints.** Pasos 2 y 3 tienen variante propia de
  tablet (`1168:1446`, `1177:1593`) y desktop (`1168:1264`, `1174:1556`).
- **La hipótesis afín se cumple por grupos, no por paso** (ampliación de D17). El modelo de datos
  acepta ahora varios grupos por paso, cada uno con su escala y desplazamiento por breakpoint:
  `IntroStep.groups` + `IntroVariant.groups` en `components/intro/intro.data.ts`. Los pasos se
  declaran en `INTRO_STEPS`; `STEP_*_VARIANTS` y `STEP_1_CLUSTER` ya no existen.
- **Los frames mobile habían cambiado en Figma** (D18): lienzo de 700 en vez de 833, texto del paso
  3 unos 90 px más arriba, nube por delante del sol. Se actualizó mobile para seguir el diseño.
- **Assets nuevos** en `public/images/intro/`: `paso2-espiral.svg` (la espiral del sol grande) y
  `paso3-ola-1168/1169/1171.svg` (olas sueltas de tablet y desktop), pasados por svgo.
  `paso2-horizonte.svg` se **reemplazó** por el export de tablet (D19): el de mobile traía piezas
  lilas que en mobile quedaban fuera de pantalla.
- `pages/dev-revision.tsx`: alto por defecto 700, `flex:none` en los iframes (antes se encogían y un
  iframe de 768 caía a la variante mobile) y param `lang` para capturar en `en` y `fr`.
- Verificado con capturas a 390 (es/en), 768 y 1280 (es, más fr en el paso 3) contra sus frames;
  `type-check`, `lint`, `prettier` y `build` limpios.

### 2026-09-21 (quinta tanda): publicado

- **Mergeado a `main`** en tres commits: la capa de estado en `docs/`, la ruta de revisión visual y
  la reconstrucción de la Introducción. PR #6, merge `c2c6627`. Producción despliega desde `main`.
- Descubierto que `gh` arrancaba con la cuenta equivocada (`johaneto-tikin` en vez de
  `johanmendezb`). Documentado en `CLAUDE.md`, sección "Publicar".
- Descubierto que `main` **ya no tiene** regla de PR ni rulesets en GitHub. Se usó PR igualmente.
- **Sale a producción con los pasos 2 y 3 en variante mobile a todos los anchos**, o sea una columna
  estrecha centrada en desktop. Es deliberado y Johan lo sabe; es lo primero que hay que cerrar.

### 2026-09-21 (cuarta tanda): Pieza 1 en tablet y desktop

- **Sistema de breakpoints** en la Introducción. Cada paso puede tener variante propia de mobile,
  tablet y desktop; si no la tiene, cae a la de mobile. Así se avanza paso por paso sin romper nada.
- **Paso 1 completo en los 3 breakpoints.** Desktop cambia la composición: ilustración a la
  izquierda, texto a la derecha.
- **Hallazgo grande (D17):** tablet y desktop reutilizan las mismas capas que mobile, solo escaladas
  y desplazadas. Error máximo de 0.05 px. Ahorra transcribir 135 entradas de datos.
- Verificado con capturas a 390, 768 y 1280 px contra sus frames.

### 2026-09-21 (tercera tanda): correcciones de la Pieza 1

- **Chip de resaltado corregido (D12).** Se cambió el `<mark>` inventado por `.map-chip`, el patrón
  que ya usaba el mapa educativo: fondo rasgado, texto blanco, inclinación de -1.2 grados.
- El filtro `#map-rough-edge` se movió de `education-map-section.tsx` a
  `components/layout/rough-edge-filter.tsx`, montado en `pages/_app.tsx`.
- **Texto del paso 1 ensanchado** de 275 a 330 px de lienzo, recentrado, con interletrado -0.03em.
  Vuelve a caer en las 3 líneas del diseño.
- **Banco de revisión visual** en `pages/dev-revision.tsx`, solo en desarrollo (D15). Verificado
  que el build de producción no genera HTML para esa ruta.
- Los tres pasos verificados con capturas a 390px contra sus frames de Figma.

### 2026-09-21 (segunda tanda): Pieza 1, mobile

- **Introducción reconstruida y estática.** `components/hero/` eliminado (sigue en el commit
  `92fda5e`), sustituido por `components/intro/`. Fuera GSAP, ScrollTrigger, el botón de saltar
  animación, el `localStorage` de visitante y el hint de SCROLL.
- Bajadas y montadas las **45 capas** de las 3 ilustraciones nuevas desde Figma.
- Optimizadas con svgo: **1.3 MB -> 480 KB**, sin pérdida de proporción (D14).
- **El copy ya estaba escrito y traducido** en los tres idiomas (D11). Solo se le añadió el
  marcador de resaltado `==...==` y se retiró la clave `hero.skip`, que ya no aplica.
- Verificado: `type-check`, `eslint` y `build` limpios; las 43 capas y los 2 resaltados se sirven
  desde el servidor; no queda rastro del hero viejo en el HTML.

### 2026-09-21

- Conectado el MCP de Figma (cuenta Erika Cely). Acceso al archivo `ng8HnnYyaDJ2nTWauh7Otb`
  verificado con una llamada real a `get_metadata` sobre el nodo del mapa.
- Explorado el repo. Hallazgo principal: el gate `?show=all` añade en vez de quitar, y `hero.tsx`
  mezcla intro con composición de página (D2 y D4).
- Creados `CLAUDE.md`, `docs/PATTERNS.md` y los tres documentos de `docs/secciones-impacto/`.
- **Refactor de composición hecho** (D4). `components/hero/hero.tsx` ya no importa ni renderiza
  Welcome/Principles/Donations/EducationMap/Sumate: devuelve solo su intro, y `null` cuando la
  animación se salta. `pages/index.tsx` es ahora el dueño del orden de secciones y del gate.
  De paso se quitó el prop `onComplete`, que no usaba nadie.
- Verificado: `type-check`, `eslint` y `build` limpios. `/` responde 200 y sirve Donaciones, Mapa
  educativo y Súmate, igual que antes.
- **Hallazgo**: el gate solo actuaba tras la hidratación, porque la home es estática. Quedó
  documentado como ampliación de D2, y dejó de importar al quitarse el gate.
- **Gate eliminado** por petición de Johan (D3 revisada). `pages/index.tsx` ya no lee el query
  param y el sitio completo carga por defecto. Se retiró también `useRouter`, que quedó sin uso.
- **Quiénes somos pasa a ir antes del footer**, no en el primer tramo (D5).
- **Traducir a los tres idiomas es ahora regla permanente**, no una pregunta por entrega (D9).
- **Verificada la extracción de assets de Figma** con llamadas reales: SVG por capa, PNG del frame
  y las 18 fotos reales del equipo. Ver D10. No hace falta nada de parte de Johan, salvo quizá
  fotos de mayor resolución para desktop.
