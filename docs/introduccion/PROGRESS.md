# Estado vivo: transiciones de la Introducción

> Esta carpeta documenta **solo** las transiciones de la Introducción (`components/intro/`). El
> resto del primer tramo (Impacto, Quiénes somos, y la Introducción estática original con sus 3
> partes) ya está cerrado y en producción; su historial vive en `docs/secciones-impacto/` y no se
> toca (D1).

Última actualización: 2026-10-01.
Las rondas 1 a 5 están en `main` (PR #17). Bienvenida como paso de la intro (D6, PR #20) y el
reposo más perceptible con el pelo en SVG y el desktop de Figma (D7 y D8, PR #21, merge `9861451`)
ya están en `main` y en producción (Vercel). Este documento queda como historial de esas rondas;
lo que sigue abierto sobre la intro (si algo) vive en `docs/CONTINUAR.md` y en las ramas en curso.

## Dónde vamos

| Intento        | Qué se hizo                                                                                                                                                   | Estado                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1 (2026-09-22) | Pin por partes con fade de opacidad por grupo y bloqueo por temporizador fijo. Worktree `22-sep`.                                                             | No aprobado. Se queda sin commitear en `22-sep`, solo como consulta. |
| 2 (2026-09-23) | Coreografía por roles con GSAP, gesto = una parte, sin reversa desde abajo, saltar con scroll fuerte                                                          | Johan la aprobó en general tras probarla con trackpad.               |
| 2, ronda 2     | Más lento (x1,4), el texto manda, relevo sin barcos duplicados, gestos encadenados                                                                            | Probada por Johan: pidió pulir el barco, la persona y la tierra.     |
| 2, ronda 3     | Dos variantes del relevo del barco (`?barco=a` / `?barco=b`), persona desde el doblez, tierra con fundido                                                     | Johan eligió la variante b del barco (squash and stretch).           |
| 2, ronda 4     | Barco b definitivo, persona lineal y como nota aparte, movimiento sutil en reposo                                                                             | Probada por Johan: pidió que la persona salga del borde inclinado.   |
| 2, ronda 5     | Recorte de la persona por el borde inclinado del barco                                                                                                        | Aprobado y en `main` (PR #17).                                       |
| Bienvenida     | Bienvenida como paso de la intro: relevo del sol, entrada por piezas, reposo (rayos; el pelo se retiró)                                                       | Aprobado y en `main` (PR #20).                                       |
| Pulido         | Pelo de la mujer en SVG (ondea desde la nuca), Bienvenida desktop según Figma `1280:9`, reposo más perceptible con dos niveles `?reposo=medio\|alto` (D7, D8) | Aprobado y en `main` (PR #21, merge `9861451`).                      |

El detalle del intento 2 (causas raíz del 1, umbrales, tiempos, qué se verificó y cómo) está en
`DECISIONES.md`, D2. La ronda 2 (ajustes de la diseñadora y tres bugs de la prueba de Johan), en D3.

### 2026-10-01: sin flecha de avanzar en la parte 3 (D17)

En la última parte de la intro solo quedan "Saltar intro" y la flecha de retroceder; el foco que
estaba en la flecha de avanzar cae en "Saltar intro". Verificado por CDP a 390 y 1280. Pendiente:
que Johan lo vea con teclado y en el celular.

### 2026-10-01: espiral de arriba quieta, aterrizaje suave, relevo del sol sin salto y favicon (D16)

Frente R, quinta ronda. **Corrige D15:** la espiral de arriba a la izquierda ("Vector 1282") no
debía girar sino quedarse quieta; ahora solo aparece y desaparece, y las otras tres siguen a 14 s
por vuelta. En mobile, el sol de la parte 2 aterriza con un squash pequeño y un solo rebote corto
(hundido 31,5 a 10 px, por encima 6 a 0,5 px a 390x844). En el deslizamiento de la parte 2 a la 3
el sol saltaba 10,7 px a contramano en el relevo porque su imagen de mobile trae el hueco de la
espiral; el viaje ya mide el disco visible y el relevo queda entre sus vecinos (ida y vuelta).
Favicon con luna morada en tema claro y crema en tema oscuro, `favicon.ico` sin 404 y sin el aviso
de `sizes`. Verificado por CDP (D16). Falta que Johan lo mire en su teléfono.

### 2026-10-01: espirales más rápidas, bola en la cola y amanecer (D15)

Frente Q, cuarta ronda. Las espirales negras giran 1,71 veces más rápido (14 s por vuelta); la de
arriba a la izquierda ("Vector 1282") ya giraba en esta rama. En tablet y desktop la bola llega
rodando al final de la cola en la carga y descansa ahí; con el gesto baja por la línea hasta la
vertical del sol y amanece como el sol de la parte 2 (reemplaza el salto de D12). En mobile no hay
bola: el sol cae por detrás de las burbujas. Volver es la misma ida al revés. Verificado por CDP
(D15). Falta que Johan lo mire: la lectura de "centrada" (vertical del sol), el arco en tablet y
"por debajo" como "por detrás" en mobile.

### 2026-10-01: Bienvenida en pantallas altas (D13)

La composición se centra en el alto y el hueco entre texto y palmera crece solo hasta 160 (antes
hasta 628 a 1024x1366). En celulares y tablets altos, lo que la ilustración no puede usar se reparte
arriba y abajo. 800 a 900 de alto y D9 sin cambios; llegada desde la intro verificada por CDP.
Falta que Johan lo mire en una pantalla alta real y valide el 40 % y el tope.

### 2026-09-24: Bienvenida cabe entera en el celular (D9)

Rama `24-sep-pulido`, sin commitear. En mobile y tablet el aire y las decoraciones escalan con el
alto de la pantalla (`--hero-k`) y la ilustración ocupa el alto que sobra sin deformarse: el hero
mide exactamente la ventana de 320x568 a 768x1024 en es, en y fr, sin solapes. Desktop idéntico.

### 2026-09-30: feedback del 30 de septiembre (D10)

Rama `30-sep`, sin commitear. Burbujas con los colores de Figma `1152:287`; entrada de la parte 1
por pasos (texto, burbujas y espirales una a una, la línea amarilla se escribe al final); las
espirales giran despacio en reposo; la bolita roja ya no está en la parte 1 en reposo: con el
primer gesto sale de debajo de las burbujas, rueda por la línea y cae, y el sol de la parte 2 entra
cayendo desde arriba; los espirales amarillos de las partes 2 y 3 se escriben al final de su
entrada. "Saltar animación" se reemplazó por "Saltar intro" y dos flechas accesibles, visibles al
final de cada paso. Verificado por CDP con cifras en D10.

### 2026-09-30: nubes a la deriva y nube nueva en desktop (D11)

Rama `30-sep`, sin commitear. Las nubes de Bienvenida derivan hacia la izquierda y vuelven, cada una
a su ritmo, con CSS y en pausa fuera de pantalla; en desktop se añadió "Vector 1313" y se movió
"Vector 5" como en Figma `1280:9`. Verificado por CDP con cifras en D11.

### 2026-10-01: segunda ronda del 30 de septiembre (D12)

Rama \`30-sep\`, sin commitear. La bolita roja salta en parábola al sol de la parte 2, en la mitad, y
se convierte en él con squash and stretch (el patrón del barco); las cintas amarillas quedan quietas
una vez dibujadas y se dibujan con \`power2.in\`; "Saltar intro" pasa por la llegada a Bienvenida (su
entrada por piezas no se pierde); la parte 1 sigue la composición nueva de Figma en desktop y
mobile; la nube del borde izquierdo de Bienvenida sigue al frame desde 1280. Verificado por CDP con
cifras en D12.

## Qué sigue, en orden

1. **Prueba de Johan de D10** con trackpad, ratón en la barra lateral y teclado. Números a tocar si
   algo se siente lento: `UNO_A_UNO`, `DIBUJO_LINEA_DURACION`, `VIAJE_BOLA`, `CAIDA_SOL` y
   `TRAZO_TRAS_PIEZAS` en `intro.motion.ts` (todo pasa además por `ESCALA_TIEMPO`). Y de D11,
   la deriva de las nubes: si se nota poco o mucho, `deriva` de cada nube en `decor-desktop.tsx`
   y `welcome.tsx`.
2. **Hecho en D12:** composición nueva de la parte 1. **Para Johan (D12):** confirmar que "donde cae
   el sol de la parte 3" era la mitad, sobre el sol de la parte 2; y que la nube 1309 a 1920 ya no
   quede pegada al borde (cambia lo decidido en D7).

Todo lo de D6, D7 y D8 fue aprobado por Johan y está mergeado (PR #20 y #21) y en producción. Lo
que queda abierto:

3. **Elegir nivel de reposo.** `?reposo=medio` (por defecto) y `?reposo=alto` siguen los dos
   disponibles para comparar (D8, regla 12: temporal). Falta que Johan elija uno y se borre el
   parámetro y el otro nivel.
4. Pendiente anotado, no pedido: en pantallas más bajas que el lienzo (portátil de 1280x700, móvil
   apaisado) la parte se centra y se recorta. Ver el final de D2. Lo decide Johan.
5. Pendiente anotado, no pedido: cambio de fuente de acento de Homemade Apple a Bradley Hand en
   otra iteración (no es de Google Fonts, hace falta el archivo con licencia web).

## Archivos del cambio

D10: `components/intro/intro-navegacion.tsx` y `intro.trazos.ts` (nuevos), `intro.motion.ts`
(entrada por pasos, trazos, viaje de la bola, espirales en reposo), `intro-section.tsx` (SVG del
trazo, bola, botones), `use-intro-pin.ts` (`irA`, sin trampa de Tab), `intro.data.ts` (roles
`espiral` y `bola`, trazos, sol de mobile partido), `locales/{es,en,fr}.json` (`intro.*`),
`public/images/intro/` (12 burbujas, `paso1-elipse-70`, `paso2-sol-mobile`, `paso2-espiral-mobile`).

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
