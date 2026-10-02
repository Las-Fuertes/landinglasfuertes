# Mixpanel: roadmap por olas

Decisiones en `DECISIONES.md` (D1 a D4). Contexto corregido para pegar en Mixpanel en
`CONTEXTO-CORREGIDO.md`. Rama `1-oct`, desde `origin/main` en `9cf867d` (PR #29).

## Estado (2026-10-01, rama `1-oct`, sin commit)

Hecho en local (D4): SDK, `lib/analytics.ts`, init en `_app`, súper propiedades, Session Replay
configurado, los 16 eventos de `tracking-plan.json`, los 10 `sendGAEvent` migrados a `track()`
con su nombre de GA, `orderId` con monto y Términos en es, en y fr. type-check y lint limpios.
Verificado por CDP contra el dev server: cada evento sale una vez con sus propiedades y no hay
peticiones a los servidores de Mixpanel en local.

Pendiente, en orden:

1. Merge a `main` (lo pide Johan).
2. En producción: comprobar en el panel de Mixpanel que llegan los eventos con `language` y
   `device_class`, y que el pageview automático trae la ruta.
3. Revisar a ojo un replay real (criterio de D2): ninguna foto en Bienvenida, EMI, mapa con
   modales, Impacto, Quiénes somos ni Súmate. Si asoma una, se apaga el replay.
4. Una donación real con Bold para ver `donation_result_viewed` con `amount_value` del
   `bold-order-id` nuevo, y `payment_flow_started` con Bold (en local no hay `BOLD_API_KEY`).
5. Armar el embudo `sumate_opened` -> `payment_flow_started` -> `donation_result_viewed`
   (approved), con los pasos de forma y frecuencia como opcionales (ver D4).

No verificable en local: replay, envío real, Bold, WhatsApp e Instagram de Súmate (sin
`NEXT_PUBLIC_WHATSAPP_NUMBER` ni `NEXT_PUBLIC_INSTAGRAM_HANDLE` en local) y la transferencia
(`DIRECT_TRANSFER` vacío, el bloque no se pinta).

## Bloqueante antes de la ola 1 (resuelto)

- [x] Token del proyecto (en `lib/analytics.ts`) y región EE. UU.

## Ola 1. Base (un constructor)

- `npm i mixpanel-browser` y `@types/mixpanel-browser` si hace falta.
- `lib/analytics.ts`: `initAnalytics()` y `track(evento, props)`. Manda a GA (`sendGAEvent`) y a
  Mixpanel. Sin token, solo GA. Súper propiedades: `idioma` (es, en, fr) y `ancho` (mobile, tablet,
  desktop según los breakpoints de PATTERNS).
- Init en `pages/_app.tsx` una sola vez (cuidado con StrictMode: dos montajes en dev). Pageview
  automático de Mixpanel con la ruta (`/`, `/gracias`, `/terminos`); UTM se guardan solos.
- Session Replay según D2.
- Migrar los 10 `sendGAEvent` a `track()` con el mismo nombre y propiedades: `sumate_open`
  (origen), `donacion_unica_click` (monto), `suscripcion_click`, `usa_givelively_click`,
  `especie_whatsapp_click`, `lleguellegue_click`, `voluntariado_click`, `instagram_click` y
  `linkedin_click` (origen).

## Ola 2. Eventos nuevos del embudo (un constructor, sin solape con la ola 1 terminada)

**Reemplazada por `PLAN-DE-EVENTOS.md`** (plan de Mixpanel revisado, nombres en inglés). La tabla de
abajo es el borrador anterior y queda solo como referencia.

| Evento                              | Dónde                                                  | Propiedades                                                                 |
| ----------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------- |
| `aviso_aceptado`                    | `components/aviso/` al pulsar Acepto                   | idioma                                                                      |
| `intro_saltada` / `intro_terminada` | `components/intro/`                                    | paso en que saltó                                                           |
| `seccion_vista`                     | una vez por sección y visita, por IntersectionObserver | seccion (bienvenida, emi, donaciones, mapa, impacto, quienes-somos, footer) |
| `principio_visto`                   | slider de EMI                                          | numero de estampilla                                                        |
| `mapa_ruta_abierta`                 | modal de una parada                                    | ruta (talleres, clubes, ruta, chiquifuertes, voces)                         |
| `mapa_saltado`                      | "Saltar mapa"                                          | parada en que saltó                                                         |
| `sumate_forma`                      | wizard del drawer                                      | forma (dinero, cosas, tiempo)                                               |
| `sumate_frecuencia`                 | Una vez / Cada mes                                     | frecuencia                                                                  |
| `donacion_monto`                    | al elegir un monto                                     | monto, es_otro                                                              |
| `donacion_resultado`                | `pages/gracias.tsx`                                    | estado (approved, pending, rejected, suscripcion), orden                    |
| `transferencia_vista`               | bloque "¿Prefieres transferir?"                        |                                                                             |
| `gracias_compartir`                 | botón "Cuéntale a tus amigos"                          |                                                                             |
| `idioma_cambiado`                   | selector de idioma                                     | de, a                                                                       |
| `sumate_cerrado`                    | al cerrar el drawer sin donar                          | ultima forma vista                                                          |

`donacion_resultado` con `approved` es el North Star de la web. Ojo: `origen=suscripcion` solo dice
que la persona volvió de Mercado Pago, no que pagó.

## Ola 3. Términos y producción

- Términos en es, en y fr según D3.
- ~~`NEXT_PUBLIC_MIXPANEL_TOKEN` en Vercel~~: ya no hace falta, el token va en el código y solo se activa en production (D4).
- Verificador independiente: en local con un token de prueba, cada evento sale una vez (no dos por
  StrictMode) con sus propiedades, mirando las peticiones de red por CDP; un replay revisado sin
  fotos (D2); type-check, lint y build limpios; el scroll táctil no empeora (D14 de la intro: nada
  de listeners no pasivos en `window`).
- Tras el merge: comprobar en el panel de Mixpanel (MCP de Mixpanel) que llegan eventos de
  producción, y armar el embudo `sumate_open` → `sumate_forma` → `donacion_monto` →
  `donacion_unica_click` → `donacion_resultado`.

## Backlog (no pedido)

- Retención real de donantes mensuales: webhooks de Mercado Pago y Bold a una ruta de `pages/api/`
  que mande el evento desde el servidor. Desde el navegador no se ve un cobro mensual.
- Meta y monto recaudado de la campaña destacada siguen en 0 (`components/sumate/sumate.data.ts`).
