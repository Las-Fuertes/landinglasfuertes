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

---

## D7. Bienvenida: pelo en SVG y desktop según Figma 1280:9

**Contexto.** 2026-09-23, rama `23-sep-pulido`. La diseñadora pasó la mujer de la playa a SVG
para poder animar el pelo (retirado en D6 porque la mujer era un raster), y Bienvenida tiene ya
frame desktop en Figma (`1280:9`, 1280 x 832). El frame mobile (`1278:2`) también se rehízo:
las olas son ahora vectores azul claro (grupo "Group 218") en vez de los PNG de antes.

### Qué se descubrió del SVG de la mujer

El nodo "Girl" (`1281:252` desktop, `1283:307` mobile, el mismo dibujo a escala 0,83) tiene
tres capas: "Vector 1287" (cuerpo y cuello, dos paths con una textura de ruido de Figma),
"Group 257" (12 trazos claros del cuerpo) y "Vector 1286" (**cabeza y melena en un solo
contorno**, con su textura, pintado el último). Lo "un poco separado" es eso: el pelo es una capa
aparte, y la cabeza va dentro de ella. **No hay hueco visible**: el cuello acaba recto en y 34,1 a
34,7 del viewBox (161,4 x 146,9) y el pelo lo tapa hasta y 36,5, unas 2 unidades de solape (2 px a
1280). No hizo falta tocar el dibujo.

### Qué se hizo

- `public/images/welcome/playa-mujer.svg`: el export real de Figma. `mujer-playa.data.ts` saca
  de él los paths por capa (con un script, no a mano) y `mujer-playa.tsx` lo pinta inline con los
  mismos filtros de textura, el pelo en dos grupos anidados (`data-pelo` gira, `data-pelo-onda`
  se inclina). Colores por nombre: `fill-blue` y `fill-beige` para los trazos (en Figma eran
  `#FFF5E8`, el fondo del frame). El PNG viejo (`playa-mujer.png`) queda sin uso, no se borra.
  Los ids de los filtros salen de `useId`: hay dos mujeres montadas (mobile y desktop, una con
  `display: none`) y un filtro dentro de un SVG oculto no pinta.
- **Reposo del pelo** (`REPOSO_BIENVENIDA`): giro de **±3°** alrededor de la nuca (el centro del
  borde superior del cuello, `NUCA` = 130,4 35 del viewBox) y, con un retraso de 0,18 de ciclo,
  una inclinación (skewX) de **±2°** desde el mismo punto: la raíz casi quieta y las puntas, a unas
  110 unidades, con unos 5,7 px de recorrido a 1280 (4,7 a 390). Seguimiento: la onda llega tarde a
  la punta. Ciclo **4,2 s**, un seno puro; la amplitud crece de 0 a la suya en 2,5 s, así que el
  primer fotograma es el diseño. Al girar sobre ese punto, los bordes del cuello (a ±9 unidades) se
  mueven menos de 0,5 unidades: el solape de 2 nunca se abre.
- **Desktop con su propia composición**: `ilustracion-playa.tsx` tiene dos lienzos recortados de
  cada frame (mobile: x 0 a 390, y 568 a 811; desktop: 1280 x 278 desde y 496), con las cajas y los
  insets de Figma. Nuevos assets en `public/images/welcome/`: `playa-olas-{desktop,mobile}.svg`
  ("Group 218"), `playa-ola-corta-*` ("Group 219" y "221"), `playa-ola-suelta-*` ("Vector
  1168"), `playa-arena-*` (la línea "Vector 1300"), `gaviota-1..4.svg` ("Vector 1305" a
  "1308"; "1311" y "1312" reutilizan la 1 y la 2), `nube-borde.svg` ("Vector 1309") y
  `nube-derecha-alta.svg` ("Vector 1310"). La palmera, la flor y las dos nubes de siempre son
  los archivos que ya había (misma geometría).
- `decor-desktop.tsx`: nubes y gaviotas de la derecha en una caja de 1280 x 832 centrada (en
  pantallas anchas la composición se queda alrededor del centro). La nube "1309" va pegada al borde
  izquierdo de la pantalla, un tercio fuera y en espejo (en Figma, giro de 180 más volteo vertical).
  Por debajo de 1280 la nube derecha alta se corta un poco por el borde (lo recorta el
  `overflow-x-clip` de la página). Las gaviotas de la izquierda van dentro del lienzo de la
  ilustración, porque caen sobre ella.
- Texto en `lg`: título en una línea (50 px, interlínea 42, tracking -0,04em; los dos `span` pasan
  a `inline`, también cabe en en y fr), subtítulo a 15 px pegado al título (30 px), subrayado a
  10 px, párrafo de 577 de ancho, 16 px, interlínea 1,2 y alineado a la izquierda. Tablet y mobile
  no cambian.
- **Entrada**: las gaviotas son un rol nuevo (`gaviota`), fondo: solo opacidad y 6 px desde
  arriba, desde 1,05 (tras las nubes), 0,08 entre una y otra. Las nubes nuevas son `nube`. Las olas
  entran de lado ±24 px (antes ±12 % de su caja: el grupo de olas mide ahora todo el ancho y un %
  lo movía de más).
- **Reposo de las gaviotas**: ±3 px en vertical, ciclos de 4,1 a 5,9 s y fases repartidas por la
  proporción áurea, en la caja interior (la exterior es de la entrada).

### Medido

- Posiciones a 1280 x 832 contra el frame (px desde el borde superior de la sección, Figma entre
  paréntesis): sol 52 (52), título 257 (257), subtítulo 329 (329), subrayado 360 (360), párrafo 395
  (395), palmera 495 (496), mujer 628 (628,4), la ilustración entera cabe en 832 (acaba en 774).
- Pelo por CDP, 21 muestras en 5 s a 1280: giro de -2,98 a 3,00°, inclinación de -1,98 a 2,00°,
  gaviota de -2,99 a 3,00 px, 21 transform distintos. Con `?quieto=1`: sin transform, 1 valor.
  Con `prefers-reduced-motion`: sin transform.
- Cuello a 8x en 4 instantes (1280 y 390): azul continuo, sin hueco.
- Llegada desde la parte 3 (una muesca a 1280): texto primero, rayos, nubes; a los 4 s queda en el
  diseño, igual que la captura quieta.

Capturas en `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-23-sep/e1bea937-3490-4abc-9d57-20da256c2279/scratchpad/bienvenida/`: `<ancho>-antes.png` y `<ancho>-despues.png` (1280, 1512, 1920, 1024, 768, 390
y 1000), `pelo/mujer-1280-{0..3}.png` y `pelo/cuello-1280-{0..3}.png` (el pelo en instantes
distintos), `llegada-g-1280-{700,1300,1700,4000}.png`.

**Tokens en vez de valores sueltos (2026-09-23):** se añadieron a `tailwind.config.js` dos tamaños de
texto, `text-display` (50 px, interlineado 42 px, tracking -0,04 em, sin peso: el título de
desktop) y `text-p-md` (15 px, interlineado 1,375: la línea manuscrita). `lg:text-[16px]` pasó a
`lg:text-base`, `lg:mt-[0.625rem]` a `lg:mt-s` y `max-w-[1280px]` a `max-w-screen-xl`. Quedan
arbitrarios los márgenes únicos de Figma (43, 52, 60, 30 y 29 px, ancho 577 px del párrafo) y las
medidas de ilustración (sol, nubes, decorado). Capturas `?quieto=1` antes y después idénticas.

**Decidido por Johan tras la verificación (2026-09-23):**

- El botón flotante de Súmate tapa en móvil la mano y la cadera de la mujer cuando Bienvenida queda
  arriba. Se deja así por ahora; se decide con diseño más adelante.
- Las nubes que sangran por el borde se quedan como están: a 1024 la derecha se corta un 22 % y a
  1920 la izquierda queda pegada al borde. Se leen como sangrado intencional.

## D8. Reposo de la intro más perceptible

**Lo que pidió Johan (2026-09-23):** "en la sección de la intro en todos los pasos pedí una
animación muy sutil mientras el usuario está en cada step, el problema es que ya es demasiado
sutil y no se percibe que en verdad está siendo animado, así que sigamos con este patrón 'sutil'
pero sí necesito que se vea que las cosas se están moviendo".

**Por qué:** con las cifras de D5 (2 a 3 px de lienzo, ciclos de 4 a 8 s) el movimiento quedaba
por debajo de lo que se nota en unos segundos de mirar. Se suben amplitudes a unas 2 a 3 veces,
se acortan los ciclos lentos y se suman piezas vectoriales que no tenían reposo, para que en
cualquier paso se vean moverse al menos dos cosas en 3 s. Mismo idiom de D5: oscilar sobre la
caja interior, fases distintas por azar fijo, `sine.inOut`, solo `transform` y `opacity`.

### Dos niveles para decidir mirando (TEMPORAL, regla 12)

`?reposo=medio` (por defecto, también sin parámetro) y `?reposo=alto`. Cifras en
`NIVELES_REPOSO` (`components/intro/intro.motion.ts`); cuando Johan elija, se borra el otro nivel
y el parámetro. Amplitudes en px del lienzo mobile (390x700), escaladas por el alto real:

|                          | D5 (antes)    | medio               | alto                 |
| ------------------------ | ------------- | ------------------- | -------------------- |
| Burbujas, `y`            | 2,5 (3-5 s)   | 5 (2,8-4,2 s)       | 7 (2,5-3,8 s)        |
| Barco, `y`               | 2,5 (5 s)     | 6 (3,6 s)           | 8,5 (3,2 s)          |
| Barco, giro              | 1,2° (4,2 s)  | 2,8° (4,4 s)        | 4° (4 s)             |
| Olas y agua, `x`         | 3 (3,5-5,5 s) | 7 (2,8-4,2 s)       | 10 (2,5-3,8 s)       |
| Nube, `x`                | 2,5 (8 s)     | 6 (5,5 s)           | 9 (5 s)              |
| Reflejo, opacidad mínima | 0,85 (4,5 s)  | 0,65 (3,4 s)        | 0,55 (3 s)           |
| Sol, escala (nuevo)      | no            | 1 a 1,04 (4 s)      | 1 a 1,065 (3,5 s)    |
| Garabatos, giro (nuevo)  | no            | punta 4 px, máx. 7° | punta 6 px, máx. 10° |

`VUELTA_S` sigue en 0,35 s en los dos niveles.

### Piezas añadidas al reposo (todas vector, regla 9)

- **Sol** (rol `sol`, pasos 2 y 3, y el punto rojo del paso 1 en tablet y desktop): respira en
  escala sobre su centro. Se eligió escala y no flotar porque el sol toca otras piezas (la espiral
  del paso 2 en desktop, el final del garabato del paso 1): flotando se despegaría de ellas.
- **Garabatos pequeños** (espirales y trazos del paso 1, la espiral del paso 2 en tablet y
  desktop, el trazo amarillo del paso 3): se balancean sobre su centro. El giro se calcula para
  que la punta más lejana se mueva `GARABATO_PX`, con tope `GARABATO_GIRO_MAX` (las espirales
  chicas llegan al tope; el trazo largo del paso 3 gira unos 3° a 4°). **El garabato grande de
  fondo del paso 1 no se mueve**: el lienzo lo corta y es fondo (regla 6).

### Bordes: la deriva nunca descubre el extremo de una pieza cortada

Con 7 a 10 px de deriva, una pieza que el lienzo corta por un lado dejaría ver su extremo (las olas
del paso 3 en mobile salen solo 3,9 px por la izquierda). `derivaSegura` mide la imagen contra el
lienzo y, si un lado tiene menos holgura que la amplitud, desplaza el rango hacia el otro lado
conservando el recorrido total: las olas del paso 3 en mobile derivan de -11,1 a 2,9 px (medio) y
de -17,1 a 2,9 px (alto). El neutro (0) sigue dentro del rango.

### Otros cambios

- `detener` ya no escribe `opacity` en todas las cajas tocadas, solo en las que la animaban (el
  reflejo): antes ponía y borraba `opacity` en cajas que no la usaban.
- `oscilar` acepta `scale` y un centro distinto de 0.

### Medido por CDP (transform calculado, cada 100 ms durante 6 s, px de pantalla, pico a pico)

|                    | 390x844 medio | 390x844 alto | 1280x832 medio | 1280x832 alto |
| ------------------ | ------------- | ------------ | -------------- | ------------- |
| Barco (grupo), `y` | 12            | 16,9         | 14,3           | 20,1          |
| Barco, giro        | 4,6°          | 8°           | 4,6°           | 8°            |
| Ola, `x`           | 14            | 20           | 16,6           | 23,8          |
| Nube, `x` (paso 3) | 10,7          | 18           | 12,7           | 21,4          |
| Burbujas, `y`      | 10            | 14           | 11,9           | 16,6          |
| Garabatos, giro    | 14° (paso 1)  | 20°          | 14°            | 20°           |
| Reflejo, opacidad  | 1 a 0,65      | 1 a 0,55     | 1 a 0,65       | 1 a 0,55      |

(El giro del barco no completa su ciclo en 6 s: con capturas en el extremo se mide ±2,7° en medio
y ±3,8° en alto.) Piezas en movimiento por paso: paso 1, las 13 burbujas y 8 garabatos; paso 2,
barco, 7 olas, 6 aguas, reflejo, sol (y espiral en desktop); paso 3, barco con la persona, olas,
nube, sol y garabato.

**Verificado:**

- **Recorte de la persona:** capturas recortadas del barco en los dos extremos del giro, a 390 y
  1280, en los dos niveles: el recorte inclinado va con el grupo y no asoma borde.
- **Reposo sagrado:** capturas `--quieto` de los pasos 1, 2 y 3 a 1280x832 idénticas byte a byte
  a las tomadas antes del cambio.
- **Transiciones:** tras 5 s de reposo, un gesto (1 → 2, 2 → 3, 3 → 2) a 390 y 1280: todo vuelve a
  neutro en 369 a 410 ms, con un paso máximo por fotograma de 1,25 px (sin salto).
- `type-check` y `lint` limpios.
- Capturas y scripts (`sonda.js`, `extremos.js`, `transicion.js`) en
  `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-23-sep/e1bea937-3490-4abc-9d57-20da256c2279/scratchpad/reposo/`.
- **Margen de visibilidad (2026-09-23):** el observador del reposo usa `rootMargin` de 1 px, como
  Bienvenida: con Bienvenida arriba del todo, el borde compartido ya no cuenta como en pantalla y
  el reposo de la intro se pausa (medido por CDP a 390 y 1280: antes cambiaba en 3 s, ahora no).

## D9. Bienvenida cabe entera en la pantalla del celular

**Lo que pidió Johan (2026-09-24, rama `24-sep-pulido`):** en su iPhone con Safari (428 x 746
visibles) el hero de Bienvenida no cabía: la palmera y las olas se cortaban abajo y el aire quedaba
desbalanceado. La composición de Figma (`1278:2`, 390 x 864) tiene que encajar SIEMPRE en la
pantalla del celular; se puede sacrificar el tamaño de las decoraciones, nunca deformarlas. Desktop
no cambia. Sigue decidido que el botón flotante de Súmate puede tapar la mano de la mujer.

**Por qué cambia D1 de `docs/emi/DECISIONES.md`.** Allí el hero crecía (`min-h-dvh`) cuando el
contenido no cabía, y en celular eso era casi siempre: 860 px de contenido natural contra 664 a 746
visibles. Ahora en mobile y tablet se comprime el aire y las decoraciones, no el texto.

**Qué se hizo** (solo `components/welcome/`; nada en `components/intro/` ni en `styles/`):

- **Una escala por alto, `--hero-k`** (`ESCALA_ALTO` en `welcome.tsx`): vale 1rem desde 864 de
  alto y baja en línea recta hasta 0,5rem a 568 (`clamp(0.5rem, calc(0.5rem + (100dvh - 35.5rem) *
0.027), 1rem)`). Cada medida de Figma que no es texto se escribe `calc(var(--hero-k) * N)`: aire
  arriba (40) y abajo (53), sol (144, además de su tope por ancho `42vw`), fila del sol, nubes y su
  desfase vertical (24), aire bajo el sol (40), separaciones del subtítulo (28), del subrayado (12)
  y del párrafo (32), y el aire mínimo sobre la ilustración (40). A 864 o más todo es igual a Figma.
- **La ilustración se queda con el alto que sobra.** Su contenedor es `flex-1` y dentro una capa
  absoluta con `container-type: size`; el lienzo mobile (390 x 243) mide
  `min(100cqw, 100cqh * 390 / 243, 87.5rem)` de ancho y su `aspect-ratio`, anclado abajo y
  centrado. Así nunca se corta ni se deforma: si falta alto, se hace más estrecho que la pantalla.
- **Las olas sangran hasta los bordes.** El lienzo mobile ya no lleva `overflow-hidden`: cuando es
  más estrecho que la pantalla, las olas (856 de ancho en un lienzo de 390) siguen hasta los bordes y
  el contenedor las recorta solo en horizontal (`overflow-x: clip`).
- **Ninguna pieza se estira.** En mobile las piezas de archivo llevan `object-contain`: tres cajas
  de Figma no tenían la proporción exacta del SVG (arena 3 %, ola corta 1,8 %, ola suelta 2,8 %) y
  con `fill` se estiraban un poco. En desktop no se tocó.
- **El título baja con el ancho solo por debajo de 364 px**: `clamp(2rem, 11vw, 2.5rem)`. A 320 en
  francés "Bienvenue chez" partía en tres líneas y el hero no cabía; ahora son dos, a 35 px.
- Desktop (`lg`): cada clase nueva tiene su `lg:` con la medida de antes, el contenedor de la
  ilustración vuelve a `flex-none` + `mt-auto` y a bloque normal.

**Hallazgo.** Un ítem flex con `flex-1` (base 0) y `container-type: size` da `100cqh = 0` en
Chrome: la consulta se evalúa antes de repartir el alto. Por eso el contenedor de tamaño es una capa
`absolute inset-0` dentro del hueco flexible, no el propio ítem.

**Medido por CDP** (`captura.js --ancla bienvenida --quieto --leer`, script `medir.js`): alto del
hero, base de la ilustración, área de solape entre las cajas de texto (`h2`, `p`) y las de sol,
nubes, palmera, mujer, flor, olas y arena, peor desviación de proporción de cada imagen visible
(`object-contain` cuenta 0) y la mujer contra su `viewBox`, y scroll horizontal. En es, en y fr:

| Ventana  | Hero | Base ilustración (es) | Alto ilustración es / en / fr | Sol | Solape | Proporción | Scroll x |
| -------- | ---- | --------------------- | ----------------------------- | --- | ------ | ---------- | -------- |
| 320x568  | 568  | 541                   | 135 / 135 / 115               | 69  | 0      | <= 0,03 %  | 0        |
| 360x640  | 640  | 606                   | 171 / 171 / 151               | 86  | 0      | <= 0,03 %  | 0        |
| 375x667  | 667  | 631                   | 180 / 180 / 180               | 92  | 0      | <= 0,03 %  | 0        |
| 390x664  | 664  | 628                   | 179 / 179 / 159               | 91  | 0      | <= 0,03 %  | 0        |
| 390x844  | 844  | 792                   | 240 / 240 / 220               | 133 | 0      | <= 0,03 %  | 0        |
| 414x736  | 736  | 694                   | 223 / 203 / 203               | 108 | 0      | <= 0,03 %  | 0        |
| 428x746  | 746  | 703                   | 225 / 205 / 205               | 111 | 0      | <= 0,03 %  | 0        |
| 430x932  | 932  | 878                   | 268 / 268 / 268               | 138 | 0      | <= 0,03 %  | 0        |
| 768x1024 | 1024 | 969                   | 422 / 396 / 396               | 138 | 0      | <= 0,03 %  | 0        |

Antes: el hero medía 836 a 865 en todos los celulares (y 1081 en tablet) y la base de la
ilustración caía hasta 145 px por debajo de la pantalla. Ahora el hero mide exactamente el alto de
la ventana en los 27 casos y la ilustración queda entera dentro, con el aire inferior de Figma
escalado (27 a 54 px). La base de la ilustración es la misma en los tres idiomas; lo que cambia con
un texto más largo es su alto.

**Desktop sin cambios:** capturas `--quieto` antes y después a 1280x832, 1512x982 y 1920x1080
idénticas byte a byte.

**Llegada desde la intro** (`--paso 3 --gesto 120`, 390x664 y 1280x832): `#bienvenida` en
`top = 0` con el alto de la ventana, sin `data-intro-llegando` y 0 piezas con opacidad < 1 a los
4,5 s. El sol rojo viaja al disco rosado ya escalado (el relevo mide la caja real). Entrada por
piezas, rayos girando y pelo sin cambios de código.

Capturas `antes-<ancho>x<alto>-<lang>.png` y `despues-...`, `llegada-<ancho>x<alto>-<ms>.png` y
`medir.js` en `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-24-sep/3826136d-6674-498b-b321-d960b35db571/scratchpad/hero/`.

**Riesgos.** En 320x568 en francés la ilustración queda en 115 px de alto (unos 185 de ancho): cabe
y no se deforma, pero es pequeña, y el botón de Súmate tapa buena parte de la mujer. Por debajo de
568 de alto (celular apaisado) el hero vuelve a crecer: la ilustración tiene un mínimo de 7rem.
Safari usa `dvh` y container queries desde la versión 16; no se probó en un iPhone físico.

---

## D10. Feedback del 30 de septiembre: colores nuevos, entrada por pasos, viaje de la bola, trazos que se escriben y navegación accesible

**Contexto.** Punto 1 de `docs/feedback-30-sep/FEEDBACK.md` y la respuesta 1 de Johan en
`docs/feedback-30-sep/ROADMAP.md`. Rama `30-sep`, frente A de la ola 1, sin commitear.

### 1. Colores de las burbujas (Figma `1152:287`)

Los colores viven dentro de los SVG de cada burbuja, no en clases: no hizo falta ningún color nuevo
en `tailwind.config.js`. Se reemplazaron los 12 SVG de la parte 1 (`paso1-burbuja-a` a `-j`,
`paso1-elipse-71`, `-73`) por los exports de Figma, casados capa a capa por orden y caja, con los
números redondeados a 2 decimales (el export trae 4 a 6 y pesaba el doble; a este tamaño no se
distingue). La segunda sombra, que antes reusaba `paso1-elipse-73`, ahora tiene su color propio y
su archivo, `paso1-elipse-70.svg`. La geometría no cambió: los tres breakpoints usan las mismas
capas.

**Queda anotado, no se tocó:** en `1152:287` (desktop) y `1159:735` (mobile) la diseñadora además
movió el racimo (desktop: unos 46 px a la derecha y 19 arriba; mobile: más chico, escala 0,93,
y la línea amarilla 39 px a la derecha) y en desktop la bolita está en otra parte de la línea. El
encargo era de color; mover la composición es otra decisión.

### 2. Entrada de la parte 1, por pasos (`crearEntrada`)

Al llegar desde el aviso o con la cookie ya puesta: primero el texto (como siempre, el texto
manda); luego las burbujas y las espirales negras **una a una**, cada 50 ms base (70 ms reales),
desde el centro del racimo hacia fuera. Los trazos negros sueltos entran con la pieza que les toca,
sin sumar un paso. Las espirales tienen rol propio, `espiral`: entran girando (-150° a 0 con
`back.out`) y en reposo **giran despacio sin fin**, una vuelta cada 24 s, alternando el sentido
(antes se balanceaban como un garabato). Al final, la línea amarilla se escribe (1,05 s base). La
entrada entera dura unos 3,4 s; un gesto a mitad la termina y pasa a la parte 2, como antes.

### 3. Trazos que se escriben (parte 1, espiral de la parte 2, trazo de la parte 3)

En Figma cada trazo amarillo es un vector con pincel; el SVG servido es el pincel convertido a
relleno, sin `stroke` que animar. Pero Figma guarda la línea central del vector (`vectorPaths`),
y esa es la que se copió a `components/intro/intro.trazos.ts` (nodos `1230:94`, `1230:96`,
`1230:98`). Una capa con `trazo` se pinta con un SVG en línea: la misma imagen del pincel,
enmascarada por esa línea con un `stroke` 1,8 veces el grosor del pincel que se despliega con
`stroke-dashoffset`. **La máscara solo se pone mientras se anima**: en reposo la imagen va tal cual
(el reposo es sagrado).

- **Grosor de la máscara medido:** con la máscara completa, píxeles amarillos que se pierden frente
  a la imagen sin máscara, parte 1 a 1280: 1551 con 1,2x, 40 con 1,5x, 0 con 1,8x. Se eligió 1,8:
  cubre todo el pincel y destapa lo mínimo del tramo vecino donde la línea se cruza consigo misma.
- **`pathLength` es 1000, no 1:** con 1, GSAP redondea `stroke-dashoffset` a píxeles enteros y el
  dibujo saltaba de golpe de 1 a 0.
- En mobile, el sol y su espiral eran un solo SVG: se partió por relleno en `paso2-sol-mobile.svg`
  y `paso2-espiral-mobile.svg`, misma caja. Así el sol cae solo y el espiral se dibuja al final.
  `paso2-sol-squiggle.svg` se queda en `public/` sin uso (regla del repo: no se borran assets).
- En las transiciones, el trazo de la parte que entra se dibuja al final de todo (0,45 s base
  después del arranque de las piezas, 0,6 s de dibujo). Al salir, se barre con el recorte de
  siempre.

### 4. El viaje de la bola entre las partes 1 y 2 (`viajeDeLaBola`)

La bolita roja **no está en la parte 1 en reposo** (con el pin lleva `invisible`; tablet y desktop
tienen la del diseño, rol `bola`; mobile no la tiene en Figma y usa una propia, `soloPin`, del
tamaño proporcional al sol de la parte 2). Con el primer gesto hacia la parte 2:

1. La bola aparece debajo de las burbujas, en el último punto de la línea que queda tapado por
   una (medido en pantalla), y rueda por la línea central (`getPointAtLength` y `getScreenCTM`)
   hasta donde la pone el diseño (desktop: 1194, 576, a 1 px del sitio de Figma) o, en mobile, hasta
   donde la línea llega al 90 % del ancho. Gira lo que avanza entre su radio.
2. La línea se va borrando desde su principio detrás de la bola y la alcanza cuando cae.
3. Las burbujas y el texto se van cuando la bola ya salió del racimo (el texto, lo último).
4. La bola cae por el borde de abajo, estirándose; el sol de la parte 2 entra cayendo desde
   arriba del lienzo, como si fuera la misma bola que sigue cayendo, y se aplasta un poco al
   llegar (squash). El espiral se escribe al final.

**Al retroceder (2 a 1)** el sol sube por donde cayó y la parte 1 entra con su coreografía de
siempre, sin bola (la bola desaparece limpia porque en la parte 1 en reposo no existe). Así ir,
volver e ir repite el mismo viaje, sin estados a medias. La transición 1 a 2 dura unos 3,4 s.

### 5. "Saltar intro" y las flechas (`intro-navegacion.tsx`)

Reemplazan al botón "Saltar animación", que solo salía con un scroll fuerte, Tab o Escape. El
problema de fondo: con el ratón arrastrando la barra lateral o con una tableta, la intro pasa
derecho al hero; no se intenta frenar la barra, las flechas son la salida.

- Tres botones reales abajo a la derecha: "Saltar intro" (lleva a `#bienvenida` y le pasa el
  foco, como antes), retroceder (solo si hay parte anterior) y avanzar (siempre; desde la parte 3
  lleva a Bienvenida, como un gesto). Sin puntos. 40x40 mínimo, borde fino y fondo papel.
- Se ven en reposo y se esconden durante cualquier entrada, transición o llegada: aparecen al final
  de cada una con un fundido de 300 ms. Escondidos, su grupo es `inert`. Si el foco estaba en uno,
  pasa al contenedor (`tabIndex=-1`, no inert) y vuelve al mismo botón al reaparecer: quien pulsa
  Enter sobre la flecha puede seguir pulsando.
- Son lo primero de la intro en el DOM: Tab llega a ellos justo después del selector de idioma.
  Ya no hay trampa de Tab: Tab recorre la página normal. Escape lleva el foco a "Saltar intro".
  Flechas, AvPág, RePág y Espacio (también con el foco en el contenedor) avanzan y retroceden.
- **Ampliación (2026-09-30, hallazgo del verificador):** durante una transición o la llegada a
  Bienvenida, Tab no puede sacar el foco de la intro. Antes, con los botones inert, Tab saltaba a
  "Estampilla anterior" de EMI, la página bajaba y la capa fija se soltaba a mitad de camino. Ahora
  `use-intro-pin.ts` cancela Tab (y Shift+Tab) mientras corre la transición y deja el foco en el
  grupo de la navegación (`data-intro-navegacion`); al reaparecer los botones, el foco pasa a
  avanzar (o al botón que tenía). En reposo Tab sale de la intro como siempre. Medido por CDP:
  Enter en avanzar más Tab a los 500 ms deja el foco en el grupo, `scrollY = 0`, parte 2, y al
  terminar el foco está en avanzar; antes quedaba en EMI con `scrollY = 1993` y la intro en la 1.
- Un `aria-live` oculto anuncia "Parte N de 3 de la introducción". Copies nuevos en `intro.*` de
  los tres idiomas (`saltar`, `anterior`, `siguiente`, `navegacion`, `paso`).
- Con `prefers-reduced-motion` no hay pin: se sirve la intro estática de siempre, sin trazos
  animados ni botones, y se ve el diseño tal cual (en tablet y desktop, con la bolita de Figma).

### Verificado (2026-09-30, CDP, dev server en :3000)

- `type-check` y `lint` limpios.
- Reposo `--quieto` de las 3 partes a 390x844, 1280x800 y 1920x1080: colores de Figma, línea y
  espirales enteras, sin bola, botones visibles.
- Entrada al cargar (1280 y 390): burbujas una a una, línea escribiéndose de 2,1 a 3,3 s; botones
  con opacidad 0 e `inert` hasta los 3,4 s y visibles a los 3,9 s; sin máscara en reposo.
- Viaje 1 a 2 a 1 a 2 (1280): la bola pasa por (428, 318), (640, 359), (684, 708), (1069, 584),
  para en (1194, 576) y cae; el sol llega a `top = 103`. La segunda ida repite la primera con 0 a
  9 px de diferencia (latencia del sondeo). Al volver, el sol sube y la bola queda `hidden`.
  También a 390x844 y 1000x1366.
- Teclado: Tab 4 llega a "Saltar intro"; Enter en avanzar deja el foco en el contenedor durante la
  transición y lo devuelve a avanzar al terminar; ArrowUp, ArrowDown, PageDown, PageUp y Espacio
  mueven un paso; Escape enfoca "Saltar intro" y Enter lleva a Bienvenida (`top = 0`, foco en la
  sección).
- `--reducido`: intro estática, 0 botones, 0 máscaras.
- Recorrido completo (1 a 2 a 3 a 2 a 1): en cada reposo, una parte montada, 0 piezas con estilos
  animados y botones visibles.

Scripts y capturas en
`/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-30-sep/4a102619-4612-4f9a-b653-f5d38898f6f9/scratchpad/ola1A/`.

### Lo que no se pudo verificar

- Un trackpad, una tableta y un lector de pantalla de verdad (VoiceOver): el anuncio y el orden se
  comprobaron por DOM, no escuchándolos.
- Safari: la máscara es un atributo `mask` de SVG sobre un `<image>`, que Safari soporta, pero no
  se probó.

## D11. Bienvenida: las nubes derivan y la nube nueva de desktop (feedback del 30 de septiembre)

**Lo que pidió Johan (2026-09-30, punto 3 de `docs/feedback-30-sep/FEEDBACK.md`):** las nubes con un
leve movimiento de derecha a izquierda, unas más rápidas que otras, muy sutil; y en desktop "un
par de nubes más" según Figma `1280:9`. Rama `30-sep`, sin commitear.

### Qué cambió en el frame 1280:9

Comparado con lo construido en D7 (`get_metadata` y `get_design_context`): **una nube nueva**,
"Vector 1313" (x 1145, y 139, 146,6 x 54,2), que es el mismo dibujo que "Vector 5" (el export de
Figma tiene los mismos paths que `left-cloud.svg`, así que se reutiliza el archivo) y sangra por la
derecha a 1280. Y **"Vector 5" se movió** a la izquierda: de x 208,64 a 123,64 (con el inset). Las
demás nubes, gaviotas, texto e ilustración siguen en su sitio. El frame creció a 934 de alto, sin
contenido nuevo abajo: no se tocó el alto del hero. Sigue vigente la decisión de D7: las nubes que
sangran a 1024 y 1920 se quedan así (a 1024, "1313" asoma unos 10 px).

### La deriva

- **CSS, no GSAP** (`components/welcome/nubes.module.css` y `nube-deriva.tsx`). Cada nube tiene una
  caja interior nueva que deriva; la de fuera (`data-rol="nube"`) sigue siendo la que mueve la
  entrada desde la intro (`bienvenida.motion.ts`, sin tocar), así que las dos se suman sin pisarse.
- **Forma del ciclo:** de su sitio hacia la izquierda en el 62 % del ciclo y de vuelta en el resto,
  los dos tramos con sine.inOut: la velocidad es 0 en los extremos, sin salto al reiniciar. Se
  eligió el vaivén lento frente a un bucle que cruza la pantalla porque este último descoloca la
  composición de Figma y obliga a duplicar nubes. La ida es más larga que la vuelta, así que se lee
  como "hacia la izquierda".
- **Cifras** (px hacia la izquierda, segundos por ciclo): desktop "Vector 5" 18 / 13, "Vector 7"
  12 / 8,5, "1310" 20 / 11, "1313" 10 / 12 (corta: sangra 16 px por la derecha a 1280 y no debe
  descubrir su extremo, regla 8), "1309" (la del borde izquierdo) 14 / 10; mobile y tablet, la
  izquierda 12 / 12 y la derecha 9 / 8,5. Velocidades medias de 0,8 a 1,8 px/s: muy sutil, pero en
  3 s se ve.
- **Cuándo corre:** `useReposoBienvenida` (`welcome.tsx`) pone `data-deriva="corre"` o `"pausa"`
  en la sección con las mismas condiciones que el resto del reposo (atributo `data-intro-anima`,
  sin `?quieto=1`, pausa fuera de pantalla y con la pestaña oculta). Sin el atributo no hay
  animación: el único fotograma es el diseño. `prefers-reduced-motion` la apaga también por CSS.

### Medido por CDP (`/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-30-sep/4a102619-4612-4f9a-b653-f5d38898f6f9/scratchpad/ola2D/sonda.js`, transform calculado a 0, 1,5 y 3 s)

- 1280x800: las cinco nubes se mueven a ritmos distintos (a los 3 s: -8,1, -9,8, -11,7, -5,1 y
  -9,3 px). 390x844: -6,1 y -7,3 px. Con `--reducido`: `none` en las tres muestras, sin atributo.
- Página arriba del todo: `data-deriva="pausa"`.
- Llegada desde la parte 3 (`--paso 3 --gesto 120`, 1280x832, 4,5 s): `#bienvenida` en top 0, sin
  `data-intro-llegando`, las siete nubes con opacidad 1 y sin transform en la caja de fuera, la
  deriva corriendo.
- Sin scroll horizontal (`scrollWidth == clientWidth`) a 390, 768, 1024, 1280, 1512 y 1920.
- Capturas `--quieto` `bienv-<ancho>x<alto>.png` y `llegada-1280.png` en `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-30-sep/4a102619-4612-4f9a-b653-f5d38898f6f9/scratchpad/ola2D/despues/`; a 1280x832
  coincide con `get_screenshot` de 1280:9.

## D12. Segunda ronda del 30 de septiembre: la bola salta al sol, cintas quietas, dibujo que acelera, "Saltar intro" con entrada y composición de la parte 1

**Lo que pidió Johan (2026-10-01, `docs/feedback-30-sep/FEEDBACK-2.md`, "Intro y Bienvenida").** Rama
`30-sep`, sin commitear. Seis puntos; cada uno con su porqué.

### 1. La bola cae en la mitad y se convierte en el sol de la parte 2 (`viajeDeLaBola`)

**Reemplazado por D15 (2026-10-01):** el salto no gustó; ahora la bola baja por la línea y el sol
amanece.

**Antes (D10):** la bola rodaba hasta su sitio en la línea (desktop, x 1194, a la derecha), caía por
el borde de abajo y el sol de la parte 2 entraba cayendo desde arriba en x 614. Dos verticales
distintas: no se leía como la misma bola (lo marcó también el verificador 1).

**Ahora:** la bola rueda igual hasta su sitio, se agacha (anticipación, 0,08 s base), salta y
describe una **parábola** hasta el disco del sol de la parte 2, en la mitad de la pantalla, creciendo
hasta su ancho por el camino y girando hasta la vuelta entera siguiente (cae con el dibujo derecho).
Al caer se aplasta (0,07 s) y en el aplastamiento máximo cambia en un fotograma por el sol, aplastado
igual, que se estira con `back.out(2.5)`. Es el relevo del barco 2 a 3 (D4, variante b): nunca hay
dos soles ni fundido. En tablet y desktop la bola y el sol son el mismo dibujo (`paso3-sol.svg` a
0,6547 y 1,444), así que crecer es exacto; en mobile el sol es otro SVG que trae el espiral en el
mismo lienzo y la capa lleva `disco` (la parte de la imagen que es el disco, medida con `getBBox`)
para saber adónde saltar y desde dónde aplastarse.

- **La parábola:** x a velocidad constante y y con vértice a 0,6 altos del sol por encima de su
  centro (sin salirse del lienzo visible), así frena al subir y acelera al caer sobre el sol: "cae
  en la mitad". Un solo estado pinta la bola en cada fotograma; el giro va en la caja interior y la
  deformación en la exterior, para que el squash sea siempre vertical aunque haya rodado.
- **Interpretación, para confirmar con Johan:** el feedback dice "donde cae el sol de la parte 3".
  El sol de la parte 3 no está en la mitad (desktop x 217, mobile x 83, a 398 y 107 px del de la
  parte 2), y la bola se convierte en el sol de la parte 2. Se leyó como "en la mitad, donde queda el
  sol": la bola cae sobre el sol de la parte 2 en su sitio de Figma. Si quería mover el sol de la
  parte 2 a la vertical del de la parte 3, es cambiar el destino (`discoDe`) y el diseño.
- Constantes nuevas: `AGACHARSE`, `VUELO_BOLA` (0,55), `ATERRIZAR`, `AGACHADA`, `ESTIRADA`,
  `APLASTADA`, `ALTURA_SOBRE_SOL`. Salen `CAIDA_BOLA`, `CAIDA_SOL`, `SOL_APLASTADO` y compañía.
  Al volver (2 a 1) no cambia: el sol sube por donde vino. La transición sigue en unos 3,4 s.

### 2. Las cintas amarillas, una vez dibujadas, se quedan quietas

`crearReposo` ya no balancea los garabatos que son trazos que se escriben (la línea de la parte 1,
el espiral de la parte 2 y el trazo de la parte 3); los garabatos negros sueltos, las burbujas y las
espirales negras siguen moviéndose como pidió Johan en D10. Matiza la regla 8 de
`docs/PATTERNS.md` ("vida en reposo"): las cintas no cuentan entre las piezas que se mueven.

### 3. El dibujo de las cintas empieza despacio y termina rápido

`CURVA_DIBUJO = 'power2.in'` en `dibujar` (antes `sine.inOut`). Se eligió power2 y no power3: al
25 % del tiempo lleva un 6 % del trazo y termina al doble de su velocidad media, que se lee como una
mano que toma impulso; con power3 el primer tercio dejaba un 1,6 % y se leía como una pausa antes de
dibujar. Vale para la entrada de la parte 1 y para los trazos de las partes 2 y 3.

### 4. "Saltar intro" ya no se pierde la entrada de Bienvenida

Antes `saltar` soltaba la capa fija y desplazaba la página con `scrollIntoView`: Bienvenida
aparecía en reposo. Ahora es la misma **llegada** del gesto desde la parte 3 (D6), desde la parte en
que esté: engancha (volviendo arriba si la página se movió unos px), la intro sale con su coreografía
y Bienvenida entra por piezas, el texto primero. El sol rojo solo viaja al rosado desde la parte 3
(`crearLlegada(origen, bienvenida, viajaElSol)`); desde las otras, el sol sale con su parte y el
rosado aparece estirándose en el mismo instante del relevo. A media llegada, saltar la termina
(`progress(1)`) como antes. Teclado: Enter o Espacio sobre el botón; al terminar el foco pasa a
`#bienvenida`. Con `prefers-reduced-motion` no hay pin ni botón: la intro estática y Bienvenida en
su estado final.

### 5. Composición de la parte 1 según Figma

- **Desktop (`1152:287`):** el racimo pasa a `dx 138, dy 47,04` (antes 92 y 66; misma escala
  1,2988), medido con "Group 249" y "Vector 1282". La bolita, "Group 235" (`1224:2`), a (1069, 559).
  La línea y el texto no cambiaron.
- **Mobile (`1159:735`):** el racimo a escala 0,92625 con `dx 15, dy 35,9` (el grupo `burbujas`
  ahora también se transforma en mobile) y la línea en x -31,207 (38,8 px a la derecha). Texto
  centrado en el mismo eje con 300 de ancho (Figma 275: con 275 el francés pasaba a cuatro líneas
  y chocaba con los botones a 375x667).
- **Tablet:** no hay frame; se deja como estaba.
- `intro.trazos.ts` no cambia: la línea es el mismo vector (`1230:94`/`1177:1705`), del mismo
  tamaño; solo se movió su caja.

### 6. Bienvenida desktop: la nube del borde izquierdo

La nube "muy a la izquierda" es "Vector 1309" (la gris que sale del borde): iba siempre pegada al
borde de la pantalla y a 1512 o 1920 quedaba sola, a 116 o 320 px del resto de la composición. Ahora
`left: max(0rem, 50% - 40rem)`: hasta 1280 sale del borde de la pantalla como antes (a 1024 igual,
-55 px) y desde ahí sigue al frame de 1280 (x -55 del frame, como en Figma `1280:9`). "Vector 5" y
"Vector 1313" ya estaban en su sitio. **Para Johan:** esto cambia lo decidido en D7 sobre 1920 (la
nube pegada al borde): ahora a 1920 queda en x 265, junto al resto; la derecha a 1024 sigue
sangrando igual.

### Medido (CDP, dev server en :3000, scripts en `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-30-sep/4a102619-4612-4f9a-b653-f5d38898f6f9/scratchpad/r2-I/`)

- Relevo bola a sol (`bola.js`), último fotograma de la bola contra el primero del sol: diferencia
  de centro x 0 px e y de 0,3 a 2,4 px, ancho 128 contra 126 (1280x800), 93 contra 93 (390x844), 128
  contra 127 (1920x1080), 125 contra 125 (1000x1366). 0 fotogramas con bola y sol a la vez. Centro del
  sol al terminar: 614 a 1280 (mitad 640), 190 a 390 (mitad 195), 934 a 1920 (mitad 960): su sitio de
  Figma. Respecto al sol de la parte 3: 398, 107 y 398 px en x (ver la interpretación del punto 1).
- 1 a 2 a 1 a 2: la segunda ida repite la primera (relevo a los 2262 a 2296 ms, mismas cifras); al
  volver, parte 1 y bola `hidden`.
- Cintas (`cintas.js`): transform calculado de la imagen de cada cinta y sus cajas, dos muestras
  separadas 2 s en reposo, partes 1, 2 y 3 a 1280x800 y 390x844: idénticos. En la parte 1 siguen
  moviéndose 17 de 17 burbujas y espirales y 4 de 4 garabatos negros.
- Curva (`curva.js`, espiral de la parte 2 a 1280): dura 783 ms; progreso al 25 % del tiempo 3,1 %
  (teórico 6,25 %), al 50 % 17 %, al 75 % 46 %.
- Saltar (`saltar.js`): clic en la parte 1 y en la 2 a 1280, Enter a 390, Espacio en la parte 3:
  opacidad del texto de Bienvenida 0 a los 0 y 300 ms, 0,94 / 0,6 / 0 a los 900 ms y 1 a los 4,5 s;
  `#bienvenida` en top 0 todo el tiempo, foco final en `#bienvenida`. `--reducido`: 0 botones,
  intro estática, Bienvenida con opacidad 1.
- Foco de D10 (`foco.js`): Enter en avanzar y Tab a los 500 ms deja el foco en el grupo, scrollY 0;
  al terminar, foco en avanzar; Escape enfoca "Saltar intro".
- Nube 1309 (`nube.js`): x -55, -55, 61 y 265 a 1024, 1280, 1512 y 1920 (Figma relativo al frame:
  -55 a 1280, 61, 265). Sin scroll horizontal.
- `npm run type-check` y `npm run lint` limpios.

Capturas en `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-30-sep/4a102619-4612-4f9a-b653-f5d38898f6f9/scratchpad/r2-I/`: `p1-<ancho>.png` (parte 1 en reposo, contra `1152:287`), `p1-375x667-<idioma>.png`,
`caida-<ancho>.png` (el sol al terminar), `vuelo-1280-<ms>.png` (la parábola), `bienv-<ancho>.png`
y `antes/`, `saltar-*.png`.

### Sin probar

Trackpad físico, Safari y lector de pantalla, como en D10.

---

## D13. Bienvenida en pantallas altas: la composición se centra y el hueco tiene tope

**Lo que pidió Johan (2026-10-01, ronda 3, frente O):** desde unos 970 px de alto el espacio entre
el texto y la palmera era enorme (286 px a 1920x1080, 628 a 1024x1366) y se veía mal diseñado.
Repartir mejor la altura sin perder Figma en 800 a 900 ni D9.

**Causa.** En desktop la ilustración iba con `mt-auto`: todo el alto de más caía en un solo
hueco bajo el texto. En mobile y tablet la ilustración se queda con el alto que sobra (D9), pero
cuando llega a su ancho máximo (el de la pantalla) ya no crece y el resto quedaba también en ese
hueco (96 a 430x932, 99 a 820x1180).

**Qué se hizo** (solo `components/welcome/welcome.tsx` e `ilustracion-playa.tsx`; nada en
`components/intro/`, mismos `data-rol` y estructura de piezas):

- **Un grupo de composición** dentro de la sección (`relative flex flex-1 flex-col
justify-center`) con el decorado de desktop dentro, para que nubes y gaviotas se muevan con el
  sol y el texto.
- **Desktop:** el grupo mide lo suyo y la sección lo centra (`lg:justify-center`). El hueco bajo el
  texto es 43 (Figma `1280:9`) hasta 832 de alto y suma el 40 % de lo que sobra, con tope en 160:
  `clamp(2.6875rem, 2.6875rem + (100dvh - 52rem) * 0.4, 10rem)`. Lo demás se reparte igual arriba
  y abajo.
- **Desktop alto y estrecho:** el lienzo de la playa crece con el alto (`min(118%, max(min(100%,
80rem), 100dvh))`): a 1024x1366 la palmera pasa de 210 a 247. El 118 % es el máximo con el que el
  dibujo (x 136 a 1168 del frame) sigue entero en pantalla; el lienzo se centra con `flex
justify-center` y lo que sobra lo recorta la página. A 1280 de ancho o más no cambia hasta que
  el alto pasa del ancho del frame.
- **Mobile y tablet:** el contenedor de la ilustración tiene tope de alto, el del lienzo a su ancho
  máximo (`calc(min(100vw, 87.5rem) * 243 / 390)`); pasado ese alto el grupo centra lo que queda
  arriba y abajo. Mientras la ilustración no llega a su ancho, D9 sigue igual.

**Medido por CDP** (`/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-30-sep/4a102619-4612-4f9a-b653-f5d38898f6f9/scratchpad/r3-O/sonda.js hero`, `?quieto=1#bienvenida`, px desde el borde de arriba de
la sección; hueco = palmera menos final del párrafo):

| Ventana   | Hueco antes | Hueco después | Sol (top) | Aire bajo la ilustración | Palmera (alto) |
| --------- | ----------- | ------------- | --------- | ------------------------ | -------------- |
| 1280x832  | 43          | 43            | 88        | 58                       | 262            |
| 1512x982  | (sin medir) | 103           | 131       | 101                      | 262            |
| 1280x1080 | 286         | 142           | 160       | 131 (antes 58)           | 262            |
| 1920x1080 | 286         | 142           | 160       | 131                      | 262            |
| 1512x1200 | 406         | 160           | 211       | 182                      | 262            |
| 1920x1200 | 406         | 160           | 211       | 182                      | 262            |
| 1440x1300 | 506         | 160           | 259       | 229                      | 266            |
| 1024x1366 | 628         | 160           | 302       | 272                      | 210 a 247      |
| 390x844   | 39          | 39            | 72        | 52                       | 216            |
| 430x932   | 96          | 40            | 102 (74)  | 82 (54)                  | 253            |
| 768x1024  | 40          | 40            | 74        | 55                       | 390            |
| 820x1180  | 99          | 40            | 104 (74)  | 84 (55)                  | 482            |

A 1280x832, 1024x768, 390x844, 768x1024 y 375x667 todo queda igual que antes (D9 intacto). Sin
solapes (hueco mínimo 27 a 375x667), ilustración entera dentro de la sección en todos (aire
inferior de 36 a 272) y 0 de scroll horizontal.

**Llegada desde la intro** (`captura.js --paso 3 --gesto 120` y `--paso 1 --clic
[data-accion=saltar]`, 1920x1200 y 390x844): a los 300 ms el sol rojo viaja y Bienvenida está
entrando; a los 4,5 s `#bienvenida` en top 0 con el alto de la ventana, sin
`data-intro-llegando`, texto con opacidad 1, 0 piezas con opacidad menor que 1 y el CTA visible.
`--reducido` sin errores de consola.

Capturas `antes/hero-<ancho>x<alto>.png`, `despues/hero-*.png` y `despues/llegada-*.png` en
`/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-30-sep/4a102619-4612-4f9a-b653-f5d38898f6f9/scratchpad/r3-O/`.

**Para Johan.** Es una propuesta: el 40 % y el tope de 160 son una perilla cada uno en
`ilustracion-playa.tsx`. En 1024x1366 (iPad Pro vertical, que usa la composición desktop) sigue
habiendo aire arriba y abajo (unos 300 y 270): la alternativa sería usar ahí la composición de
tablet, que es otra decisión.

## D14. El dedo se quedaba pegado al llegar a Bienvenida y en Impacto (2026-10-01)

**Contexto.** Johan, en producción (`21bca2d`) y en su celular: "sobre todo en Bienvenida: cuando
termina la animación hago scroll con el dedo y la página se queda pegada un momento y luego se
suelta. Pasa lo mismo en Impacto". Rama `30-sep`, sin commitear.

### Causa raíz: tres mecanismos, dos de ellos ya en producción

1. **Todo toque de la página era bloqueante** (producción y rama). Había dos listeners de toque
   no pasivos que cubren la página entera: el `touchmove` de `use-intro-pin.ts` en `window`
   (`passive: false`, puesto para siempre desde que la intro arranca) y el `touchstart` y
   `touchmove` que Swiper (el slider de Principios) cuelga de `document` con `passive: false`.
   Con eso el compositor de Chrome no puede empezar a desplazar hasta que el hilo principal
   atiende el evento: si está ocupado (el fin de la llegada, las entradas de Impacto), el dedo se
   queda quieto lo que dure esa tarea y luego "se suelta". Medido en la traza del compositor
   (`InputHandlerProxy::HandleTouchMove`): en producción, en Bienvenida y en Impacto, **15 de 15**
   `touchmove` salen con `DID_NOT_HANDLE` (esperan al hilo principal); con el arreglo, **15 de 15**
   con `DID_HANDLE_NON_BLOCKING`. Tareas largas medidas a CPU x4 a x6 en Impacto: 218 ms (rama) y
   220 ms (producción); en un arrastre que coincidió con una, `scrollY` no se movió en los
   primeros 200 ms (antes: 0 px a +100 y +200 ms; con el arreglo, ningún arrastre de 14 queda
   quieto y ningún `touchmove` es `cancelable`).
2. **La cola de la llegada se comía los dedos** (producción y rama). Durante toda la llegada
   (unos 3,2 s en producción) cada `touchmove` se cancela, pero el último tramo solo terminan de
   aparecer nubes y gaviotas: la página se ve quieta y no responde. Serie de arrastres cada medio
   segundo tras el gesto: en producción el de 2648 ms no mueve nada y el primero que mueve es el
   de 3249 ms.
3. **Un dedo puesto durante la llegada quedaba retenido hasta levantarlo** (solo rama). El
   "tragar el resto del gesto" de D6 se aplicaba a cualquier dedo marcado como hecho, también a
   uno que se apoyó durante la llegada: si seguía arrastrando, se cancelaban **216 de 216**
   `touchmove` después del fin y la página no pasaba de Bienvenida (844 px fijos 2,4 s). En
   producción no siempre se ve porque el nodo tocado se desmonta y sus eventos ya no llegan a
   `window`.

Descartado: `overflow`, `touch-action` y `scroll-behavior` de `html` y `body` están en `visible`,
`auto` y `auto` en Bienvenida y en Impacto; no hay `scrollTo` del código durante el arrastre.

### Arreglo (cambio mínimo)

- `use-intro-pin.ts`: el `touchmove` no pasivo se pone y se quita según haga falta
  (`sincronizar`): solo con la página arriba del todo (donde la intro engancha), enganchada o
  durante la llegada. Se revisa en cada `scroll` y al terminar la llegada. Fuera de eso no hay
  listener bloqueante de la intro. Al terminar la llegada el dedo queda libre aunque siga puesto
  (la regla de tragar de D6 queda solo para la inercia de la rueda).
- `bienvenida.motion.ts`: la llegada lleva la etiqueta `asentada`, donde termina todo lo que no
  es fondo (nubes y gaviotas). Un dedo nuevo desde ahí termina la llegada con `progress(1)` y
  desplaza en el acto. Antes de esa etiqueta se sigue tragando, como en D6.
- `principles-section.tsx`: los eventos de Swiper (`detachEvents` y `attachEvents`) solo con el
  slider a menos de un cuarto de pantalla (`IntersectionObserver`, `rootMargin: 25%`), con un
  `update` al volver.
- `use-iman.ts` (Impacto, docs/impacto/DECISIONES.md D4): además de no actuar con un dedo puesto,
  no asienta si la página se movió desde el último `scroll` visto o si ese fue hace menos de
  150 ms; así un temporizador retrasado por el hilo ocupado no empuja a media inercia. Cuenta los
  dedos que quedan al soltar (`touches.length`).

### Verificado

Toque emulado por CDP a 390x844 (`Input.dispatchTouchEvent`), con el servidor de desarrollo.

- Dedo apoyado durante la llegada que sigue subiendo: antes 216 de 216 cancelados tras el fin y
  `scrollY` fijo en 844; ahora 0 de 197 y la página sigue al dedo desde el fin (859 a +200 ms).
- Serie de arrastres tras el gesto: el de 2681 ms ya mueve 105 px (pasó `asentada`); el de
  2083 ms se sigue tragando.
- Intro 1 -> 2 -> 3 -> Bienvenida por toque; bajar con el dedo hasta arriba y volver a entrar
  1 -> 2 -> 3; slider de Principios cambia de tarjeta con un arrastre tras llegar desde arriba.
- Rueda de 100 px cada 150 ms atraviesa Impacto en ambos sentidos a 1280x800 y 390x844 sin un
  solo retroceso; PageDown, PageUp y Espacio asientan en los puntos. (Corregido tras la
  verificación 4: Espacio avanza un bloque igual que PageDown, 5048 a 5700, 6353 y 7005 a 1280.
  El "se pasa del bloque" que se anotó aquí era un fallo de la sonda, que mandaba la tecla en
  repetición: `rawKeyDown` más `char` por CDP genera keydown `Unidentified` que cortan el paso.)
- Imán: con el dedo quieto 800 ms tras arrastrar, `scrollY` no cambia; asienta al soltar.
- `npm run type-check` y `npm run lint` limpios.

Trazas y tablas: `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-30-sep/4a102619-4612-4f9a-b653-f5d38898f6f9/scratchpad/r3-M/`
(`traza-scrollY.txt`, sondas `sonda.js`, `sonda2.js`, `sonda4.js`).

**Lección.** Un listener de `touchmove` o `wheel` con `passive: false` en `window` o `document`
vuelve bloqueante todo el scroll de la página, aunque su código no haga nada fuera de su zona.
Se pone solo mientras puede actuar. Y una librería puede hacerlo por su cuenta (Swiper).

### Ampliación (2026-10-01): la rueda y Swiper

La verificación 4 encontró dos restos del mismo mecanismo 1, los dos de la misma familia.

**La rueda.** La intro dejaba su `wheel` en `window` con `passive: false` desde que montaba y para
siempre: toda rueda y trackpad de la página se despachaba bloqueante y esperaba al hilo principal,
aunque la intro ya no estuviera en pantalla. Medido a 1280x800 con CPU x4
(`InputRouterImpl::MouseWheelEventHandled`): 10 de 10 eventos bloqueantes en Bienvenida, EMI e
Impacto; con el arreglo, 0 de 10 (`SET_NON_BLOCKING`, y `cancelable` false en una sonda pasiva).

- `use-intro-pin.ts`: el mismo `onWheel` se escucha siempre, pero solo es no pasivo cuando puede
  frenar: página arriba del todo, intro enganchada, llegada en curso o, después de la llegada,
  mientras sigue vivo el gesto que la disparó (su inercia se traga, D6). Fuera de eso se quita y se
  vuelve a poner con `passive: true`. No se quita del todo a propósito: sigue registrando el gesto
  (`registrarRueda`), así un gesto de subida que llega arriba no se confunde con uno nuevo y la
  bajada que sigue sí engancha. Dentro del handler, `preventDefault` solo se llama si el listener
  era no pasivo en ese evento.
- `sincronizar` (antes solo el toque) decide las dos cosas y corre en cada `scroll`, en `enganchar`
  (al enganchar y al soltar), al terminar la llegada y al abrir o cerrar un gesto de rueda. Llamarlo
  desde `enganchar` arregla además un resto: si la página salía de la intro enganchada por un
  desplazamiento de un solo `scroll` (un `scrollTo` instantáneo), el `touchmove` bloqueante se
  quedaba puesto hasta el siguiente `scroll`.

**Swiper.** Swiper 12.1.3 cuelga `touchstart` y `touchmove` de `document` y `touchstart` del slider
con `passive: false` dentro de su `events` y no hay opción que lo cambie (`passiveListeners` solo
toca otros listeners, `touchEventsTarget` solo el elemento del `pointerdown`, `touchStartPreventDefault`
el `pointerdown`, `cssMode` cambia el slider entero y el efecto mazo no funciona con él). El arreglo
anterior (soltarlos lejos del slider) dejaba bloqueante todo toque a un cuarto de pantalla del
slider: 20 de 20 `touchmove` con `DID_NOT_HANDLE`, también el scroll vertical sobre el slider.

- `principles-section.tsx`: tras crearse la instancia, esos tres listeners se quitan y se vuelven a
  poner, los mismos handlers con el mismo `capture`, con `passive: true` (`pasivizarToques`).
  Sustituye al `IntersectionObserver` de D14. Lo único que hacían como no pasivos era frenar el
  scroll de la página durante un arrastre horizontal, y eso ya lo hace `touch-action: pan-y` del
  mazo. El `touchstart` solo guarda el dedo; el `touchmove` sigue moviendo la tarjeta. Los
  `pointerdown` y `pointermove` no pasivos que quedan no bloquean el scroll (los eventos de puntero
  nunca lo hacen). El `detachEvents` de Swiper al destruirse los quita igual.
- Descartado: dejar a Swiper solo con eventos de puntero. Swiper 12 ignora `pointercancel` fuera de
  Safari (`onTouchEnd` en swiper-core), así que tras un scroll vertical sobre el slider se quedaría
  con el `pointerId` viejo y no aceptaría el siguiente dedo. Se descartó leyendo el código, sin
  probarlo.

**Verificado** (CDP, servidor de desarrollo, CPU x4; tablas y scripts en
`/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-30-sep/4a102619-4612-4f9a-b653-f5d38898f6f9/scratchpad/verif4-arreglos/`,
`TABLA.md`):

- Toque a 390x844: Bienvenida, EMI fuera y sobre el slider pasan de 20 de 20 `touchmove`
  bloqueantes a 0 de 20; Impacto ya estaba en 0. Ningún listener no pasivo de toque o rueda en
  `window`, `document` ni el slider fuera de la intro. Arriba del todo sigue bloqueante a propósito.
- Intro por trackpad a 1280x800: un paso por gesto (1, 2, 3, Bienvenida en 800 exacto). Una
  inercia de 9,6 s que sobrevive 6 s a la llegada no mueve la página de 800 (la rueda sigue no
  pasiva mientras dura) y al cerrar el gesto la rueda vuelve a pasiva y la siguiente muesca mueve.
  Subida con inercia desde Bienvenida que llega arriba y, sin silencio, un gesto hacia abajo: entra
  a la parte 2. Con ratón (muescas de 100 hacia arriba hasta 0): una muesca abajo, parte 2; otra,
  parte 3. ArrowUp retrocede un paso.
- Intro por toque (1, 2, 3, Bienvenida) y "Saltar intro" a 390x844: llegan; el primer arrastre
  tras la llegada no queda quieto más de 100 ms.
- Slider: un arrastre cambia de tarjeta, también tras alejarse y volver; dos arrastres seguidos
  (el segundo a 150 ms, con la transición en curso) avanzan dos; a mitad de arrastre la tarjeta ya
  se movió; un arrastre vertical sobre el slider baja la página 279 px sin cambiar de tarjeta y el
  horizontal siguiente funciona. Autoplay avanza antes de tocarlo y la pista se ve.
- Rueda de 100 px cada 150 ms por Impacto en ambos sentidos a 1280x800 y 390x844: 0 retrocesos. A
  1280 queda 1 muesca sin movimiento en la bajada, igual con la rueda bloqueante de antes (no es de
  este cambio).
- `npm run type-check` y `npm run lint` limpios.

## D15. Cuarta ronda (2026-10-01): espirales más rápidas, la bola descansa en la cola y el sol amanece

**Lo que pidió Johan (`docs/feedback-30-sep/FEEDBACK-3.md`, "Intro").** Rama `30-sep`, frente Q,
sin commitear. El salto de la bola de D12 (parábola hasta el sol) no gustó: las transiciones de la
parte 2 a la 3 y de la 3 a Bienvenida, donde las piezas viajan sin saltar, son superiores. Hacía
falta más sutileza.

### 1. Espirales

- **Más rápidas:** `ESPIRAL_VUELTA_S` pasa de 24 a 14 s por vuelta, 1,71 veces (pedido: al menos
  1,5). Medido por CDP a 1280x800, giro calculado de la caja interior cada 1,5 s: antes 15 °/s
  (24 s por vuelta), ahora 25,7 °/s (14 s).
- **La espiral "un poco diferente" de arriba a la izquierda** es "Vector 1282" (Figma `1163:1178`
  en desktop, `1420:429` en mobile): la única con forma de bucle, fuera del racimo, arriba a la
  izquierda. En producción (`21bca2d`) tenía rol `garabato` y solo se balanceaba unos grados, al
  lado de las otras tres que giran. En esta rama ya tenía rol `espiral` (cambio sin commitear de
  una ronda anterior) y gira como las demás, ahora también a 14 s. Medido: su giro pasa de 16° a
  93° en 3 s, igual que las otras tres (en sentidos alternos). **Para Johan:** si lo que vio fue
  producción o un preview, es eso; si en `localhost` la ve quieta, avisar con el ancho.
- Las cintas amarillas siguen quietas una vez dibujadas (D12, punto 2).

### 2. Tablet y desktop: la bola descansa al final de la cola y amanece como el sol

**Reemplaza el punto 1 de D12** (rodar hasta el sitio de Figma, agacharse, saltar en parábola y
aplastarse sobre el sol). Salen `viajeDeLaBola`, `subirSol`, `discoDe` y sus constantes; entran
`lineaConBola`, `bolaAmanece`, `solCae`, `rodarHastaLaCola` y el relevo `bola-vuelve`
(`components/intro/intro.motion.ts`).

- **En reposo, la bola está al final de la cola.** Su caja en `intro.data.ts` pone su centro sobre
  la línea central del trazo en el último punto donde cabe entera en el lienzo con 8 px de aire
  (desktop 1223,54, 565,03; tablet 967,55, 934,67; antes, la de Figma en 1069, 559 y 939, 806). La
  línea real termina 10 px fuera del lienzo de desktop y 343 fuera del de tablet: en el borde la
  bola quedaría cortada. Ya no está oculta con el pin, y la intro estática (`prefers-reduced-motion`)
  la muestra en el mismo sitio: estado final coherente.
- **Entrada (carga):** aparece **mientras la cinta se dibuja**, no después. Asoma de debajo de las
  burbujas cuando la punta del trazo pasa por ahí, creciendo de 0,6 a 1, y rueda (gira lo que avanza
  entre su radio) hasta la cola con `power2.out`. Por qué así: el trazo termina rápido (`power2.in`,
  D12) y la bola toma ese impulso y frena hasta quedarse quieta, que es seguimiento (regla 10); las
  entradas se solapan en vez de ir en bloque (regla 1); y es un detalle que llega tarde, al final de
  todo (regla 7). Nunca va por delante de la punta: en cada fotograma se limita a ella. Sigue 0,7 s
  base tras el trazo; la entrada entera dura unos 4,2 s (antes 3,4).
- **Gesto a la parte 2:** la bola baja rodando por la misma línea, hacia atrás, hasta la vertical del
  sol de la parte 2 (`sine.inOut`, 0,95 s base). La línea se recoge hacia ella desde sus dos puntas
  (la cola, detrás de la bola, y el principio, desde las burbujas), y las dos llegan con ella. Ahí,
  en un fotograma, cambia por el sol: es el mismo dibujo (`paso3-sol.svg`) a otra escala, y el giro
  de la bola se ajusta para llegar con vueltas enteras, así que el cambio no se ve. El sol amanece
  desde ese punto: sube y crece hasta su sitio (0,8 s base, `sine.inOut`, arranca y llega despacio).
  Nunca hay dos soles ni fundido, como en el viaje del sol de la parte 2 a la 3. La parte 1 sale
  desde 0,3 s base (el texto, lo último); el texto de la 2 llega cuando la bola se para y el espiral
  se escribe cuando el sol casi llegó. Unos 3 s en total (antes 3,4).
- **"Centrada horizontalmente" se leyó como la vertical del sol de la parte 2** (614 a 1280, la mitad
  es 640): así el amanecer es una subida recta. **Tablet:** la línea no cruza esa vertical antes de
  meterse bajo las burbujas; la bola baja hasta el punto más bajo de ese tramo y el sol amanece desde
  ahí con un arco suave hacia su sitio (304 px a la izquierda en 760 de subida a 1000x1366).
- **Volver a la parte 1 (`bola-vuelve`)** es la ida armada con las dos partes en reposo, llevada a su
  final y reproducida hacia atrás, dentro de un timeline que avanza (así `progress(1)` sigue
  dejando la parte 1 en reposo y `onComplete` se dispara igual). El sol se pone, cambia por la bola
  y esta sube rodando a la cola mientras la línea se vuelve a extender. El texto sigue mandando: al
  revés, el de la parte 2 se va antes de que llegue el de la 1. 1, 2, 1, 2 repite las mismas cifras.
- **"Saltar intro"** desde la parte 1: la bola sale con la intro (rol `bola` con estado oculto escala
  0 y opacidad 0, como las demás piezas).

### 3. Mobile: el sol cae por detrás de las burbujas

- **Sin bola en la carga ni en reposo.** Mobile no la tiene en Figma (`1159:735`) y la cola sale de
  la pantalla por la derecha en mitad de su curva: no hay un "final de la cola" visible donde
  descansar, solo el borde de la pantalla. Sale `BOLA_MOBILE`.
- **Gesto a la parte 2:** el sol de la parte 2 cae desde arriba del lienzo (`power2.in`, 0,6 s base)
  mientras las burbujas siguen ahí (la parte 1 va encima, `zIndex` 1 solo durante la transición):
  cae por detrás de ellas hasta su sitio, que queda tocando el racimo, y se aplasta un poco al
  llegar (squash and stretch, D4). Las burbujas empiezan a irse a los 0,45 s base. **Para Johan:**
  "cae por debajo de las bubbles" se leyó como "por detrás"; el sol de la parte 2 está arriba del
  racimo, no debajo.
- Volver es la misma caída al revés: el sol sube por detrás de las burbujas que vuelven.

### Conservado

Entrada por pasos (texto, burbujas una a una, cinta con `power2.in`), "Saltar intro" y flechas (D10),
foco retenido durante las transiciones, listeners de D14 sin tocar (`use-intro-pin.ts` no cambió),
llegada a Bienvenida.

### Medido (CDP, dev server en :3000, scripts y capturas en `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-30-sep/4a102619-4612-4f9a-b653-f5d38898f6f9/scratchpad/r4-Q/`)

`viaje.js` (bola por fotograma, muestras cada 50 ms contra la línea central muestreada en 3000
puntos), `movil.js`, `ver1282.js`, `cintas.js`, `saltar.js`, `foco.js`, `oyentes.js`:

| Ventana   | Bola al terminar la carga          | Distancia máx. al trazo | Bola parada en x / sol x       | Relevo (ms) | Sol final    | Dos soles |
| --------- | ---------------------------------- | ----------------------- | ------------------------------ | ----------- | ------------ | --------- |
| 1280x800  | 1247,8, 574,3 (a 0,3 px del trazo) | 0,4 px                  | 614,7 / 614,4                  | 1377, 1375  | 614,4, 142,8 | 0         |
| 1920x1080 | 1567,8, 714,3 (0,3)                | 0,4 px                  | 934,5 / 934,4                  | 1369, 1378  | 934,4, 282,8 | 0         |
| 1000x1366 | 968,5, 953,5 (0,5)                 | 0,5 px                  | 794,6 (punto más bajo) / 490,6 | 1366        | 490,6, 236,5 | 0         |

- Relevo bola a sol: último fotograma de la bola contra el primero del sol, 0,1 a 0,3 px de centro y
  el mismo ancho (48,4 a 1280). Paso máximo por fotograma: bola 15 px, sol 13 px (sin saltos).
- 1, 2, 1, 2: misma cifra en las dos idas; al volver, la bola en su sitio de reposo con transform
  `none` y opacidad 1, parte 1.
- 390x844: el sol cae en x 203 constante (su sitio), termina con dx 0 y dy 0 respecto a su sitio en
  `?introPaso=2`; aterriza a 1052 y 1045 ms con 6 de 13 burbujas aún visibles; parte 1 con `zIndex`
  1 durante la caída; ninguna bola montada.
- Cintas: idénticas tras 2 s en las partes 1 a 3 a 1280 y 390; se mueven 17 de 17 burbujas y
  espirales y 4 de 4 garabatos negros de la parte 1.
- "Saltar intro" (clic en las partes 1 y 2 a 1280, Enter a 390, Espacio en la 3): igual que en D12
  (texto de Bienvenida 0 / 0,94 / 1 a 0, 900 y 4500 ms, foco final en `#bienvenida`); la bola tiene
  opacidad 0 a los 900 ms. `--reducido`: 0 botones, intro estática, Bienvenida con opacidad 1.
- Foco: Enter en avanzar y Tab a los 500 ms deja el foco en el grupo con `scrollY` 0; al terminar,
  en avanzar; Escape enfoca "Saltar intro".
- Listeners (`DOMDebugger.getEventListeners` en `window` y `document`): arriba del todo, `wheel` y
  `touchmove` no pasivos (a propósito, D14); en Bienvenida y en Impacto, ninguno, a 1280 y 390.
- `npm run type-check` y `npm run lint` limpios.

Capturas: `carga-<ancho>.png` (carga terminada), `descenso-<ancho>.png` (mitad del descenso),
`amanecer-<ancho>.png` (el sol subiendo), `caida-390x844.png` (mitad de la caída), `sol-390x844.png`,
`espiral1282-recorte-t0.png` y `-t3.png` (recortes de 180 px, por eso pesan menos de 10 KB).

### Sin probar

Trackpad físico, Safari y lector de pantalla, como en D10 y D12.

## D16. Quinta ronda (2026-10-01): la espiral de arriba queda quieta, el sol aterriza suave, el sol de mobile ya no salta en el relevo y hay favicon

Rama `30-sep`, frente R, sin commitear. Scripts y capturas en
`/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-30-sep/4a102619-4612-4f9a-b653-f5d38898f6f9/scratchpad/r5-R/`.

### 1. La espiral de arriba a la izquierda NO se anima (corrige la lectura de D15)

**D15 leyó al revés el pedido.** Johan señaló la espiral "un poco diferente" de arriba a la
izquierda de la parte 1 y D15 entendió que debía girar como las demás. Lo que Johan quiere es lo
contrario: **esa espiral queda quieta**, ni gira ni se mece. Mandó una captura (garabato negro en
espiral, tipo resorte, sobre crema con una franja amarilla); comparada con un recorte de 180 px
alrededor de cada espiral, es "Vector 1282" (`paso1-espiral-1282.svg`, Figma `1163:1178` en
desktop, `1420:429` en mobile), la única fuera del racimo y junto a la cinta amarilla.

- Conserva el rol `espiral` (entra con las burbujas, en su turno) y lleva una marca nueva en los
  datos, `quieta: true` (`IntroLayer.quieta`, `data-quieta` en el DOM).
- **Entrada y salida:** solo aparece y desaparece (escala de 0 a 1 con `back.out(1.4)` y
  opacidad), sin los -150° de giro de las demás (`oculto` mira `esQuieta`).
- **Reposo:** `crearReposo` la salta; tampoco entra en los garabatos que se mecen. Las otras tres
  siguen girando a 14 s por vuelta, en sentidos alternos.

Medido (`espiral.js`, 1280x800 y 390x844): durante la entrada, giro máximo 0° en la 1282 contra
82° a 147° en las otras tres; en reposo, transform `none` idéntico en dos muestras separadas 2 s,
y las otras pasan de 73,3° a 124,7° (1280) y de 99,4° a 150,9° (390): 25,7 °/s, 14 s por vuelta.
Recorte: `espiral1282-390x844.png` y `espiral1282-1280x800.png` (180 px, por eso pesan menos de
10 KB).

### 2. Mobile, parte 1 a 2: el sol aterriza sin tanto rebote

El rebote no era de la caída (que llega a su sitio con `power2.in`, sin pasarse) sino del squash
al llegar: se aplastaba a 0,62 de alto y 1,2 de ancho y volvía con `back.out(2.5)`, que se estiraba
por encima de su tamaño. Ahora el aterrizaje es corto: se aplasta a 0,88 de alto y 1,08 de ancho
(0,08 s base) y recupera su forma en 0,3 s con `back.out(1.2)`, un solo rebote pequeño
(`APLASTADA`, `RECUPERAR`, `CURVA_RECUPERAR` en `intro.motion.ts`). La caída y los tiempos del
texto y la salida de la parte 1 no cambian.

Medido (`sol.js`, borde superior del disco por fotograma desde que la caja llega a su sitio):

| Ventana | Hundido bajo el final, antes / ahora | Por encima del final, antes / ahora | Escala y mín./máx., antes / ahora | Cambios de sentido |
| ------- | ------------------------------------ | ----------------------------------- | --------------------------------- | ------------------ |
| 390x844 | 31,5 / 10 px                         | 6 / 0,5 px                          | 0,62-1,072 / 0,88-1,006           | 2 / 1              |
| 360x740 | 29 / 9,2 px                          | 5,5 / 0,5 px                        | 0,62-1,072 / 0,88-1,006           | 2 / 1              |
| 430x932 | 34,7 / 11 px                         | 6,6 / 0,6 px                        | 0,62-1,072 / 0,88-1,006           | 2 / 1              |

### 3. Mobile, parte 2 a 3: el salto del sol en el relevo

**Causa:** el sol de mobile de la parte 2 (`paso2-sol-mobile.svg`) trae en su caja el hueco de la
espiral amarilla: el disco ocupa solo el 72 % del ancho y el 86 % del alto, arriba a la izquierda
(`disco` en los datos, D12). El sol de la parte 3 llena su caja. El viaje de D3 lleva caja a caja,
así que a mitad del deslizamiento, en el fotograma del relevo, el disco visible saltaba **10,7 px
hacia la derecha** (mientras todo iba a la izquierda a unos 6 px por fotograma) y crecía 23,7 px de
ancho de golpe. Desktop y tablet usan para la parte 2 el mismo sol de la 3 y no tenían el salto.

**Arreglo:** el viaje mide lo que se ve (`cajaVisible`): para una pieza con `data-disco`, el disco
dentro de su imagen; para las demás, su caja como antes (`cajaDe` acepta una función de medida).
De paso, las cajas se miden con los grupos sin el mecido del reposo (`data-grupo` con
`transform: none` mientras se mide, y se restaura): medido mecido, la caja del barco viejo salía
inflada por el giro y en el relevo el barco nuevo era 10 px más ancho; ahora la diferencia es la
que crece el barco en un fotograma (4,4 px, igual sin reposo con `?quieto=1`).

Medido (`disco.js`, centro del disco visible por fotograma con rAF, la pieza visible de las dos;
ida 2 a 3 y vuelta 3 a 2; también con toques emulados a DPR 3 en 390x844):

| Ventana         | Relevo, dx del fotograma y sus vecinos (px), antes | Ahora, ida            | Ahora, vuelta      | Ancho en el relevo, antes / ahora |
| --------------- | -------------------------------------------------- | --------------------- | ------------------ | --------------------------------- |
| 390x844         | -6,27 / **+4,67** / -5,73                          | -5,76 / -6,19 / -5,08 | 5,07 / 6,22 / 5,45 | +23,7 / +1,6 px                   |
| 360x740         |                                                    | -5,32 / -5,70 / -4,69 | 4,70 / 5,43 / 5,03 | +1,4 px                           |
| 430x932         |                                                    | -5,96 / -6,83 / -5,97 | 5,62 / 6,49 / 6,37 | +1,6 px                           |
| 390x844, táctil |                                                    | -5,41 / -6,48 / -5,08 | 5,39 / 5,59 / 5,79 | +1,2 px                           |

Sin picos en ningún fotograma (un delta mayor que el doble de sus dos vecinos y de 1 px) en el sol
ni en el barco, ni en ninguna pieza de las partes 2 y 3 (`todo.js`). Nota sobre el criterio "pico
mayor que 2 veces la media": con `power3.inOut` el tramo central va unas 3 veces más rápido que la
media del recorrido (390x844: media 1,9 px, máximo 6,2), sin discontinuidad; por eso se compara
con los fotogramas vecinos. Desktop sin cambios: relevo del sol a 1280x800 -20,2 / -22,0 / -20,2.

### 4. Favicon

Johan dejó dos lunas de 134x134 con fondo transparente en
`public/images/favicons/`: `favico_purple.png` (luna azul morada, oscura) y `favico_yellow.png`
(luna crema, clara). Copiadas del checkout principal sin borrar los originales.

- **Tema claro del navegador** (pestaña clara): la morada, que contrasta con ella. **Tema oscuro**
  (pestaña oscura): la crema, que en una pestaña clara casi no se vería. Van como
  `<link rel="icon" media="(prefers-color-scheme: light|dark)">` en `pages/_document.tsx`.
- **Respaldo sin `media`:** la morada, porque casi todas las pestañas son claras. Va primero; los
  navegadores que entienden `media` se quedan con el que coincide.
- **`apple-touch-icon`:** la crema. iOS rellena la transparencia de negro en la pantalla de inicio,
  y sobre negro la morada apenas se ve.
- **`public/favicon.ico`:** la morada a 32x32, hecha con `sips` de macOS
  (`sips -z 32 32` y `sips -s format ico`, 4,4 KB, sin dependencias). No se enlaza: es para quien
  pide `/favicon.ico` por su cuenta, y quita el 404.
- **De paso, el aviso de `sizes`:** next/image avisaba de que `paso2-sol.png` (el reflejo del sol
  de la parte 2) tenía `sizes="100vw"` sin ocupar la pantalla. Cada capa calcula ahora su `sizes`
  como la fracción del lienzo que ocupa su caja (`sizesDe`, el lienzo nunca pasa del ancho de la
  pantalla; las que sangran siguen en `100vw`), y la precarga usa el mismo valor para reutilizar la
  descarga.

Medido: `curl -sI` da 200 en `/favicon.ico` y en las dos PNG; consola a 390x844, 1280x800 y
1024x1366 recorriendo la intro (`consola.js`): ningún 4xx ni 5xx, sin el aviso de `sizes`. Queda
un aviso de desarrollo de HMR (`isrManifest`) que no es de este frente.

### Conservado y regresiones

Desktop 1280x800 (`viaje.js`, D15): bola al terminar la carga en 1247,8, 574,3 (a 0,3 px del
trazo), relevo bola a sol en 614,5 / 614,4, sol final 614,4, 142,8, cero fotogramas con dos soles,
1, 2, 1, 2 igual. Rueda (`verif5/intro-rueda.js`): un paso por gesto, el tercero llega a
Bienvenida; listeners como en D14. `npm run type-check` y `npm run lint` limpios.

Capturas: `carga-1280x800.png`, `descenso-1280x800.png`, `amanecer-1280x800.png`,
`carga-390x844.png`, `sol-aterriza-390x844.png`, `parte2-390x844.png`,
`desliza-mitad-390x844.png`, `parte3-390x844.png`, `desliza-<ancho>-mitad.png`.

### Sin probar

Teléfono real (el aterrizaje y el deslizamiento solo se midieron en Chrome headless, también con
toques emulados) y el favicon en Safari y Firefox con tema oscuro.

## D17. Sin flecha de avanzar en la última parte de la intro (2026-10-01)

**Feedback** (Johan): "en la intro, en el último paso no necesitamos la flecha hacia abajo pues es
el último paso".

**Cuál es el último paso.** Los botones de D10 viven dentro de la intro (`IntroNavegacion` en
`intro-section.tsx`) y solo se ven en sus partes 1 a 3; Bienvenida es un paso más del gesto (D6)
pero no tiene botones. La última parte con botones es la 3 (`INTRO_STEPS.length - 1`). Ahí la
flecha de avanzar y "Saltar intro" hacían lo mismo: llevar a Bienvenida con la coreografía de
llegada (D12).

**Qué se hizo.**

- `puedeAvanzar` pasa de `true` fijo a `pin.stepIndex < INTRO_STEPS.length - 1`. En la parte 3
  quedan "Saltar intro" y la flecha de retroceder. El gesto, la rueda y las teclas siguen llevando
  a Bienvenida desde la parte 3 (D6): solo se quita el botón.
- **Foco.** Quien pulsa la flecha de avanzar en la parte 2 tiene el foco encima cuando la parte 3
  la quita. Los botones se esconden durante la transición y el foco pasa al grupo (D10); al
  reaparecer, el botón recordado ya no está y el foco cae en "Saltar intro", que desde ahí es el
  avance. No se pierde en el body. Medido por CDP (clic real en la flecha de la parte 2, 390x844):
  en la parte 3 el foco queda en `saltar`, botones visibles `saltar` y `anterior`.

Capturas `intro-paso3-390.png` e `intro-paso3-1280.png` en el scratchpad de la sesión
(`constructor-a/`).

## D18. En Bienvenida se puede bajar en cualquier momento, sin esperar su entrada (2026-10-02)

**Feedback** (Johan, ola 3 del 2-oct): "en la pantalla de bienvenida, a veces la gente no quiere
esperar a que termine de cargar la animación, deberían poder hacer scroll libremente en cualquier
momento en la bienvenida". Rama `2-oct`, sin commitear.

### Causa

Durante la llegada a Bienvenida (D6, unos 3,4 s medidos) la intro sigue enganchada con la capa fija
y la página no se mueve con nada: la llegada cuenta como una transición en curso
(`corriendoRef` y `llegandoRef` en `components/intro/use-intro-pin.ts`) y todo gesto, viejo o nuevo,
se traga.

- Rueda: un gesto nuevo con la transición corriendo se frena entero (`use-intro-pin.ts`, rama
  `if (corriendoRef.current)` de `onWheel`, `frenar()` en la línea 365).
- Dedo: con la intro enganchada, todo `touchmove` mientras corre se cancela
  (`if (t.hecho || corriendoRef.current)`, línea 472). Solo un dedo nuevo pasada la etiqueta
  `asentada` terminaba la llegada (D14, línea 438), y eso es casi al final.
- Teclado: flecha abajo, AvPág y Espacio se cancelan mientras corre (línea 423).
- La red de seguridad del scroll no suelta la capa durante la llegada (línea 498), a propósito: la
  página se desplaza por código.

### Qué se hizo

`soltarLlegada()` en `use-intro-pin.ts`: un gesto **nuevo** hacia abajo durante la llegada la
termina en el acto (`progress(1)`, el mismo camino que "Saltar intro" a media llegada y que el dedo
de D14) y ese mismo gesto pasa al scroll nativo. "Nuevo" es lo mismo que en el resto de la intro:
una rueda que `registrarRueda` abre como gesto nuevo (tras silencio, cambio de sentido o impulso
nuevo sobre la inercia), un dedo apoyado durante la llegada que sube (el que la disparó ya está
`hecho`) o una tecla que no es repetición. Al soltar se anula el "tragar" de D6, que es para el
gesto que la disparó, no para este.

Se mantiene: el gesto que trae Bienvenida desde la parte 3 sigue siendo un paso y su inercia, su
dedo o su tecla sostenida se siguen tragando hasta el final (una ráfaga no se salta media página).
Un gesto nuevo hacia ARRIBA durante la llegada se sigue tragando, y subir desde Bienvenida tras la
llegada no cambia. "Saltar intro", las flechas y Tab durante la llegada, sin cambios. No hay
listeners nuevos: la decisión vive dentro de los handlers que ya eran no pasivos durante la
llegada, y al soltar, `terminarLlegada` llama a `sincronizar` como siempre (D14).

**Por qué terminarla y no dejarla correr.** Dejarla correr obliga a soltar la capa fija a media
coreografía: la parte 3 a medio salir y la copia del sol que viaja (colgada de la capa) se irían con
la intro hacia arriba, y el sol rosado se quedaría sin disco hasta el relevo. Con el Lenguaje de
movimiento (docs/PATTERNS.md): "nunca se bloquea más de lo que dura la transición; salir siempre es
posible" (4) y "el reposo es sagrado" (11): al completarla, Bienvenida queda exactamente en su
reposo aprobado, y si la persona vuelve a subir la ve entera. El corte dura un fotograma y ocurre
mientras la página ya se mueve hacia EMI.

### Medido

CDP contra el servidor de desarrollo, desde `?introPaso=3`; el gesto nuevo arranca a D ms del
inicio de la llegada (`data-intro-llegando`). Sonda: `sonda.js` y `matriz.txt` en el scratchpad
de la sesión (`ola3/`).

- 390x844 táctil, disparo con un arrastre y arrastre nuevo de 400 px: con D = 100, 300 y 600 la
  llegada termina a los 90 a 100 ms del dedo nuevo, `scrollY` pasa de 844 a 929 a +300 ms y a 1229
  al soltar; EMI entra (su borde de arriba en 759 a +300 ms, en 459 al final).
- 1280x832 y 390x844 con trackpad (disparo con inercia de 1,8 s, corte, 40 ms y gesto nuevo con
  rampa e inercia): con D = 100, 300 y 600, `scrollY` 832 a 977 a +300 ms, a unos 1500 a +600 ms y
  2414 al final; EMI entra a +300 ms.
- Flecha abajo a 1280 con D = 300: la llegada termina a 14 ms y la página baja 40 px (lo de una
  flecha).
- Solo la inercia del disparo, sin gesto nuevo (390 y 1280): `scrollY` fijo en el borde de
  Bienvenida a 0, 500, 1500, 2500 y 4000 ms; la llegada dura entera (3,37 s).
- `getEventListeners` tras bajar: ningún `touchstart`, `touchmove` ni `wheel` no pasivo en
  `window` ni `document`, en todos los casos.
- `npm run type-check` y `npm run lint` limpios.

### Ampliación (2026-10-02): rueda robusta, muescas de ratón y dedo de Safari

El verificador de la ola 3 encontró tres problemas en la primera versión (informe y sondas en el
scratchpad de la sesión, `verificador-ola3/INFORME.md`).

1. **La inercia que trajo Bienvenida podía cortarla.** La primera versión soltaba la llegada con
   cualquier gesto nuevo de rueda, también uno abierto por "impulso nuevo" (`registrarRueda`). Una
   ráfaga irregular de un solo gesto (`10,24,22,44,22,61,24,39,77` y su inercia) se leía como dos
   gestos: la llegada se cortaba a los 540 ms y la página terminaba 1900 px más abajo.
   **Ahora**, durante la llegada, un gesto de rueda la suelta en el acto solo si se abrió tras un
   silencio (180 ms) o con un cambio de sentido. Un impulso solo cuenta si se cumplen tres
   condiciones: antes de él la inercia había caído a no más del 10 % de su pico y a no más de
   12 px (unos dedos que se apoyan en el trackpad la cortan casi a cero), el evento siguiente
   también es fuerte (un pico suelto por ruido o un evento doble por un hilo atrasado no tiene
   segundo evento) y pasaron 300 ms desde el inicio de la llegada (`LLEGADA_GUARDA_MS`,
   `LLEGADA_DECAIDO`, `LLEGADA_VALLE_PX` y `candidatoRef` en `use-intro-pin.ts`).
   Simulación de la lógica con 3000 gestos de trackpad con ruido: 0 % de cortes falsos con ruido
   de hasta ±80 % en el dedo, ±20 % en la inercia y 15 % de eventos dobles (antes 1,3 a 18 %
   según el criterio). Solo con ruido extremo (±50 % en la inercia y 30 % de eventos dobles) hay
   un 4,7 %, siempre en la cola y como mucho 684 px. Un gesto nuevo real a 300, 600 y 1500 ms la
   suelta en el 99 a 100 % de los casos.
2. **El ratón por muescas no bajaba.** Con muescas cada 100 o 150 ms nunca hay 180 ms de silencio:
   era un solo gesto, se tragaba entero durante la llegada y también después (el "tragar" de D6),
   y 30 muescas seguidas no movían la página. **Ahora** una serie de eventos separados por 60 ms o
   más y con el mismo `|deltaY|` (de 12 px o más), tres seguidos, o `deltaMode` por líneas, es
   rueda de ratón: durante la llegada (pasados los mismos 300 ms) y en el tragar de después, cada
   muesca abre un gesto nuevo (`muescaRef`, `MUESCA_*`). Hace falta el mismo tamaño y no solo el
   espacio entre eventos: con el hilo principal lento la inercia llega en eventos espaciados pero
   sumados, y con solo el espacio la propia inercia la atravesaba (medido: 5 de 5 ráfagas). En las
   partes 1 a 3 no se aplica: girar el ratón seguido sigue siendo un gesto y un paso.
3. **Dedo de Safari.** Un dedo apoyado durante la llegada cuyo primer movimiento iba hacia abajo o
   de lado (Safari manda movimientos de pocos px que Chrome no manda) se marcaba como "hecho" y
   quedaba tragado hasta el final. **Ahora** se frena sin marcarlo y suelta la llegada cuando ha
   subido 10 px desde donde se apoyó (`TOUCH_SOLTAR_LLEGADA`).
4. `soltarLlegada` llama a `sincronizar` al dejar de tragar: la rueda vuelve a pasiva en el acto y
   no en el primer `scroll`.

Los números de línea de la causa son de la primera versión. Hoy: rueda 459, teclado 515,
`asentada` 533, dedo 572, red de seguridad 599.

**Medido** (CDP, servidor de desarrollo, sondas del verificador y `ola3/rafagas.txt`,
`ola3/matriz2.txt`, `ola3/p-iphone.js`, `ola3/p-pasos.js` en el scratchpad de la sesión):

- Ráfagas irregulares desde la parte 3 (cinco secuencias, entre ellas la del informe, a 1280 y a
  390): ninguna atraviesa Bienvenida, `scrollY` fijo en su borde y llegada entera (3,37 s).
  Inercia con eventos sin esperar respuesta y tareas largas de 250 ms con CPU x4 y x6: igual.
- Muescas de 100 px desde la parte 3: cada 190 y 250 ms baja la 2.ª muesca; cada 150 ms, la 4.ª
  (a 454 ms); cada 100 ms, la 5.ª (a unos 400 ms); luego cada muesca baja 100 px. Antes, cada 100
  y 150 ms, ninguna de 30. Desde la parte 1, 6 y 15 muescas cada 100 ms avanzan una sola parte.
- Gesto nuevo a 100, 300 y 600 ms: trackpad a 1280, la página baja a los 300 ms del gesto (957 y
  luego 1565 a +600) y EMI entra (a 100 ms la llegada se suelta a los 422 ms, por la espera de
  300 ms); dedo a 390, la llegada termina a 201, 402 y 696 ms y la página llega a 1229.
- Dedo nuevo que primero baja 9 px y luego sube 400: la página llega a 1219.
- Ningún `touchstart`, `touchmove` ni `wheel` no pasivo en `window` ni `document` tras salir.
- `npm run type-check` y `npm run lint` limpios.

**Queda.** Un movimiento de trackpad a menos de 300 ms del gesto que trajo Bienvenida, o uno que no
corta la inercia casi a cero, se toma como parte de ese gesto y se traga, como en las partes 1 a 3.
Con el ratón, la entrada de Bienvenida dura una o dos muescas: es lo pedido.
