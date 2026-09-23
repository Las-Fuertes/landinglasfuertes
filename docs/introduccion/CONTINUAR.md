# Arranque de sesión nueva

Pega esto como primer mensaje en un chat nuevo. Está escrito para alguien sin ningún contexto
previo de la conversación.

---

````
Trabajamos en la web de Fundación Las Fuertes, una organización de educación menstrual integral.
Es un Next.js 16 con Pages Router (carpeta `pages/`, NO App Router), TypeScript y Tailwind 3.

EL TRABAJO: LAS TRANSICIONES ENTRE LAS 3 PARTES DE LA INTRODUCCIÓN

La Introducción (`components/intro/`) son 3 partes ya diseñadas y aprobadas: composición, assets,
copy y medidas no se tocan. Lo que está en juego es cómo se pasa de una parte a otra.

Hay un segundo intento construido el 2026-09-23, **sin commitear, en el worktree
`~/orca/workspaces/landinglasfuertes/23-sep-intro/`, rama `23-sep-intro`**: pin por partes, un
gesto avanza una parte, coreografía por roles con GSAP (sin ScrollTrigger), relevo del sol, el
barco y las olas entre las partes 2 y 3 (nunca dos a la vez), sin reversa al volver desde abajo, y
botón "Saltar animación" solo con scroll fuerte o con Tab/Escape. Johan probó la primera ronda con
su trackpad y la aprobó en general; la ronda 2 (D3: más lento, el texto manda, tres bugs) está
verificada por CDP y le falta su prueba.

============================================================
FEEDBACK DE JOHAN TRAS PROBARLO (lo completa él, no lo inventes):

<PEGAR AQUÍ: dispositivo y navegador, qué se sintió mal (un gesto avanza de más o de menos, la
coreografía, el botón de saltar, algo de un breakpoint), y qué sí le gustó y no hay que tocar.>
============================================================

ANTES DE TOCAR NADA, lee en este orden:
  1. CLAUDE.md                          qué es el proyecto y las reglas
  2. docs/introduccion/PROGRESS.md      estado vivo y qué sigue
  3. docs/introduccion/DECISIONES.md    D2 a D5 enteras: causas raíz del intento 1, mecánica,
                                        umbrales, tiempos, bugs de la prueba de Johan y su arreglo
  4. docs/PATTERNS.md                   sección "Animación" (flags de captura.js para la intro)
  5. El código: components/intro/use-intro-pin.ts, intro.motion.ts, intro-section.tsx

No escribas en `docs/secciones-impacto/` (D1). Todo va a `docs/introduccion/`.

DÓNDE SE AJUSTA CADA COSA

- La persona de la parte 3 (se asoma aparte, tras la transición): `crearAsomo`, `PERSONA_*`.
- El movimiento en reposo: cifras en `REPOSO` (intro.motion.ts); `?quieto=1` lo congela.
- Todo va rápido o lento: `ESCALA_TIEMPO` (1,4) en intro.motion.ts, una sola cifra para todo.
- Un gesto se corta o se pega: `FIN_DE_GESTO_MS` (180) en use-intro-pin.ts. Un scroll encadenado
  no se detecta como gesto nuevo: `IMPULSO_DECAIDO`, `IMPULSO_FACTOR`, `IMPULSO_MIN_PX`.
- El botón de saltar sale de más o de menos: `SCROLL_FUERTE_PX` (1500) y `GESTOS_FUERTES` (2).
- Touch demasiado sensible o duro: `TOUCH_THRESHOLD` (50).
- Tiempos y curvas por rol: `T`, `DESFASE`, `DURACION`, `ESCALON` en intro.motion.ts. Cada rol
  define su estado oculto en `oculto()`; la salida usa el mismo con el sentido contrario.

LECCIONES QUE COSTARON, NO LAS REPITAS

1. La inercia de un trackpad manda eventos durante 1,5 a 2 s. Nunca bloquees con un temporizador
   fijo: el gesto termina tras un silencio, y el bloqueo se libera cuando terminó el gesto Y el
   timeline.
2. Un enganche geométrico simétrico (placeholder cruzando el viewport) engancha también al subir y
   corre la intro en reversa. Solo se engancha con un gesto hacia abajo que empezó arriba del todo.
3. Con StrictMode (activo en next.config.js) los efectos se montan dos veces: toda animación de
   GSAP va dentro de `gsap.context()` y se deshace con `ctx.revert()` al desmontar.
4. Tablet es 768-1023: a 1024 exacto gana desktop. Verifica tablet a 1000.
5. Un gesto nuevo no siempre llega tras un silencio: con inercia larga o scroll encadenado nunca
   hay hueco. El cambio de sentido y un impulso nuevo tras decaer también abren gesto (D3).
6. Nunca dos barcos a la vez: el viaje entre 2 y 3 es un relevo en un fotograma, no un crossfade.
   Y en GSAP un `fromTo` de duración cero con `immediateRender` pinta su estado FINAL: para ocultar
   algo antes del primer fotograma, `gsap.set` dentro del contexto (D3).
7. Con transiciones de 1,75 s, los scripts de prueba deben esperar más de 1,8 s entre gestos: un
   gesto durante la transición se descarta a propósito.
8. El idle nunca va sobre el elemento que animan las transiciones (la caja exterior con
   `data-rol`, o la interior del barco): si no, el contexto de GSAP de la transición restaura su
   estado a medio mecer y deja piezas desplazadas (D5). Para capturas en reposo, `--quieto`.
9. En la comparación de capturas en reposo, el selector de idioma y el indicador "N" de Next son
   fijos y se mueven respecto a la parte: no son diferencias reales.

CÓMO SE VERIFICA

```bash
npm run dev   # en :3000
node scripts/captura.js --paso 2 --quieto --w 1280 --h 832 --out /tmp/p2.png
node scripts/captura.js --inercia 120:0.9 --tras 1500 --leer "document.querySelector('[data-paso]').dataset.paso"
node scripts/captura.js --paso 2 --gesto 120 --tras-lista 0,300,600,900,1200 --out /tmp/t23.png
```

Un PNG de menos de 10 KB es una captura fallida.

REGLAS QUE CUESTAN SI SE SALTAN

1. El dev server va SIEMPRE en `localhost:3000`. Si el puerto lo tiene otro worktree
   (`lsof -p <pid> | grep cwd`), mátalo y arranca el tuyo.
2. Si el dev server dice `Can't resolve '@vercel/turbopack-next/internal/font/google/font'`:
   `rm -rf .next node_modules/.cache` y arranca de nuevo. Tras `npm run build`, borra `.next`.
3. No hagas commits ni push a menos que se pidan en ese mismo mensaje. Cuando se pidan:
   `gh auth switch --user johanmendezb` antes de `gh`.
4. No agregues dependencias sin preguntar. No borres GSAP ni `public/images/hero/`.
5. Nunca `git stash`: el stash se comparte entre worktrees.
````
