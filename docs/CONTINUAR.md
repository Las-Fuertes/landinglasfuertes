# Arranque de sesión nueva (feedback de secciones)

Pega el bloque de abajo como primer mensaje en un chat nuevo y completa la parte marcada. Está
escrito para alguien sin ningún contexto previo. Actualizado: 2026-09-24.

---

```
Trabajamos en la web de Fundación Las Fuertes, una organización de educación menstrual integral
(EMI). Es un Next.js 16 con Pages Router (carpeta `pages/`, NO App Router), TypeScript, Tailwind 3,
framer-motion para animación general, GSAP (núcleo, sin ScrollTrigger) en la Introducción y Swiper
en el slider de principios.
Idiomas es (por defecto), en y fr con el i18n nativo de Pages Router.

ESTADO AL EMPEZAR (todo en `main` y en producción; `main` despliega solo a producción vía Vercel)

- PR #20 (2026-09-23): Bienvenida como un paso más de la intro (D6). Desde la parte 3, un gesto
  trae Bienvenida: relevo del sol rojo al rosado con squash and stretch, entrada por piezas (texto
  primero) y reposo con los rayos del sol girando.
- PR #21 (merge `9861451`, 2026-09-23): reposo de la intro más perceptible, con dos niveles
  `?reposo=medio|alto` (medio por defecto; Johan aprobó sin elegir uno, `alto` sigue disponible
  como parámetro para comparar y se borra cuando elija); la mujer de Bienvenida pasó a SVG con el
  pelo ondeando desde la nuca; Bienvenida en desktop según Figma `1280:9`; lenguaje de movimiento
  documentado en `docs/PATTERNS.md` (D7 y D8 en `docs/introduccion/DECISIONES.md`).
- PR #22 (merge `5bae81e`, 2026-09-24): Bienvenida como hero de una sola pantalla (`min-h-dvh`);
  sección nueva `components/emi/` (id `emi`) con "Educación menstrual integral como mapa de
  cambio" y el slider de principios dentro como estampillas (abanico en desktop, pila en mobile,
  pulgar animado en vez de "SWIPE" que se desvanece sin mover el layout; arrastre continuo,
  interrumpible desde la pose visible); Donaciones fiel a Figma mobile `1288:1478` y desktop nuevo
  `1288:1594`; el enlace del footer "Nuestros principios" apunta a `#principios`. Documentado en
  `docs/emi/` y `docs/donaciones/`. Verificado por dos verificadores independientes; Vercel en
  success.

EN CURSO, SIN MERGEAR (2026-09-24): rama `24-sep-mapa` (worktree `23-sep`). Mapa educativo nuevo
  (Figma `966:11627`, orden Talleres -> Clubes -> Mi ruta -> ChiquiFuertes -> Voces Soberanas),
  cada parada clicable en todo su grupo, zoom en mobile para ver una parada sola, título con el
  mapa doblado y el pin (Figma `1311:14`), "Saltar mapa" con scroll fuerte reutilizando el
  detector de gestos de la intro (`lib/gesto-rueda.ts`) y el botón flotante de Súmate oculto en
  las secciones marcadas con `data-oculta-flotante`. Detalle y estado exacto en
  `docs/mapa-educativo/PROGRESS.md` y `DECISIONES.md` (D1 a D5).

EL TRABAJO DE ESTA SESIÓN: FEEDBACK DE JOHAN SOBRE OTRAS SECCIONES

============================================================
FEEDBACK DE JOHAN (lo completa él, no lo inventes):

<PEGAR AQUÍ, sección por sección: qué se ve o se siente mal, en qué dispositivo y ancho, capturas
si las hay, links de Figma si hay diseño nuevo, y qué NO hay que tocar.>
============================================================

Si el feedback es ambiguo, pregunta antes de construir (AskUserQuestion, con una opción
recomendada). Si hay un frame de Figma, carga primero la skill `figma:figma-design-to-code`.

ANTES DE TOCAR NADA, lee en este orden:
  1. CLAUDE.md                            qué es el proyecto, orden de la página, reglas, worktrees
  2. docs/PATTERNS.md                     grid, breakpoints, colores por nombre, copy e i18n, chip
                                          rasgado, verificación visual, animación, drawer
                                          SI EL FEEDBACK TOCA ANIMACIÓN: lee entera la
                                          subsección "Lenguaje de movimiento del sitio"
                                          (12 preferencias de Johan aprobadas en varias rondas)
  3. docs/sumate-drawer/PROGRESS.md       pendientes abiertos del drawer y del orden nuevo
  4. docs/sumate-drawer/DECISIONES.md     D1 (orden) y D2 (drawer)
  5. Solo si el feedback toca la intro o Bienvenida: docs/introduccion/DECISIONES.md (D2 a D8) y
                                          docs/introduccion/PROGRESS.md (todo mergeado; queda
                                          pendiente elegir nivel de reposo)
  6. Solo si toca EMI o el slider de principios: docs/emi/DECISIONES.md y PROGRESS.md
  7. Solo si toca Donaciones:              docs/donaciones/DECISIONES.md y PROGRESS.md
  8. Solo si toca el mapa educativo:       docs/mapa-educativo/DECISIONES.md y PROGRESS.md (rama
                                          `24-sep-mapa`, sin commitear; no tocar sin coordinar)
  9. Solo si toca Impacto o Quiénes somos: docs/secciones-impacto/DECISIONES.md (historial cerrado:
                                          se consulta, no se reescribe; se le añaden ampliaciones)

MAPA DE SECCIONES (componente -> título visible)
  components/intro/            Introducción (3 partes, pin con GSAP)
  components/welcome/          "Bienvenidx a Las Fuertes"                 id `bienvenida` (hero)
  components/emi/              "Educación menstrual integral como mapa de cambio"  id `emi`
                               (contiene el slider de principios y su título en cinta, id `principios`)
  components/principles/       el slider "Así lo comprendimos nosotras" (Swiper), dentro de EMI
  components/donations/        "Dirigir el cambio ... tripulantes comprometidos"
  components/education-map/    "Cómo hacemos de nuestro mapa educativo la ruta ..." (en curso)
  components/impacto/          "Así se ve el impacto en acción"           id `impacto`
  components/quienes-somos/    "¿Quiénes somos?"
  components/sumate/           drawer "Súmate a Las Fuertes": useSumateDrawer().open('<origen>')
  components/layout/footer.tsx footer

DECISIONES DE JOHAN QUE NO DEBEN VOLVER A PROPONERSE
  - El botón flotante de Súmate en mobile tapa la mano de la mujer de Bienvenida: se deja así.
  - Las nubes que sangran por el borde a 1024 y 1920: se quedan así.
  - El mapa educativo sigue avanzando por posición de scroll, NO por "un gesto, una parada" como
    la intro (Johan, 2026-09-24: "dejémoslo como está, no le hagamos nada más").
  - La fuente de acento pasará de Homemade Apple a "Bradley Hand" en otra iteración; hace falta el
    archivo con licencia web (no está en Google Fonts). No proponer el cambio sin ese archivo.

PENDIENTES CONOCIDOS (anotados, no pedidos; solo se tocan si Johan los pide)
  - Elegir el nivel de reposo de la intro (`?reposo=medio` o `?reposo=alto`) y borrar el que no
    quede, junto con el parámetro.
  - Barco de Donaciones meciéndose en reposo (propuesta no pedida, ver `docs/donaciones/PROGRESS.md`).
  - Título del mapa educativo en desktop es una adaptación propia sin frame de Figma: validar con
    diseño.
  - Tablet horizontal (1000x700): en el mapa, la parada Clubes deja ver 17 % de Talleres aun con
    el zoom máximo.
  - El slider de principios no responde al scroll horizontal de dos dedos del trackpad (Swiper no
    lo escucha).
  - Cambio de fuente de acento a Bradley Hand (ver arriba).
  - El pago real con Bold dentro del drawer no se ha probado (en local no hay llave ni https):
    probarlo en un preview de Vercel.
  - Intro en pantallas más bajas que el lienzo (móvil apaisado): las partes 1 y 2 pierden el texto.
  - Bloques de Impacto en desktop se ven flacos (esperando feedback de diseño); su aire de arriba
    sigue pendiente ahora que va tras el mapa educativo y no tras la intro. Tablet de Impacto sin
    revisar. Claves de copy de la intro con prefijo `hero.` (limpieza opcional).
  - Título en inglés de Donaciones: el corte natural deja "with" o "crews" solas; no es un error de
    maquetación, se ajusta si molesta.

CÓMO TRABAJAR (regla de Johan: el orquestador no implementa)
  - El chat principal orquesta. Todo subagente se lanza con `model` explícito: "opus" para
    constructores y verificadores, "sonnet" para exploración y lectura. Nunca un Agent sin model.
  - El prompt de cada subagente lleva: worktree, rama y punta; qué hay sin commitear y qué no
    tocar; archivos exactos que leer; criterio de éxito medible; prohibiciones; resumen final
    acotado en palabras y una línea "VEREDICTO:". El orquestador lee el resumen y confirma con grep
    o con una captura puntual, no lee informes enteros.
  - Al paralelizar dos constructores en el mismo worktree, reparte archivos sin solape explícito en
    el prompt (quién toca qué archivo) y avisa por mensaje cuando uno termina, para coordinar lo
    compartido (por ejemplo una prop o un título que se mueve de un componente a otro).
  - Si lanzar un Agent con `name` falla con "Timed out waiting for the Orca runtime", relánzalo
    sin `name` (sigue siendo async y se le puede escribir con SendMessage por su id).
  - Si un agente se corta por límite de uso de la API, no se relanza: se le escribe con SendMessage
    por su id cuando se reinicia el límite, pidiéndole mirar `git status` antes de seguir.
  - Tras cada tanda de cambios grandes, un verificador independiente (opus) antes de que Johan
    pruebe: en tandas anteriores encontró bugs reales que el constructor no vio (pulgar tapado y
    salto de layout, enlace del footer roto, flechas activas con el drawer abierto, autoplay
    muerto por StrictMode, salto al interrumpir una transición del slider, y antes 3 bugs en la
    intro).
  - Johan prueba en localhost:3000 con su trackpad y su móvil; cada ronda de feedback es una
    entrada nueva en DECISIONES.md con el porqué, en el momento, no al final.

CÓMO SE VERIFICA (nada se entrega sin mirarlo)
  - `scripts/captura.js` habla con el Chrome local por CDP, fija viewport y guarda un PNG. Flags en
    docs/PATTERNS.md: --ancla, --w/--h, --y, --tras, --lang, --hash, --clic, --reducido, y para la
    intro --paso, --gesto, --rafaga, --inercia, --tras-lista, --tecla, --recorte, --quieto.
    Un PNG de menos de 10 KB es una captura fallida.
  - Anchos reales, no solo los de Figma (390, 1024, 1280): también 1512 y 1920. Tablet es 768 a
    1023; a 1024 exacto gana desktop.
  - Para tiempos y estados, sondea estilos calculados por CDP en vez de mirar una imagen.
  - `npm run type-check`, `npm run lint`, `npm run build` limpios antes de proponer commit.

REGLAS QUE CUESTAN SI SE SALTAN
  1. El dev server va SIEMPRE en localhost:3000, desde el worktree de la rama en curso. Si el
     puerto lo tiene otro worktree (`lsof -ti tcp:3000 -sTCP:LISTEN` y luego `lsof -p <pid> | grep
     cwd`; ojo, sin `-sTCP:LISTEN` sale el navegador), mátalo y arranca el tuyo.
  2. `Can't resolve '@vercel/turbopack-next/internal/font/google/font'` es caché rancia de
     Turbopack: `rm -rf .next node_modules/.cache` y arrancar de nuevo. Sale al alternar
     `npm run build` con `npm run dev`: tras un build, borra `.next` y relanza el dev.
  3. NUNCA `git stash` a secas (la pila es compartida entre worktrees y sesiones). Si hace falta
     apartar trabajo, usa un commit WIP o `git stash push -u -m "<etiqueta única>"` y recupéralo
     por esa etiqueta, nunca con `stash pop` a ciegas. husky + lint-staged hacen su propio stash en
     cada commit y lo limpian solos: eso es normal.
  4. Colores y espaciados por nombre de Tailwind, nunca hex ni px sueltos. Sin rayas largas en
     código, comentarios ni docs. Copy nuevo en los tres locales en la misma entrega.
  5. No borres librerías ni assets que parezcan huérfanos (GSAP, `public/images/hero/`, los assets
     viejos de Donaciones). No añadas dependencias sin preguntar.
  6. No hagas commits ni push a menos que Johan los pida en ese mismo mensaje. Cuando los pida:
     rama desde `origin/main` actualizado (`git fetch` primero), commit con identidad
     `Johaneto <johan@beu.app>`, `gh auth switch --user johanmendezb` antes de `gh`, PR y merge.
     Después confirma el despliegue: `gh api repos/Las-Fuertes/landinglasfuertes/commits/<sha>/status`.
     Si el push por SSH falla con "Broken pipe" en un push grande, reintenta con
     `GIT_SSH_COMMAND="ssh -o ServerAliveInterval=15" git push`.
  7. Figma: `get_metadata` a veces no muestra todos los hijos de un frame (por ejemplo una capa
     llamada "Girl"); si falta algo, bajar con `get_design_context` o `use_figma` de solo lectura.

DÓNDE ESTÁ TODO
  - Worktrees en `~/orca/workspaces/landinglasfuertes/<rama>/`; el checkout principal con `main`
    está en `~/Sites/personal/landinglasfuertes`. Un cambio en un worktree no se ve en el de `main`
    hasta mergear y hacer `git pull` ahí. Crea una rama nueva desde `origin/main` para esta sesión.
  - Documentación nueva de esta tanda: carpeta propia `docs/<tema>/` con DECISIONES.md y
    PROGRESS.md; actualiza CLAUDE.md ("Trabajo en curso") y este archivo al cerrar.

CIERRE DE SESIÓN: antes de quedarte sin contexto, escribe en el repo lo aprendido al final
(DECISIONES), el estado con versiones y qué sigue en orden (PROGRESS), y actualiza este
CONTINUAR.md. Avisa a Johan del contexto ANTES de agotarlo.
```

</content>
