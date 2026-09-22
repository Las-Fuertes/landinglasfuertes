# Arranque de sesión nueva

Pega esto como primer mensaje en un chat nuevo. Está escrito para alguien sin ningún contexto
previo de la conversación.

---

```
Trabajamos en la web de Fundación Las Fuertes, una organización de educación menstrual integral.
Es un Next.js 16 con Pages Router (carpeta `pages/`, NO App Router), TypeScript y Tailwind 3.

Estamos reconstruyendo el primer tramo de la página a partir de un rediseño en Figma. Van hechas
la Introducción (3 pasos, mobile/tablet/desktop) y "Quiénes somos" (al final, antes del footer).
Falta la sección "Así se ve el impacto en acción", que va ENTRE la Introducción y Welcome: un mapa
de Colombia donde los territorios se encienden en rosa con su etiqueta, y después 4 bloques
ilustrados con cifras (piscina, luces, copa, persona), cada uno con un estado "antes" y "después"
de animar. Es la pieza con más animación de todo el rediseño y arranca en este chat.

ANTES DE TOCAR NADA, lee en este orden:
  1. CLAUDE.md                              qué es el proyecto y cómo se corre
  2. docs/secciones-impacto/PROGRESS.md     el estado vivo y el siguiente paso concreto
  3. docs/secciones-impacto/DECISIONES.md   qué se decidió y por qué; D8 (ampliada) y D16 son
                                            las que mandan en esta sección
  4. docs/PATTERNS.md                       convenciones, y la sección "Animación"

Trabajo sin commitear en este worktree (rama `21-sep-round-2`): pasos 2 y 3 de la Introducción en
tablet/desktop, Quiénes somos, `scripts/captura.js` y los docs. No lo pierdas: si hay que
commitear, Johan lo pide.

DOS PREGUNTAS QUE HAY QUE HACERLE A JOHAN ANTES DE CONSTRUIR (están en PROGRESS, "Preguntas
abiertas" 5 y 6): el mapa del diseño trae 7 etiquetas (incluye Ibagué) pero el título dice
"6 territorios"; y el bloque de la piscina dice "2XX niñas", que es un placeholder sin número real.
Pregunta las dos en el primer mensaje y sigue construyendo con lo que no dependa de la respuesta.

ORDEN DE TRABAJO SUGERIDO
  1. Mapa estático en mobile (SVG inline, un path por departamento, D8). Derivar el mapeo
     path -> territorio comparando `1102:3` (todo gris) con `1102:60` (rosa + etiquetas) y
     ESCRIBIRLO en PATTERNS.md apenas se sepa: volver a sacarlo cuesta caro.
  2. Animación del mapa: los territorios pasan de gris a rosa y aparecen las etiquetas, al entrar
     en viewport, una sola vez, respetando prefers-reduced-motion. framer-motion es el patrón por
     defecto; GSAP está instalado y permitido si hace falta (D16).
  3. Los 4 bloques, uno por uno, mobile primero. Cada uno tiene frame "antes" y "después".
  4. Tablet y desktop escalando la composición mobile (D7), como se hizo en Quiénes somos (D21).
  Valida con Johan al cerrar cada paso; no arranques el siguiente breakpoint sin visto bueno.

LAS SEIS REGLAS QUE MÁS CUESTAN SI SE SALTAN

1. Verifica con capturas antes de entregar. La herramienta es `scripts/captura.js`: fija el
   viewport al ancho que pidas, desplaza hasta el ancla y guarda un PNG que comparas contra el
   frame de Figma. Procedimiento y trampas en docs/PATTERNS.md, "Verificación visual antes de
   entregar". Un PNG de menos de 10 KB es una captura fallida, no una página vacía.

2. Busca el patrón antes de inventarlo. Las etiquetas del mapa y los títulos de los bloques son
   el chip rasgado `.map-chip` (styles/global.css); en `locales` se escribe `==texto==`. El latido
   de los puntos de `components/education-map/` es CSS puro y respeta reduced-motion: cópialo.

3. Los tres idiomas van en la misma entrega (`locales/es.json`, `en.json`, `fr.json`). Si falta
   una clave, la web muestra la clave cruda.

4. No borres librerías ni assets que parezcan huérfanos (GSAP, `public/images/hero/`).

5. El dev server de la rama corre SIEMPRE en localhost:3000, que es donde Johan prueba. Si el
   puerto lo tiene el server de otro worktree (`lsof -p <pid> | grep cwd`), mátalo y arranca el
   tuyo. Después de un `npm run build`, borra `.next` antes de `npm run dev`.

6. No hagas commits ni push a menos que se pidan en ese mismo mensaje. Cuando se pidan: rama, PR
   y merge a `main` (despliega solo). Antes de `gh`: `gh auth switch --user johanmendezb`.
   No agregues dependencias sin preguntar.

ESTA SESIÓN PUEDE CORTARSE POR LÍMITE DE USO. Escribe PROGRESS.md al terminar cada sub-paso, no al
final; y si un hallazgo cambia una decisión, va a DECISIONES.md en el momento. Lo que quede solo
en el chat se pierde.

CONTEXTO ÚTIL QUE YA NO HAY QUE REDESCUBRIR

- Los frames de Figma cambian mientras se construye (D18). Antes de transcribir, pide
  `get_metadata` del frame; no uses números de otra sesión.
- Un asset compartido entre breakpoints se baja del frame donde más se ve (D19). Los SVG pasan por
  `npx svgo@3` con `removeViewBox` desactivado y precisión 2 (D14). `download_assets` corta en 20
  SVG por nodo: para el mapa (34 vectores) hay que bajar por sub-nodo o usar `get_design_context`.
- Las medidas del diseño se guardan en px del lienzo mobile y se escalan: por porcentaje sobre un
  lienzo (Introducción, `components/intro/`) o por una variable CSS `--k` (Quiénes somos,
  `components/quienes-somos/`). Para el mapa, el SVG inline con viewBox escala solo.
- El copy del mapa: "Así se ve el impacto en acción", "==6 territorios ahora más fuertes==",
  "Desde Isla Fuerte llevando olas de cambio a Colombia." Traducir a en/fr en la misma pasada.
```

---

## Figma

Archivo: `ng8HnnYyaDJ2nTWauh7Otb` ("Las fuertes reloaded").
URL base: `https://www.figma.com/design/ng8HnnYyaDJ2nTWauh7Otb/Las-fuertes-reloaded?node-id=<id>`

El MCP de Figma ya está conectado (plugin `figma@synced`). Para leer un frame:
`get_metadata` para la estructura, luego `get_design_context` para implementar, `get_screenshot`
para verlo.

### Introducción: 3 pasos x 3 breakpoints (todos construidos; los frames mobile miden 390x700)

| Paso | Mobile     | Tablet      | Desktop     |
| ---- | ---------- | ----------- | ----------- |
| 1    | `1159:735` | `1152:306`  | `1152:287`  |
| 2    | `1152:221` | `1168:1446` | `1168:1264` |
| 3    | `1152:186` | `1177:1593` | `1174:1556` |

### Impacto (solo hay diseño mobile; tablet y desktop se improvisan escalando, ver D7). SIGUIENTE.

| Pieza          | Antes de animar | Después de animar |
| -------------- | --------------- | ----------------- |
| Mapa           | `1102:3`        | `1102:60`         |
| Bloque piscina | `1102:162`      | `1102:286`        |
| Bloque luces   | `1102:322`      | `1102:363`        |
| Bloque copa    | `1103:544`      | `1103:558`        |
| Bloque persona | `1102:400`      | `1102:414`        |

### Quiénes somos (construida)

Mobile: `1219:985`. No hay tablet ni desktop; se escala (D7, D21).

## Comandos

```bash
npm run dev          # http://localhost:3000
npm run type-check
npm run lint
npm run build
```
