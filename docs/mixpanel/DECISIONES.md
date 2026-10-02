# Mixpanel: decisiones

## D1. Qué se mide y con qué herramienta (2026-10-01)

**Contexto.** Mixpanel generó un "business context" de la fundación. Al confrontarlo con el sitio se
vio que mezcla dos públicos: las niñas de la isla (beneficiarias, cuyo recorrido pasa en los
talleres, fuera de la web) y las personas donantes, voluntarias y aliadas (las que de verdad usan el
sitio). Su North Star ("niñas empoderadas por EMI") no se puede medir desde la web.

**Decisión.**

- La web mide el recorrido de quien apoya: aviso aceptado, secciones vistas, Súmate abierto (con
  origen), forma de ayudar, frecuencia, monto, pago abierto y resultado en `/gracias`. El North
  Star de la web es **donaciones completadas** (y su monto), no el de la fundación.
- **Mixpanel convive con Google Analytics** (decisión de Johan). Un solo helper `track()` en
  `lib/analytics.ts` manda cada evento a los dos; los 10 `sendGAEvent` actuales pasan por él con el
  mismo nombre, para no romper el histórico de GA.
- Dependencia nueva autorizada por Johan: `mixpanel-browser` (SDK oficial, solo en cliente).
- Token por `NEXT_PUBLIC_MIXPANEL_TOKEN`. Sin token (local, previews sin configurar) el helper no
  manda nada a Mixpanel y no rompe.
- Autocaptura apagada: solo eventos con nombre, para que el panel no se llene de ruido.

**Por qué.** El sitio es un embudo de donación con una sola puerta (el drawer de Súmate); lo que
Mixpanel aporta sobre GA son los embudos y los recorridos, y para eso los eventos tienen que ser
pocos, con nombre y con propiedades estables.

## D2. Session Replay encendido con imágenes enmascaradas (2026-10-01)

**Decisión de Johan:** Session Replay encendido, con todas las imágenes enmascaradas.

**Por qué importa.** El sitio muestra fotos de niñas menores de edad detrás de un aviso de
protección (`docs/aviso/`) y les cierra las imágenes a los rastreadores de IA. Una grabación que
guardara esas fotos en un tercero contradiría ese aviso y los Términos.

**Cómo.** Bloquear en la grabación todo `img`, `picture`, `video`, `canvas` y cualquier elemento con
imagen de fondo por CSS, más un atributo propio (`data-mp-bloquear`) para lo que haga falta a mano.
Textos de campos enmascarados (el monto "Otro monto" sí se puede ver: no es dato personal, pero los
campos de texto libre no). **Criterio de éxito: un replay real en el panel de Mixpanel, revisado a
ojo, en el que no se vea ninguna foto** en Bienvenida, EMI, mapa (modales incluidos), Impacto,
Quiénes somos ni Súmate. Si no se puede garantizar, se apaga: eso manda sobre la decisión.

## D3. Los Términos cambian el mismo día (2026-10-01)

`/terminos` dice hoy que solo hay Google Analytics y la cookie `lf_aviso`, y que "el sitio no guarda
nada más en tu navegador". Con Mixpanel eso deja de ser cierto. La sección de cookies se reescribe
en es, en y fr en la misma entrega que activa Mixpanel: qué guarda, para qué, que hay grabaciones
de sesión sin imágenes, y que no se piden datos personales. Se actualiza la fecha de "Última
actualización".

## D4. Cómo quedó la integración (2026-10-01)

**Archivos.**

- `lib/analytics.ts`: `initAnalytics()`, `track(evento, props, gaLegacy?, opciones?)` y
  `registrarSuperPropiedades()`. Es el único sitio con el token de Mixpanel (constante en el
  código, es público como el id de GA; región EE. UU., sin `api_host`). Esto **reemplaza** lo de
  D1 sobre `NEXT_PUBLIC_MIXPANEL_TOKEN`: no hay variable de entorno de token.
- `pages/_app.tsx`: `useAnalytics()` inicia una vez y mantiene las súper propiedades `language`
  (locale del router) y `device_class` (mobile menor de 768, tablet de 768 a 1023, desktop desde
  1024). El ancho se escucha con dos `matchMedia` (md y lg), que solo avisan al cruzar un corte:
  sin listener de `resize` y sin spam.
- `lib/use-secciones-vistas.ts` (montado en `pages/index.tsx`): `section_viewed` con un solo
  IntersectionObserver, franja central de la ventana (`rootMargin -45% 0px -45% 0px`), una vez
  por sección y carga. Sin listeners de scroll, `touchmove` ni `wheel` (D14 de la intro).
- `components/sumate/sumate-medicion.ts`: estado de cada apertura del drawer (última forma
  elegida, si hubo pago, si ya se contó la transferencia). Lo usan `sumate-drawer-context.tsx`
  (`sumate_opened`, `sumate_closed`), `como-ayudar.tsx` y `donar-dinero.tsx`.
- `lib/orden-bold.ts`: `montoDeOrden()` lee el monto del `bold-order-id` en `/gracias`.
- Instrumentados además: `components/aviso/puerta-aviso.tsx`, `components/intro/use-intro-pin.ts`
  (en `saltar`, no en la sección), `components/education-map/route-sheet.tsx` (al montar la
  tarjeta, que lleva `key` por ruta), `donar-cosas.tsx`, `donar-tiempo.tsx`, `difunde.tsx`,
  `components/layout/footer.tsx` y `pages/gracias.tsx`. Ya no queda ningún `sendGAEvent` fuera
  de `lib/analytics.ts`.

**Entorno.** Mixpanel solo se inicia y envía si `NEXT_PUBLIC_VERCEL_ENV === 'production'` (Vercel
la pone sola en el despliegue de `main`). En local y previews no se llama a `init`, no sale
ninguna petición a `api-js.mixpanel.com` y `track` escribe `console.debug('[analytics]', evento,
props)`. GA sigue igual que antes: `track` llama a `sendGAEvent` solo cuando el evento tenía
equivalente en GA, con el nombre y las propiedades de siempre. Los eventos nuevos no van a GA.
Los clics que sacan a la persona del sitio (WhatsApp, Mercado Pago, Give Lively, redes) van con
`transport: 'sendBeacon'` y `send_immediately`.

Ojo: en `npm run dev` Turbopack descarga el chunk de `mixpanel-browser` aunque el `import()`
dinámico no se ejecute. Es código del propio localhost, no una petición a Mixpanel; en el build
de producción el chunk se pide solo al llamar a `init`.

**StrictMode.** El init tiene guardia de módulo; `section_viewed`, `map_route_opened` y
`donation_result_viewed` llevan un `useRef` que sobrevive al doble efecto. Verificado por CDP:
ningún evento sale dos veces.

**Session Replay (D2).** `record_sessions_percent: 100`; `record_block_selector` = `img, picture,
video, audio, canvas, svg image, [data-mp-bloquear]`; `record_canvas: false`;
`record_mask_all_inputs: true` (todo campo enmascarado, también "Otro monto"); y
`record_mask_all_text: false`, porque el SDK enmascara todo el texto por defecto y el texto de la
página es el copy público del sitio. Se buscaron fotos puestas como imagen de fondo
(`background-image`, `bg-[url`, `backgroundImage`): no hay ninguna (solo degradados y un
triángulo SVG en `data:`), así que hoy ningún elemento lleva `data-mp-bloquear`; el atributo queda
para cuando haga falta. Las `<image>` dentro de SVG (intro, sol de Bienvenida) caen en
`svg image`. **No se pudo probar en local**: el replay solo graba en producción. El criterio de D2
sigue en pie: revisar a ojo un replay real tras el merge y apagarlo si asoma una foto.

**Monto en la referencia.** `donar-dinero.tsx` arma el `orderId` como
`lasfuertes-<monto>-<Date.now()>-<azar>`. `pages/api/bold-signature.ts` solo exige que sea un
string no vacío y firma `${orderId}${amount}${currency}${secret}` igual que antes: la fórmula no
cambia. Las órdenes viejas (`lasfuertes-<marca>-<azar>`) no traen monto y `/gracias` lo omite.

**Detalles de los eventos.**

- `payment_flow_started` con Bold se manda al pulsar "Donar" del sitio (donde ya estaba el
  `donacion_unica_click` de GA), que carga el botón embebido de Bold; el pago en sí ocurre dentro
  de Bold. Con Mercado Pago, al pulsar el enlace de suscripción.
- `sumate_help_type_selected` y `donation_frequency_selected` salen en cada clic, también sobre
  la opción ya activa, y nunca por el valor inicial. Como "Dinero" y "Una vez" vienen elegidos, en
  el embudo quien no toca nada salta esos pasos: el embudo debe permitir pasos opcionales o
  empezar en `sumate_opened` y terminar en `payment_flow_started`.
- `donation_amount_chosen` custom sale al salir del campo o con Enter, no por tecla, y no se
  repite si el monto no cambió.
- `transfer_details_viewed`: el bloque "¿Prefieres transferir?" está siempre a la vista con
  "Una vez"; cuenta con un IntersectionObserver una vez por apertura. **Hoy no se ve nunca**:
  `DIRECT_TRANSFER` está vacío en `sumate.data.ts` y el bloque no se pinta.
- `social_click` en `/gracias` ("Síguenos en Instagram") no tenía evento de GA y sigue sin él.

**Ampliación (2026-10-01, tras el verificador independiente).**

- **Activación robusta.** `next.config.js` define `env.NEXT_PUBLIC_VERCEL_ENV` con
  `NEXT_PUBLIC_VERCEL_ENV ?? VERCEL_ENV ?? ''`. Así Mixpanel se activa en producción aunque en
  Vercel esté apagado "Automatically expose System Environment Variables" (`VERCEL_ENV` existe
  siempre en su build). En local queda vacío: verificado por CDP, cero peticiones a Mixpanel.
- **`/gracias` sin parámetros no mide.** Antes contaba como `rejected`. Ahora
  `donation_result_viewed` solo sale con `bold-tx-status` o con `origen=suscripcion`.
- **Sin doble conteo al recargar.** `trackSinRepetir()` en `lib/analytics.ts`: una vez por
  `bold-order-id` y, la vuelta de la suscripción, una vez por visita (ventana de 30 minutos). La
  última clave reportada se guarda en la persistencia del propio Mixpanel (súper propiedad
  `lf_resultado_medido`, en `property_blacklist`: se guarda en su cookie pero no viaja en los
  eventos). No se añade almacenamiento propio, coherente con los Términos. En local, sin SDK, solo
  se evita repetir en la misma carga: una recarga en local sí vuelve a escribir el
  `console.debug`. La lógica de persistencia se probó en Node con un SDK falso (dos cargas con el
  mismo `orderId` envían una vez; otro `orderId` sí envía; la suscripción se descarta dentro de
  la ventana y vuelve a contar fuera). En producción queda por ver en el panel.
- **Términos exactos.** Se graba el 100 % de las sesiones: el texto dice ahora "las sesiones de
  navegación" (es), "browsing sessions" (en) y "les sessions de navigation" (fr), no "algunas".
