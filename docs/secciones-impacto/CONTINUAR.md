# Arranque de sesión nueva

Pega esto como primer mensaje en un chat nuevo. Está escrito para alguien sin ningún contexto
previo de la conversación.

---

```
Trabajamos en la web de Fundación Las Fuertes, una organización de educación menstrual integral.
Es un Next.js 16 con Pages Router (carpeta `pages/`, NO App Router), TypeScript y Tailwind 3.

Estamos reconstruyendo el primer tramo de la página a partir de un rediseño en Figma. Está TODO
construido en mobile y escalado a tablet/desktop: la Introducción (3 pasos), la sección "Así se ve
el impacto en acción" (mapa de Colombia que se enciende + 4 bloques ilustrados animados) y
"Quiénes somos" (antes del footer). La sección de impacto se construyó de noche sin que Johan la
viera: lo primero de esta sesión es que la revise y pida ajustes.

ANTES DE TOCAR NADA, lee en este orden:
  1. CLAUDE.md                              qué es el proyecto y cómo se corre
  2. docs/secciones-impacto/PROGRESS.md     el estado vivo y el siguiente paso concreto
  3. docs/secciones-impacto/DECISIONES.md   qué se decidió y por qué; D8, D22 y D23 son las de
                                            la sección de impacto
  4. docs/PATTERNS.md                       convenciones, el mapeo del mapa y "Animación"

Rama de trabajo: `21-sep-round-2-2`, en ~/orca/workspaces/landinglasfuertes/21-sep-round-2-2/.
Todo está commiteado (10 commits sobre `main`); nada está publicado. La rama `21-sep-round-2` es
la misma historia tres commits atrás: no la uses.

PREGUNTAS ABIERTAS PARA JOHAN (PROGRESS, "Preguntas abiertas" 5 y 6): el mapa trae 7 etiquetas
(incluye Ibagué) y el título dice "6 territorios"; y la piscina dice "2XX niñas", placeholder.
Se construyó tal cual el diseño; cambiar cualquiera es una línea.

QUÉ PUEDE PEDIR JOHAN Y DÓNDE SE TOCA
  - Aire entre bloques (120 px, D22): `components/impacto/impacto-section.tsx`.
  - Velocidad u orden de las animaciones: `styles/global.css`, sección "MAPA DE IMPACTO", y el
    orden de `ETIQUETAS` en `components/impacto/mapa.data.ts`.
  - Copy y líneas de los chips: `locales/{es,en,fr}.json`, clave `impacto`.
  - Posición de una capa: `components/impacto/bloques.data.ts`, en px del frame de Figma.
  - Publicar: PR de `21-sep-round-2-2` contra `main` (despliega solo).
    `gh auth switch --user johanmendezb` antes de `gh`.

LAS SEIS REGLAS QUE MÁS CUESTAN SI SE SALTAN

1. Verifica con capturas antes de entregar: `scripts/captura.js` (`--w`, `--ancla`, `--y`,
   `--lang`, y `--tras` para esperar el final de una animación). Procedimiento en docs/PATTERNS.md.
   Un PNG de menos de 10 KB es una captura fallida.

2. Busca el patrón antes de inventarlo: chip rasgado `.map-chip` (`==texto==` en locales),
   `FadeIn`, `useInView` + CSS para animar, `--k` para escalar (D21).

3. Los tres idiomas van en la misma entrega. Si falta una clave, la web muestra la clave cruda.

4. No borres librerías ni assets que parezcan huérfanos (GSAP, `public/images/hero/`).

5. El dev server de la rama corre SIEMPRE en localhost:3000. Si el puerto lo tiene otro worktree
   (`lsof -p <pid> | grep cwd`), mátalo y arranca el tuyo. Tras `npm run build`, `rm -rf .next`.

6. No hagas commits ni push a menos que se pidan en ese mismo mensaje. Rama, PR y merge a `main`.
   No agregues dependencias sin preguntar.

Escribe PROGRESS.md al terminar cada sub-paso; si un hallazgo cambia una decisión, va a
DECISIONES.md en el momento. Lo que quede solo en el chat se pierde.
```
