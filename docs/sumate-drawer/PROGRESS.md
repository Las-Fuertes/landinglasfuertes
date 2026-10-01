# Estado: orden nuevo y Súmate como drawer

## 2026-10-01: enlace nuevo del plan mensual (ronda 3), rama `30-sep`, sin commitear

- El plan mensual de Mercado Pago es ahora `https://mpago.la/1bHZ1uA`. Antes el enlace venía solo
  de la variable `NEXT_PUBLIC_MP_SUBSCRIPTION_URL` (no había ninguno en el código); ahora es la
  constante `MP_SUBSCRIPTION_URL` de `components/sumate/sumate.data.ts`, como el de Give Lively,
  para que una variable vieja en Vercel no lo pise. `.env.example` ya no la pide; la variable en
  Vercel se puede borrar. Hay que configurar en el plan de MP la URL de retorno
  `https://<dominio>/gracias?origen=suscripcion` si no la tiene.

## 2026-10-01: arreglos del segundo verificador, rama `30-sep`, sin commitear

- Difunde lleva los enlaces a Instagram y LinkedIn dentro del texto (FEEDBACK-2, Súmate), en es,
  en y fr: marcadores `{instagram}` y `{linkedin}` en `sumate.difunde.text` que `difunde.tsx`
  cambia por enlaces (`target="_blank"`, `rel="noopener noreferrer"`, anillo de foco, 42 px de
  alto con `py-2 -my-2`). Las URLs son las del footer, duplicadas en `difunde.tsx` porque allí
  son constantes privadas. El botón "Síguenos en Instagram" de abajo sigue igual (sale solo con
  `NEXT_PUBLIC_INSTAGRAM_HANDLE`).
- El botón apagado "Muy pronto podrás contactarnos por aquí." del bloque azul Llegue-Llegue
  (pestaña "Con cosas", sale cuando falta `NEXT_PUBLIC_WHATSAPP_NUMBER`) era negro sobre azul,
  1,43:1. `DisabledCta` acepta `sobreAzul`: texto papel sobre velo `papel/15`, 7,43:1 (calculado
  sobre `blue`). Los demás botones apagados siguen negro sobre gris (`ui.tsx`,
  `donar-cosas.tsx`).
- El enlace de Google Maps de la despedida medía 52x19; con `py-3 -my-3` e `inline-block` mide
  52x48 a 390 y 64x54 a 1280, sin mover el texto (`sumate-contenido.tsx`).

## 2026-09-30: modal a pantalla completa (D3), rama `30-sep`, sin commitear

Hecho: desktop a pantalla completa, sheet con borde rasgado en móvil y tablet, marcos rasgados en
todo el formulario, cielo de garabatos, caja de Estados Unidos aparte, despedida con sello y
enlace a la ubicación, copy en es, en y fr.

Cómo se verificó (dev server en :3000, Chrome por CDP, script del scratchpad `ola4G/verificar.js`):

- `npm run type-check` y `npm run lint` limpios.
- Capturas en es y fr a 390x844, 768x1024, 1024x768, 1280x800, 1512x982 y 1920x1080, arriba y
  bajando el scroll interno; ninguna bajo 10 KB. Comparadas con Figma `1300:1865`.
- Caja del panel: igual a la pantalla en los cuatro anchos desktop (0, 0, innerWidth,
  innerHeight); sheet de 390x776 y 768x942. Sin scroll horizontal.
- Desde el footer (1280 y 390) y desde Donaciones (1280): foco inicial en Cerrar, 60 Tab y
  Shift+Tab sin salir (12 focos), Escape cierra, hash vacío, body liberado, foco de vuelta al
  disparador. Navegación flotante: abre, y al cerrar el foco vuelve a su botón. Clic en el velo
  del sheet cierra. `/#donar` baja hasta "¿Cómo quieres ayudar?" sin mover el sheet.
- Movimiento reducido: opacidad 1 y transform `none`. Sin errores en consola (solo avisos previos
  de HMR, GA y una imagen de la intro).

Qué sigue:

1. Que Johan lo mire en desktop y móvil.
2. Enlace de ubicación: hoy busca "Isla Fuerte, Bolívar" en Google Maps (`SEDE_MAPA_URL`); si la
   fundación tiene el pin exacto de la sede, reemplazarlo.
3. `docs/PATTERNS.md`, sección del drawer, todavía dice "lateral derecho en desktop": actualizar.
4. Mobile y tablet no tienen frame en Figma: se derivaron del de desktop.
5. Probar Bold real en un preview https (en local no hay llave y se ve "Pronto disponible").

## 2026-09-23

Última actualización: 2026-09-23. Rama `23-sep-orden-drawer` (desde `main` en `eb5d15f`), en el
worktree `~/orca/workspaces/landinglasfuertes/23-sep-intro/`. **Sin commitear**: nada se
commitea ni publica sin que Johan lo pida. Decisiones en `DECISIONES.md` de esta carpeta.

## Hecho

- Orden nuevo en `pages/index.tsx` (D1). "Saltar animación" lleva a `#bienvenida`.
- Drawer de Súmate con sus cuatro disparadores, deep link, trampa de foco y bloqueo del body (D2).
- Copy nuevo en `es`, `en` y `fr` bajo `sumate.drawer` (flotante, su aria-label, cerrar).
- `scripts/captura.js --clic <selector>` para abrir el drawer en una captura.

## Cómo se verificó (servidor de desarrollo en :3000, Chrome por CDP)

- Orden en el DOM: Introducción, bienvenida, principles, donations, mapa, impacto,
  quienes-somos, footer. Uniones capturadas a 390 y 1280.
- Drawer desde los 4 orígenes a 390x844, 1000x1366 y 1440x900, arriba y abajo del scroll interno:
  caja 390x776 (sheet, franja de 68 px), 1000x1257 (franja de 109 px) y 576x900 a la derecha;
  hash `#sumate` al abrir y vacío al cerrar; foco inicial en "Cerrar"; foco de vuelta al
  disparador en los 3 con disparador.
- Teclado: 80 Tab y 20 Shift+Tab sin salir del drawer (12 focos distintos). Escape y clic en el
  overlay cierran. Rueda sobre el overlay: `scrollY` 3808 antes y después; sobre el panel, el
  scroll interno pasa de 503 a 1226 con `scrollY` quieto.
- Flotante: opacidad 0 con la intro enganchada, 1 tras la intro, 0 con el drawer abierto.
- Saltar animación (Tab y Escape) a 390, 1000 y 1280: top de `#bienvenida` = 0.
- Reduced motion: transform `none` en todo momento y opacidad 1 desde el primer cuadro.
- `/#donar`: abre el drawer, deja `#sumate` en la URL y baja hasta "¿Cómo quieres ayudar?".
- `npm run type-check`, `npm run lint` y `npm run build` limpios.

## Qué sigue, en orden

1. **Que Johan lo mire** en `localhost:3000` (desde el botón de Donaciones, el footer, el flotante
   y `localhost:3000/#sumate`) en móvil y desktop.
2. Decisiones de diseño abiertas:
   - Aire de arriba de Impacto (`k(32)`) ahora que va tras el mapa azul y no tras la intro.
   - El flotante tapa la esquina inferior derecha del contenido en móvil (por ejemplo, el final
     del párrafo de Quiénes somos al pasar). Opciones: ocultarlo sobre el footer, o hacerlo más
     pequeño en móvil.
   - Si el flotante debe esconderse cuando la sección de Donaciones (con su propio botón) está en
     pantalla.
   - El footer lista "Súmate" como botón al final de "Explora"; podría ir en "¿Quieres ayudar?".
3. Probar el pago real de Bold dentro del drawer en un preview con https (en local no hay llave).
4. Publicar cuando Johan lo pida: commit, PR contra `main`, merge (`gh auth switch --user
johanmendezb` antes de `gh`).
