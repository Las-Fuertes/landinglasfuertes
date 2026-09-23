# Estado vivo: transiciones de la Introducción

> Esta carpeta documenta **solo** las transiciones de la Introducción (`components/intro/`). El
> resto del primer tramo (Impacto, Quiénes somos, y la Introducción estática original con sus 3
> partes) ya está cerrado y en producción; su historial vive en `docs/secciones-impacto/` y no se
> toca (D1).

Última actualización: 2026-09-23 (D6).
Las rondas 1 a 5 están en `main` (PR #17). Trabajo en curso: rama `23-sep-bienvenida`, en el
worktree `~/orca/workspaces/landinglasfuertes/23-sep-intro/`, sobre `main` en `5b5b299`.
**D6 sin commitear**: nada llega a `main` sin que Johan lo pida.

## Dónde vamos

| Intento        | Qué se hizo                                                                                               | Estado                                                               |
| -------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1 (2026-09-22) | Pin por partes con fade de opacidad por grupo y bloqueo por temporizador fijo. Worktree `22-sep`.         | No aprobado. Se queda sin commitear en `22-sep`, solo como consulta. |
| 2 (2026-09-23) | Coreografía por roles con GSAP, gesto = una parte, sin reversa desde abajo, saltar con scroll fuerte      | Johan la aprobó en general tras probarla con trackpad.               |
| 2, ronda 2     | Más lento (x1,4), el texto manda, relevo sin barcos duplicados, gestos encadenados                        | Probada por Johan: pidió pulir el barco, la persona y la tierra.     |
| 2, ronda 3     | Dos variantes del relevo del barco (`?barco=a` / `?barco=b`), persona desde el doblez, tierra con fundido | Johan eligió la variante b del barco (squash and stretch).           |
| 2, ronda 4     | Barco b definitivo, persona lineal y como nota aparte, movimiento sutil en reposo                         | Probada por Johan: pidió que la persona salga del borde inclinado.   |
| 2, ronda 5     | Recorte de la persona por el borde inclinado del barco                                                    | Aprobado y en `main` (PR #17).                                       |
| Bienvenida     | Bienvenida como paso de la intro: relevo del sol, entrada por piezas, reposo (rayos; el pelo se retiró)   | Construido y verificado por CDP (D6). **Falta verificador y Johan.** |

El detalle del intento 2 (causas raíz del 1, umbrales, tiempos, qué se verificó y cómo) está en
`DECISIONES.md`, D2. La ronda 2 (ajustes de la diseñadora y tres bugs de la prueba de Johan), en D3.

## Qué sigue, en orden

0. **D6 (Bienvenida):** un verificador independiente y luego Johan en `localhost:3000`. Mirar: que
   el salto a Bienvenida no se note, el relevo del sol, el ritmo (unos 2,7 s de bloqueo, más que
   una transición de la intro: si se siente largo, `LLEGADA` en `bienvenida.motion.ts`) y la
   ilustración algo más nítida. El pelo ya no se mueve: se retiró (ampliación al final de D6).
   Probar con dedo real: la llegada ahora también la dispara el touch desde la parte 3.
1. **Johan prueba la ronda 4** en `localhost:3000`: la persona (lineal, llega tarde), el idle
   (si se ve demasiado o nada, son las cifras de `REPOSO` en `intro.motion.ts`) y el barco b ya
   definitivo. Decidir también si la nube y el sol se suavizan en sus entradas (D4, punto 3).
2. **Lo que se probó de rondas anteriores** sigue igual en `localhost:3000` con su trackpad y en un móvil real. Lo que hay
   que mirar: el ritmo nuevo (si 1,4 se queda corto o largo, es `ESCALA_TIEMPO`), que el texto se
   vaya el último y llegue el primero, que el barco nunca se vea doble entre 2 y 3, que un scroll
   fuerte encadenado ya no deje la intro sin responder, y volver desde Impacto y bajar de inmediato.
3. Ajustar según lo que diga. Los números están con nombre: `FIN_DE_GESTO_MS`, `SCROLL_FUERTE_PX`,
   `GESTOS_FUERTES`, `TOUCH_THRESHOLD` e `IMPULSO_*` en `use-intro-pin.ts`; en `intro.motion.ts`,
   `ESCALA_TIEMPO` para el ritmo global y `T`, `DESFASE`, `DURACION`, `ESCALON` por rol.
4. Con su visto bueno: commit, PR y merge (`gh auth switch --user johanmendezb` antes de `gh`).
5. Pendiente anotado, no pedido: en pantallas más bajas que el lienzo (portátil de 1280x700, móvil
   apaisado) la parte se centra y se recorta. Ver el final de D2. Lo decide Johan.
6. Pendiente anotado, no pedido: animar el pelo de la mujer de Bienvenida cuando exista como SVG
   aparte (D6).

## Archivos del cambio

D6 (Bienvenida): `components/intro/bienvenida.motion.ts` (nuevo), `use-intro-pin.ts` (llegada),
`intro-section.tsx` (efecto de la llegada), `intro.motion.ts` (solo exports),
`components/welcome/{welcome,sol-rosado,ilustracion-playa}.tsx`, `sol-rosado.data.ts`,
`components/sumate/sumate-flotante.tsx` (espera a la llegada), `tailwind.config.js` (`pink-sol`),
`public/images/welcome/pink-sun-disco.png` y `playa-*`.

Rondas 1 a 5:

- `components/intro/use-intro-pin.ts`: gestos, enganche, saltar y reinicio (reescrito).
- `components/intro/intro.motion.ts`: roles y timelines de GSAP (nuevo).
- `components/intro/intro-section.tsx`: modo pin reescrito; el respaldo estático es el de siempre.
- `components/intro/use-breakpoint.ts`: traído de `22-sep` tal cual.
- `components/intro/intro.data.ts`: solo el campo `rol`.
- `locales/{es,en,fr}.json`: `intro.saltar`.
- `pages/_document.tsx` y `styles/global.css`: ocultar la intro estática mientras hidrata.
- `scripts/captura.js`: flags de la intro (ver `docs/PATTERNS.md`).

## Decisiones de fondo que siguen vigentes

En `docs/secciones-impacto/DECISIONES.md`: **D13** (capas en porcentaje sobre un lienzo), **D16**
(GSAP se queda instalado), **D17** (tablet y desktop reutilizan las capas de mobile por grupos) y
**D26** (el horizonte de la parte 2 sangra en desktop: verificar a 1920).

## Bitácora

### 2026-09-23: Bienvenida como paso de la intro (D6)

Desde la parte 3, un gesto trae Bienvenida: la intro sale, la página se asienta sola en
`#bienvenida` bajo la capa fija, el sol rojo viaja y cambia por el rosado con squash and stretch,
los rayos salen en cascada y Bienvenida entra por piezas (texto primero). En reposo giran los
rayos y ondea el pelo (filtro SVG con máscara, sin costuras). La ilustración pasó de un PNG a
capas de Figma. Verificado por CDP con cifras en D6.

### 2026-09-23: ronda 5 (D5)

La persona de la parte 3 no parecía salir del doblez: su recorte era horizontal y el borde del
barco sube hacia la derecha. Ahora el recorte es un `polygon()` con la recta del borde medida en
los paths del SVG, fija respecto al barco (medido: se mueve 0,01 px como mucho), y en reposo no le
recorta nada. Se encontró y se evitó un fallo de GSAP interpolando cadenas de `polygon()`.

### 2026-09-23: ronda 4 (D5)

Johan eligió la variante b del barco; se retiró la a y el parámetro `?barco`. La persona de la
parte 3 ahora se asoma lineal, sin rebote, medio segundo después de la transición y fuera del
bloqueo de gestos, y al retroceder se esconde antes de que el barco se mueva. Se añadió un
movimiento sutil en reposo (burbujas, barco con la persona, olas, reflejo, nube), congelable con
`?quieto=1`. Verificado por CDP con cifras en D5.

### 2026-09-23: ronda 3 (D4)

El relevo del barco en un fotograma se veía como un salto. Se construyeron dos variantes para
comparar en el navegador (`?barco=a`, morph aparente con fundido corto; `?barco=b`, salto con
squash), marcadas como temporales. La persona de la parte 3 ahora sale del doblez del barco sin
escalar, y la tierra de la parte 2 entra y sale solo con opacidad. Verificado por CDP con cifras
en D4.

### 2026-09-23: ronda 2 (D3)

Johan aprobó D2 en general. Se hizo todo más lento con una sola escala (x1,4), se reordenó para
que el texto sea lo último en irse y lo primero en llegar, se cambió el crossfade del barco, el
sol y las olas por un relevo en un solo fotograma (nunca dos a la vez) y se arreglaron dos bugs de
gestos: un scroll fuerte encadenado bloqueaba la intro, y al volver desde Impacto y bajar de
inmediato no enganchaba. Verificado por CDP con cifras en D3.

### 2026-09-23: tres fallos del verificador corregidos (D2)

Un verificador independiente encontró tres fallos: la entrada de la parte 1 no se animaba en
tablet ni desktop, el pellizco de zoom del trackpad cambiaba de parte, y la intro se atascaba en
la parte 3 al asomarse a Impacto y volver. Los tres se corrigieron y se volvieron a probar por CDP
(D2, "Correcciones tras la verificación independiente"). Quedan para Johan, sin tocar: el
crossfade de los dos barcos y el recorte en móvil apaisado.

### 2026-09-23: segundo intento construido (D2)

Se partió del intento 1 sin tocar su worktree: se trajeron `use-breakpoint.ts`, el respaldo
estático, el placeholder y `captura.js`; se reescribieron el hook y el modo pin. Se añadieron a
`captura.js` `--inercia`, `--tras-lista`, `--tecla`, `--recorte`, `--reducido` y `--hash`.
Verificado por CDP (D2, "Verificado"); falta la prueba física de Johan.

### 2026-09-23: documentación separada de `docs/secciones-impacto/` (D1)
