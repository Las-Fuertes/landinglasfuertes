# Decisiones: orden nuevo de la home y Súmate como drawer

Pedido de Johan del 2026-09-23. Rama `23-sep-orden-drawer`, creada desde `main` en `eb5d15f`.
Estas decisiones amplían (no borran) `docs/secciones-impacto/DECISIONES.md`, D5.

---

## D1. Orden nuevo de la página

```
Introducción -> Welcome -> Principles -> Donaciones -> Mapa educativo -> Impacto -> Quiénes somos -> Footer
```

Súmate sale del flujo (D2). `pages/index.tsx` sigue siendo el único dueño del orden.

**Por qué:** lo decidió Johan. Welcome ("Bienvenidx a Las Fuertes") vuelve a ser lo primero tras
la intro, e Impacto ("Así se ve el impacto en acción") pasa a cerrar el recorrido antes del
equipo, después de contar el modelo educativo.

Consecuencias:

- **"Saltar animación"** de la intro lleva a Welcome, no a Impacto. Welcome recibe el id estable
  `bienvenida` (`components/welcome/welcome.tsx`), con `outline-none` porque el salto le pone
  `tabindex=-1` y el foco. La regla de la intro que sirve la versión estática con cualquier
  `#hash` en la URL no cambia.
- **Uniones entre secciones**: revisadas con capturas a 390 y 1280. No hizo falta tocar nada: la
  intro y Welcome son beige los dos; Mapa educativo termina en `bg-blue-700` y antes iba seguido
  de Súmate (beige), ahora de Impacto (beige), así que el corte azul a beige es el mismo; Impacto
  (beige) a Quiénes somos (`bg-cream`) es el mismo salto que Súmate (beige) a Quiénes somos.
  Impacto arranca con poco aire arriba (`k(32)`), pensado para ir tras la intro de pantalla
  completa; tras el mapa azul se lee bien, pero el aire es decisión de diseño (ver PROGRESS).

## D2. Súmate es un drawer, no una sección

**Disparadores** (los cuatro registran `sumate_open` en GA con su `origen`):

| Origen        | Dónde                                                              |
| ------------- | ------------------------------------------------------------------ |
| `tripulantes` | El botón "Quiero aportar" de Donaciones (antes `href="#sumate"`)   |
| `footer`      | El enlace "Súmate" del footer, ahora un botón al final de la lista |
| `flotante`    | Botón fijo nuevo abajo a la derecha (`sumate-flotante.tsx`)        |
| `hash`        | `/#sumate` al cargar o al cambiar el hash; también `/#donar`       |

**Por qué un drawer:** Súmate es una acción, no un capítulo del relato. Sacarla del flujo deja la
página contando la historia y la pone a un clic desde cualquier punto.

**Botón flotante.** Aparece solo cuando el borde de arriba de Welcome toca el techo de la
pantalla, es decir, con la intro ya fuera (con el pin, la intro ocupa la pantalla y la página
está arriba del todo, así que no aparece mientras está enganchada). Se oculta con opacidad, sin
desmontarse, mientras el drawer está abierto: así el foco puede volver a él al cerrar. Usa el
estilo de los CTA de Súmate (`bg-blue`, blanco, mayúsculas) con borde blanco para que se vea
también sobre las secciones azules. Texto en los tres idiomas (`sumate.drawer.*`).

**Forma.** Lateral derecho en lg+ con `lg:max-w-xl` (576 px, dentro del rango pedido de 560 a
640); en móvil y tablet sube desde abajo como sheet de `92dvh`, dejando una franja arriba, igual
que `education-map/route-sheet.tsx`. Overlay `bg-black/50` detrás.

**Contenido.** Todo Súmate tal cual, en `sumate-contenido.tsx` (lo que antes era
`sumate-section.tsx`, sin `PageGrid`), con scroll interno en `[data-drawer-scroll]`.
Ninguna pieza de Súmate usa clases `lg:`, así que en el drawer desktop se ve la versión tablet
(`md:`), que es la que corresponde a ~576 px. No hizo falta un modo aparte ni container queries
(el Tailwind del repo no tiene el plugin). Única excepción: el barco de papel de
`proyecto-destacado.tsx` pisaba el título en la tarjeta estrecha y se oculta en `lg` dentro del
drawer (`useEnDrawer()`). `FadeIn` dentro del drawer se muestra directamente, porque el panel ya
entra animado; las entradas `whileInView` de los ítems (Con cosas, Con tiempo) siguen
funcionando con el scroll interno porque el IntersectionObserver recorta por el contenedor.

**Contexto único.** `SumateDrawerProvider` en `pages/index.tsx` envuelve `main`, el footer, el
flotante y el drawer. `useSumateDrawer()` expone `isOpen`, `open(origen)` y `close()`. Fuera del
provider, `open()` navega a `/#sumate`.

**Deep link.** Abrir escribe `#sumate` con `history.replaceState(history.state, ...)` (se conserva
el estado del router de Next) y cerrar lo quita; ninguno desplaza la página. `/#sumate` abre el
drawer al cargar. `/#donar` también, y baja el scroll interno hasta "¿Cómo quieres ayudar?":
es el destino de "Reintentar" en `/gracias`, que no se tocó. Con cualquier hash la intro se
sirve estática (docs/introduccion/DECISIONES.md, D2), así que no hay pin detrás del drawer.

**Accesibilidad.** `role="dialog"`, `aria-modal`, `aria-labelledby="sumate-title"` (el h2 de
siempre), foco al botón cerrar al abrir, trampa de foco con el mismo `FOCUSABLE` de
`route-sheet.tsx`, Escape y clic en el overlay cierran, foco de vuelta al disparador. Los
disparadores son `<button aria-haspopup="dialog">`, no enlaces.

**Bloqueo del scroll.** `body.style.overflow = 'hidden'` mientras está abierto, compensando el
ancho de la barra. No choca con la intro: el drawer solo se abre con la intro fuera de pantalla
(o estática por el hash), con el body quieto no hay eventos de scroll que la reenganchen, y el
drawer para la propagación de Escape y Tab para que el listener de teclado de la intro no los vea.

**Animación.** framer-motion: entrada 400 ms `[0.22, 1, 0.36, 1]`, salida 220 ms. Con
`prefers-reduced-motion` el panel aparece en su sitio (solo funde el overlay) y al cerrar se
desvanece. Se probó un fundido de entrada del panel y dejaba un cuadro en opacidad 0 al terminar.

**Pago.** Donar dinero no depende de estar en la página: el contenedor de Bold va por `ref`, no
por id; `/api/bold-signature` y la redirección a `/gracias` no cambian. El único ancla interna,
"Apoyar este proyecto" (`#donar`), se desplaza a mano dentro del drawer para no cambiar el hash.
No se pudo probar el checkout real de Bold en local (sin llave en dev ni https).

## D3. Modal a pantalla completa en desktop y look del sitio (2026-09-30)

Pedido de Johan (docs/feedback-30-sep/FEEDBACK.md, punto 8), rama `30-sep`. Figma `1300:1865` es
guía, no resultado: la iteración anterior (tarjetas blancas redondeadas, sombras grises, chips con
bordes suaves) no se parecía al resto de la página.

**Forma.** En desktop (lg+) deja de ser lateral: el panel cubre la pantalla (`lg:inset-0`), sobre
papel, como una página más; entra con un fundido y 24 px de subida (curvas de
`education-map/coreografia.ts`, con `sinAceleracion` para no repetir el parpadeo de opacidad). En
móvil y tablet sigue el sheet de `92dvh` desde abajo, ahora sobre papel con el borde de arriba
rasgado (filtro `footer-rough-edge` sobre una capa sin hijos que se sale por los lados y por
abajo). El contexto, los disparadores, el deep link, la trampa de foco, Escape, el bloqueo del body
y el pago no cambiaron. La raíz pasó de `overflow-hidden` a `overflow-clip`: un `scrollIntoView`
(el de `#donar`) desplazaba la raíz recortada y subía el sheet entero.

**Por qué pantalla completa y no un modal centrado:** el contenido es largo (unos 2.500 px) y en
Figma es una página; un modal centrado con su propio scroll dejaba dos marcos y poco aire.

**Bordes y fondos.** Una sola pieza, `MarcoRasgado` (`ui.tsx`): capa de color con el filtro
`map-rough-edge` y encima un recuadro de papel con el mismo filtro (el marco del modal del mapa).
El relleno va dentro del recuadro filtrado para que se rasgue con él. Tonos: azul con sombra para
lo elegido (tarjeta de categoría activa, panel, caja de montos), gris para lo secundario
(tarjetas inactivas, caja de Estados Unidos, ítems de Con cosas y Con tiempo), negro para Difunde.
El bloque Llegue-Llegue es azul con borde rasgado. Montos, campo "Otro monto" y botones van con
esquina de 4 px y borde azul de 2 px como en Figma, sin rasgar: son controles.

**Lo nuevo de Figma.** Título en la cinta negra del sitio (`Resaltado tono="negro"`, giro -1,26°);
cielo de garabatos (nubes, sol rosa, pájaros) y, desde xl, estrella y concha a los lados del panel,
con vaivén en reposo (`garabato.tsx`, quieto con movimiento reducido); la caja "¿Donas desde
Estados Unidos?" sale del panel y va debajo, solo con "Con dinero"; despedida con sello rosa de
borde rasgado y olas, "Te agradecemos desde Isla Fuerte, Colombia" en `font-acento` y un enlace a
la ubicación. Assets en `public/images/sumate/` (estrella de 389 KB: muchos trazos; solo carga al
abrir el modal). El sol es `welcome/pink-sun.svg`, el mismo dibujo.

**Lo que se dejó del diseño a propósito.** La tarjeta "Nuestro proyecto ahora mismo" no está en
Figma y su texto pasó a ser el párrafo de la cabecera: la tarjeta solo se monta si la campaña de
`sumate.data.ts` tiene foto o meta. Los íconos de las categorías y de los ítems son los de antes.

**Accesibilidad y contraste.** Cerrar es un círculo de 40 px fijo en la esquina. Todos los CTA
llevan al menos 48 px de alto y van en azul con texto papel: blanco sobre naranja o rosa no llega
a AA, así que Con cosas y Con tiempo dejaron sus botones de color. El texto de la categoría elegida
va en azul (el ícono conserva su acento). Grises de texto en `black/75` o más (`black/60` sobre
papel daba 4,2:1). Errores en negro sobre `red/20` (el rojo sobre papel no llegaba). El campo
"Otro monto" usa `!` porque la regla base de inputs de `styles/global.css` gana por especificidad.

**Efecto fuera del modal.** `CtaLink` lo usa también `/gracias` ("Reintentar"): toma la forma nueva.

**Copy nuevo** en es, en, fr: `sumate.hero.subtitle` (el texto de EMI de Figma, con "Bolívar"
corregido), `sumate.unica.text` y `sumate.despedida.*`.
