# Progreso: sección Impacto

## Ronda 5 (2026-10-01), D7: sin imán en táctil

- `use-iman.ts`: con `(pointer: coarse)` no se registra ningún listener del imán; el scroll con
  el dedo es nativo. Desktop con rueda o trackpad sigue igual. Verificado por CDP (ver D7).
- Pendiente: probarlo en iPhone y Android reales (Johan) y en un portátil con pantalla táctil
  (debe conservar el imán con el trackpad).

## Ronda 4 (2026-10-01), D6: título centrado y imán que no toma el mando

- Título "Así se ve el impacto en acción" centrado en su franja: 32/31 px de aire en desktop,
  28/28 en tablet; en mobile la franja reserva el alto del CTA "Súmate" y el título queda a 13,6
  del CTA y 13 del pie. Se quitó la excepción mobile de la ronda 3 (su pendiente queda resuelto):
  la sección define `--aire-arriba` y `--aire-abajo`, y la franja mide `--alto-titulo` siempre.
- Imán: 500 ms de quietud real, asentado propio con `requestAnimationFrame`, curva `t³` de 600 a
  900 ms según la distancia, cancelable por cualquier gesto o `scroll` ajeno.
- Verificado por CDP (`r4-P/` del scratchpad): ver D6. Pendiente: probarlo con trackpad físico y
  teléfono real (la inercia del trackpad de macOS manda `wheel` largo rato; con 500 ms de
  quietud el imán espera a que termine).

## Ronda 3 (2026-10-01): menos aire sobre el título en mobile

- Solo `components/impacto/titulo-impacto.tsx` (los demás archivos de Impacto eran de otro frente):
  en mobile el aire de arriba del título baja de 80 a 64 (`pt-16`) y la caja se acorta lo mismo
  (de 154 a 138); desde md todo sigue igual. 64 es lo justo bajo el CTA "Súmate" nuevo (termina
  en 59), que en en y fr cruza en horizontal la primera línea del título. Medido a 390x844: h2 de
  top 80 a 64, sin solape con el CTA en es, en y fr.
- Pendiente para quien tome `impacto-section.tsx`: bajar allí `--aire-arriba` mobile de
  `spacing.20` a `spacing.16` y quitar la excepción del título. Hoy las pantallas siguen restando
  el `--alto-titulo` completo (154), así que bajo el título fijo quedan 16 de beige sin contenido.

## Estado (2026-10-01), ampliación de D4

Arreglos del segundo verificador, rama `30-sep`, sin commitear (DECISIONES.md, ampliación de D4):
el imán ya no es `scroll-snap` de CSS sino `useIman` en JS, que asienta solo al terminar el
scroll y solo hacia adelante, así que la rueda muesca a muesca ya no queda atrapada; y las
lámparas y la copa caben en pantallas bajas (ilustración topada por alto en mobile y tablet).

- Archivos: `components/impacto/use-iman.ts`, `impacto-section.tsx`, `bloque-impacto.tsx`.
- Verificado por CDP (scratchpad `verif2-arreglos/`): rueda de 100 px cada 150 y 250 ms
  atraviesa Impacto en los dos sentidos en 4 tamaños, empujón de 0,2 pantallas asienta a 0 px,
  `scrollSnapType` `none` en toda la página, "Inicio" y "Terminar" bien, pantallas del alto
  exacto en 7 tamaños. type-check y lint limpios.

**Pendientes:**

1. Probar con ratón y trackpad físicos (Windows y macOS) y Safari, sobre todo la sensación del
   empujón del 15 %.
2. En pantallas bajas las lámparas y la copa quedan más chicas (311 px de ancho a 375x667, 379 a
   1000x800). Si Johan prefiere el dibujo grande, se quita el tope y la pantalla crece.

## Estado (2026-09-30), D4

Hecho en la rama `30-sep`, sin commitear (ver DECISIONES.md, D4): cada par texto más imagen a
pantalla completa (`min-h-dvh`) con imán `proximity` que solo se enciende mientras Impacto está
arriba; más aire entre el título y el mapa (y el título por debajo de la navegación flotante en
mobile); entradas en una sola secuencia pausada al asentarse cada bloque, con la luz intacta.

- Archivos: `components/impacto/impacto-section.tsx`, `mapa-impacto.tsx`, `bloque-impacto.tsx`,
  `use-iman.ts` y `use-asentado.ts` (nuevos), `styles/global.css` (solo el bloque de Impacto:
  `--resto` de desktop y la animación de los bloques).
- Verificado por CDP en 5 tamaños (snap `none` en intro y mapa, encaje a 0 px tras scroll
  parcial, "Terminar" llega al tope, pantallas del alto del viewport, nada cortado ni bajo la
  navegación, sin scroll horizontal). type-check y lint limpios.

**Pendientes de D4:**

1. Sin probar con trackpad físico, Safari (sin `scrollend`, usa la espera de 150 ms) ni en un
   teléfono real (la barra del navegador cambia `dvh`).
2. El mapa de la primera pantalla en mobile queda más chico (320 px de ancho a 390x844, antes 385) para que el aire nuevo quepa sin salirse de la pantalla. Si Johan lo prefiere grande, la
   primera pantalla puede crecer y el imán deja leerla entera.
3. Superado el 2026-10-01: ya no hay `proximity` (ver la ampliación de D4).
4. El pendiente de D3 (el botón flotante tapaba el párrafo en mobile) ya no aplica: la navegación
   va arriba a la izquierda y no tapa nada en reposo.

## Estado (2026-09-25), D2

Hecho en la rama `24-sep-pulido`, sin commitear (ver DECISIONES.md, D2):

- Mobile y tablet: una sola distancia imagen-texto, `mt-xl` (40 px), en los cinco bloques
  (antes 138, 50, 75, 92 y -31 en el mapa).
- Entrada de la primera fila (título, flor, mapa, territorios, etiquetas) pausada, en 2,1 s y
  solo cuando la cortina de "Terminar" / "Saltar mapa" ya se fue. Territorios por opacidad en vez
  de `fill`.
- Archivos: `components/impacto/mapa-impacto.tsx`, `bloque-impacto.tsx`, `bloques.data.ts`,
  `use-sin-cortina.ts` (nuevo), `styles/global.css` (bloque "MAPA DE IMPACTO"),
  `components/education-map/cortina.ts` (marca y evento de la cortina) y un comentario de
  `coreografia.ts`; párrafo del mapa de impacto en `docs/PATTERNS.md`.

**Cómo se verificó:**

- Distancias por CDP (`getBBox` del mapa, cajas de los lienzos, que el escaneo de píxeles mostró
  ceñidas al dibujo) a 360x640, 390x844, 428x746 y 768x1024 en es, en y fr, tras la animación:
  42, 40, 40, 40, 40; entre bloques 120 (150 en tablet). Capturas `antes|despues-<ancho>-<lang>-<tramo>.png`
  en el scratchpad (las de 360 y 428 "antes", con el código de `main`).
- `medir-resaltado` de Impacto a 360, 390, 428, 768, 1280 y 1512: 36 de 36 en cada idioma.
- Línea de tiempo con un sondeo propio por CDP que muestrea estilos calculados en cada frame
  (cortina emulada con los tiempos de `coreografia.ts`, scroll normal a 14 px por frame y el flujo
  real con clic en "Saltar mapa"); CPU 4x: 0 frames > 34 ms; reduced motion: nada se mueve.
- Desktop 1280 y 1512: idéntico salvo 289 px de antialiasing en el mapa (ver D2).
- `npm run type-check` y `npm run lint` limpios.

## Estado (2026-09-24)

Hecho en la rama `24-sep-pulido`, sin commitear (ver DECISIONES.md, D1):

- Desktop (>= 1024) a dos columnas con filas intercaladas; el título de la sección junto al mapa;
  aire superior de 112 px tras el Mapa educativo. Mobile y tablet sin cambios.
- Archivos: `components/impacto/impacto-section.tsx`, `bloque-impacto.tsx`, `mapa-impacto.tsx`.

**Cómo se verificó:**

- Capturas antes y después con `scripts/captura.js --ancla impacto --tras 4500 --y <tramo>` a
  390x844, 768x1024, 1280x832, 1512x982 y 1920x1080 en es, en y fr
  (`antes|despues-<ancho>-<lang>-<tramo>.png` en el scratchpad de la sesión). A 390 y 768 las 30
  parejas son idénticas byte a byte; se tomaron con el código de `main` y con el nuevo en el
  mismo minuto, porque otros constructores cambiaban a la vez secciones de más arriba (el
  desplazamiento de la página cambia el grano del filtro rasgado y daba diferencias falsas).
- Sonda CDP por fila a 1280, 1512 y 1920 en los tres idiomas: ilustración y texto del lado
  esperado, diferencia de centros verticales 0 o 1 px, solape entre texto (con sus tiras de
  resaltado) y dibujo (con sus etiquetas) de 0 px, sin scroll horizontal. Caracteres por línea
  del párrafo: las frases que se parten lo hacen entre 45 y 57; las cortas (entre 23 y 64
  caracteres) caben en una línea.
- `node scripts/medir-resaltado.js --usos impacto-titulo1..4,impacto-cierre,impacto-etiquetas`:
  30 de 30 en cada idioma.
- Animaciones sondeadas a 150 y 3500 ms por fila (ver D1).
- `npm run type-check` y `npm run lint` limpios.

## Título fijo, mapa centrado y texto primero (2026-10-01), D5

El título de la sección acompaña cada bloque fijo arriba y se suelta al llegar a Quiénes somos;
el mapa queda centrado en el alto útil (0 px de diferencia de 1024 a 1920); cada bloque entra en
cuanto su pantalla asoma, el texto primero (visible a 153 ms del gesto) y el cambio de la
ilustración tras asentarse; la luz sin cambios. PageDown y Espacio corregidos para avanzar un
bloque con el título encima. Verificado por CDP en 9 tamaños y 3 idiomas (scripts y capturas en
`r2-L/` del scratchpad de la sesión). type-check y lint limpios.

Pendiente: probar con trackpad físico, Safari y teléfono real (la barra de direcciones de mobile
cambia `dvh` y con ella el alto útil).

## Telón (2026-09-25)

El traspaso de "Terminar" a Impacto ya no sube una cortina: fundido de 400 ms, salto, fundido de
salida de 500 ms, e Impacto entra 120 ms antes del final con movimientos de 4 a 8 px (D2, punto 3).
Verificado con el flujo real por CDP (línea de tiempo cada 50 ms, capturas `telon-<ms>.png`), CPU
4x sin frames lentos, reduced motion sin cortina. type-check y lint limpios.

## Encaje (2026-09-25), D3

La primera fila (título de sección, mapa con etiquetas y el bloque "7 territorios") cabe entera
en la primera pantalla en 360x640, 375x667, 390x664, 390x844, 428x746, 768x1024, 1280x720,
1280x832, 1440x900, 1512x982 y 1920x1080, en es, en y fr: flor al final del título, menos aire y
un mapa que mide lo que quepa. Verificado por CDP con Impacto en top 0 (sondeo de cajas), capturas
`encaje-<ancho>x<alto>-<lang>.png`, `medir-resaltado` 54 de 54 por idioma, línea de tiempo del
telón sin cambios. type-check y lint limpios.

## Pendientes

1. Resuelto (2026-09-25): Johan descartó el título de sección junto al mapa; vuelve centrado
   arriba en desktop y la fila 1 es mapa y cierre (D1). Medido a 1280, 1512 y 1920 en es, en y
   fr: centros alineados, 0 solapes, `medir-resaltado` 18 de 18; mobile y tablet idénticos a la
   versión anterior (A/B por captura con el mismo código salvo este cambio).
2. Resuelto: a 1024 el cierre del mapa en español dejaba "a Colombia." sola. El párrafo del cierre
   lleva `lg:text-balance`; sin viudas en es, en y fr a 1024, 1280, 1512 y 1920 (líneas de 27/26,
   33/26 y 34/41 caracteres, o una sola en español desde 1280). Mobile y tablet siguen idénticos.
3. Resuelto (2026-09-25): a 1024 en francés quedaban "par an." y "toujours été là." solas. Los
   párrafos de los cuatro bloques llevan también `lg:text-balance`. Revisados todos los párrafos
   de Impacto en es, en y fr a 1024, 1280, 1512 y 1920: ninguna última línea de una o dos palabras
   (la más corta, 23 caracteres, es un párrafo de una sola línea). Mobile y tablet idénticos.
4. Tablet de Impacto sigue siendo la columna mobile escalada (D7 de `docs/secciones-impacto/`);
   no se tocó.
