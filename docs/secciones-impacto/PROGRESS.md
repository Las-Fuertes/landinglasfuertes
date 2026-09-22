# Estado vivo: reconstrucción del primer tramo

> **En producción desde el 2026-09-21.** La Introducción y la eliminación del gate `?show=all` se
> mergearon a `main` en `c2c6627` (PR #6). Lo que sigue se construye sobre eso.

Última actualización: 2026-09-21.
Rama de trabajo: `17-sep-Landing-remake`. Punta al empezar: `92fda5e`, igual que `origin/main`.

## Dónde vamos

| #   | Pieza                      | Mobile  | Tablet | Desktop | Estado                              |
| --- | -------------------------- | ------- | ------ | ------- | ----------------------------------- |
| 0   | State layer (docs)         | -       | -      | -       | **Hecho**                           |
| 0.5 | Refactor de composición    | -       | -      | -       | **Hecho**                           |
| 1   | Introducción estática      | **[x]** | [ ]    | [ ]     | **Mobile hecho, falta visto bueno** |
| 2   | Quiénes somos              | [ ]     | [ ]    | [ ]     | Pendiente                           |
| 3   | Mapa de impacto            | [ ]     | [ ]    | [ ]     | Pendiente                           |
| 4   | Bloques de impacto         | [ ]     | [ ]    | [ ]     | Pendiente                           |
| B   | Quitar el gate `?show=all` | -       | -      | -       | **Hecho** (adelantado, ver D3)      |

Regla: una pieza a la vez, y dentro de cada una mobile -> validar con Johan -> tablet -> desktop.
No se empieza la siguiente sin aprobación en los 3 breakpoints. Cada pieza entrega el copy en
`es`, `en` y `fr`; sin los tres idiomas no está terminada.

Orden definitivo de la página (D5):

```
Introducción -> Impacto -> Welcome -> Principles -> Donaciones -> Mapa educativo -> Súmate -> Quiénes somos -> Footer
```

## Siguiente paso concreto

**Pasos 2 y 3 en tablet y desktop.** Hoy caen a la variante mobile en todos los anchos, que es
correcto pero no es el diseño. Faltan cuatro frames:

| Paso | Tablet      | Desktop     |
| ---- | ----------- | ----------- |
| 2    | `1168:1446` | `1168:1264` |
| 3    | `1177:1593` | `1174:1556` |

Procedimiento, ya probado con el paso 1 (ver D17): sacar la escala y el desplazamiento comparando
tres capas de control con `get_metadata`, que es mucho más barato que `get_design_context`, y
añadir la variante a `STEP_2_VARIANTS` / `STEP_3_VARIANTS` en `components/intro/intro.data.ts`.
**Verificar la hipótesis afín con sus propias capas antes de darla por buena.**

Después, verificar con capturas:
`/dev-revision?anclas=intro-paso-2-desktop&w=1280&h=832`

## Preguntas abiertas

1. ~~GSAP sin uso~~ **Resuelto (D16): se queda.** Vienen transiciones y animaciones más adelante.
   Tampoco se toca `public/images/hero/`.
2. **Las claves de copy siguen con prefijo `hero.`** aunque el componente ahora sea `intro`. Ver
   D11. Limpieza opcional.
3. **Resolución de las fotos del equipo**: 512px de lado largo, se revisa en la Pieza 2.

## Bitácora

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
