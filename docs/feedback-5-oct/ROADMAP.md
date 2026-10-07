# Feedback del 5-oct: roadmap

Rama `5-oct`, desde `main` en `0e1d53b` (PR #32). Todo sin commitear al escribir esto; PR #33.

## Qué se hizo hoy (2026-10-05)

- **Impacto en mobile**: el título sticky no tiembla por su `top` sino porque las alturas de la fila
  del mapa y de los pares usaban `100dvh`, que cambia en cada cuadro en iPhone. Ahora `100svh`
  (`docs/impacto/DECISIONES.md`, D8). No se reproduce en Chrome emulado: sin confirmar en iPhone.
- **Give Lively**: no tiene vuelta (sin callback URL). Solo la intención: `us_donation_clicked` lleva
  `payment_provider: 'givelively'` (`docs/mixpanel/DECISIONES.md`, D7).
- **Inglés**: revisión de la revisora aplicada o descartada bloque por bloque, es y fr intactos
  (`docs/traducciones/REVISION-5-OCT.md`). Bienvenida y títulos se quedan en español como están.
- **/gracias rehecha** con el look del sitio, misma lógica; `noindex` y `Disallow` se mantienen,
  foco en el h1 (`docs/gracias/`, D1 y D2).
- **SEO técnico** (S1 a S9, S11, S12): canonical, hreflang, OG, JSON-LD, sitemap, 404, h1, y title y
  description nuevos de Johan en es, en y fr (`docs/auditoria/DECISIONES.md`, D1).
- **Accesibilidad de foco** (A3 a A12): selector de idioma como enlaces, `inert`, foco del deep link
  `/#sumate`, anillo de las flechas del slider, "Otro monto" con etiqueta visible
  (`docs/auditoria/DECISIONES.md`, D2; `docs/sumate-drawer/DECISIONES.md`, D5).
- **Imagen del primer slide** sin precarga prioritaria (S15).

## Cómo se verificó

Verificador independiente (`VERIFICACION.md`): 0 fallas. Impacto medido por CDP a 390, 768, 1280 y
1920 (imán desktop avanza 640 px exactos); Tab en `/` y en `/#sumate` sin paradas invisibles ni fuera
del panel; `curl` de title, canonical e hreflang en 6 rutas; `type-check`, `lint` y `build` limpios
(23 páginas). Después de la última ronda: `curl` de los tres títulos nuevos y captura del drawer a
390 con el campo "Otro monto" y su etiqueta.

## QUÉ SIGUE, en orden

1. Temblor de Impacto: RESUELTO por `docs/impacto/` D9 (scroll nativo, sin título sticky ni imán,
   2026-10-06). Pendiente de que Johan lo confirme en iPhone real.
2. **Ronda de PERFORMANCE** (próxima sesión): LCP, peso de imágenes, JS de GSAP, Swiper y
   framer-motion, filtro SVG de pincel, Lighthouse mobile en producción. Medir S15 ahí.
3. A1 y A2, contraste de estampillas y sello EMI: pendiente de Johan (recomendación: texto negro).
4. S10, imagen OG de 1200 x 630 sin rostros de menores: pendiente de Johan.
5. S16, S6 parcial (`/es` duplicado) y demás de `docs/auditoria/PROGRESS.md`; A12 con VoiceOver.
6. Pendientes viejos de `docs/CONTINUAR.md`.

## Decisiones de hoy que no se reabren

Sin botón de pausar animaciones (A5); el español de Bienvenida y títulos no se cambia para seguir a
la revisora de inglés; `/gracias` no se indexa.

## Cómo se orquestó (sesión barata)

- El orquestador solo coordina; todos los subagentes en Sonnet.
- Máximo 2 a la vez, con archivos repartidos sin solape.
- Un dev server compartido en :3000 que nadie mata, salvo el verificador para el build (y luego
  `rm -rf .next` y relanzar el dev).
- Un solo verificador, al final.
- Respuestas finales de 120 a 150 palabras con línea `VEREDICTO:`.
