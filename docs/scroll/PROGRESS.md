# Scroll en mobile: progreso

Rama `7-oct-scroll`.

## Hecho (2026-10-07)

- D1 alto fijo: `--alto-fijo` en `_document`, utilidades `h-pantalla` y `min-h-pantalla`,
  reemplazo de `dvh` en intro, Bienvenida, ilustración de la playa y Donaciones.
- D2 M3: `touchmove` pasivo arriba del todo, bloqueante solo en el pin.
- Ronda 2: `--alto-grande` y `mb-barra` para intro y Bienvenida a sangre, mapa pasado a
  `--alto-fijo` (documento sin cambio de alto en los dos órdenes de carga), type-check y lint limpios.

## Pendiente

- Probar en iPhone real: tirón al subir con la barra, y el `touch-action: pinch-zoom` de D2.
- Siguen con `dvh` o `innerHeight`:
  `education-map-section.tsx:340` (stage `h-dvh`, sticky, no empuja), `route-sheet.tsx:176`,
  `sumate-drawer.tsx:270`, `gracias-vista.tsx:155`, `pages/404.tsx:20`, `pages/gracias.tsx:30`
  (`min-h-dvh`, páginas sueltas), `volver-arriba.tsx` y `use-saltar-mapa.ts` (`innerHeight` en
  runtime). El track del mapa usa `100lvh - 100svh`; revisar que no mueva el documento.
- Lotes B y C de la auditoría (M2, M4 a M9).
