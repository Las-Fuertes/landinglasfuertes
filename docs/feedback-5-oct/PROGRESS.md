# Feedback del 5-oct: progreso

## Tarea 1. El título de Impacto tiembla en mobile

**Causa.** Con el título fijo (`sticky top-0`, CSS puro) no hay JS ni motion values por frame: su
`top` no se mueve. El temblor viene de que las alturas de la fila del mapa y de los pares
(`min-h` y arte) usaban `100dvh`, que en iPhone cambia en cada cuadro mientras la barra de Safari
entra o sale; todo el contenido bajo el título se reflowa. Decisión: `docs/impacto/DECISIONES.md`, D8.

**Arreglo.** `100dvh` a `100svh` en `components/impacto/impacto-section.tsx` (2 veces) y
`components/impacto/bloque-impacto.tsx` (1).

**Medición** (CDP, 390x844 con táctil, scripts del scratchpad de la sesión, `tiembla.js`).

| Prueba                                                   | Antes             | Después                                          |
| -------------------------------------------------------- | ----------------- | ------------------------------------------------ |
| `top` del título, gestos táctiles reales (407 cuadros)   | 0,00 px (rango 0) | 0,00 px (rango 0)                                |
| `top` del título, CPU 6x más lenta                       | 0,00 px           | 0,00 px                                          |
| `top` del título con alto de ventana en vaivén 844 a 934 | 0,00 px           | 0,00 px                                          |
| Corrimiento de un bloque en el documento con ese vaivén  | 360 px            | 360 px (el emulador no distingue `svh` de `dvh`) |

Honesto: el temblor no se reproduce en Chrome emulado y el criterio de 0,5 px se cumple antes y
después. La causa se deduce del acoplamiento de las alturas al alto dinámico; falta verlo en un
iPhone real. Si siguiera, el siguiente paso es promover el título a su capa (`transform-gpu`).

## Tarea 2. Give Lively sin vuelta

Give Lively no permite callback URL. Se confirmó en el código que no existía ninguna rama que
esperara su vuelta (`pages/gracias.tsx`, `lib/resultado-pago.ts`, `/api/estado-pago` solo conocen
Bold y Mercado Pago), así que no hubo nada que quitar.

- `components/sumate/como-ayudar.tsx`: `us_donation_clicked` ahora lleva
  `payment_provider: 'givelively'`.
- `docs/mixpanel/tracking-plan.json` y `PLAN-DE-EVENTOS.md`: propiedad añadida.
- `docs/mixpanel/DECISIONES.md`: D7 (ampliación de D5 y D1); `ROADMAP.md`, `docs/CONTINUAR.md` y
  `docs/feedback-2-oct/ROADMAP.md`: el pendiente de Give Lively retirado.
