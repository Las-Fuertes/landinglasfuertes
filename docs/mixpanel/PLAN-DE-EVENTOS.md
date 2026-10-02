# Plan de eventos de Mixpanel (revisado)

Parte del tracking plan que generó Mixpanel (2026-10-01) y lo corrige contra el código. Los nombres
son los de Mixpanel en inglés; GA conserva sus nombres viejos (D1), así que el helper recibe los
dos cuando el evento ya existía en GA. Pendiente de aprobación de Johan.

## Qué se corrige del plan de Mixpanel y por qué

1. **Propiedades que Mixpanel ya pone solo.** `country` (geolocalización por IP), `session_id`
   (sesiones automáticas) y los UTM (`utm_source`, etc. se guardan solos y persisten como primer
   toque). Mandarlos a mano duplica columnas y `country` "unknown" pisaría el valor real. Se quitan
   de todos los eventos. `language` va una vez como súper propiedad, no en cada llamada.
2. **`suma_te_opened`** lleva el nombre partido (Súmate leído como "suma te"). Pasa a
   `sumate_opened`. Sus orígenes reales en el código son `tripulantes` (botón de Donaciones),
   `flotante`, `footer` y `hash` (enlace compartido `/#sumate`); se mapean a `donations_button`,
   `floating_button`, `footer` y `shared_link`.
3. **Aviso de menores.** `acceptance_method` siempre sería `button_click` (solo hay un botón) y
   `accepted_before_suma_te` siempre sería `true` (el aviso tapa todo el sitio; no se puede abrir
   Súmate sin aceptarlo). Se quitan. `notice_version` = `v1`, la versión de la cookie `lf_aviso`.
   Ojo: quien vuelve con la cookie ya puesta no dispara este evento; en el embudo, el primer paso
   debe ser la visita, no el aviso.
4. **`help_type` = `share_the_word` no existe** en el selector de Súmate (solo dinero, cosas y
   tiempo; "Difunde" es un bloque aparte). Y `selected_from` = `donations_section_button` no
   ocurre: ese botón abre el panel, no elige forma. Se quitan los dos.
5. **`currency` siempre es COP** dentro del sitio: los dólares van por Give Lively, fuera. Se quita
   y, a cambio, se añade el evento que falta: `us_donation_clicked`.
6. **El monto mensual no existe en el sitio.** La suscripción es un enlace fijo de Mercado Pago
   (`mpago.la/1bHZ1uA`) donde la persona elige allá. `donation_amount_chosen` solo aplica a la
   donación única. Y como el sitio **ya preselecciona $50.000**, quien dona sin tocar el monto
   nunca dispararía ese evento: el monto tiene que ir también en `payment_flow_started`.
7. **`selected_method` no se puede saber**: tarjeta, PSE o Nequi se eligen dentro de Bold, no en
   el sitio. Nequi, Daviplata y Bancolombia por transferencia no son un flujo de pago, son datos
   que se copian. Se quita; la transferencia se mide como `transfer_details_viewed`.
8. **`payment_result_received` y `completed_donation_thank_you_viewed` son el mismo hecho.** Sin
   webhooks de servidor, el único resultado que ve el sitio es la vuelta a `/gracias` con
   `bold-tx-status`. Se fusionan en `donation_result_viewed`. El nombre "completed" mentía para
   `rejected`.
9. **El monto en `/gracias`.** Bold solo devuelve `bold-order-id` y `bold-tx-status`. Propuesta: que
   el `orderId` lleve el monto (`lasfuertes-50000-<marca>-<azar>`), así `/gracias` lo lee de la URL
   sin guardar nada en el navegador. Esto es lo que vuelve medible el North Star en pesos.
10. **La suscripción no confirma pago.** Volver de Mercado Pago (`origen=suscripcion`) no dice que
    cobró. Se reporta como `payment_status` = `subscription_returned`, nunca `approved`.
11. **`whatsapp_click`.** `share_the_word` no va por WhatsApp (es Instagram y LinkedIn) y falta la
    ropa del Llegue-Llegue. Contextos reales: `volunteering`, `in_kind_goods`, `clothing_llegue`.
    `button_location` siempre sería el panel de Súmate: se quita.
12. **`impact_map_section_viewed`** se llama como una sección pero mide todas: pasa a
    `section_viewed`. `time_on_section_seconds` obliga a mandar el evento al salir (se pierde al
    cerrar la pestaña y choca con el imán de Impacto y el pin de la intro): se manda al entrar, una
    vez por sección y visita, sin tiempo. Si se quiere tiempo, el replay lo da.
13. **El razonamiento de Mixpanel dice "sin replays con imágenes de menores"**, pero D2 decidió
    replay encendido con imágenes enmascaradas. Manda D2.

## Lo que el plan no tenía y conviene sumar

- `us_donation_clicked` (ya existe en GA como `usa_givelively_click`).
- `social_click` con `network` (instagram, linkedin) y `location` (footer, difunde, gracias).
- `map_route_opened` con `route` (talleres, clubes, ruta, chiquifuertes, voces): dice qué programa
  interesa, que es lo más cercano al producto real de la fundación.
- `intro_skipped` con `step`: cuánta gente se salta la historia antes de llegar a Súmate.
- `thank_you_shared`: el paso de referido del modelo de crecimiento.
- `sumate_closed` con `last_help_type`: abandono del panel.

## Plan final

| Evento                             | Propiedades                                                                                                        | Nombre en GA                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `child_protection_notice_accepted` | notice_version                                                                                                     | (nuevo)                                                                |
| `intro_skipped`                    | step                                                                                                               | (nuevo)                                                                |
| `section_viewed`                   | section_name (welcome, emi, donations, educational_map, impact, who_we_are)                                        | (nuevo)                                                                |
| `map_route_opened`                 | route                                                                                                              | (nuevo)                                                                |
| `sumate_opened`                    | entry_source                                                                                                       | `sumate_open`                                                          |
| `sumate_help_type_selected`        | help_type (money, goods, time)                                                                                     | (nuevo)                                                                |
| `donation_frequency_selected`      | frequency (one_time, monthly)                                                                                      | (nuevo)                                                                |
| `donation_amount_chosen`           | amount_value, amount_type (preset, custom)                                                                         | (nuevo)                                                                |
| `payment_flow_started`             | payment_provider (bold, mercado_pago), frequency, amount_value (solo bold), amount_type                            | `donacion_unica_click` / `suscripcion_click`                           |
| `donation_result_viewed`           | payment_status (approved, pending, rejected, subscription_returned), provider_status_code, frequency, amount_value | (nuevo)                                                                |
| `transfer_details_viewed`          |                                                                                                                    | (nuevo)                                                                |
| `us_donation_clicked`              |                                                                                                                    | `usa_givelively_click`                                                 |
| `whatsapp_click`                   | whatsapp_context (volunteering, in_kind_goods, clothing_llegue)                                                    | `voluntariado_click` / `especie_whatsapp_click` / `lleguellegue_click` |
| `social_click`                     | network, location                                                                                                  | `instagram_click` / `linkedin_click`                                   |
| `thank_you_shared`                 |                                                                                                                    | (nuevo)                                                                |
| `sumate_closed`                    | last_help_type                                                                                                     | (nuevo)                                                                |

Súper propiedades (van solas en todo evento): `language`, `device_class` (mobile, tablet, desktop).
Automáticas de Mixpanel: país, ciudad, sesión, UTM, navegador, pageviews.

North Star de la web: `donation_result_viewed` con `payment_status = approved`, suma de
`amount_value`. Embudo principal: `sumate_opened` → `sumate_help_type_selected` (money) →
`donation_frequency_selected` → `payment_flow_started` → `donation_result_viewed` (approved).

**Ampliación (2026-10-01, Johan):** se quita `language_changed`: no le interesa el dato y gasta
cuota de eventos. El idioma sigue llegando como súper propiedad. Quedan 16 eventos. El schema para
pegar en Mixpanel está en `tracking-plan.json`.
