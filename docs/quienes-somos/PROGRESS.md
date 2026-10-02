# Progreso: sección Quiénes somos

## Estado (2026-10-01), D3

- Párrafo de mobile a `spacing.l` (25 px) de cada borde de la pantalla, fuera de la caja de 390:
  340 de ancho a 390 (antes 310) y 380 a 430 (antes 310). Desktop igual. Ver D3.
- Pendiente: entre 600 y 767 (teléfono en horizontal) el párrafo llega a 717 de ancho, más que en
  tablet (651); si molesta, topar con un `max-w`. Confirmar con Johan si a 360 quiere aún menos
  margen (sigue en 11 líneas).

## Estado (2026-09-30), D1 y D2

Hecho en la rama `30-sep`, sin commitear:

- Desktop según Figma `1437:1518`, mobile según `1219:985`, tablet con las fichas de desktop en
  dos columnas. Conchas, pájaros y fotos descargados de Figma.
- Equipo de ocho: sale Karina Cely; fotos y cargos nuevos en es, en y fr.
- Archivos: `components/quienes-somos/quienes-somos-section.tsx`, `quienes-somos.data.ts`,
  `quienes-somos.module.css` (nuevo); `public/images/quienes-somos/2026-09/*.jpg`,
  `concha-a.svg`, `concha-b.svg`, `pajaros-{rosa,azul}-{grande,chico}.svg` (nuevos); claves
  `quienesSomos.roles` en `locales/*.json`.

**Cómo se verificó:**

- Capturas con `scripts/captura.js` a 390x844, 768x1024, 1024x768, 1280x800, 1512x982 y
  1920x1080 en es, en y fr (`q-<lang>-<ancho>.png` en el scratchpad `ola3F/`), más capturas altas
  de la sección entera a 390, 768, 1000 y 1280 comparadas con `get_screenshot` de los dos frames:
  misma composición, tamaños, pájaros y cortes de cargo.
- Por CDP en fr a 390, 768, 1024 y 1920: `scrollWidth` igual al ancho (sin scroll horizontal) y
  las 34 imágenes de la sección con `naturalWidth > 0`.
- Entradas: 50 ms después de llegar, sin `--reducido` las piezas están en opacidad 0 a 0,14; con
  `--reducido` todo lo que está en pantalla está en 1 (quedan en 0 solo las fichas aún fuera de
  pantalla y los pájaros del otro breakpoint, que están en `display: none`).
- `npm run type-check` y `npm run lint` limpios.

## Pendientes

- Confirmar con Johan la grafía "Vanessa Córtes" (¿Cortés?) y "Co-Fundadora".
- En francés el cargo de Paola parte en tres líneas a 1024; se lee bien, pero es el más largo.
- Sin vida en reposo (pájaros que se mecen): el encargo pedía solo entradas; si se quiere, va en
  los pájaros, que son vector.
