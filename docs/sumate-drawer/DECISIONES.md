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
