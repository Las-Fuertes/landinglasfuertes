# Decisiones: navegación flotante, footer nuevo y fuente de acento

Feedback de Johan del 2026-09-30 (`docs/feedback-30-sep/FEEDBACK.md`, secciones 2, 9 y 10).
Rama `30-sep`, desde `main` en `21bca2d`. Frente B de la ola 1 (`docs/feedback-30-sep/ROADMAP.md`).

---

## D1. Navegación flotante en lugar del botón "Súmate"

**Qué.** El botón fijo "Súmate" (antes abajo a la derecha) se convierte en una navegación
flotante según Figma `1402:225` (componente con las variantes `Navbar=Closed` y `Navbar=Opened`).
Cerrada es un círculo `bg-papel-tostado` (Figma `#FBE6C9`, token nuevo) con el ícono de menú;
abierta, una píldora `bg-papel` con el círculo y una X, "INICIO" y "SÚMATE" en píldora negra.

**Dónde.** Arriba a la izquierda (`top-m left-m`, `lg:top-l lg:left-l`): es donde la pone el
diseño (la instancia `1417:348` está en x 20, y 22 del hero mobile) y donde abre hacia la derecha.
El selector de idioma vive en la misma esquina, pero solo con la página arriba del todo
(`scrollY < 40`), y la navegación solo aparece con Bienvenida tocando el techo: nunca coinciden.

**Comportamiento heredado del botón Súmate** (docs/sumate-drawer/DECISIONES.md, D2): aparece
cuando el borde de arriba de `#bienvenida` toca el techo y la intro no está trayéndola
(`data-intro-llegando`), se retira con el drawer abierto y sobre las secciones con
`data-oculta-flotante` (el mapa), y se oculta con opacidad sin desmontarse. Al ocultarse queda
`inert` y `aria-hidden`, y el menú se cierra.

**Entradas.** El menú de Figma solo tiene dos: **Inicio** y **Súmate**. No hay entradas a
secciones, así que no hizo falta mapear ids.

- Inicio: salto directo a `scrollY 0` (sin recorrido suave: pasaría por el pin de la intro a
  medio camino) y foco en `main` (con `tabindex=-1`), para que el siguiente Tab entre en la intro.
- Súmate: `useSumateDrawer().open('flotante')`, el mismo origen de GA de antes. Antes de abrir,
  el foco pasa al botón del menú, así el drawer lo guarda como disparador y lo devuelve ahí.

**Íconos.** No se usa la hamburguesa del diseño (pedido de Johan): `Menu` y `X` de
`lucide-react`, los mismos que ya usan el drawer y el mapa.

**Accesibilidad.** `<nav aria-label>` con un disclosure: botón con `aria-expanded`,
`aria-controls` y `aria-label` que cambia (abrir/cerrar menú). Escape cierra y devuelve el foco
al botón (y no se propaga a la intro); clic fuera, foco fuera o elegir una entrada también
cierran. Botón de 44x44 y entradas de 40 de alto. No es modal: no atrapa el foco.

**Archivo.** `components/sumate/sumate-flotante.tsx` (se mantuvo el nombre y el export
`SumateFlotante` para no tocar `components/sumate/index.ts` ni `pages/index.tsx`, que son de
otros frentes). Si se quiere renombrar a `components/layout/navegacion-flotante.tsx`, es un
movimiento sin cambio de comportamiento.

**Ampliación (2026-10-01, ronda 3): menú apagado y CTA "Súmate" en su lugar, temporal.** Johan
pidió ocultar el menú por ahora y dejar en la misma esquina solo un botón "Súmate" bien visible:
es el pedido más importante para la fundación y dentro del menú quedaba casi escondido.

- El código del menú sigue entero, detrás de `const MENU_ACTIVO: boolean = false` en
  `components/sumate/sumate-flotante.tsx`. Ponerlo en `true` devuelve el menú tal cual era.
- El CTA hereda toda la visibilidad de la navegación (`useVisible`): oculto durante la intro,
  con el drawer abierto y sobre secciones con `data-oculta-flotante` (el mapa); se oculta con
  opacidad e `inert`, sin desmontarse, para que el drawer le devuelva el foco al cerrar.
- Abre el drawer con `useSumateDrawer().open('flotante')`, el mismo origen de GA. Conserva
  `data-sumate-flotante`, `aria-haspopup="dialog"` y el `aria-label` de siempre
  (`sumate.drawer.flotanteAria`); el texto visible es `nav.sumate`. Sin copy nuevo.
- Estilo: el botón azul del sitio (`bg-blue`, texto y borde de 2 en `papel`, `rounded`,
  mayúsculas `font-extrabold`, sombra), `h-11` (44) en mobile y `h-12` (48) desde md; el borde
  papel lo separa de las secciones azules. Papel sobre `blue` pasa AA de sobra. Foco con anillo
  azul sobre offset papel.
- Medido por CDP: 120 x 44 en 390 y 768 (148 x 48 desde 1280, en `top-l`); visible en
  Bienvenida e Impacto a 390, 768, 1280 y 1920; oculto en la intro y sobre el mapa; un clic abre
  el drawer con el foco dentro. No pisa el título fijo de Impacto: en mobile el título bajó a 64
  de aire (el CTA termina en 59; en en/fr la primera línea del título lo cruza en horizontal), y
  desde 768 el título empieza a la derecha del CTA.

**Ampliación (2026-10-01, ronda 3, frente O): el CTA con la forma del selector de idioma.**
Johan pidió que el CTA se parezca mucho al selector de idioma, para que la esquina no cambie de
forma de golpe al pasar de uno a otro.

- Misma forma: una píldora `rounded-full` blanca translúcida (`bg-white/80`, `backdrop-blur-sm`),
  borde de 1 en `black/10`, `shadow-lg` y 4 de relleno; dentro, un chip azul `rounded-full` como
  el del idioma activo, con su misma letra (13,6 px, `py-1.5`). Lo que lo hace CTA: el chip azul
  ocupa toda la píldora, más ancho (`px-m`), en mayúsculas `font-extrabold`. Blanco sobre `blue`
  pasa AA de sobra. Toda la píldora es el botón; hover oscurece el chip a `blue-300`; foco con
  anillo azul y offset.
- Mismo sitio que el selector: `left-page-margin top-4` en todos los anchos (antes `top-m left-m`
  y `top-l left-l` desde `lg`). El selector no se tocó (solo un comentario que remite al CTA).
- Medido por CDP a 390 y 1280 (iguales): selector 135,6 x 42,4 en x 40, y 16; CTA 97 x 42,4 en
  x 40, y 16 (en 92 y fr 141). Ambos con radio 9999px, borde 1px `rgba(36,36,36,0.1)`, relleno 4px,
  fondo `rgba(255,255,255,0.8)`; chip del idioma 32,4 de alto con relleno 6/12, chip del CTA 32,4
  con 6/15. Antes: CTA 120 x 44 (390) y 128 x 48 (1280), radio 4, borde papel de 2.
- Título fijo de Impacto: a 390 el CTA acaba en y 58 y el título empieza en 64 (es, en, fr); a 768
  el título empieza en x 183 y el CTA acaba en x 137 (es), 132 (en) y 181 (fr). Con `px-l` el
  francés llegaba a 205 y lo pisaba: por eso `px-m` y sin `tracking-wide`.
- Visible en Bienvenida tras la llegada desde la intro (gesto y "Saltar intro", 390 y 1920).
- Capturas: `/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-30-sep/4a102619-4612-4f9a-b653-f5d38898f6f9/scratchpad/r3-O/antes/cta-*.png`, `despues/cta-*.png`, `despues/selector-*.png` e
  `impacto-cta-<ancho>-<idioma>.png`.

## D2. Footer nuevo y "Transparencia"

**Qué.** Footer según Figma `1402:230`, en `components/layout/footer.tsx`: bloque `bg-blue` con
borde rasgado, logo y lema, columnas "¿Quieres apoyar?" (Dona aquí, Instagram, LinkedIn) y "La
fundación" (Transparencia), olas abajo a la izquierda, pájaros arriba a la derecha y el © abajo
a la derecha. Assets exportados de Figma en `public/images/footer/` (fuente en
`design-assets/footer/`).

- **Borde rasgado**: filtro nuevo `footer-rough-edge` en `rough-edge-filter.tsx`, aplicado a una
  capa de fondo sin hijos (el texto no se deforma), más ancha que la pantalla para que no se vean
  los lados. El footer sube `-mt-s` sobre la sección anterior, así los dientes de arriba se ven
  contra su fondo, sea cual sea. Una franja `bg-papel` bajo los dientes de abajo, como en Figma.
- **Títulos de columna**: `Resaltado tono="negro"` (el chip del sitio, docs/PATTERNS.md), no un
  rectángulo propio.
- **Dona aquí** abre el drawer con origen `footer` (antes "Súmate").
- **Instagram y LinkedIn** con las URLs fijas del feedback, `target="_blank"` y
  `rel="noopener noreferrer"`. Se registra `instagram_click` y `linkedin_click` en GA.
- **Sale el formulario de contacto** del footer. (Ampliación: `components/contact/` se borró
  después, ver D5.)
- **Sale "Nuestros principios"** y "Bienvenida": el diseño ya no los tiene.
- **"Términos y condiciones"** lleva a la página nueva `/terminos` (D4). En la primera entrega
  no se mostraba porque no había destino.
- Mobile y tablet no tienen frame en Figma. La primera versión solo apilaba todo centrado; la
  definitiva está en D5.

**Transparencia** (decisión de Johan): "Transparencia" es un botón que despliega los años con
estados financieros; cada año abre su PDF en otra pestaña. Los años salen de
`components/layout/transparencia.data.ts` (`{ anio, ruta }`), así que sumar un año es poner el PDF
en `public/transparencia/` y añadir una línea. El de 2025 se copió del checkout principal como
`public/transparencia/estados-financieros-2025.pdf` (sin espacios). El menú
(`menu-transparencia.tsx`) es un disclosure: `aria-expanded`, `aria-controls`, Escape devuelve el
foco al botón, clic fuera y foco fuera cierran; cada enlace dice "Estados financieros 2025 (se abre
en otra pestaña)" al lector de pantalla.

## D3. Fuente de acento: Indie Flower

**Qué.** La letra manuscrita de los acentos pasa de Homemade Apple a **Indie Flower** (Google
Fonts vía `next/font/google`, sin dependencia nueva). **Reemplaza el plan anterior de Bradley
Hand.** Se carga una sola vez en `pages/_app.tsx` como la variable `--font-acento` y se usa con el
token de Tailwind `font-acento` (`tailwind.config.js`, `fontFamily.acento`). Usos hoy: el
"de Isla Fuerte, Colombia" de Bienvenida y el "desliza" de la pista del slider de principios.
La intro no usa la fuente de acento.

**Tamaños.** Indie Flower es mucho más estrecha que Homemade Apple: al mismo tamaño el subtítulo
de Bienvenida ocupaba un 70 % de su subrayado. Se subió para que vuelva a cubrirlo: mobile
`clamp(1.375rem, 6.2vw, 1.5rem)` (antes `clamp(1rem, 4vw, 1.125rem)`), desktop `text-h3` (antes
`text-p-md`, que se borró en D5), y "desliza" de `text-h4` a `1.5rem`. Revisado a 390, 1280 y 1920
en es, en y fr: una sola línea, sin desbordes.

**Ampliación (2026-10-01): Pangolin reemplaza a Indie Flower.** Tras otro review de la
diseñadora (`docs/feedback-30-sep/FEEDBACK-2.md`, Fuente), la fuente de acento pasa a
**Pangolin** (Google Fonts vía `next/font/google`, peso 400, sin dependencia nueva). Cambia solo
la carga en `pages/_app.tsx`; la variable `--font-acento` y el token `font-acento` siguen igual,
así que todos los usos cambian a la vez: el subtítulo de Bienvenida, "desliza" de la pista, la
despedida del drawer de Súmate y, nuevo, el texto de las estampillas de EMI
(docs/emi/DECISIONES.md, D5). **Tamaños sin cambios**: Pangolin es un poco más ancha que Indie
Flower y aun así, a 390, 1280 y 1920 en es, en y fr, el subtítulo y "desliza" quedan en una línea
sin desbordar ("desliza" termina a 20 px del borde a 390). Verificado por CDP: `getComputedStyle`
de los acentos da `Pangolin` y `document.fonts.check('16px Pangolin')` da `true`, también dentro
del drawer. La intro no usa la fuente de acento.

## D4. Página de Términos y condiciones

**Qué.** `pages/terminos.tsx` (`/terminos`, `/en/terminos`, `/fr/terminos`), enlazada desde "La
fundación" del footer (con `aria-current="page"` cuando se está en ella). Mismo lenguaje que el
sitio: cabecera `bg-blue` con el borde rasgado del footer, el logo que lleva a la home y el título
en papel; cuerpo sobre `bg-beige` en `PageGrid` (8 de 12 columnas desde `lg`), títulos de sección
con `Resaltado tono="negro"`, y el footer, la navegación flotante y el drawer de Súmate montados
igual que en la home.

**Contenido.** Solo lo que el proyecto ya dice o hace, en cinco secciones (`terminos.secciones.*`
en los tres idiomas; francés con tuteo):

1. Quiénes somos: Fundación Las Fuertes, Isla Fuerte, Bolívar, Colombia; Instagram y LinkedIn.
2. Protección de menores y fotos: el texto del aviso (`aviso.texto`), el uso prohibido de las
   fotos, incluida la IA, y lo que ya se hace para las máquinas (`robots.txt` y la cabecera
   `X-Robots-Tag: noimageai, noai` de `next.config.js`).
3. Cookies: `lf_aviso` (365 días, versión del aviso, sin datos personales, también fijada por
   `/api/aviso`) y Google Analytics (`pages/_app.tsx`). El grep no encontró otro almacenamiento
   en uso: el `localStorage` de `components/app-image/` solo lo usa `components/coming-soon/`,
   que no está montado en ninguna página.
4. Donaciones: el drawer Súmate; Bold (COP, mínimo 5.000, firma de integridad en el servidor, el
   sitio no ve datos de la tarjeta, vuelta a `/gracias`); Mercado Pago para la mensual; Give Lively
   con Caring for Colombia desde Estados Unidos; tiempo y cosas por WhatsApp.
5. Cambios y ley aplicable.

**Datos legales que faltan: marcadores visibles.** No se inventó nada. Donde falta un dato va
`[Pendiente: ...]` (`[Pending: ...]`, `[En attente : ...]`) en el propio texto de `locales`, y la
página lo pinta como `<mark data-pendiente>` en amarillo: NIT, dirección para notificaciones,
representante legal, correo de contacto, política de reembolsos, certificados de donación y
beneficios tributarios, y ley aplicable y jurisdicción. Para cerrarlos basta con reemplazar el
marcador en los tres locales.

**Ampliación (2026-10-01): datos legales reales y secciones quitadas.** Johan dio los datos en
la segunda ronda de feedback (`docs/feedback-30-sep/FEEDBACK-2.md`, "Respuestas a preguntas
abiertas"), y ya no queda ningún marcador:

- **NIT** 901.809.186-3. **Representante legal** Karoll Adriana Lopez Lozano (escrito exactamente
  así, sin tildes, como lo dio Johan), cédula de ciudadanía 52.717.530.
- **Correo** comunicaciones@lasfuertes.org, en "Quiénes somos" y en Donaciones. La página lo
  convierte en enlace `mailto:` (`renderParrafo` en `pages/terminos.tsx` reconoce ese correo en
  el texto de `locales`; el texto sigue siendo plano en los tres idiomas).
- **Reembolsos y temas tributarios** (incluidos los certificados de donación): se gestionan
  escribiendo directamente a la fundación a ese correo (`terminos.secciones.donaciones.p6`).
- **Dirección para notificaciones**: no se dio, así que se quitó la línea en vez de inventarla.
- **Se quitó la sección 5** ("Cambios y ley aplicable": la nota de que los términos pueden
  cambiar y la ley aplicable y jurisdicción), por pedido de Johan. La página queda con cuatro
  secciones y `terminos.secciones.cambios` salió de los tres locales.
- Se retiró el pintado de marcadores en amarillo (`<mark data-pendiente>`): ya no hay datos
  pendientes. La fecha de "Última actualización" pasa al 1 de octubre de 2026.

Verificado con `curl` en `/terminos`, `/en/terminos` y `/fr/terminos`: 200, el NIT y la cédula
una vez, el correo cuatro veces (dos textos y dos `mailto:`), cero marcadores y cero menciones de
la ley aplicable.

**Ampliación (2026-10-01, ronda 3): el correo es fundacionlasfuertes@gmail.com.** Johan dio el
correo real de la fundación; reemplaza a comunicaciones@lasfuertes.org en los dos párrafos de
Términos (`terminos.secciones.responsable.p3` y `donaciones.p6`) en es, en y fr, y en `CORREO` y
el patrón de `renderParrafo` (`pages/terminos.tsx`). No aparece en ningún otro sitio del código.
Verificado con `curl`: el correo nuevo en `/terminos`, `/en/terminos` y `/fr/terminos`, un solo
`mailto:` distinto (`mailto:fundacionlasfuertes@gmail.com`) y cero `comunicaciones@`.

**Navegación fuera de la home.** Sin `#bienvenida`, la navegación flotante aparece desde
`scrollY >= 40`, el mismo umbral en el que se va el selector de idioma: se relevan en la esquina.
"Inicio" hace `router.push('/')` en el mismo idioma. Súmate abre el drawer, que se monta también
en esta página.

## D5. Footer en mobile y tablet, y borrado del formulario de contacto

**Footer responsive** (pedido de Johan: diseñarlo a partir del desktop, no solo apilar):

- **Mobile (< 768)**: la marca es una fila, logo a la izquierda (7,5 rem) y el lema al lado;
  debajo, "¿Quieres apoyar?" y "La fundación" con sus chips, alineados a la izquierda con la
  misma arista que el logo; el © al final, más pequeño. Pájaros arriba a la derecha y olas abajo
  a la izquierda, como en desktop. Dos columnas lado a lado no caben a 390 (142 px por columna y
  "Síguenos en Instagram" mide ~150).
- **Tablet (768 a 1023)**: las tres columnas de desktop a partes iguales (4, 4 y 4 de 12), la
  marca centrada en la suya, el © abajo a la derecha y las olas a 22 rem.
- **Desktop (>= 1024)**: sin cambios (D2).
- Los chips pueden partirse en dos piezas si no caben (francés), en vez de desbordar.

**Borrado.** `components/contact/` completo (el footer era su único consumidor; ningún
`index.ts`, `pages/api` ni script lo importaba). De sus claves `modal.*` solo se borró
`modal.close`: el resto lo usa también `components/coming-soon/coming-soon.tsx` (otro
formulario de contacto, sin montar en ninguna página). Se borraron también `sumate.drawer.flotante`
(la nav usa `nav.sumate`; `flotanteAria` sigue en uso) y el tamaño `p-md` de
`tailwind.config.js`. La cabecera de `scripts/captura.js` ya no cita `footer nav button`.

**Ampliación (2026-10-01): `components/coming-soon/` borrado.** Johan no lo reconocía y pidió
hacer lo conveniente. El grep en `pages`, `components`, `scripts`, `lib`, `hooks`, `styles` y las
configuraciones no encontró a nadie que lo importara, así que se borró la carpeta entera y con
ella las claves que solo él usaba, en los tres idiomas: `content.*`, `cta.*`, `modal.*` (lo que
quedaba tras D5), `timestamp` y `hero.mainTitle1`, `hero.mainTitle2`, `hero.subtitle1` y
`hero.subtitle2` (el resto de `hero.*` es de la Introducción y sigue en uso). `meta.*` se queda:
lo usa `pages/index.tsx`. Queda huérfano `components/app-image/` (su único consumidor era
coming-soon); no se borró porque no era de este frente: es lo siguiente a limpiar. Tras el
borrado, es, en y fr tienen las mismas 227 claves.
