# Arranque de sesión nueva (feedback de secciones)

Pega el bloque de abajo como primer mensaje en un chat nuevo y completa la parte marcada. Está
escrito para alguien sin ningún contexto previo. Actualizado: 2026-09-23.

---

```
Trabajamos en la web de Fundación Las Fuertes, una organización de educación menstrual integral
(EMI). Es un Next.js 16 con Pages Router (carpeta `pages/`, NO App Router), TypeScript, Tailwind 3,
framer-motion para animación general y GSAP (solo núcleo, sin ScrollTrigger) en la Introducción.
Idiomas es (por defecto), en y fr con el i18n nativo de Pages Router.

ESTADO AL EMPEZAR (todo en `main` y en producción; `main` despliega solo a producción vía Vercel)

- PR #17 (2026-09-23): transiciones de la Introducción. La intro se fija en pantalla y cada gesto
  (rueda, touch o teclado) avanza UNA parte, sin importar la inercia; coreografía por piezas con
  GSAP; el texto sale último y entra primero; el barco hace relevo con squash and stretch entre
  las partes 2 y 3; la persona se asoma desde el doblez del barco con un recorte inclinado;
  movimiento sutil en reposo; "Saltar animación" solo ante scroll fuerte o con Tab/Escape; al
  volver desde abajo se ve la parte 1 y la intro se rearma. Aprobada por Johan tras 5 rondas.
- PR #18 (2026-09-23): nuevo orden de secciones y Súmate como drawer. Orden:
  Introducción -> Bienvenida -> Principios ("Así lo comprendimos nosotras") -> Donaciones
  ("... tripulantes comprometidos") -> Mapa educativo -> Impacto -> Quiénes somos -> Footer.
  Súmate ya no es una sección: es un drawer (lateral en desktop, sheet desde abajo en móvil) que
  abren el botón de Donaciones, el footer, un botón flotante y `/#sumate` o `/#donar`.

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
  3. docs/sumate-drawer/PROGRESS.md       pendientes abiertos del drawer y del orden nuevo
  4. docs/sumate-drawer/DECISIONES.md     D1 (orden) y D2 (drawer)
  5. Solo si el feedback toca la intro:   docs/introduccion/DECISIONES.md (D2 a D5)
  6. Solo si toca Impacto o Quiénes somos: docs/secciones-impacto/DECISIONES.md (historial cerrado:
                                          se consulta, no se reescribe; se le añaden ampliaciones)

MAPA DE SECCIONES (componente -> título visible)
  components/intro/            Introducción (3 partes, pin con GSAP)
  components/welcome/          "Bienvenidx a Las Fuertes"                 id `bienvenida`
  components/principles/       "Así lo comprendimos nosotras" (Swiper)
  components/donations/        "Dirigir el cambio ... tripulantes comprometidos"
  components/education-map/    "Cómo hacemos de nuestro mapa educativo la ruta ..."
  components/impacto/          "Así se ve el impacto en acción"           id `impacto`
  components/quienes-somos/    "¿Quiénes somos?"
  components/sumate/           drawer "Súmate a Las Fuertes": useSumateDrawer().open('<origen>')
  components/layout/footer.tsx footer

PENDIENTES CONOCIDOS (anotados, no pedidos; solo se tocan si Johan los pide)
  - Aire de arriba de Impacto, ahora que va tras el mapa azul y no tras la intro.
  - El botón flotante de Súmate tapa la esquina inferior derecha del contenido en móvil; y si
    debe esconderse cuando Donaciones (con su propio botón) está en pantalla.
  - En el footer, "Súmate" está al final de "Explora"; podría ir en "¿Quieres ayudar?".
  - El pago real con Bold dentro del drawer no se ha probado (en local no hay llave ni https):
    probarlo en un preview de Vercel.
  - Intro en pantallas más bajas que el lienzo (móvil apaisado): las partes 1 y 2 pierden el texto.
  - Bloques de Impacto en desktop se ven flacos (esperando feedback de diseño). Tablet de Impacto
    sin revisar. Claves de copy de la intro con prefijo `hero.` (limpieza opcional).

CÓMO TRABAJAR (regla de Johan: el orquestador no implementa)
  - El chat principal orquesta. Todo subagente se lanza con `model` explícito: "opus" para
    constructores y verificadores, "sonnet" para exploración y lectura. Nunca un Agent sin model.
  - El prompt de cada subagente lleva: worktree, rama y punta; qué hay sin commitear y qué no
    tocar; archivos exactos que leer; criterio de éxito medible; prohibiciones; resumen final
    acotado en palabras y una línea "VEREDICTO:". El orquestador lee el resumen y confirma con grep
    o con una captura puntual, no lee informes enteros.
  - Si lanzar un Agent con `name` falla con "Timed out waiting for the Orca runtime", relánzalo
    sin `name` (sigue siendo async y se le puede escribir con SendMessage por su id).
  - Tras cada tanda de cambios grandes, un verificador independiente (opus) antes de que Johan
    pruebe: encontró 3 bugs reales en la intro que el constructor no vio.
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
  3. NUNCA `git stash` (la pila es compartida entre worktrees y sesiones). husky + lint-staged
     hacen su propio stash en cada commit y lo limpian solos: eso es normal.
  4. Colores y espaciados por nombre de Tailwind, nunca hex ni px sueltos. Sin rayas largas en
     código, comentarios ni docs. Copy nuevo en los tres locales en la misma entrega.
  5. No borres librerías ni assets que parezcan huérfanos (GSAP, `public/images/hero/`). No
     añadas dependencias sin preguntar.
  6. No hagas commits ni push a menos que Johan los pida en ese mismo mensaje. Cuando los pida:
     rama desde `origin/main` actualizado (`git fetch` primero), commit con identidad
     `Johaneto <johan@beu.app>`, `gh auth switch --user johanmendezb` antes de `gh`, PR y merge.
     Después confirma el despliegue: `gh api repos/Las-Fuertes/landinglasfuertes/commits/<sha>/status`.

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
