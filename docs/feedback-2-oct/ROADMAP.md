# Feedback del 2-oct: roadmap por olas

Rama `2-oct`, desde `origin/main` en `15ad467` (PR #30), en el worktree `1-oct`.

## Feedback literal de Johan (2026-10-02)

**Pagos (con dinero real en producción).**

- Bold funcionó: volvió a
  `/gracias?bold-order-id=lasfuertes-5000-1790940967450-8900&bold-tx-status=approved` y mostró el
  gracias. Bold fue algo lento, pero es de Bold.
- Mercado Pago (suscripción mensual) volvió a `/gracias?preapproval_id=<id>` y el sitio mostró
  **pago fallido**: faltaba reconocer esa URL. Hay que mostrar el gracias mensual y ajustar los
  eventos de Mixpanel. "No creo que estemos trackeando de forma acertada el success o el error."
- Give Lively (EE. UU.): no admite callback URL, no habrá vuelta a `/gracias`. Solo se mide el clic (docs/mixpanel/DECISIONES.md, D7).
- Decisión de Johan: primero "solo leer la URL"; **cambiada el mismo día**: el éxito se confirma
  consultando a Bold y a Mercado Pago con el id de la vuelta (`pages/api/estado-pago.ts`, D6 de
  `docs/mixpanel/`). Sin webhooks por ahora. Requiere `MP_ACCESS_TOKEN` en Vercel.

**Página (todo en celulares reales).**

1. Impacto: el título sticky tiembla mucho al hacer scroll en mobile.
2. Modales del mapa con mucho flash al abrir, "como si estuviera corto de memoria"; el drawer de
   Súmate se siente lento desde el clic y en sus interacciones. "¿Qué estamos haciendo mal?"
3. Quiénes somos sigue capturando el scroll.
4. En toda la página, al volver hacia arriba la barra de Safari reaparece y el contenido salta;
   al retomar el scroll hacia abajo, otra vez.
5. Botón "volver arriba" abajo a la derecha, traducido en es/en/fr. Decisión de Johan: aparece al
   hacer scroll hacia arriba, pasada Bienvenida, y se esconde al bajar.

## Olas

- Ola 1 (en paralelo): diagnóstico de rendimiento y scroll (puntos 1 a 4, sin tocar código) y
  constructor de pagos (Mercado Pago en /gracias y eventos).
- Ola 2: arreglos del diagnóstico y botón volver arriba (archivos sin solape).
- Ola 3: verificador independiente, prueba de Johan en celular, PR.

## Diagnóstico y decisiones de Johan (2026-10-02)

Diagnóstico medido en Chrome (CDP, 390, táctil, CPU x4) y WebKit (Playwright) contra producción.

1. **Saltos al volver hacia arriba, "temblor" del título de Impacto y "captura" de Quiénes somos
   son la misma causa**: siete bloques miden `100dvh` (intro, Bienvenida, ilustración de playa,
   Donaciones, Impacto y sus bloques), que cambia 81 px cuando Safari muestra o esconde su barra; lo
   visible salta la suma de lo de encima (141 px en Bienvenida, 405 en Impacto, 567 en Quiénes
   somos). Con `svh` el salto medido es 0. El título sticky no se mueve (top 0 en 768 frames) y
   Quiénes somos no retiene el dedo. **Johan: se deja como está** ("es en toda la página que pasa").
   No volver a proponer el cambio a `svh` salvo que él lo pida.
2. **Lentitud de modales del mapa y de Súmate**: el borde de pincel es un filtro SVG en vivo
   (`components/layout/rough-edge-filter.tsx`); en WebKit, 183 a 231 ms de frames perdidos al abrir
   el modal y 201 a 323 ms el drawer, frente a 28 a 50 y 13 a 51 sin filtro. **Johan: no tocar el
   borde.**
3. **Demora desde el toque**: el modal espera hasta 250 ms la foto
   (`components/education-map/use-route-sequencer.ts`) y el drawer monta todo al hacer clic.
   Aprobado como arreglo sin cambio visual: precargar las fotos del mapa y dejar Súmate montado.
4. **Session Replay al 100 %** sube tareas largas en Impacto (22 a 40 ms, un frame de 288 ms).
   **Johan: se deja al 100 %.**
5. **Publicación**: todo junto en un PR.

Verificador de pagos: aprobado. Detalles menores a corregir en la ola 2: reintentar también
`NO_TRANSACTION_FOUND` de Bold, texto de pendiente neutro (hoy dice "normal con PSE"), suscripción
pausada con texto propio, espacio de no separación en `gracias.shareText` en francés.

## Ola 2

- Constructor A: precarga de fotos del mapa y Súmate montado (sin cambio visual).
- Constructor B: botón volver arriba y los cuatro detalles de pagos.

## Ola 3: feedback literal de Johan (2026-10-02)

- "para volver arriba: el ícono es muy diferente al que utilizamos, pongamos la flecha que ya
  utilizamos en el intro".
- "en la pantalla de bienvenida, a veces la gente no quiere esperar a que termine de cargar la
  animación, deberían poder hacer scroll libremente en cualquier momento en la bienvenida".

Un constructor para los dos (decisión nueva en `docs/introduccion/`), luego verificador y PR único.
