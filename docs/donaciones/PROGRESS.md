# Progreso: sección Donaciones

## Estado (2026-09-23)

Hecho en la rama `23-sep-emi`, sin commitear (ver DECISIONES.md, D1 y D2):

- Mobile fiel a 1288:1478 y desktop nuevo según 1288:1594; tablet con la composición desktop.
- Assets nuevos en `public/images/donations/`: `barco-mobile.svg`, `barco-desktop.svg`,
  `olas-desktop.svg` y `olas-mobile.svg` (compuesto con los siete vectores del frame). Fuentes tal
  cual se exportaron en `design-assets/donaciones/`. Los viejos (`paper-ship.png`,
  `sea-waves.svg`, `sea-waves-tile.svg`) siguen en disco sin uso.
- Copy: `donations.title` reemplaza a `titleLine1..6`; la negrita de `paragraph1` pasa a la
  primera frase entera. Los tres idiomas.
- Token nuevo `papel` (#FFF5E8) en `tailwind.config.js`; peso 800 de Bricolage en `pages/_app.tsx`.

**Cómo se verificó:** `scripts/captura.js --ancla tripulantes` a 390x871, 360x800, 430x932,
768x1024, 1024x768, 1280x956, 1512x982 y 1920x1080, y en/fr a 390 y 1280; medidas por CDP (`--leer`)
a 0 o 1 px del frame a 390 y 1280; clic real en el botón (`--clic "#tripulantes button"`) abre el
drawer con `#sumate`. `npm run type-check` y `npm run lint` limpios.

## Pendientes

1. **Decidir con la diseñadora**: el botón mobile está en x=111, no centrado, como el frame. Si era
   un descuido del frame, es cambiar `.boton` en `donations.module.css`.
2. **Título en inglés**: el corte natural deja "with" sola en mobile ("Leading change / with /
   comprehensive...") y "crews" sola en desktop. No es un error de maquetación; si molesta, se
   ajusta la traducción.
3. **Limpieza**: `.donation-title-chip` en `styles/global.css` y los assets viejos ya no se usan.
   Se dejaron por la regla de no borrar assets; se retiran cuando Johan lo diga.
4. **Propuesta de movimiento (no implementada)**: el barco meciéndose sutil en reposo (giro de 3
   a 4 grados, ciclo de 4 a 5 s, con las ondas respirando en opacidad), según el punto 8 del
   lenguaje de movimiento. Requeriría separar barco y ondas en SVG aparte.
