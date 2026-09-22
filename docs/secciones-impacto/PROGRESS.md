# Estado vivo: reconstrucción del primer tramo

> **En producción (`main` = `2ef6879`, PR #7):** la Introducción con el paso 1 en los 3 breakpoints y
> los pasos 2 y 3 solo en mobile. **Sin publicar, en el worktree `21-sep-round-2`:** los pasos 2 y 3
> en tablet y desktop, Quiénes somos completa, el script de captura y los docs de esta sesión.
> Johan dio por buena la Introducción; Quiénes somos la vio y pidió cerrar la sesión sin más
> ajustes.

Última actualización: 2026-09-21 (noche).
Rama de trabajo: `21-sep-round-2`, creada desde `main` en `2ef6879` (PR #7). Los pasos 2 y 3 en
tablet y desktop están **sin commitear** en el worktree
`~/orca/workspaces/landinglasfuertes/21-sep-round-2/`.

## Dónde vamos

| #   | Pieza                      | Mobile  | Tablet  | Desktop | Estado                                |
| --- | -------------------------- | ------- | ------- | ------- | ------------------------------------- |
| 0   | State layer (docs)         | -       | -       | -       | **Hecho**                             |
| 0.5 | Refactor de composición    | -       | -       | -       | **Hecho**                             |
| 1   | Introducción estática      | **[x]** | **[x]** | **[x]** | **Hecha en los 3, falta visto bueno** |
| 2   | Quiénes somos              | [ ]     | [ ]     | [ ]     | Pendiente                             |
| 3   | Mapa de impacto            | [ ]     | [ ]     | [ ]     | Pendiente                             |
| 4   | Bloques de impacto         | [ ]     | [ ]     | [ ]     | Pendiente                             |
| B   | Quitar el gate `?show=all` | -       | -       | -       | **Hecho** (adelantado, ver D3)        |

Regla: una pieza a la vez, y dentro de cada una mobile -> validar con Johan -> tablet -> desktop.
No se empieza la siguiente sin aprobación en los 3 breakpoints. Cada pieza entrega el copy en
`es`, `en` y `fr`; sin los tres idiomas no está terminada.

Orden definitivo de la página (D5):

```
Introducción -> Impacto -> Welcome -> Principles -> Donaciones -> Mapa educativo -> Súmate -> Quiénes somos -> Footer
```

## Siguiente paso concreto

1. **Que Johan mire Quiénes somos en los 3 breakpoints** (`localhost:3000/#quienes-somos`, está
   justo antes del footer). Dos cosas que decide él: si en desktop la columna de 3400 px le parece
   demasiado larga (D21) y si el encuadre de alguna foto no le gusta (`focus` en
   `quienes-somos.data.ts`). La Introducción ya la dio por buena.
2. **Publicar** cuando lo pida: todo lo de la sexta y séptima tanda está sin commitear en el
   worktree `21-sep-round-2`. Commit, PR contra `main`, merge. `gh auth switch --user johanmendezb`
   antes de `gh`.
3. **Pieza 3: Mapa de impacto** (`1102:3` antes de animar, `1102:60` después). Es la pieza dura:
   SVG inline con 6 territorios animables (D8), y el mapeo path -> territorio hay que derivarlo por
   color de relleno y dejarlo escrito en PATTERNS.md.
4. Pieza 4: los 4 bloques de impacto.

Antes de transcribir cualquier frame, volver a pedir su `get_metadata`: los frames se mueven
mientras se construye (D18).

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
