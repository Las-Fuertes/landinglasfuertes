# Feedback del 30 de septiembre: roadmap

Rama `30-sep` (worktree `~/orca/workspaces/landinglasfuertes/30-sep`), creada desde `origin/main`
en `21bca2d`. El feedback original completo está en `FEEDBACK.md` (misma carpeta). Cada frente
escribe sus decisiones en la carpeta de su sección (`docs/<seccion>/DECISIONES.md` y `PROGRESS.md`);
este archivo solo ordena el trabajo y registra el estado de cada ola.

## Respuestas de Johan antes de construir (2026-09-30)

1. **Navegación accesible de la intro**: "Saltar intro" y dos flechas (retroceder si se puede,
   avanzar si se puede), en el lugar del actual "Saltar animación". Sin puntos: ocupan espacio y
   son difíciles de clicar. Aparecen desde el primer paso y en todos, cada vez al final de las
   animaciones y transiciones de ese paso. Tiene que ser bien accesible (Tab, lector de pantalla,
   teclado).
2. **Impacto a pantalla completa**: scroll libre con imán (`scroll-snap`), cada par texto + imagen
   del alto del viewport. No se secuestra el scroll.
3. **Transparencia**: clic en "Transparencia" abre un menú con los años (hoy 2025); cada año abre
   su PDF en otra pestaña. Agregar un año = el PDF y una línea en un archivo de datos.
4. La fuente de acento pasa a **Indie Flower** (Google Fonts). Esto reemplaza el plan anterior de
   Bradley Hand.

## Olas (máximo 2 constructores a la vez, archivos sin solape)

| Ola | Frente                                                                                                                                                | Punto del feedback | Archivos dueños                                                                                                                        |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | A. Intro: colores de bubbles, entradas por pasos, bolita roja que recorre la línea y cae como sol, espirales que se dibujan, "Saltar intro" + flechas | 1                  | `components/intro/`                                                                                                                    |
| 1   | B. Navegación flotante (reemplaza el botón Súmate), footer nuevo con transparencia, fuente Indie Flower                                               | 2, 9, 10           | `components/layout/`, `components/sumate/sumate-flotante.tsx`, `pages/_app.tsx`, `pages/_document.tsx`, `tailwind.config.*`, `styles/` |
| 2   | C. Mapa: SVG nuevo, modales desktop según Figma, modal mobile más alto y centrado, botones 40 y cerrar 30                                             | 5                  | `components/education-map/`                                                                                                            |
| 2   | D. Bienvenida (nubes a la deriva, nubes nuevas desktop) y Tripulantes (olas y barco animados, mar al borde izquierdo, más aire)                       | 3, 4               | `components/welcome/`, `components/donations/`                                                                                         |
| 3   | E. Impacto: pares a pantalla completa con imán, aire del título, entradas más intencionadas (la luz se queda)                                         | 6                  | `components/impacto/`                                                                                                                  |
| 3   | F. Quiénes somos: desktop y mobile finales de Figma                                                                                                   | 7                  | `components/quienes-somos/`                                                                                                            |
| 4   | G. Formulario de donación: modal a pantalla completa en desktop, sheet en mobile, bordes y fondo al look de la página                                 | 8                  | `components/sumate/`                                                                                                                   |
| 4   | H. Auditoría del aire entre título y texto en toda la página                                                                                          | nota del 9         | lectura global, cambios mínimos                                                                                                        |

`locales/*.json` es compartido: cada constructor añade solo sus claves con ediciones pequeñas y
relee el archivo antes de editar.

Tras cada ola, un verificador independiente (opus) revisa ambos frentes antes de que Johan pruebe.

## Estado

- Ola 1: A (intro) terminado el 2026-09-30 (`docs/introduccion/` D10). Abiertos: Figma también
  movió la composición de la parte 1 (racimo y bolita), no se tocó; transición 1 a 2 de unos 3,4 s;
  sin probar con trackpad físico, Safari ni lector de pantalla. B terminado el 2026-09-30 (`docs/navegacion/` D1 a D3); abiertos:
  destino de "Términos y condiciones" (no hay página), footer mobile y tablet sin frame de Figma
  (armado apilado, validar con diseño), `components/contact/` quedó sin uso.
- Respuesta de Johan a los abiertos de B (2026-09-30): generar una página de Términos y
  condiciones con el contenido que ya tiene el proyecto (aviso de menores, uso de imágenes e IA,
  cookie del aviso, donaciones), diseñar un footer propio para mobile y tablet, y BORRAR el
  formulario de contacto (`components/contact/` y sus claves). B retomado con esto al terminar A y terminado (`docs/navegacion/` D4 y
  D5): `/terminos` en es, en, fr con marcadores legales en amarillo que Johan debe completar (NIT,
  dirección, representante legal, correo, reembolsos, certificados de donación, ley aplicable);
  footer propio en mobile y tablet; `components/contact/` borrado. Abierto: `components/coming-soon/`
  (otro formulario sin montar) aún usa `modal.*`.
- Ola 2: D (Bienvenida y Tripulantes) lanzado al terminar B. C (mapa) terminado
  (`docs/mapa-educativo/` D11): frame `1338:3182` es duplicado de Clubes. Abiertos para Johan:
  edades de Clubes (Figma "10 a 14", locale "6 a 11"); cintas del título de Voces se pisan en
  Figma, se dejaron sin solape; `medir-resaltado` marca FALLA en desktop solo por el tope de
  sobresalida (27 px contra 24).
- Ola 2: D terminado (`docs/introduccion/` y `docs/donaciones/`, entradas nuevas): nubes con
  vaivén propio, nube desktop nueva (reusa `left-cloud.svg`), olas y barco en capas animadas, mar
  al borde, Donaciones `min-h-dvh`. Abierto: el aire nuevo de Donaciones no viene de un frame.
- Ola 3: E (Impacto) lanzado al terminar C; F (Quiénes somos) lanzado al terminar D.
- E y F se cortaron por límite de API (429) y se retomaron con SendMessage. F terminado
  (`docs/quienes-somos/` D1 y D2): sale Karina Cely, cambian cargos de Paola, Lina, Vanessa y
  Adriana. Dudas para Johan: "Vanessa Córtes" (¿Cortés?), "Cofundadora" en vez de "Co-Fundadora",
  cargo de Paola en fr parte en tres líneas a 1024.
- E terminado (`docs/impacto/` D4): imán `proximity` (con `mandatory`, "Inicio" quedaba atrapado
  en Impacto), activo solo con Impacto arriba; título a 40 px del mapa (65 en desktop); en mobile el
  mapa baja de 385 a 320 px de ancho para que el primer bloque quepa. Sin probar en trackpad
  físico, Safari ni teléfono real.
- Ola 4: G terminado (`docs/sumate-drawer/` D3): modal a pantalla completa en desktop, sheet con
  borde rasgado en mobile, botones en azul por contraste AA, tarjeta de proyecto destacado solo si
  la campaña tiene foto o meta. Abiertos: enlace de ubicación sin pin exacto de la sede; el botón
  "Reintentar" de `/gracias` comparte componente y cambió de aspecto; pago real con Bold sin probar
  (probarlo en preview de Vercel). H (aire título-texto, `AIRE.md`) lanzado al terminar G.
- Verificador 1 (olas 1, 2 y F): aprobado con observaciones, ninguna alta ni media. Se mandaron a
  arreglar: Tab durante una transición de la intro sacaba el foco a EMI y soltaba el pin;
  `aria-controls` a un id inexistente con los menús cerrados. Para Johan: la bola cae en una
  vertical distinta de donde entra el sol (no se lee como la misma bola). Menores sin arreglar:
  algunos `text-[0.77rem]` y similares a mano; favicon 404 y `sizes` del sol, previos a la rama.
- H terminado (`AIRE.md`): escala 40 px (`xl`) título-texto, 65 px (`xxl`) en desktop cuando
  sigue un dibujo grande; cambiaron EMI (18/36 a 40) y Súmate mobile (25 a 40); excepciones
  justificadas en AIRE.md. PATTERNS.md ya describe Súmate como modal a pantalla completa.
- Arreglos del verificador 1 hechos (foco retenido en la intro durante transiciones, ampliación
  de D10; `aria-controls` solo con el menú abierto).
- Verificador 2 (E, G, H): aprobado con observaciones, pero con un hallazgo alto. El imán CSS
  `proximity` de Impacto atrapa la rueda del ratón muesca a muesca (Chrome reasienta tras cada
  muesca) y sigue activo en el tope de Quiénes somos. Además: un texto negro sobre azul en
  Súmate "Con cosas" (1,44:1) cuando falta `NEXT_PUBLIC_WHATSAPP_NUMBER`; los bloques 3 y 4 de
  Impacto no caben en viewports bajos; el enlace de Maps es chico. Lo de Quiénes somos en y≈8750
  o 12840 no es bug: el recorrido del mapa se mide unos 540 ms tras cargar. Arreglos lanzados;
  el agente se cortó por límite de API (429, se reinicia a las 00:40 hora Bogotá del 2026-10-01)
  cuando ya iba en la verificación (type-check, lint, contraste y tamaño del enlace). Se retoma
  con SendMessage pidiéndole mirar `git status`; si se perdió, un constructor nuevo con el
  INFORME del verificador 2 (`scratchpad/verif2/`) y este párrafo como contexto.

- Arreglos del verificador 2 terminados (retomado tras el 429): el imán de Impacto pasó de CSS
  `scroll-snap` a JS (`components/impacto/use-iman.ts`): asienta solo al terminar el scroll, nunca
  hacia atrás, hacia el bloque siguiente si está a menos del 30 % o si el gesto recorrió al menos
  15 %; sin gesto, con dedo puesto o con movimiento reducido no actúa. Lección: CSS snap
  `proximity` atrapa la rueda de ratón muesca a muesca en Chrome, incluso solo en bloques que
  caben; no volver a él. Rueda verificada en ambos sentidos a 1280x800, 390x844, 1920x1080 y
  375x667. Bloques 3 y 4 caben en viewports bajos; contraste de Súmate 7,43:1; Maps 52x48.

- Frente M (dedo pegado en Bienvenida e Impacto, docs/introduccion/DECISIONES.md D14): lección,
  un `touchmove` con `passive: false` en `window` o `document` (el de la intro y el de Swiper)
  vuelve bloqueante todo el scroll táctil y el dedo espera al hilo principal; ahora solo se ponen
  mientras pueden actuar, y la cola de la llegada ya no se come el dedo.

## Ronda 2 (2026-10-01, `FEEDBACK-2.md`)

| Tanda | Frente                                                                                                                                                                           | Archivos dueños                                                                                                      |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1     | I. Intro (sol cae al centro con la conversión del barco, cintas quietas y con ease-in, Saltar intro conserva la entrada de Bienvenida, composición parte 1) y nube de Bienvenida | `components/intro/`, `components/welcome/`                                                                           |
| 1     | L. Impacto (mapa centrado en desktop, título sticky, textos primero)                                                                                                             | `components/impacto/`                                                                                                |
| 2     | J. Fuente Pangolin, Difunde con Instagram y LinkedIn, EMI (aire inferior y cards `1297:2,4,5,6`)                                                                                 | `pages/_app.tsx`, `tailwind.config.js`, `components/sumate/difunde.tsx`, `components/emi/`, `components/principles/` |
| 2     | K. Mapa (cintas que se pisan como Figma, borde creativo de las imágenes, edades), `/terminos` con datos reales, borrar `coming-soon`                                             | `components/education-map/`, `pages/terminos.tsx`, `components/coming-soon/`                                         |

Luego un verificador 3 sobre la ronda entera.

- Tanda 1 lanzada (I y L). I terminado (`docs/introduccion/` D12): la bola salta en arco y
  aterriza sobre el sol de la parte 2 (cerca del centro) con squash and stretch como el barco;
  el sol de la parte 3 NO está en el centro (398 px a 1280), así que se interpretó "la mitad"
  como el sol de la parte 2: pendiente de confirmar con Johan. Cintas quietas, dibujo `power2.in`,
  Saltar intro reproduce la entrada de Bienvenida, parte 1 según Figma (texto mobile a 300 de
  ancho por el francés), nube "Vector 1309" recolocada (cambia lo aceptado en D7 para 1920).
- J terminado (`docs/emi/`, ampliación de D3 en `docs/navegacion/`): Pangolin en todo
  `font-acento`; Difunde con Instagram y LinkedIn; EMI abajo de 8/31/29 a 48/46/69 px; las cards
  son las estampillas del slider, ahora en HTML con texto traducible. Abierto: el azul `#2CA0FF`
  de las cards quedó como hex en el CSS del slider (falta token, se le pasa al verificador 3);
  cuatro imágenes viejas de estampillas sin uso.
- K lanzado al terminar J.
- L terminado (`docs/impacto/` D5): mapa centrado (0 px), título como componente sticky
  (`titulo-impacto.tsx`), entrada por bloque al asomar (`use-entrada-bloque.ts` reemplaza a
  `use-asentado.ts`), texto visible a los 153 ms; corrigió PageDown/Espacio que se saltaban un
  bloque con el título fijo. Sin probar en trackpad, Safari ni teléfono real.
- K terminado tras retomarlo por 429 (`docs/mapa-educativo/` D12, `docs/navegacion/` D4 y D5):
  cintas que se pisan solo en el modal desktop; marco de pincel exportado de Figma
  (`marco-foto.svg`, igual en las cinco paradas; mobile sin marco, como Figma); edades ya estaban
  bien en los locales; /terminos con datos reales y sin marcadores; `coming-soon` borrado.
  Huérfano: `components/app-image/` (no se borró).
- Verificador 3 lanzado sobre I, J y L (y K cuando termine), con encargo de pasar el hex de las
  cards a un token.

- Verificador 3 (ronda 2 entera, retomado tras 429): aprobado con observaciones, ninguna alta ni
  media. Pasó el hex de las cards a `blue.cielo` en tailwind. Bajas: intro en tablet apaisada
  (1000x800) deja el sol de la parte 2 casi fuera y corta el texto (layout previo); URL de LinkedIn
  duplicada en footer y Difunde; favicon 404 y `sizes` del sol, previos.

## Ronda 3 (2026-10-01)

Pedido de Johan: correo de la fundación `fundacionlasfuertes@gmail.com`; enlace nuevo del plan
mensual `https://mpago.la/1bHZ1uA`; menos aire arriba del título de Impacto en mobile; ocultar
temporalmente el menú flotante y dejar en su lugar solo un CTA "Súmate" (muy importante para la
fundación y hoy casi escondido); bug en producción: en mobile, al terminar la animación de
Bienvenida, el scroll con el dedo se queda pegado un momento y luego se suelta (también en
Impacto); barra inferior azul del mapa en mobile más baja y con el contenido centrado; borrar
`components/app-image/`. El sol de la parte 2 cayendo cerca del centro no tuvo respuesta: se deja.

- M (bug de scroll táctil, causa raíz en prod y en la rama) y N (todo lo demás) lanzados en
  paralelo.
- N terminado: correo cambiado; el plan mensual salía de una variable de entorno y ahora va fijo
  en el código (`sumate.data.ts`), así que la variable de Vercel se puede borrar; CTA "Súmate"
  120x44 en lugar del menú (`MENU_ACTIVO = false` en `sumate-flotante.tsx`); título de Impacto
  mobile de 80 a 64 px arriba (falta `--aire-arriba` mobile a `spacing.16` en
  `impacto-section.tsx`, encargado a M); barra del mapa mobile de 77 a 52 px, centrada (D13);
  `components/app-image/` borrado.
- Johan aprueba el sol de la parte 2 cayendo cerca del centro. Pide además: CTA "Súmate" con forma
  muy parecida al selector de idioma; Bienvenida en pantallas altas (desde ~970 px) con el aire
  palmeras-texto mejor repartido; mar de Tripulantes mejor repartido en pantallas muy anchas.
  Frente O lanzado en paralelo con M.
- O terminado (ampliación de D1 en `docs/navegacion/`, D13 en `docs/introduccion/`, D4 en
  `docs/donaciones/`): CTA como píldora gemela del selector de idioma con chip azul dentro;
  Bienvenida centrada en alto con tope de 160 px entre texto y palmera (sin cambios en alturas
  normales); olas repartidas a lo ancho desde 1512. Abierto: iPad Pro vertical (1024x1366) aún
  deja ~300 px arriba y ~270 abajo en Bienvenida.

## Qué sigue, en orden

1. Johan prueba en localhost:3000 con trackpad, ratón y móvil.
2. Respuestas pendientes de Johan: edades de Clubes; cintas de Voces; "Vanessa Córtes" y
   "Cofundadora"; cargo de Paola en fr a 1024; bola y sol en verticales distintas; composición de
   la parte 1 movida en Figma; datos legales de /terminos; borrar `components/coming-soon/`; pin
   exacto de la sede en Súmate; aire de Donaciones sin frame.
3. Commit, PR y merge solo cuando Johan lo pida; probar el pago con Bold en el preview de Vercel.
4. Al cerrar: actualizar `docs/CONTINUAR.md` y la sección "Trabajo en curso" de CLAUDE.md.

- Ola 2: C (mapa) lanzado al terminar B, en paralelo con A.

## Verificador 4 (ronda 3, 2026-10-01)

Aprobado con observaciones, nada alto. Espacio en Impacto NO es regresión (avanza un bloque; el
fallo era del script de prueba con la tecla en repetición). Medios mandados a arreglar, misma
familia que D14: el listener `wheel` no pasivo de la intro queda puesto para siempre en `window`
(toda rueda espera al hilo principal, ya en producción) y el `touchmove` de Swiper en `document`
hace esperar al dedo cerca de EMI. Bajos: CTA a 1,7 px del título de Impacto en fr a 768 (no
tapa); Bienvenida a 1280x832 mide 5 px más que la pantalla (solo relleno); favicon 404 y aviso
de next/image previos.

## Ronda 4 (2026-10-01, `FEEDBACK-3.md`)

- P (Impacto: título más arriba y centrado en su franja; imán con espera >= 500 ms y curva lenta
  al inicio) lanzado en paralelo con los arreglos del verificador 4.
- Q (intro: espirales 1,5x, espiral de arriba a la izquierda animada, bola que llega a la cola en
  la carga y baja por la línea hasta el centro como amanecer en desktop, cae bajo las bubbles en
  mobile) espera a que terminen los arreglos del verificador 4, que tocan `use-intro-pin.ts`.
- Arreglos del verificador 4 terminados (ampliación de D14): el `wheel` no pasivo de la intro solo
  actúa mientras la intro puede actuar (0 de 10 eventos bloqueantes fuera de ella, antes 10 de
  10); Swiper 12.1.3 no permite configurar sus listeners de toque, así que se re-registran como
  pasivos (0 de 20 bloqueantes, antes 20 de 20) sin perder arrastre, scroll vertical ni autoplay.
- Q (intro) lanzado al terminar esos arreglos, en paralelo con P.
- P terminado (`docs/impacto/` D6): título centrado en su franja (32/31 px a 1280; en mobile la franja reserva el alto del CTA y pasa a 154 px); imán espera 500 ms de quietud y asienta con curva cúbica en 600 a 900 ms, cancelable.
- Q terminado (`docs/introduccion/` D15): espirales a 14 s por vuelta (antes 24); "Vector 1282"
  ya giraba en la rama (en producción solo se mecía); bola que acompaña el dibujo y reposa en la
  cola, baja por la línea hasta la x del sol y se releva por el sol que sale; en tablet la línea
  no llega a esa x y el sol sale en leve diagonal; mobile sin bola, el sol cae detrás de las
  bubbles. Para confirmar con Johan: "centrado" leído como la x del sol, la diagonal en tablet y
  "debajo" leído como "detrás".
- Verificador 5 (ronda 4 y arreglos del 4) lanzado.
- Verificador 5: aprobado con observaciones, nada alto ni medio. Bajas: en fr a 768 el CTA queda
  a 2 px del título de Impacto (si se reactiva el menú con `MENU_ACTIVO`, lo cruzaría en tablet:
  revisarlo al reactivarlo); un gesto durante la carga de la intro termina la entrada de golpe y
  la bola salta a la cola (decidido); favicon 404 y `sizes` del sol, previos.

## Estado al 2026-10-01 (fin de la ronda 4)

Todo construido y verificado, sin commitear en `30-sep`. Falta: que Johan pruebe en trackpad,
ratón y móvil; sus tres confirmaciones de D15; `npm run build` antes del PR (con el dev server
parado, y luego `rm -rf .next` antes de relanzar el dev); commit, PR y merge cuando lo pida; probar
el pago con Bold y el plan mensual en el preview de Vercel; borrar en Vercel la variable vieja del
plan mensual.

## Ronda 5 (2026-10-01, última de la sesión)

- Johan aclaró que la espiral distinta de arriba a la izquierda de la parte 1 NO debe animarse.
  Su frase de la ronda 4 ("hay una espiral que es un poco diferente a la izquierda arriba, esta no
  se anima") era una aclaración, no un pedido, y se leyó mal. Lección: ante una frase descriptiva
  sobre un elemento suelto, confirmar si es pedido o aclaración antes de construir.
- Pide también: menos rebote del sol en mobile del paso 1 al 2, quitar un pequeño salto en mobile
  al deslizar del paso 2 al 3, y favicon claro y oscuro. Las imágenes estaban en el checkout
  principal (`public/images/favicons/favico_yellow.png` y `favico_purple.png`), no en
  `public/favicons`. Frente R lanzado.
- R terminado (`docs/introduccion/` D16): "Vector 1282" quieto (0° en entrada y reposo); rebote
  del sol en mobile de 31,5 px hundido y 6 de sobrepaso a 10 y 0,5 (venía del aplastamiento);
  salto 2 a 3 en mobile era el relevo de la imagen del sol (disco desplazado 10,7 px), ahora sin
  picos ida y vuelta; favicon morado en tema claro, crema en oscuro y iOS, `favicon.ico` con
  `sips`; sin 404 ni aviso de `sizes`. Ronda pequeña: sin verificador independiente aparte.
