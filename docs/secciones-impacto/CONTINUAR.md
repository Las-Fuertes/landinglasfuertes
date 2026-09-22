# Arranque de sesión nueva

Pega esto como primer mensaje en un chat nuevo. Está escrito para alguien sin ningún contexto
previo de la conversación.

---

```
Trabajamos en la web de Fundación Las Fuertes, una organización de educación menstrual integral.
Es un Next.js 16 con Pages Router (carpeta `pages/`, NO App Router), TypeScript y Tailwind 3.

Estamos reconstruyendo el primer tramo de la página a partir de un rediseño en Figma. Son tres
secciones: la Introducción (3 pasos, ya reconstruida y estática), "Así se ve el impacto en acción"
(nueva, con un mapa de Colombia y 4 bloques animados) y "Quiénes somos" (nueva, va al final justo
antes del footer).

ANTES DE TOCAR NADA, lee en este orden:
  1. CLAUDE.md                              qué es el proyecto y cómo se corre
  2. docs/secciones-impacto/PROGRESS.md     el estado vivo y el siguiente paso concreto
  3. docs/secciones-impacto/DECISIONES.md   qué se decidió y por qué, con sus correcciones
  4. docs/PATTERNS.md                       las convenciones del repo, ya verificadas

Continúa desde el "Siguiente paso concreto" de PROGRESS.md.

LAS CINCO REGLAS QUE MÁS CUESTAN SI SE SALTAN

1. Verifica con capturas antes de entregar. Hay una ruta de revisión que solo existe en
   desarrollo (`pages/dev-revision.tsx`): monta un iframe por sección, del ancho que le pidas, y lo
   desplaza hasta ella. Con Chrome headless capturas y comparas contra el frame de Figma. El
   procedimiento y dos trampas que cuestan tiempo están en docs/PATTERNS.md, sección "Verificación
   visual antes de entregar". Entregar sin mirar ya salió mal una vez.

2. Busca el patrón antes de inventarlo. Para resaltar una palabra existe `.map-chip`
   (styles/global.css): fondo oscuro rasgado, texto blanco, inclinado. En los textos de `locales`
   se escribe `==texto==`. Ya inventé un `<mark>` en su lugar y hubo que rehacerlo.

3. Los tres idiomas van en la misma entrega. El copy vive en `locales/es.json`, `en.json` y
   `fr.json`. Si falta una clave, la web muestra la clave cruda en pantalla. Sin los tres, la
   sección no está terminada.

4. No borres librerías ni assets que parezcan huérfanos. GSAP quedó sin uso al retirar la intro
   animada y `public/images/hero/` también, pero se quedan: vienen transiciones y animaciones más
   adelante.

5. No hagas commits ni push a menos que se pidan en ese mismo mensaje. Cuando se pidan: `main`
   despliega a producción y hoy NO tiene regla de PR en GitHub, pero igual se va por rama, PR y
   merge, que llega igual y deja rastro. Antes de usar `gh`, cambia de cuenta:
   `gh auth switch --user johanmendezb` (la que queda activa sola es otra).
   No agregues dependencias sin preguntar.

CONTEXTO ÚTIL QUE YA NO HAY QUE REDESCUBRIR

- El sitio completo carga por defecto. El query param `?show=all` se eliminó; si lo ves
  mencionado en algún lado, está obsoleto.
- El copy de la Introducción ya estaba escrito y traducido en los tres idiomas, bajo las claves
  `hero.section1`, `hero.section2` y `hero.section3`. Conservan el prefijo `hero.` aunque el
  componente ahora se llame `intro`.
- Las ilustraciones se montan por capas posicionadas en porcentaje sobre un lienzo, no con píxeles
  fijos (`components/intro/intro.data.ts`). Tablet y desktop reutilizan las capas de mobile con una
  transformación afín: ver la decisión D17.
- Los SVG que bajes de Figma pásalos por `npx svgo` antes de entrar. Sin optimizar pesan el triple
  y son lo primero que carga la web. La configuración exacta está en D14.
```

---

## Figma

Archivo: `ng8HnnYyaDJ2nTWauh7Otb` ("Las fuertes reloaded").
URL base: `https://www.figma.com/design/ng8HnnYyaDJ2nTWauh7Otb/Las-fuertes-reloaded?node-id=<id>`

El MCP de Figma ya está conectado (plugin `figma@synced`). Para leer un frame:
`get_metadata` para la estructura, luego `get_design_context` para implementar, `get_screenshot`
para verlo.

### Introducción: 3 pasos x 3 breakpoints

| Paso | Mobile     | Tablet      | Desktop     |
| ---- | ---------- | ----------- | ----------- |
| 1    | `1159:735` | `1152:306`  | `1152:287`  |
| 2    | `1152:221` | `1168:1446` | `1168:1264` |
| 3    | `1152:186` | `1177:1593` | `1174:1556` |

### Impacto (solo hay diseño mobile; tablet y desktop se improvisan escalando, ver D7)

| Pieza          | Antes de animar | Después de animar |
| -------------- | --------------- | ----------------- |
| Mapa           | `1102:3`        | `1102:60`         |
| Bloque piscina | `1102:162`      | `1102:286`        |
| Bloque luces   | `1102:322`      | `1102:363`        |
| Bloque copa    | `1103:544`      | `1103:558`        |
| Bloque persona | `1102:400`      | `1102:414`        |

### Quiénes somos

Mobile: `1219:985`. No hay tablet ni desktop.

## Comandos

```bash
npm run dev          # http://localhost:3000
npm run type-check
npm run lint
npm run build
```
