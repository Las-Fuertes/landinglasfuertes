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

## D5. La vuelta de Mercado Pago se mostraba como pago fallido (2026-10-02)

**El bug (producción, dinero real).** Johan pagó una suscripción mensual con Mercado Pago y volvió
a `https://www.lasfuertes.org/gracias?preapproval_id=6bcf80760c964da5966bedaf43d18aeb`. `/gracias`
solo reconocía `origen=suscripcion` y `bold-tx-status`; sin ninguno caía en `rejected` y mostró
"El pago no se completó" a alguien que acababa de suscribirse. En el panel no se medía (desde D4,
sin parámetros no hay evento), así que el fallo era invisible. Bold sí funcionó
(`?bold-order-id=lasfuertes-5000-1790940967450-8900&bold-tx-status=approved`). Además, como la
página se prerenderiza sin query, el HTML estático pintaba la pantalla de rechazo un instante
antes de hidratar, también en las vueltas buenas.

**Decisión de Johan (reemplazada el mismo día por D6).** El éxito se confirma SOLO leyendo la URL de vuelta: no se consulta la API
del proveedor y no hay webhooks.

**Cómo llega la URL.** El botón mensual es un enlace fijo al plan (`MP_SUBSCRIPTION_URL` =
`https://mpago.la/1bHZ1uA` en `components/sumate/sumate.data.ts`). Al terminar, Mercado Pago manda
a la persona al `back_url` del plan y le añade `preapproval_id` (el id de la suscripción creada).
`.env.example` pedía configurar `https://<dominio>/gracias?origen=suscripcion`, pero la vuelta real
llegó sin `origen`: o el plan tiene `/gracias` a secas, o Mercado Pago reemplaza la query propia.
No se puede ver el panel desde aquí; da igual, porque ahora `/gracias` reconoce `preapproval_id` y
no hace falta tocar el plan. La documentación oficial de suscripciones (con y sin plan asociado,
`back_url` en la creación del plan) solo define `back_url` como "URL de retorno exitoso" y **no
documenta ningún parámetro** añadido, ni `status` ni `external_reference`. Por eso no se lee
ningún estado de Mercado Pago: la vuelta con `preapproval_id` se toma como suscripción creada.

**Cambios.**

- `lib/resultado-pago.ts` (nuevo): `leerVueltaPasarela(query)` decide pasarela, resultado y clave
  de deduplicación. Orden: `bold-tx-status` (approved, pending; cualquier otro valor es
  rejected), luego `preapproval_id`, luego el viejo `origen=suscripcion`. Sin ninguno, `null`.
- `pages/gracias.tsx`: con `preapproval_id` u `origen=suscripcion` muestra la pantalla mensual
  (`gracias.suscripcionTitle` y `gracias.suscripcionText`, que ya decían lo correcto en es, en y
  fr: gracias por sumarte cada mes, Mercado Pago envía el comprobante de cada cobro y desde
  Mercado Pago se gestiona o cancela; no se tocó el copy). Hasta que el router tiene la query no
  pinta ningún resultado. **`/gracias` sin parámetros de pasarela redirige al inicio** (con
  `router.replace('/')`, en el mismo idioma) y no mide nada: un "gracias" le mentiría a quien no
  pagó y un "pago fallido" a quien sí; no hay nada cierto que decir.
- `donation_result_viewed` suma `payment_provider` (bold, mercado_pago) y `donation_success`
  (true para Bold `approved` y para la vuelta de Mercado Pago; false para pending y rejected).
  Mercado Pago: `payment_status` = `subscription_returned`, `frequency` = `monthly`, sin monto y
  sin mandar el `preapproval_id`. Se deduplica con `trackSinRepetir` por `mp:<preapproval_id>`
  (sin ventana: la misma suscripción cuenta una vez); el viejo `origen=suscripcion` sigue con la
  ventana de 30 minutos.
- `payment_flow_failed` (nuevo) en `components/sumate/donar-dinero.tsx`: el pago de Bold no se
  pudo abrir y la persona ve `sumate.unica.error`. Props: `payment_provider`, `frequency`,
  `amount_value`, `failure_reason`: `signature_error` (`/api/bold-signature` respondió error o sin
  firma; el caso de hoy si falta `BOLD_SECRET_KEY`), `network_error` (la petición de firma no
  terminó), `container_error` (no estaba el contenedor del botón) y `script_error` (no cargó el
  script de Bold; antes ese fallo dejaba la pantalla sin botón y sin error, ahora muestra el
  error). El monto mensual no tiene este evento: es un enlace, no puede fallar antes de salir.
- `docs/mixpanel/tracking-plan.json` y `PLAN-DE-EVENTOS.md` al día (17 eventos).

**Verificado (2026-10-02, por CDP contra el dev server, a 390 y 1280).** Pantalla y evento de:
`?preapproval_id=...` (mensual, `subscription_returned`, `donation_success` true),
`?origen=suscripcion` (igual), Bold approved (con `amount_value` 5000), pending y rejected
(`donation_success` false), `/gracias` sin nada (redirige a `/`, sin evento) y la mensual en `/en`
y `/fr`. El fallo de firma, con una `NEXT_PUBLIC_BOLD_API_KEY` falsa puesta un momento en
`.env.local` (borrado después) y sin `BOLD_SECRET_KEY`: muestra el error y manda
`payment_flow_failed` con `signature_error`. En producción queda por ver en el panel, con la
próxima suscripción real, que llega una sola vez.

**Give Lively: ya no está pendiente.** Se pensó en reconocer su vuelta en `/gracias`, pero Give
Lively no permite configurar callback URL (ver D7): no habrá esa vuelta.

## D6. /gracias confirma el estado con la pasarela (2026-10-02)

**Cambio de decisión de Johan.** Reemplaza la decisión de D5 ("solo la URL"): ahora `/gracias`
consulta el estado real del pago a la pasarela con el id que trae la URL de vuelta. La URL queda
como respaldo: si la consulta falla, tarda o no sabe, se muestra y se mide lo que dice la URL,
exactamente como en D5.

**Endpoints confirmados en la documentación oficial.**

- **Bold** (fuente: https://www.developers.bold.co/pagos-en-linea/consulta-de-transacciones):
  `GET https://payments.api.bold.co/v2/payment-voucher/<identificador único de la venta>` (el
  `orderId` del botón, `lasfuertes-...`) con `Authorization: x-api-key <llave de identidad>`. Usa
  la **llave de identidad** (`NEXT_PUBLIC_BOLD_API_KEY`), no la secreta; sin ella o mal puesta, 401. Responde `{ link_id, transaction_id, total, payment_status }`; **no trae moneda** (el botón
  del sitio solo cobra COP). `payment_status`: en proceso `PROCESSING` y `PENDING` (solo PSE);
  finales `APPROVED`, `REJECTED`, `FAILED`, `VOIDED`; y `NO_TRANSACTION_FOUND` si aún no existe.
  La transacción aparece "en hasta 10 minutos" y se puede consultar durante 24 horas, así que
  justo al volver puede salir `NO_TRANSACTION_FOUND`: eso se trata como `unknown` y manda la URL.
  Solo aplica al botón de pagos, no a los links de pago.
- **Mercado Pago** (fuente:
  https://www.mercadopago.com.co/developers/es/reference/online-payments/subscriptions/get-preapproval/get):
  `GET https://api.mercadopago.com/preapproval/{id}` con `Authorization: Bearer <access token>`.
  Monto mensual en `auto_recurring.transaction_amount` y moneda en `auto_recurring.currency_id`
  (`COP` en el ejemplo). La referencia solo muestra `status: "pending"` en su ejemplo y no
  enumera los estados; los demás salen del SDK oficial de Go
  (https://pkg.go.dev/github.com/mercadopago/sdk-go/pkg/preapproval: `authorized`, `paused`,
  `cancelled`, más `pending` al crear) y de la guía de gestión de suscripciones, que cancela con
  `canceled` (una ele). Se aceptan las dos grafías.

**Ruta `pages/api/estado-pago.ts` (servidor).** `GET ?provider=bold|mercado_pago&id=...`.
Valida el id antes de salir (Bold: `lasfuertes-<monto>-<marca>-<azar>` o el formato viejo; MP:
alfanumérico de 8 a 64) para no ser un proxy abierto; otro método, 405; id o proveedor inválido, 400. Devuelve SOLO `{ status, amount_value, currency }` con `status` normalizado: Bold
`APPROVED` -> approved, `PENDING`/`PROCESSING` -> pending, `REJECTED`/`FAILED` -> rejected,
`VOIDED` -> cancelled; MP `authorized` -> approved, `pending` y `paused` -> pending,
`cancelled`/`canceled` -> cancelled; lo demás, `unknown`. Nunca reenvía datos de quien paga (la
respuesta de MP trae `payer_id` y correo: se descartan). Tope propio de 6 s con
`AbortController`, `Cache-Control: no-store`. Sin llave (`NEXT_PUBLIC_BOLD_API_KEY` o
`MP_ACCESS_TOKEN`), con error HTTP, JSON roto o tope: `unknown`, nunca un 500.
Para probar en local, `ESTADO_PAGO_BOLD_BASE` y `ESTADO_PAGO_MP_BASE` apuntan las bases a un
servidor de prueba; con `NODE_ENV=production` se ignoran.

**`/gracias`.** Tras leer la URL (D5) muestra "Confirmando tu pago…" (claves
`gracias.confirmandoTitle` y `confirmandoText`) y llama a `confirmarConPasarela`
(`lib/resultado-pago.ts`, con su propio tope de 8 s). Si Bold dice pendiente, reintenta tres veces
con esperas de 2,5, 4 y 6 s antes de mostrar "en proceso" (unos 14 s en el peor caso). Pantallas:
Bold approved, pending y rejected/cancelled como siempre; MP `authorized` -> gracias mensual,
`pending`/`paused` -> pantalla nueva "Tu suscripción está en proceso" (`suscripcionPendingTitle`
y `Text`, porque el pendiente de Bold habla de PSE), `cancelled` -> "El pago no se completó". Si
la pasarela da `unknown`, la pantalla de D5. Copy nuevo en es, en y fr.

**`donation_result_viewed`.** Sale UNA vez, con el resultado final, y suma `verified`.
`payment_status` = estado de la pasarela (Bold: approved, pending, rejected, cancelled; MP:
authorized, pending, cancelled); sin verificar, lo de D5 (`subscription_returned` para MP).
`donation_success` = true para Bold approved y MP authorized, y también sin verificar cuando la
URL dice approved o vuelve de MP (como en D5): para el North Star estricto se filtra
`verified = true`. `amount_value` viene de la pasarela cuando responde (también el mensual de MP);
si no, del `orderId` de Bold. `provider_status_code` sigue siendo el `bold-tx-status` de la URL.

**Verificado (2026-10-02).** Con un servidor de prueba de Node en el puerto 4599 (scratchpad) y un
`.env.local` temporal con llaves falsas (`prueba-local`) y las bases apuntadas al mock, **borrado
al terminar**. Por curl: approved, rejected, `NO_TRANSACTION_FOUND` -> unknown, MP authorized con
25000 COP, MP cancelled, 404 de MP -> unknown, ids con `/` o `..` -> 400, POST -> 405, el tope
de 6 s -> unknown, y sin llaves -> unknown; el correo del pagador del mock nunca sale. Por CDP a
390 y 1280, pantalla y evento: Bold approved (verified, 5000); pending que pasa a approved en el
segundo reintento (7000 del proveedor); pending siempre (unos 14 s, "en proceso"); URL approved
que el proveedor dice rejected (gana el proveedor); tope de la pasarela (pasa por "Confirmando",
cae a la URL con `verified` false); MP authorized (`authorized`, 25000), pending (pantalla nueva
en es, en y fr) y cancelled; sin llaves, Bold y MP caen a la URL con `verified` false; `/gracias`
sin nada sigue yendo al inicio.

**Lo que tiene que hacer Johan en Vercel (Production).** Añadir `MP_ACCESS_TOKEN` con el Access
Token de producción de la cuenta dueña del plan (solo servidor, sin `NEXT_PUBLIC`).
`NEXT_PUBLIC_BOLD_API_KEY` ya existe y sirve para Bold. No poner `ESTADO_PAGO_*` en Vercel.
Sin `MP_ACCESS_TOKEN`, la mensual sigue funcionando como en D5 (`verified` false).

**Ampliación (2026-10-02, ola 2, constructor B): cuatro detalles que dejó el verificador.**

- **`NO_TRANSACTION_FOUND` de Bold se reintenta.** Bold puede tardar hasta 10 minutos en registrar
  la venta, así que justo al volver es normal que no la encuentre. Antes se trataba como `unknown`
  y se caía a la URL en el acto. Ahora `/api/estado-pago` lo responde como `not_found` (también si
  llega con HTTP 404 y ese `payment_status` en el cuerpo) y `confirmarConPasarela`
  (`lib/resultado-pago.ts`) lo reintenta con las mismas esperas que el pendiente (2,5, 4 y 6 s).
  Si tras los reintentos sigue sin aparecer, se devuelve `unknown` y manda la URL, como antes
  (`verified` false). Un `not_found` en un reintento no borra un `pending` ya visto.
- **Texto de pendiente neutro.** `gracias.pendingText` decía "esto es normal con PSE" aunque se
  pagara con tarjeta; ahora dice que a veces el banco o la pasarela tardan unos minutos (es, en y
  fr).
- **Suscripción pausada con pantalla propia.** Mercado Pago `paused` antes se trataba como
  pendiente ("todavía está confirmando"), pero una pausa no se confirma sola. La ruta ahora
  responde `paused` y `/gracias` muestra "Tu suscripción está pausada": no se cobra nada por ahora
  y se reactiva o cancela desde la cuenta de Mercado Pago (`gracias.suscripcionPausedTitle` y
  `Text`, en es, en y fr; ícono de pausa en naranja). `donation_result_viewed` sale con
  `payment_status` = `paused`, `donation_success` false y `verified` true (tracking-plan y
  PLAN-DE-EVENTOS al día).
- **Francés.** `gracias.shareText` lleva espacio de no separación antes de ":", como el resto del
  archivo. De paso se corrigieron otros cuatro ":" de `terminos.*` en `fr.json` que tenían
  espacio normal.

**Verificado (2026-10-02)** con un servidor de prueba de Node en el puerto 4599 (scratchpad) y un
`.env.local` temporal con llaves falsas, **borrado al terminar**; luego se reinició el dev server en
:3000 desde este worktree y se borró `.next` (guardaba la llave falsa compilada). Por CDP a 390:
Bold con URL approved y dos `NO_TRANSACTION_FOUND` antes del APPROVED: "Confirmando" y a los 7,2 s
el gracias con `verified` true; URL pending con un 404 `NO_TRANSACTION_FOUND` y luego APPROVED: a
los 3,1 s, approved verificado; `NO_TRANSACTION_FOUND` siempre: a los 13,1 s cae a la URL
(approved, `verified` false); PENDING, NO_TRANSACTION_FOUND, PENDING: "en proceso" con el texto
nuevo, `verified` true; MP `paused`: pantalla de pausa en es, en y fr (y 1280 en es), evento
`paused`. Tras borrar el `.env.local`, la ruta responde `unknown` y ningún chunk servido contiene
la llave falsa.

## D7. Give Lively no tiene vuelta: solo se mide el clic (2026-10-05)

**Ampliación de D5 (que dejaba pendiente la vuelta de Give Lively) y de D1 (qué se mide).** Give
Lively no permite configurar un callback URL, así que la persona que dona desde Estados Unidos
nunca vuelve a `/gracias` ni a ningún otro sitio nuestro. Por eso no se construye una rama de
`payment_provider` = `givelively` en `lib/resultado-pago.ts`, ni su texto en es, en y fr, ni nada
en `/api/estado-pago`: no hay quién las llame. (Se revisó el código: ninguna de esas ramas llegó
a existir; Bold y Mercado Pago no se tocan.)

Lo único que se mide es la intención: el clic que lleva a Give Lively, `us_donation_clicked`,
ahora con `payment_provider` = `givelively` (antes iba sin propiedades), en
`components/sumate/como-ayudar.tsx`. Consecuencia para los tableros: las donaciones de EE. UU. no
cuentan en `donation_success`; se leen aparte, como clics, y la conversión real se ve en el panel
de Give Lively. `docs/mixpanel/tracking-plan.json` y `PLAN-DE-EVENTOS.md` al día.
