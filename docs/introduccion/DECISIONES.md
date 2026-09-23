# Decisiones: transiciones de la Introducción

Una entrada por decisión, con su porqué. Numeración propia de este documento (D1 en adelante),
**independiente** de la de `docs/secciones-impacto/DECISIONES.md` (esa documenta un trabajo
distinto, ya cerrado).

Iniciado: 2026-09-23.

---

## D1. Esta documentación se separa de `docs/secciones-impacto/`

`docs/secciones-impacto/` documenta un trabajo ya cerrado: Impacto, Quiénes somos, y la
Introducción estática original (sus 3 partes, aprobadas y en producción). Las transiciones entre
esas partes son trabajo nuevo, pedido por Johan el 2026-09-22.

El primer intento se escribió dentro de `docs/secciones-impacto/` (una D29 y una entrada de
bitácora) y eso confundió a la sesión siguiente, que reescribió por error el `CONTINUAR.md` de esa
carpeta creyendo que seguía activo. Johan pidió revertirlo.

**Lo que se hizo:** carpeta nueva `docs/introduccion/` con su propio `CONTINUAR.md`, `PROGRESS.md`
y `DECISIONES.md`, para todo lo que siga con la Introducción. `CLAUDE.md` apunta aquí.

**Lo que NO se hizo, a propósito:** no se movió ni se copió nada de `docs/secciones-impacto/`. Las
decisiones D13, D16, D17 y D26 de allí se quedan como historial y aquí se citan por número. La D29
(el primer intento) nunca llegó a una rama con historial: vive solo, sin commitear, en el worktree
`~/orca/workspaces/landinglasfuertes/22-sep`. Lo que se aprendió de ella está resumido en D2.

---

## D2. Segundo intento: coreografía por roles con GSAP, gesto = una parte, sin reversa desde abajo, saltar con scroll fuerte

**Contexto.** Johan no aprobó el primer intento (2026-09-22, worktree `22-sep`, sin commitear).
Tenía tres problemas, cada uno con una causa concreta en su código. El plan aprobado el 2026-09-23
está en `~/.claude/plans/te-comparto-un-poco-dapper-phoenix.md`. Rama `23-sep-intro`.

### Las tres causas raíz del primer intento, y qué se hizo con cada una

1. **Un scroll rápido se saltaba las 3 partes.** El bloqueo entre partes era un `setTimeout` fijo
   de 950 ms, pero la inercia de un trackpad sigue mandando eventos de rueda durante 1,5 a 2 s. La
   cola de la inercia contaba como un gesto nuevo y disparaba otra parte.
   **Ahora:** un _gesto_ es una ráfaga de eventos de rueda que termina tras
   `FIN_DE_GESTO_MS = 180` ms sin eventos. El primer evento del gesto dispara una parte y el resto
   del gesto (inercia incluida, dure lo que dure) se traga con `preventDefault`. Un gesto nuevo que
   empieza mientras corre la transición también se traga entero. El bloqueo se libera cuando el
   timeline terminó **y** el gesto terminó; no hay ningún temporizador fijo.
2. **Al volver desde Impacto la intro corría en reversa.** La condición de enganche (`top` del
   placeholder entre `-vh` y `0`) valía igual subiendo que bajando, así que al subir se enganchaba
   en la parte 3 y la deshacía.
   **Ahora:** solo engancha un gesto hacia abajo **que empezó** con `scrollY <= ARRIBA_PX` (2 px).
   Un gesto que sube desde Impacto y llega a 0 con su inercia no engancha. Cuando el placeholder
   sale del viewport por arriba (IntersectionObserver con `rootMargin: -1px` arriba, para que
   tocar el borde cuente como fuera), la intro vuelve a la parte 1 sin animar; al reaparecer, la
   parte 1 reproduce su entrada. Una vez arriba, bajar corre la intro de nuevo.
3. **Las transiciones eran planas.** Solo se animaba la opacidad por grupo, con un desfase de 15 a
   20 ms que no se percibe, y el grupo `burbujas` (unas 20 capas) se movía como una sola pieza.
   **Ahora:** coreografía por roles con GSAP, ver abajo.

### Motor: GSAP núcleo, sin ScrollTrigger

Cada transición es un `gsap.timeline()` con 20 a 30 piezas que se solapan, cambian según el
sentido y deben poder terminarse de golpe (`progress(1)`, para saltar) o deshacerse
(`gsap.context().revert()`, porque StrictMode monta dos veces en desarrollo). Hacerlo con
`variants` de framer-motion obligaba a calcular a mano los retrasos de cada pieza. GSAP ya estaba
instalado y permitido (D16 de `secciones-impacto`). **No se usa ScrollTrigger**: el avance es por
gesto, no por posición del scroll. framer-motion sigue siendo el patrón del resto del sitio.

### Coreografía por roles (`components/intro/intro.motion.ts`)

Cada capa lleva un campo `rol` en `intro.data.ts` (no cambia ninguna medida) y el componente lo
pone en `data-rol`. Cada rol tiene un "estado oculto": la entrada parte de él con el sentido del
gesto y la salida va hacia él con el sentido contrario, así adelante y atrás quedan en espejo.

| Rol         | Entra                                                            | Sale                         |
| ----------- | ---------------------------------------------------------------- | ---------------------------- |
| `burbuja`   | escala desde 0 con `back.out(1.6)`, cascada desde el centro      | se encoge, de fuera a dentro |
| `garabato`  | `clip-path: inset()` de izquierda a derecha, como si se dibujara | se barre                     |
| `horizonte` | se abre desde el centro en horizontal                            | se cierra al centro          |
| `sol`       | sube desde abajo con -15° de giro                                | sigue subiendo y se apaga    |
| `nube`      | deriva desde un lado                                             | deriva hacia el otro         |
| `agua`      | olas sueltas, alternando de lado                                 | igual, al revés              |
| `ola`       | como `agua`; además viajan con el barco entre las partes 2 y 3   | ídem                         |
| `barco`     | navega desde la izquierda con cabeceo (`elastic.out`)            | navega hacia la derecha      |
| `persona`   | aparece con rebote cuando el barco ya llegó                      | se encoge                    |
| `texto`     | por párrafo: sube 24 px con fade y blur de 6 px a 0              | sale primero, hacia arriba   |

- El recorte de los garabatos deja una holgura de -20% para que el trazo que se sale de su caja
  (los `inset` negativos de Figma) no se corte.
- **Continuidad 2 ↔ 3:** el sol, el barco y sus olas no salen y entran, viajan. Se mide la caja
  de cada rol en la parte de origen y en la de destino (`getBoundingClientRect`); la pieza nueva
  arranca con un `transform` que la pone encima de la vieja y viaja a su sitio mientras la vieja
  se desvanece yendo al mismo destino. Es un crossfade con movimiento porque los SVG de una parte
  y otra son distintos. En reversa (3 → 2) es el mismo mecanismo.
- Solo se animan `transform`, `opacity`, `filter` y `clip-path` sobre la caja exterior de cada
  capa, y al terminar se borran con `clearProps`. Si un día una capa trae `opacity` en los datos,
  va en una caja interior para que la limpieza no la pise.
- **Tiempos:** la salida arranca en 0 (el texto primero), la entrada se solapa desde 0,4 s y todo
  termina hacia 1,2 s. La entrada de la parte 1 (al cargar y al volver desde abajo) dura unos
  0,9 s y espera a sus imágenes como mucho 500 ms. Un gesto durante esa entrada la termina en el
  acto y pasa a la parte 2.

### El botón "Saltar animación"

Solo aparece con un scroll fuerte: un gesto que acumula más de `SCROLL_FUERTE_PX = 1500` px de
`deltaY`, o `GESTOS_FUERTES = 2` gestos nuevos durante una misma transición. También aparece, y
recibe el foco, con Tab o Escape estando enganchado, para que nadie quede atrapado. Al pulsarlo:
`progress(1)` del timeline, desengancha, scroll suave a `#impacto` y el foco pasa a esa sección.
Texto en `intro.saltar` de los tres idiomas.

El umbral de 1500 px se eligió con el simulador de inercia de `scripts/captura.js`: un gesto normal
de trackpad (`--inercia 120:0.9`, unos 1200 px en 1,8 s) no lo alcanza; uno fuerte
(`--inercia 200:0.95`, unos 3700 px) sí.

### Lo que se trajo del primer intento, tal cual o casi

- `components/intro/use-breakpoint.ts`, tal cual: el breakpoint por `matchMedia` con los cortes de
  Tailwind, para montar solo la parte del breakpoint activo. **Tablet es 768-1023**: a 1024 exacto
  gana desktop (ya pasaba con las clases de Tailwind). Verifica tablet a 1000, nunca a 1024.
- El respaldo estático: en SSR, con `prefers-reduced-motion` o con un `#hash` en la URL se sirven
  los 9 bloques de siempre, sin capa fija ni listeners.
- El placeholder de una pantalla (`h-dvh`) en el flujo. Cambio: ahora la capa que se vuelve
  `fixed` es la misma caja (`absolute` suelta, `fixed` enganchada), no un árbol aparte. Así las
  partes no se remontan al enganchar y sus imágenes no parpadean. Como solo engancha con la página
  arriba del todo, las dos posiciones coinciden al píxel.
- `?introPaso=N` y los flags `--paso`, `--gesto`, `--rafaga` y `--leer` de `scripts/captura.js`.

### Hallazgos de esta vuelta

- **El parpadeo de la hidratación.** La intro se sirve estática y al hidratar pasa al pin con la
  entrada animada: entre el primer pintado y la hidratación se veía la parte 1 y luego
  desaparecía para entrar. Un script en `pages/_document.tsx` marca `<html data-intro-anima>` con
  las mismas condiciones que `useIntroPin` y una regla de `styles/global.css` oculta la versión
  estática (`visibility`, así ocupa su sitio). Sin JS no corre y se ve la estática. No hay
  mismatch: React no hidrata `<html>` en Pages Router.
- **Precarga de imágenes.** Con solo la parte actual montada, las imágenes de la que entra
  empezaban a pedirse al empezar su propia animación. `PrecargaImagenes` pide todas las del
  breakpoint en un contenedor `hidden`, con las mismas props que `Capa` para reutilizar la misma
  descarga, y las capas del pin usan `loading="eager"`.
- **Touch en los extremos.** Desde la parte 3 hacia abajo (o desde la 1 hacia arriba) se suelta en
  el primer movimiento sin `preventDefault`, para que el mismo dedo siga con el scroll nativo (o
  con el gesto de recargar). Con la página arriba y sin enganchar, un dedo que sube se retiene
  desde el primer movimiento y engancha al pasar los 50 px.
- **Red de seguridad:** si la página se mueve por otra vía estando enganchada (barra de scroll, un
  enlace, el foco saltando con Tab a otra sección), la capa fija se suelta.

### Verificado (2026-09-23)

- **Reposo idéntico:** las 3 partes a 390x700, 1000x1366 y 1280x832 (recortadas a la caja de cada
  parte), más 1512x832 y la parte 2 a 1920x832 (D26), comparadas píxel a píxel contra capturas
  tomadas antes del cambio. Móvil y desktop: 0 a 20 px distintos por captura (antialias). Tablet:
  las únicas diferencias son el selector de idioma y el indicador "N" de Next, que quedan 16 px
  más arriba respecto a la parte porque en el pin la parte se centra en la pantalla.
- **Un gesto, una parte:** `--inercia 120:0.9` desde la parte 1 deja la 2, desde la 2 deja la 3;
  una ráfaga de 6 eventos avanza una parte; `--inercia 200:0.95` avanza una parte y muestra el
  botón.
- **Tres gestos cortos** (a 0, 250 y 500 ms): una sola parte y aparece el botón.
- **Volver desde abajo:** 3 gestos llevan a Impacto; al subir con la rueda hasta `scrollY = 0` no
  se engancha nunca por el camino, se ve la parte 1, su entrada se reproduce (24 de 24 piezas
  animándose hasta los 830 ms, 0 a los 910 ms) y un gesto hacia abajo lleva a la parte 2.
- **Saltar:** con el ratón y con Tab + Enter, la página queda con `#impacto` en `top = 0`, el foco
  en `section#impacto` y la intro de vuelta en la parte 1. Escape también muestra el botón y le
  da el foco.
- **Duraciones medidas** hasta reposo limpio (sin estilos animados y una sola parte montada):
  1255 a 1304 ms en 1 → 2, 2 → 3, 3 → 2 y 2 → 1, en móvil, tablet y desktop (incluye la latencia
  del sondeo por CDP, unos 20 a 60 ms). Durante la transición hay 2 partes montadas; en reposo, 1.
- **Coreografía:** capturas a 0, 300, 600, 900 y 1200 ms de 1 → 2, 2 → 3 (móvil y desktop) y
  3 → 2; el fotograma de 1200 ms pesa exactamente lo mismo que la captura en reposo de destino.
- `prefers-reduced-motion` y `/#impacto`: respaldo estático, sin capa fija.
- Sin errores de hidratación en consola. `type-check`, `lint` y `build` limpios.

### Correcciones tras la verificación independiente (2026-09-23)

Un verificador aparte encontró tres fallos. Los tres se corrigieron y se volvieron a probar por CDP
repitiendo su caso de reproducción.

1. **La entrada de la parte 1 al cargar no se animaba en tablet ni desktop** (en móvil sí).
   `useBreakpoint` arranca en `'mobile'` y resuelve el real en el mismo render que activa el pin;
   el efecto que termina el timeline "si cambia el breakpoint a media transición" veía ese cambio
   y terminaba la entrada en el acto. **Arreglo:** ese efecto solo actúa ante un cambio real con
   el pin ya activo (guarda el breakpoint previo en un ref desde el primer render con pin).
   **Verificado:** al cargar, 25 de 25 piezas animándose de 260 a 1030 ms a 1280x832, igual a
   1000x1366 y 24 de 24 a 390x700; al volver desde abajo, lo mismo en los tres.
2. **El pellizco de zoom del trackpad cambiaba de parte.** Chrome lo manda como `wheel` con
   `ctrlKey`, y `onWheel` lo trataba como un gesto (y además bloqueaba el zoom con
   `preventDefault`). **Arreglo:** `onWheel` ignora los eventos con `ctrlKey`, sin
   `preventDefault`. **Verificado:** 10 eventos ctrl+wheel de +5 y luego de -5 dejan la parte 1.
3. **Atasco en la parte 3.** Desde la parte 3, una muesca o una flecha hacia abajo desengancha
   hacia Impacto; si se volvía a `scrollY = 0` sin que la intro saliera del todo, se quedaba en
   la parte 3 sin enganchar, subir no hacía nada y las partes 1 y 2 quedaban inalcanzables (el
   enganche sin pin solo aceptaba gestos hacia abajo, y el reinicio a la 1 solo ocurre si sale
   del viewport). **Arreglo, la regla:** al volver a `scrollY <= 2` con la intro en una parte
   distinta de la 1, reengancha en esa parte; el gesto, la tecla o el dedo que trajo hasta arriba
   se da por consumido, para que su inercia no retroceda sola. Desde ahí subir retrocede
   3 → 2 → 1 dentro de la intro y, en la 1, suelta. Solo si la intro salió del viewport se
   reinicia a la parte 1 (y entonces al subir no hay enganche ni reversa, como antes). El caso
   simétrico, desde la parte 1 hacia arriba, ya soltaba sin atascarse porque la página no se mueve.
   **Verificado** con rueda y con flechas: parte 3, una muesca abajo (`scrollY` 100, o 40 con la
   flecha), vuelta a 0 enganchada en la 3, subir tres veces da 2, 1 y suelta, y bajar lleva a la 2.
   Repetidos sin cambios "volver desde abajo" (salida completa: sin enganche al subir, parte 1) y
   "tres gestos cortos" (una parte y botón).

No se tocaron, a propósito, dos notas del verificador que decide Johan: el crossfade de los dos
barcos entre las partes 2 y 3, y el recorte en móvil apaisado.

### Lo que no se pudo verificar

- Un trackpad y un dedo de verdad. La inercia se simula con eventos de rueda por CDP y el touch no
  se probó por CDP. Si el gesto se siente cortado o pegajoso, los números a tocar son
  `FIN_DE_GESTO_MS` y `TOUCH_THRESHOLD` en `use-intro-pin.ts`; si el botón aparece de más o de
  menos, `SCROLL_FUERTE_PX`.
- Pantallas más bajas que el lienzo (por ejemplo un portátil de 1280x700, o tablet apaisada por
  debajo de 1024 de ancho): con el pin la parte se centra y se recorta arriba y abajo, cosa que ya
  pasaba en el primer intento. Ajustar el lienzo al alto cambiaría el tamaño del tipo, que va por
  `vw`; queda anotado como pendiente.

---

## D3. Ronda 2 tras la prueba de Johan: más lento, el texto manda, relevo sin duplicados y gestos encadenados

**Contexto.** Johan probó D2 con su trackpad el 2026-09-23 y la aprobó en general. Pidió dos
ajustes de diseño (de la diseñadora) y reportó tres bugs. Todo sigue en la rama `23-sep-intro`,
sin commitear.

### A. Más lento, con una sola perilla

Las animaciones iban muy rápido. Todas las cifras de `intro.motion.ts` son ahora una base y el
timeline entero se reproduce a `1 / ESCALA_TIEMPO` de velocidad (`tl.timeScale`), con
`ESCALA_TIEMPO = 1.4`. Una sola cifra alarga o acorta todo por igual, sin tocar desfases ni
duraciones una por una. **Medido** (por fotograma con `requestAnimationFrame`, hasta que no queda
ningún estilo animado y solo hay una parte montada): transiciones de 1746 a 1800 ms (1 → 2, 2 → 3,
3 → 2 y 2 → 1, en 390x700 y 1280x832); entrada de la parte 1 al cargar de 1083 a 1189 ms (390,
1000 y 1280).

### B. El texto manda

El storytelling es la prioridad: en la salida las piezas se van primero y el texto viejo es lo
último en apagarse; en la entrada el texto nuevo llega el primero, justo cuando el viejo ya se fue,
y las piezas lo siguen. Igual hacia adelante, hacia atrás y en la entrada de la parte 1. Tiempos
base (a multiplicar por 1,4): piezas viejas fuera entre 0 y 0,35 s (todas dentro de un abanico de
0,1 s, por eso las 20 burbujas ya no alargan la salida), texto viejo de 0,15 a 0,44 s, texto nuevo
desde 0,44 s y piezas nuevas desde 0,55 s. En la entrada de la parte 1, el texto en 0 y las piezas
a los 0,15 s. **Medido** en milisegundos reales: la última pieza vieja desaparece a los 351-483 y
el texto viejo llega a 0 a los 563-617; el texto nuevo empieza a los 629-634 y la primera pieza
nueva a los 783-862. En la entrada de la parte 1, el texto a los 7 y la primera pieza a los
100-206. El sol, el barco y las olas que viajan entre 2 y 3 no cuentan como "piezas que se van":
se transforman (ver el punto 3).

### Bug 1. "A veces el scroll no me sirve con scroll muy fuerte; tras unos segundos vuelve"

**Causa:** un gesto solo terminaba tras `FIN_DE_GESTO_MS` (180 ms) de silencio. Con una inercia
larga, o si Johan volvía a hacer scroll antes de que acabara, nunca había silencio: todo seguía
siendo el mismo gesto, ya consumido, y se tragaba. **Reproducido:** 3 s de inercia fuerte
(100 eventos desde 200 decayendo x0,97) y, sin pausa, otro gesto: se quedaba en la parte 2.
**Arreglo:** un gesto nuevo empieza también (a) siempre que cambia el sentido, y (b) con un
impulso nuevo: tras bajar del pico del gesto a menos del 40% (`IMPULSO_DECAIDO`), `|deltaY|`
vuelve a crecer 3 veces sobre el valle (`IMPULSO_FACTOR`) y pasa de 12 px (`IMPULSO_MIN_PX`). El
pico y el valle se miden desde el pico, no desde el primer evento, porque un gesto de trackpad
arranca con eventos pequeños que crecen, y eso no debe contar como impulso. Así el bloqueo nunca
dura más que la transición en curso. **Verificado:** el mismo caso ahora llega a la parte 3; la
inercia normal (`120:0.9`) sigue avanzando una sola parte; en los extremos, una inercia fuerte
hacia arriba en la parte 1 no hace nada y un gesto hacia abajo inmediato (sin pausa) entra a la 2;
una inercia fuerte hacia abajo en la parte 3 suelta y sigue a Impacto.

### Bug 2. "Vuelvo desde la siguiente sección y al bajar no se anima; con el puntero arriba sí"

**Causa:** la inercia de la subida seguía viva al llegar a `scrollY = 0`, y el gesto hacia abajo
que venía justo después se tomaba como parte del mismo gesto, que había empezado lejos de arriba y
no podía enganchar. **Reproducido** con el puntero al centro y arriba (sobre el selector de
idioma): la página bajaba normal (`scrollY` 1129). **Arreglo:** el cambio de sentido inicia
siempre un gesto nuevo (el mismo arreglo del bug 1). **Verificado** en las dos posiciones del
puntero: engancha y anima 1 → 2. En la prueba no se vio que el elemento bajo el puntero importe:
los listeners están en `window` y el selector de idioma no captura la rueda. Si Johan lo sigue
notando con el puntero en un sitio concreto, es una pista nueva.

### Bug 3. "En la transición de 2 a 3 el barco se duplica un momento"

**Regla:** nunca puede haber dos barcos, dos soles ni olas de dos partes visibles a la vez.
**Causa:** el viaje de D2 era un crossfade: la pieza nueva aparecía (opacidad 0 a 1) mientras la
vieja se apagaba, y durante ese medio segundo se veían las dos.
**Arreglo, un relevo:** la pieza vieja viaja hacia la caja de la nueva y la nueva, invisible, hace
el mismo recorrido desde la caja de la vieja. Como las dos siguen la misma interpolación de caja
con la misma curva, ocupan el mismo sitio en cada instante. A mitad del viaje, cuando van más
rápido y la diferencia de dibujo menos se nota, se cambian en el mismo fotograma (dos `tl.set` en
el mismo instante del timeline) y la nueva termina el viaje. Se eligió frente a "el viejo sale del
todo y luego entra el nuevo" porque conserva la continuidad que Johan había pedido en D2 y, en las
capturas, el cambio de dibujo a media velocidad no se lee como un salto.
**Hallazgo:** el primer intento del relevo usaba un `fromTo` de opacidad con duración cero y
`immediateRender`. GSAP lo trata como un `set` y pinta su estado final en el acto: el barco nuevo
quedaba visible desde el principio (seguían viéndose dos) y, al deshacer el contexto, barco, sol y
ola de la parte 3 terminaban en opacidad 0. Ahora la pieza nueva se oculta con un `gsap.set`
inmediato dentro del contexto (se pinta oculta antes del primer fotograma y el contexto la
deshace) y aparece con un `tl.set` en el relevo.
**Verificado** por fotograma (`requestAnimationFrame`, todas las pasadas de arriba): como mucho una
parte con barco, sol u olas visibles (opacidad > 0,05 y dentro de la pantalla) en 2 → 3 y 3 → 2, a
390x700 y 1280x832. Al terminar, la parte 3 queda con su barco, su sol y sus olas visibles y sin
estilos animados. Capturas cada 50 ms en los mismos cuatro casos: un solo barco en cada una.

### Sin cambios

- El reposo de las 3 partes sigue idéntico: se repitió la comparación píxel a píxel de las 9
  capturas y dio las mismas cifras que en D2.
- No se tocó el recorte en pantallas bajas ni en móvil apaisado (lo decide Johan).
- Siguen bien: volver desde Impacto sin enganche al subir, reenganche en la parte 3 al volver sin
  salir del todo (esperando 2,1 s entre gestos, porque ahora cada transición dura 1,75 s), saltar,
  tres gestos cortos, pellizco de zoom, `prefers-reduced-motion` y `/#impacto`.

---

## D4. Ronda 3: dos variantes del relevo del barco, la persona sale del doblez, la tierra solo con fundido

**Contexto.** Johan probó la ronda 2 (D3). El barco ya no se duplica, pero el relevo en un solo
fotograma se ve como un salto fuerte, porque los dos dibujos son muy distintos: el de la parte 2
va inclinado, es más chico y está en perspectiva; el de la parte 3 va recto, es más grande, tiene
la vela alta y lleva a la persona. Pidió además dos ajustes de pulido. La escala de tiempo sigue
en 1,4.

### 1. Barco 2 ↔ 3: dos variantes para comparar (TEMPORAL)

Se eligen con `?barco=a` (por defecto) o `?barco=b`. Es temporal: en `intro.motion.ts` e
`intro-section.tsx` todo está marcado con `TEMPORAL: comparación de barco` para retirarlo cuando
Johan y la diseñadora elijan. El sol y las olas siguen con el relevo de un fotograma de D3.

- **a, morph aparente.** Durante el viaje, el barco de la parte 2 gira 7° (`ENDEREZAR_BARCO_2`: la
  línea de su casco baja unos 7° en su viewBox, de (86, 140) a (222, 122)) hasta quedar recto en el
  relevo. Las cajas ya coinciden porque los dos barcos siguen el mismo recorrido (D3). En el relevo,
  un fundido cruzado corto (`FUNDIDO_BARCO`, 0,16 s base). En 3 → 2 es al revés: el barco de la
  parte 2 sale recto del relevo y se inclina hasta su dibujo. **Medido** por fotograma en 2 → 3 y
  3 → 2, a 390x700 y 1280x832: dos barcos visibles durante 200 a 217 ms (13 o 14 fotogramas). En
  el fotograma central del relevo, distancia entre centros 0 % y diferencia de ancho 0,1 % del
  ancho del barco. La línea de flotación, medida por el borde inferior de la caja, difiere un
  5,9 %, pero es por la caja girada 7° del barco viejo, no por el casco.
- **b, salto con squash.** Se anima la caja interior del barco, para no pisar el viaje que mueve
  la exterior. El barco viejo se hunde un 12 % de su alto y se aplasta a `scaleY` 0,55 desde su
  línea de flotación (0,14 s base, `power2.in`). En el aplastamiento máximo cambia por el nuevo en
  un fotograma, y el nuevo se estira hacia arriba con `back.out(2.5)` (0,4 s base), como si
  saliera del agua. **Medido:** 0 fotogramas con dos barcos en los 4 casos. Entre el último
  fotograma del viejo y el primero del nuevo, centros a 2,8 % (1280) y 5,9 % (390) y anchos a
  1,6 %. Esa distancia es el propio viaje entre dos fotogramas a la velocidad máxima, no un
  desalineado.
- **Capturas cada 50 ms** de las dos variantes, en 2 → 3 y 3 → 2 a 1280x832 y 390x700:
  `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-23-sep-intro/a603c801-2327-49d1-b139-e85c7fceab84/scratchpad/barco-a/` y `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-23-sep-intro/a603c801-2327-49d1-b139-e85c7fceab84/scratchpad/barco-b/` (las etiquetas en ms van por detrás del tiempo real, porque
  cada captura tarda).
- **Opinión del constructor:** se ve mejor la **b**. En la a, durante el fundido se leen dos
  siluetas distintas y semitransparentes superpuestas (vela, perspectiva), como un fantasma. En la
  b nunca hay dos barcos y el aplastamiento esconde el cambio de dibujo dentro del gesto.

**Elección (ronda 4, 2026-09-23): se queda la b.** Johan la eligió porque "tiene el principio de
animación más antiguo que existe": squash and stretch. La variante a, el parámetro `?barco` y los
comentarios `TEMPORAL: comparación de barco` se retiraron; no queda código de la a. Las capturas
de las dos siguen en el scratchpad solo como registro.

### 2. La persona sale del doblez del barco

Antes entraba escalando desde 0 y se veía rara. Ahora (`asomar` en `intro.motion.ts`) sube desde
abajo sin escalar, recortada con `clip-path` por una línea fija a la altura de su borde inferior
en reposo, que es donde se asoma por el borde del barco. El desplazamiento (su alto) y el borde
inferior del recorte se animan con la misma curva: el recorte baja lo mismo que ella sube y la
línea no se mueve en pantalla. Termina con un `back.out(1.4)` leve; cuando se pasa de largo, el
recorte queda en negativo y no corta nada. Al salir hace lo mismo al revés: se esconde hacia abajo
dentro del barco. Entra cuando el barco ya se asentó (0,95 s base, al terminar el viaje).
**Medido:** escala 1 en todos los fotogramas; sube de 68 px (390) u 80 px (1280) a 0 y se pasa
de largo 5 o 6 px hacia arriba antes de asentarse. La caja final no cambia: el reposo sigue
idéntico. Con esto, 2 → 3 dura unos 1,9 s (antes 1,75), porque la persona entra al final.

### 3. La tierra (`horizonte`) solo con fundido

La apertura desde el centro con `clip-path` era demasiado fuerte para un elemento de fondo. Ahora
es solo opacidad, sin desplazamiento, recorte ni escala, con `power1.inOut`: la entrada dura
0,7 s base (0,98 s reales) y la salida 0,42 s base (0,59 s reales). La salida es algo más corta
de lo pedido (0,6 a 0,8 s) para no romper la regla de D3: el texto viejo tiene que ser lo último
en apagarse, y termina a los 0,44 s base. **Medido** en 1 → 2 a 1280: `transform` y `clip-path`
siempre en `none` y la opacidad sube suave (0 a los 800 ms, 0,21 a los 1100 ms).

**Otros elementos de fondo que se mueven bastante (sin cambiar, a decidir por Johan):**

- La **nube** deriva un 60 % de su ancho desde un lado (unos 55 px en móvil y 87 en desktop).
  Es lo más llamativo que queda en el fondo.
- El **sol** sube la mitad de su alto con 15° de giro. Es protagonista, pero también es fondo.
- El **reflejo del sol en el agua** y las olas sueltas (`agua`) entran de lado un 30 % de su
  ancho: unos 24 px el reflejo, poco.

### Sin cambios

Reposo idéntico (mismas cifras que en D2 y D3 en las 9 capturas), `type-check` y `lint`
limpios, y siguen bien volver desde Impacto, el reenganche en la parte 3 y bajar de inmediato tras
subir con inercia.

---

## D5. Ronda 4: barco b, la persona como nota aparte y lineal, movimiento en reposo

**Contexto.** Johan eligió la variante b del barco (ver la nota al final del punto 1 de D4) y pidió
dos ajustes: la persona de la parte 3 y un movimiento muy sutil en reposo. La escala de tiempo
sigue en 1,4.

### La persona: lineal, aparte y sin cortes

- **Sin rebote.** Sube desde dentro del barco con `sine.out` (se eligió frente a `none`: llega
  igual de recta pero sin frenazo al final) y sin pasarse de largo. Mismo recorte que en D4: una
  línea fija en su borde inferior en reposo, donde se asoma por el doblez. Dura 0,6 s base (0,84 s
  reales). **Medido:** su `y` mínima es 0 (nunca pasa de la posición final) y su escala es 1 en
  todos los fotogramas.
- **Como nota aparte, tarde.** Ya no está en el timeline de la transición: `crearAsomo` la
  reproduce `PERSONA_RETRASO_S` (0,5 s) después de que la transición terminó, con texto y piezas
  asentados. No alarga el bloqueo de gestos, que se libera al acabar la transición principal.
  **Medido** en 2 → 3 a 390 y 1280: la transición termina a los 1667 ms, el asomo empieza a los
  2182 ms (515 ms después) y llega a los 2949 ms.
- **Al retroceder (3 → 2)** baja de vuelta dentro del barco con la misma línea de recorte, lineal
  (`sine.in`, 0,25 s base) y desde donde esté. El barco no empieza a viajar hasta que ella
  terminó (`VIAJE_TRAS_PERSONA`): el aplastamiento llega después. **Medido:** escondida a los
  333 ms; el barco empieza a moverse a los 417 ms.
- **Un gesto durante el asomo, o antes de que empiece,** mata el asomo sin revertirlo y la salida
  la esconde desde donde esté. **Medido:** con un gesto hacia arriba a los 1800 ms (aún escondida),
  a los 2300 ms y a los 2600 ms (a medio asomar), la intro vuelve a la parte 2 sin esperar. La
  persona baja desde donde estaba, con un desplazamiento máximo de 2,6 a 4,9 px por fotograma: es
  su propia velocidad, no un salto (un salto serían 68 a 80 px).
- **Cómo se evita un fotograma suelto:** el contexto de GSAP de la transición se deshace al
  terminar y dejaría a la persona visible. El asomo va en un efecto de layout que la esconde en el
  mismo commit, antes del pintado, y `limpiar` ya no toca a la persona.
- Capturas cada 50 ms de la entrada (2 → 3) y la salida (3 → 2) a 1280x832 y 390x700 en
  `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-23-sep-intro/a603c801-2327-49d1-b139-e85c7fceab84/scratchpad/persona/`.

### Ronda 5: el recorte de la persona sigue el borde inclinado del barco

**Lo que vio Johan:** la persona se asoma por el trazo que va del pliegue central a la punta
derecha, y ese trazo sube hacia la derecha. El recorte era una recta horizontal, así que la
cortaba por una línea que no coincidía con el trazo y no parecía salir del doblez.

- **La recta, medida en los paths** de `paso3-barco.svg` (viewBox 307,84 x 181): es el lado
  superior del polígono claro `M204.6 106.8 153.75 128 l94.06 42.43 58.44-94.46z`, de
  (153,75, 128) a (204,6, 106,8) y a la punta (306,25, 75,97). Tiene un quiebre leve: pendiente
  -0,42 en el primer tramo y -0,30 en el segundo. Se pasa a px con la caja y el `inset` de la
  capa del barco, leídos del estilo que escribe `Capa`. Así sirve en los tres breakpoints (el
  grupo del barco escala igual al barco y a la persona) y no le afectan ni el redondeo ni el idle.
  En pantalla, con `?introPaso=3`: (357,2, 520,1), (417,5, 495) y (537,9, 458,5) a 1280, y
  (195,7, 320,7), (246,6, 299,5) y (348,2, 268,6) a 390.
- **Comprobada superponiéndola en rojo** sobre capturas a 1280 y a 390 (a 2x). Los puntos son el
  filo del relleno claro, que coincide con el filo superior del trazo negro. Con `subir: 1` (por
  encima del filo), en reposo el polígono le recortaba a la persona unos 230 px (a 2x) de su
  contorno inferior, justo donde pisa el trazo. Con `subir: -0.8` la línea queda dentro del
  trazo, por encima de su centro, y en reposo el polígono no le recorta nada: 0 px distintos a
  1280 y a 390 entre la persona sin recorte y con él.
- **El recorte es un `clip-path: polygon()`** cuyo borde inferior es esa recta, en px locales de
  la persona, y se compensa con su desplazamiento. Vive en la persona, que está dentro del grupo
  del barco: se mece con el barco y lo acompaña en la salida.
- **Hallazgo: GSAP interpola mal la cadena de un `polygon()`** de 7 puntos. A mitad del asomo,
  la x del punto de la derecha valía 73,9 en vez de 122,6, y el borde se torcía. Ahora se anima un
  solo número (el recorrido) y en cada fotograma se escriben a la vez el `transform` y el
  polígono (`colocarPersona`). **Medido** por fotograma, sumando el punto del polígono y el
  desplazamiento de la persona: el borde se mueve como mucho 0,01 px respecto al barco en la
  entrada (153 fotogramas), la salida (106) y con un gesto a mitad del asomo (259), a 390 y a 1280.
- **Dirección: vertical.** Se probó también en diagonal, perpendicular al borde (x 0,3 por cada 1
  de y). Las dos cortan igual de limpio, pero en diagonal la persona se desliza a lo largo del
  borde y parece resbalar; en vertical se lee como que sale del doblez. Queda en
  `ASOMO_DIRECCION` por si se quiere volver a probar.
- Se mantiene todo lo demás: `sine.out` sin rebote, +0,5 s tras la transición y fuera del
  bloqueo de gestos. En la salida baja con el mismo recorte inclinado. El recorrido que la esconde
  sale del punto más bajo del borde dentro de su ancho (unos 89 px a 390 y 105 a 1280).
- **Capturas** cada 50 ms de la entrada y la salida a 1280x832 y 390x700, más las mismas con zoom
  sobre el barco (`--recorte` acepta ahora un selector): `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-23-sep-intro/a603c801-2327-49d1-b139-e85c7fceab84/scratchpad/persona-borde/`. Un fotograma a
  mitad del asomo con zoom: `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-23-sep-intro/a603c801-2327-49d1-b139-e85c7fceab84/scratchpad/persona-borde/zoom-entra-1280-2400.png`.
- `captura.js`: `--recorte` ya no pide `captureBeyondViewport` si el recorte cabe en pantalla.
  Esa opción redimensiona la página un instante y descolocaba el pin a mitad de una transición.

### Movimiento en reposo (`crearReposo` en `intro.motion.ts`)

Mientras se está en una parte, algo flota muy sutilmente:

- **Parte 1:** cada burbuja sube y baja 2,5 px de lienzo, con su fase y su duración (3 a 5 s).
- **Partes 2 y 3:** el barco se mece: 2,5 px de lienzo en `y` (5 s) y ±1,2° de giro alrededor
  de su centro (4,2 s). Las olas derivan 3 px en `x` (3,5 a 5,5 s, desfasadas).
- **Parte 2:** además, el reflejo del sol respira en opacidad entre 1 y 0,85 (4,5 s).
- **Parte 3:** además, la nube deriva 2,5 px en 8 s.
- Todo con `sine.inOut` y yoyo infinito. Solo `transform` y `opacity`. Las cifras están en
  `REPOSO` (`intro.motion.ts`).

Decisiones de construcción:

- **No se pisa con las transiciones:** el idle va sobre la caja interior de cada pieza (las
  transiciones animan la exterior) o, en el barco, sobre un envoltorio nuevo por grupo
  (`data-grupo`, del tamaño del lienzo, solo en modo pin; en reposo no cambia nada). La persona
  está dentro del grupo del barco: se mece con la misma transformación y nunca se desincroniza.
  Su centro se mueve 2,7 px (390) o 3,2 px (1280) respecto al del barco, que es el brazo de
  palanca del giro, no un desfase.
- **Arranque y parada:** arranca al quedar quieta la intro (fin de la entrada de la parte 1 o de
  una transición), saliendo de 0 con medio ciclo suave, sin salto. Al empezar una transición se
  mata y vuelve a su sitio en `VUELTA_S` (0,35 s). Se pausa fuera de pantalla
  (IntersectionObserver) y con la pestaña oculta (`visibilitychange`). Con
  `prefers-reduced-motion` no hay idle (sigue la versión estática).
- **Escala con el lienzo:** las amplitudes están en px del lienzo mobile y se multiplican por el
  alto real de la parte dividido entre 700.
- **`?quieto=1`** (flag `--quieto` de `captura.js`) congela el idle para comparar capturas.
- Se añadió el rol `reflejo` (el PNG del reflejo del sol, antes `agua`) para poder darle su
  respiración de opacidad. Entra y sale igual que `agua`.

**Medido** durante 6 s (`requestAnimationFrame`, px de pantalla):

|                                      | 390x700      | 1280x832     |
| ------------------------------------ | ------------ | ------------ |
| Burbujas, `y`                        | -2,5 a 2,5   | -3 a 3       |
| Barco, recorrido en `y`              | 5 px         | 5,9 px       |
| Barco, giro                          | -1,2° a 1,2° | -1,2° a 1,2° |
| Olas, `x`                            | -3 a 3       | -3,6 a 3,6   |
| Nube, `x` (parte 3, en 6 de sus 8 s) | 0 a 0,95     | 0 a 1,14     |
| Reflejo, opacidad                    | 0,85 a 0,96  | 0,85 a 0,96  |

**Se para en las transiciones y no deja piezas desplazadas:** tras 3,5 s de idle, un gesto: la
parte que sale vuelve a neutro en 300 a 345 ms (1 → 2, 2 → 3, 3 → 2, 2 → 1). La que entra no se
mueve durante la transición ni al terminar (desplazamiento 0) y empieza a flotar después.

### Hallazgo menor

`limpiar` llamaba a `gsap.set` con una lista vacía cuando la parte no tiene barco, y GSAP
avisaba en consola ("target not found"). Ahora mira antes de llamar.

### Sin cambios

El reposo con `--quieto` sigue idéntico en las 9 capturas (mismas cifras que en D2). Siguen bien
la inercia (un gesto, una parte), volver desde Impacto, el reenganche en la parte 3, el scroll
encadenado, bajar de inmediato tras subir y saltar. `type-check` y `lint` limpios.

---

## D6. Bienvenida como un paso más de la intro: relevo del sol, entrada por piezas y reposo

**Contexto.** Johan pidió el 2026-09-23 que Bienvenida sea "un paso más" de la intro, con el mismo
patrón. Rama `23-sep-bienvenida` desde `main` (`5b5b299`), sin commitear. Diseño mobile en Figma
`ng8HnnYyaDJ2nTWauh7Otb`, nodo `1278:2`.

### Mecánica (`use-intro-pin.ts`, `intro-section.tsx`)

- Desde la parte 3, un gesto hacia abajo (rueda, flecha, espacio, dedo) ya no suelta la intro:
  `avanzar` abre una **llegada** (`llegada`, un id, como `transicion`). Un gesto sigue siendo un
  paso: mientras corre, los gestos se tragan igual que en la intro y cuentan para el botón de
  saltar.
- En el efecto de layout de la llegada, antes del primer pintado: se ocultan las piezas de
  Bienvenida, la página se desplaza sola a `#bienvenida` (`scrollTo` instantáneo) y la capa fija
  de la intro deja de pintar su fondo beige. La parte 3 sigue encima, fija y en su sitio; debajo
  ya está Bienvenida, oculta, sobre el mismo beige de la página. Por eso el salto de scroll no se
  ve: `#bienvenida` queda en `top = 0` en todos los fotogramas.
- La red de seguridad del scroll (soltar la capa si la página se mueve) se ignora durante la
  llegada. Al terminar: la capa se suelta, la intro vuelve a la parte 1 sin animar (como al salir
  por arriba) y el scroll es nativo. Lo que queda del gesto que la disparó (la inercia o el mismo
  dedo) se sigue tragando hasta que empieza otro gesto, para que no siga bajando más allá.
- Subir desde Bienvenida no cambia: se ve la parte 1 en flujo y reproduce su entrada; bajar
  desde arriba engancha 1 -> 2. No hay llegada al revés.
- "Saltar animación" termina la llegada con `progress(1)`: Bienvenida queda en reposo.
- `<html data-intro-llegando>` mientras dura: el botón flotante de Súmate espera a que termine.
  Sin eso aparecía al bajar la página y tapaba el botón de saltar (mismo rincón).

### Coreografía (`components/intro/bienvenida.motion.ts`, cifras base x `ESCALA_TIEMPO`)

1. La parte 3 sale con `salir()` (el texto último), menos el sol.
2. **Relevo del sol**, como el barco (D4): el sol rojo viaja al disco del sol rosado (0,1 a 0,8 s
   base, `power3.inOut`), se hunde y se aplasta al llegar, cambia en un fotograma por el disco
   rosado y este se estira con `back.out(2.5)`. La parte recorta lo que se sale de su lienzo y en
   móvil el sol rosado cae fuera, así que viaja una **copia** del sol rojo colgada de la capa fija
   (el original se oculta en el mismo fotograma; la copia se quita al revertir el contexto).
3. Los 13 **rayos** salen del disco en cascada, en el sentido del reloj desde arriba (0,035 s
   entre uno y otro), cada uno desde más cerca del centro, con `back.out`.
4. El **texto** entra primero, en 0,44 (cuando el viejo ya se fue): título, subtítulo manuscrito,
   su subrayado se dibuja con `clip-path` de izquierda a derecha, y el párrafo.
5. Las **nubes** derivan desde 0,9: solo opacidad y 14 px.
6. La **ilustración** desde 1,0: palmera (crece desde abajo), olas (de lado, alternando), mujer
   (sube 8 %), trazos (se dibujan) y flor (gira y aparece). El bloque de EMI solo hace un fundido:
   se ve de entrada solo en pantallas muy altas.

Para animar por piezas: el sol rosado es ahora `sol-rosado.tsx` (los paths de `pink-sun.svg` en
`sol-rosado.data.ts`, el disco como `pink-sun-disco.png`, el raster que venía dentro del SVG) y
la ilustración es `ilustracion-playa.tsx` con las capas de Figma (nodo `1278:99`) en
`public/images/welcome/playa-*`. `beach-woman.png` y `pink-sun.svg` quedan sin uso (no se
borran, regla de assets). Color nuevo `pink-sol` en Tailwind (`#F57DB7`, el del SVG).

**Medido** (por fotograma, `?introPaso=3` y una muesca, flecha, inercia normal y fuerte, a
390x844 y 1280x832; ms reales desde el desplazamiento): como mucho **1 sol visible** en cada
fotograma y ninguno sin sol; texto viejo visible hasta 581, texto nuevo desde 614, relevo a
1115, rayos desde 1232, nubes 1298, palmera 1398, olas 1481, mujer 1614, trazos 1698, flor 1815;
la capa se suelta a los 2665. `scrollY` pasa de 0 al destino en un solo fotograma con la capa
fija y no vuelve a cambiar. Capturas cada 100 ms: `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-23-sep-intro/a603c801-2327-49d1-b139-e85c7fceab84/scratchpad/bienvenida/serie/` (hoja de contacto
`/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-23-sep-intro/a603c801-2327-49d1-b139-e85c7fceab84/scratchpad/bienvenida/hoja-390.png`, relevo a 1280 en `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-23-sep-intro/a603c801-2327-49d1-b139-e85c7fceab84/scratchpad/bienvenida/relevo-1280.png`).

### Reposo: solo dos movimientos

- **Rayos del sol:** giran alrededor del centro del disco, una vuelta cada 80 s (medido 4,52°/s),
  arrancando desde 0 en 2 s. El **disco no gira**: es un raster con textura de lápiz y contorno
  irregular; girando se ve bailar su silueta y el remuestreo lo hace titilar. Los rayos solos se
  leen como un sol que gira.
- **Pelo de la mujer:** la mujer es un raster sin el pelo separado. Se hizo con un filtro SVG
  sobre la mujer: ruido de baja frecuencia (`feTurbulence`) que se desliza (`feOffset`), con
  menos fuerza en x que en y, multiplicado por una **máscara** (`feImage`, degradados) que vale 1
  en la melena y cae a 0 antes de la cabeza, la espalda y la rodilla, y usado en
  `feDisplacementMap`. Como es una sola imagen y el desplazamiento se apaga suave, no hay costura
  ni doble contorno. **Hallazgo:** fuera de la `feImage` el mapa es transparente y un mapa
  transparente sí desplaza (copiaba el borde del pelo unos px más arriba): se pone un
  `feFlood` negro opaco debajo. Además `color-interpolation-filters: sRGB` y el ruido opaco, para
  que el gris 0,5 sea desplazamiento 0.
  **Medido** en 6 s con capturas a 2x: los cambios quedan solo en el borde de la melena (mapa de
  diferencias en `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-23-sep-intro/a603c801-2327-49d1-b139-e85c7fceab84/scratchpad/bienvenida/pelo-union.png` y `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-23-sep-intro/a603c801-2327-49d1-b139-e85c7fceab84/scratchpad/bienvenida/pelo-union-1280.png`); el borde se mueve hasta 1,5 px
  a 390 y 3 px a 1280 (percentil 95). Zoom sin costuras: `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-23-sep-intro/a603c801-2327-49d1-b139-e85c7fceab84/scratchpad/bienvenida/pelo-zoom-1280.png`.
- Cifras en `REPOSO_BIENVENIDA`. Se pausa fuera de pantalla (con 1 px de margen: con la página
  arriba, Bienvenida toca el borde inferior y contaba como visible) y con la pestaña oculta. Sin
  idle con `?quieto=1`, `prefers-reduced-motion` o `#hash` al cargar (mismo atributo
  `data-intro-anima` que la intro).

### Llegar sin pasar por la intro

Recarga a media página, `#hash`, barra de scroll o "saltar": Bienvenida se ve **en reposo**, sin
entrada. Se eligió frente a una entrada al entrar en viewport porque el contenido puede estar ya a
la vista al cargar (restauración del scroll) y ocultarlo para animarlo sería un parpadeo, y porque
"saltar" ya pide reposo. El idle sí corre.

### Diferencias visuales en reposo

Comparado píxel a píxel con capturas previas (`/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-23-sep-intro/a603c801-2327-49d1-b139-e85c7fceab84/scratchpad/bienvenida/antes/` vs `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-23-sep-intro/a603c801-2327-49d1-b139-e85c7fceab84/scratchpad/bienvenida/despues/`) a 390, 1000, 1280 y
1512: 0,6 a 1,5 % de píxeles distintos, **todos en bordes** (antialias del sol y de la
ilustración). La ilustración se ve **algo más nítida**: antes era un PNG de 390 px estirado hasta
720 en desktop; ahora cada capa viene a más resolución. Posiciones iguales. El anillo del disco
queda por encima de los rayos (no se tocan). Tras la llegada, el reposo es idéntico al estático
(4 y 5 px distintos a 390 y 1280). Las 3 partes de la intro en reposo: 0 px distintos.

### Sin cambios en la intro

Repetido a 390x844 y 1280x832: una inercia normal avanza una parte (1 -> 2 -> 3 y atrás hasta
soltar en la 1), la inercia fuerte y tres gestos cortos avanzan una y muestran el botón, flechas,
Tab y Escape, saltar (lleva a `#bienvenida` con el foco), volver desde abajo sin enganche y bajar
de nuevo a la parte 2. `#bienvenida` y reduced-motion: intro estática, sin idle.

### Ampliación 2026-09-23: el pelo se retira

Johan pidió quitar el movimiento del pelo de la mujer. La mujer es un raster
(`public/images/welcome/playa-mujer.png`) sin el pelo separado, y el filtro deforma píxeles de una
imagen plana. Se rehará cuando la diseñadora exporte el pelo como SVG aparte. Se borró todo el
código (el filtro y la máscara en `ilustracion-playa.tsx`, el bloque del reposo y las cifras
`PELO_*` en `bienvenida.motion.ts`): la mujer vuelve a ser una imagen normal, idéntica en reposo.
El reposo de Bienvenida queda solo con el giro de los rayos, sin cambios. El truco del filtro
queda descrito arriba ("Reposo: solo dos movimientos") como referencia, por si sirve de nuevo.
