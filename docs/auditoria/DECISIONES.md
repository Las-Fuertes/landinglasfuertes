# Auditoría SEO y accesibilidad: decisiones

El informe completo (hallazgos con id, severidad y archivo) está en `SEO-A11Y-5-OCT.md`; el estado
por id y cómo se verificó cada uno, en `PROGRESS.md`. Aquí van las decisiones y el porqué.

## D1. SEO técnico (2026-10-05)

**Qué se hizo.** Un solo origen del sitio (`components/seo/site.ts`, por defecto
`https://www.lasfuertes.org`; la variable `NEXT_PUBLIC_SITE_URL` solo vale si su host es
`lasfuertes.org` o un subdominio, porque en Vercel estaba escrita sin la "t" y rompía las tarjetas
de WhatsApp). Canonical por idioma, hreflang es, en, fr y x-default, Open Graph y Twitter completos,
JSON-LD `NGO` por idioma (`components/seo/`), `public/sitemap.xml` con alternates y línea `Sitemap:`
en `robots.txt`, `<h1>` solo para lectores de pantalla (`meta.h1`), 404 traducida con `noindex`,
`localeDetection: false`.

**Title y description (S2), decisión de Johan.** Reemplazan los textos de "próximamente":

- es: title "Fundación Las Fuertes | Educación Menstrual Integral en Colombia"; description
  "Conoce la Fundación Las Fuertes. Llevamos Educación Menstrual Integral y herramientas de cambio a
  niñas y adolescentes en Colombia. ¡Súmate!"
- en y fr se tradujeron con CME ("Comprehensive Menstrual Education") y EMI ("Éducation menstruelle
  intégrale"), tuteo y espacio de no separación antes de `!`, `:`, `?`, `;`.
- Claves `meta.title` y `meta.description` de `locales/{es,en,fr}.json`.

**Aceptado o decidido por Johan.**

- `NEXT_PUBLIC_SITE_URL` ya corregida en Vercel por él.
- S13: `/gracias` se queda con `noindex` y con `Disallow: /gracias` en `robots.txt`. Bien que Google
  no la indexe; no se quita el bloqueo.
- S6 queda parcial: el redirect de `/es/:path*` hacía bucle 308 con `/` y `/sitemap.xml`; el
  canonical cubre el duplicado.

**Pendiente.** S10 (imagen para compartir de 1200 x 630 sin rostros de menores) espera a Johan; S16
(borrar activos muertos) pide su confirmación.

## D2. Accesibilidad WCAG 2.2 AA (2026-10-05)

**Hecho.** Enlace "Ir al contenido" (A6); selector de idioma como enlaces con `hreflang` y nombre
accesible (S5, A7); contenedor `inert` fuera de la parte alta (A3); foco que vuelve a `main` con el
deep link `/#sumate` (A10); `data-nosnippet` y trampa de Tab con el selector en la puerta (S12);
`/gracias` con foco en el h1 y región viva (docs/gracias D2).

Hoy, del lote 3:

- A9: las dos flechas `sr-only` del slider de principios usan el anillo de marca al recibir foco
  (`focus-visible:ring-2 focus-visible:ring-blue`, sin el contorno por defecto).
- S15: la primera foto del slider ya no lleva `priority`: dejó de precargarse en el `<head>`
  compitiendo con el LCP. Se quitó la prop `prioridad` de `Estampilla`.
- A12: el texto de cada estampilla termina en un espacio, para que el texto leído por la región
  viva no salga pegado. Cambio de bajo riesgo hecho sin lector de pantalla: falta probar con
  VoiceOver (anotado en el roadmap).
- A11: el campo "Otro monto" tiene etiqueta visible (ver `docs/sumate-drawer/DECISIONES.md`, D5).

**Aceptado por Johan (no se arregla).**

- A5, animaciones sin pausa (WCAG 2.2.2): se acepta el incumplimiento. No habrá botón de pausar
  animaciones. Con `prefers-reduced-motion` ya se apagan.

**Pendiente de Johan.**

- A1 y A2, contraste del texto crema sobre rosa (2,29) y azul (2,57) en las estampillas y el sello
  EMI: Johan no decidió, no se tocan. Recomendación: texto negro (6,28 y 5,60); alternativa,
  oscurecer el rosa a unos `#D94F96`.
