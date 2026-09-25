# Bienvenida como hero y sección EMI: estado

Rama `23-sep-emi` desde `origin/main` `9861451`. Sin commitear (2026-09-23). Decisiones en
`DECISIONES.md` (D1 hero, D2 sección EMI).

## Hecho

- Bienvenida: `min-h-dvh`, ilustración anclada al fondo con `mt-auto`, sin el bloque EMI. Rol
  `emi` retirado de la llegada.
- `components/emi/` (id `emi`) montada en `pages/index.tsx` entre Bienvenida y Donaciones, con el
  slider de `components/principles/` dentro como segunda mitad.
- Variantes del chip rasgado `map-chip--emi` y `map-chip--cinta` (`styles/global.css`, anotadas en
  `docs/PATTERNS.md`).
- Claves `emi.*` en es, en y fr; `welcome.emi*` retiradas.
- CLAUDE.md (orden de la página) y `docs/CONTINUAR.md` (mapa de secciones) al día.

## Verificado (2026-09-23)

Capturas en
`/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-23-sep/e1bea937-3490-4abc-9d57-20da256c2279/scratchpad/emi/`:

- `bienvenida-<ancho>x<alto>.png` en 390x664, 390x844, 390x932, 768x1024, 1024x768, 1280x720,
  1280x832, 1512x982 y 1920x1080, con la medida por CDP de D1 (borde inferior del hero = inicio de
  `#emi` en todos).
- `emi-390x1034.png` y `emi-1280x956.png` frente a `figma-1288-913.png` y `figma-1288-676.png`.
- `llegada-390x844.png` y `llegada-1280x832.png` (parte 3 + inercia normal, 4,5 s).
- `emi-1280-{es,en,fr}.png`.
- `npm run type-check` y `npm run lint` limpios. No se corrió `npm run build`.

## Hecho: coordinación con el slider (D3)

El slider ya no pinta título, fondo ni padding de sección, y se etiqueta con la cinta
(`id="principios"`). El footer apunta a `#principios`. El aire del mazo se alineó con los
frames 1288:913 y 1288:676. Ver D3 y su ampliación en `DECISIONES.md`.

## Hecho: indicador de swipe (D4)

- Johan eligió la mezcla de A y B (2026-09-25, D4). Hecho: un solo
  componente `pista-deslizar.tsx`; opciones y parámetro `?swipe` borrados.

## Pendiente: otros

- **Fuente de acento.** La fuente de acento pasará a Bradley Hand en otra iteración (Johan,
  2026-09-23): no es de Google Fonts, hace falta el archivo con licencia web.
- **Hero en pantallas bajas** (D1): a 1280x720 la mujer se corta 53 px y a 390x664 casi entera. Si
  Johan lo quiere dentro de la pantalla, la opción es comprimir el aire con `clamp(..., dvh, ...)`
  (arriba, bajo el sol, entre texto y playa y abajo), sabiendo que a 720 se come casi todo.
- **Tablet (768 a 1023)**: la ilustración mobile se estira a todo el ancho (478 px de alto a 768) y
  el hero crece 57 px a 768x1024. Es lo de antes (D7 de la intro); se decide con diseño.
- Los bordes rasgados de la cinta se leen como pequeñas manchas negras arriba y abajo a 1x (es el
  filtro `#map-rough-edge`, el mismo de todo el sitio). Figma la dibuja recta; si la quieren recta,
  basta con `map-chip--flat` o un fondo sin filtro.
- `public/images/welcome/emi-dove.svg` queda sin uso (no se borra, regla de assets).
