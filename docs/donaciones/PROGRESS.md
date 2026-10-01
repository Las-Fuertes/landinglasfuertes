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

## 2026-09-30 (D3)

Rama `30-sep`, sin commitear: olas y barco animados (capas nuevas en `public/images/donations/`:
`olas-desktop-<vector>.svg`, `olas-mobile-1..7.svg`, `barco-*-casco.svg`, `barco-*-ondas.svg`),
mar pegado al borde izquierdo en desktop como en el Figma actual (x -13), sección de al menos una
pantalla con más aire arriba y entre el botón y las olas. Verificado por CDP (cifras en D3);
`type-check` y `lint` limpios.

## 2026-10-01 (D4)

El mar se reparte en pantallas muy anchas: cada ola se corre a la derecha una fracción de lo que
sobra sobre 1512; hasta 1512 nada cambia. Mayor hueco sin olas a 2560 de 554 a 252 px. Verificado
por CDP (D4). Falta que Johan lo mire en una pantalla ancha real.

## Pendientes

1. **Decidir con la diseñadora**: el botón mobile está en x=111, no centrado, como el frame. Si era
   un descuido del frame, es cambiar `.boton` en `donations.module.css`.
2. **Título en inglés**: el corte natural deja "with" sola en mobile ("Leading change / with /
   comprehensive...") y "crews" sola en desktop. No es un error de maquetación; si molesta, se
   ajusta la traducción.
3. **Limpieza**: `.donation-title-chip` en `styles/global.css` y los assets viejos ya no se usan.
   Se dejaron por la regla de no borrar assets; se retiran cuando Johan lo diga.
4. ~~Propuesta de movimiento~~: hecha en D3.
5. **Prueba de Johan de D3**: si el vaivén se nota poco o mucho, las cifras están juntas al final
   de `donations.module.css` y en `OLAS_*` de `donations-section.tsx`. El aire nuevo (128/48 en
   mobile, 220/80 desde `md`) no viene de un frame: validarlo con diseño.
6. **Limpieza**: `olas-desktop.svg`, `olas-mobile.svg`, `barco-desktop.svg` y `barco-mobile.svg`
   quedaron sin uso (las capas los reemplazan). No se borran sin que Johan lo diga.
