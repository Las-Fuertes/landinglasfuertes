# /gracias: decisiones

## D1. /gracias con el look del sitio (2026-10-05)

**Por qué.** La página a la que vuelven Bold y Mercado Pago era una tarjeta blanca con un icono de
lucide sobre fondo beige: no se parecía a nada del sitio. Se rehizo solo la presentación, con los
patrones que ya existen. La lógica (consulta a `/api/estado-pago`, eventos de Mixpanel, query
params) no cambió.

**Separación.** Antes todo vivía en `pages/gracias.tsx`.

- `components/gracias/resultado.ts`: tipos y `decidir()`, copiados tal cual.
- `components/gracias/use-resultado-gracias.ts`: lectura de la vuelta, redirección sin parámetros,
  `confirmarConPasarela`, `trackSinRepetir('donation_result_viewed', ...)` con las mismas
  propiedades (`payment_provider`, `payment_status`, `donation_success`, `verified`, `frequency`,
  `provider_status_code`, `amount_value`) y `thank_you_shared`.
- `components/gracias/gracias-vista.tsx`: solo presentación; recibe `pantalla`, `orderId`,
  `onShare`, `copied`.
- `pages/gracias.tsx`: une las dos y pone el `<title>` y `noindex`.

**Patrones reutilizados y por qué.**

- Fondo `beige`, nubes de Bienvenida (`public/images/welcome/*cloud*`), quietas.
- Dibujo arriba: la estrella de mar del aviso con su salto (`useSaltoEstrella`), el sol rosado de
  Bienvenida y la gaviota. Son las piezas que ya conoce quien visita el sitio.
- Frase manuscrita en Pangolin (`font-acento`, `text-blue`) sobre el título.
- Título en chip rasgado con `Resaltado` (`variante="titulo"`): `tono="rosa"` en éxito, `negro` en
  espera y falla. Sin chips ni cintas nuevos.
- Aire título a texto de `mt-xl` (docs/feedback-30-sep/AIRE.md).
- Botones con la forma de los CTA de Súmate: se exportó `CTA_BASE` de `components/sumate/ui.tsx`
  (azul principal, negro secundario). Se usa `next/link`, que conserva el idioma; `CtaLink` es un
  `<a>` plano y perdía el prefijo `/en`.
- `FadeIn` escalonado (texto primero, botones 0,25 s después) y `prefers-reduced-motion` por
  `MotionConfig`.
- `LanguageSwitcher`, `SumateDrawerProvider` + `SumateDrawer` y `Footer` como en `/terminos`. El
  footer queda bajo el pliegue (el contenido ocupa `min-h-dvh`).
- Copy nuevo en es, en y fr: `gracias.acentoExito`, `acentoEspera`, `acentoFalla`.

**Estados.**
| Estado | Dibujo | Título | Botones |
| --- | --- | --- | --- |
| Verificando (`confirmando`, `role="status"`) | estrella | negro | ninguno |
| Aprobado, suscripción activa | estrella | rosa | compartir, volver, Instagram |
| Pendiente, suscripción en proceso, pausada | sol | negro | compartir, volver, Instagram |
| Rechazado | gaviota | negro | Intentar de nuevo (`/#sumate`), volver |
| Caída a la URL (API sin respuesta) | la pantalla que dice la URL | igual | igual |

La caída a la URL no es una pantalla propia: es el mismo flujo con `verified: false`. Se verificó
con la página real (`/gracias?bold-tx-status=approved&bold-order-id=...`), que en local no tiene
llaves y cae a la URL.

**Cómo se verificó.** Capturas en `docs/gracias/capturas/` (`<estado>-<ancho>.png`) con
`scripts/captura.js`. Los estados que dependen de la API se forzaron con una página temporal que
montaba `GraciasVista` por `?estado=`; ya está borrada. El `type-check` y el `lint` pasan.

**Cambio de comportamiento menor.** "Intentar de nuevo" iba a `/#donar` y ahora va a `/#sumate`
(pedido de la tarea). Los eventos no cambian.

## D2. `noindex`, `Disallow` y foco (2026-10-05)

**Indexación.** Johan decidió que está bien que Google no indexe `/gracias`: se mantiene el `noindex`
del meta (`pages/gracias.tsx`) y también el `Disallow: /gracias` actual de `public/robots.txt`. El
informe (S13) sugería quitar el bloqueo para que Google lea el `noindex`; no se hace. No volver a
proponer indexarla.

**Foco y lectores de pantalla.** El foco inicial va al `h1` (`tabIndex={-1}`, sin anillo) al cargar y
cada vez que cambia el resultado (de "verificando" a aprobado, pendiente o rechazado). Hay una región
viva `aria-live="polite"` permanente con el título, así "Confirmando tu pago" se anuncia y luego su
resultado. El enlace "Ir al contenido" no aparece aquí: si el `main` de `/gracias` gana
`id="contenido"`, hay que sumar la ruta a `RUTAS_CON_CONTENIDO` en `pages/_app.tsx`.

**Medido.** Contraste de `text-black/70` sobre el beige: unos 8:1 (pasa AA). Objetivos táctiles:
ninguno menor de 24 px. Un solo `h1`.
