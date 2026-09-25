# Progreso: sección Impacto

## Estado (2026-09-25), D2

Hecho en la rama `24-sep-pulido`, sin commitear (ver DECISIONES.md, D2):

- Mobile y tablet: una sola distancia imagen-texto, `mt-xl` (40 px), en los cinco bloques
  (antes 138, 50, 75, 92 y -31 en el mapa).
- Entrada de la primera fila (título, flor, mapa, territorios, etiquetas) pausada, en 2,1 s y
  solo cuando la cortina de "Terminar" / "Saltar mapa" ya se fue. Territorios por opacidad en vez
  de `fill`.
- Archivos: `components/impacto/mapa-impacto.tsx`, `bloque-impacto.tsx`, `bloques.data.ts`,
  `use-sin-cortina.ts` (nuevo), `styles/global.css` (bloque "MAPA DE IMPACTO"),
  `components/education-map/cortina.ts` (marca y evento de la cortina) y un comentario de
  `coreografia.ts`; párrafo del mapa de impacto en `docs/PATTERNS.md`.

**Cómo se verificó:**

- Distancias por CDP (`getBBox` del mapa, cajas de los lienzos, que el escaneo de píxeles mostró
  ceñidas al dibujo) a 360x640, 390x844, 428x746 y 768x1024 en es, en y fr, tras la animación:
  42, 40, 40, 40, 40; entre bloques 120 (150 en tablet). Capturas `antes|despues-<ancho>-<lang>-<tramo>.png`
  en el scratchpad (las de 360 y 428 "antes", con el código de `main`).
- `medir-resaltado` de Impacto a 360, 390, 428, 768, 1280 y 1512: 36 de 36 en cada idioma.
- Línea de tiempo con un sondeo propio por CDP que muestrea estilos calculados en cada frame
  (cortina emulada con los tiempos de `coreografia.ts`, scroll normal a 14 px por frame y el flujo
  real con clic en "Saltar mapa"); CPU 4x: 0 frames > 34 ms; reduced motion: nada se mueve.
- Desktop 1280 y 1512: idéntico salvo 289 px de antialiasing en el mapa (ver D2).
- `npm run type-check` y `npm run lint` limpios.

## Estado (2026-09-24)

Hecho en la rama `24-sep-pulido`, sin commitear (ver DECISIONES.md, D1):

- Desktop (>= 1024) a dos columnas con filas intercaladas; el título de la sección junto al mapa;
  aire superior de 112 px tras el Mapa educativo. Mobile y tablet sin cambios.
- Archivos: `components/impacto/impacto-section.tsx`, `bloque-impacto.tsx`, `mapa-impacto.tsx`.

**Cómo se verificó:**

- Capturas antes y después con `scripts/captura.js --ancla impacto --tras 4500 --y <tramo>` a
  390x844, 768x1024, 1280x832, 1512x982 y 1920x1080 en es, en y fr
  (`antes|despues-<ancho>-<lang>-<tramo>.png` en el scratchpad de la sesión). A 390 y 768 las 30
  parejas son idénticas byte a byte; se tomaron con el código de `main` y con el nuevo en el
  mismo minuto, porque otros constructores cambiaban a la vez secciones de más arriba (el
  desplazamiento de la página cambia el grano del filtro rasgado y daba diferencias falsas).
- Sonda CDP por fila a 1280, 1512 y 1920 en los tres idiomas: ilustración y texto del lado
  esperado, diferencia de centros verticales 0 o 1 px, solape entre texto (con sus tiras de
  resaltado) y dibujo (con sus etiquetas) de 0 px, sin scroll horizontal. Caracteres por línea
  del párrafo: las frases que se parten lo hacen entre 45 y 57; las cortas (entre 23 y 64
  caracteres) caben en una línea.
- `node scripts/medir-resaltado.js --usos impacto-titulo1..4,impacto-cierre,impacto-etiquetas`:
  30 de 30 en cada idioma.
- Animaciones sondeadas a 150 y 3500 ms por fila (ver D1).
- `npm run type-check` y `npm run lint` limpios.

## Telón (2026-09-25)

El traspaso de "Terminar" a Impacto ya no sube una cortina: fundido de 400 ms, salto, fundido de
salida de 500 ms, e Impacto entra 120 ms antes del final con movimientos de 4 a 8 px (D2, punto 3).
Verificado con el flujo real por CDP (línea de tiempo cada 50 ms, capturas `telon-<ms>.png`), CPU
4x sin frames lentos, reduced motion sin cortina. type-check y lint limpios.

## Encaje (2026-09-25), D3

La primera fila (título de sección, mapa con etiquetas y el bloque "7 territorios") cabe entera
en la primera pantalla en 360x640, 375x667, 390x664, 390x844, 428x746, 768x1024, 1280x720,
1280x832, 1440x900, 1512x982 y 1920x1080, en es, en y fr: flor al final del título, menos aire y
un mapa que mide lo que quepa. Verificado por CDP con Impacto en top 0 (sondeo de cajas), capturas
`encaje-<ancho>x<alto>-<lang>.png`, `medir-resaltado` 54 de 54 por idioma, línea de tiempo del
telón sin cambios. type-check y lint limpios.

## Pendientes

1. Resuelto (2026-09-25): Johan descartó el título de sección junto al mapa; vuelve centrado
   arriba en desktop y la fila 1 es mapa y cierre (D1). Medido a 1280, 1512 y 1920 en es, en y
   fr: centros alineados, 0 solapes, `medir-resaltado` 18 de 18; mobile y tablet idénticos a la
   versión anterior (A/B por captura con el mismo código salvo este cambio).
2. Resuelto: a 1024 el cierre del mapa en español dejaba "a Colombia." sola. El párrafo del cierre
   lleva `lg:text-balance`; sin viudas en es, en y fr a 1024, 1280, 1512 y 1920 (líneas de 27/26,
   33/26 y 34/41 caracteres, o una sola en español desde 1280). Mobile y tablet siguen idénticos.
3. Resuelto (2026-09-25): a 1024 en francés quedaban "par an." y "toujours été là." solas. Los
   párrafos de los cuatro bloques llevan también `lg:text-balance`. Revisados todos los párrafos
   de Impacto en es, en y fr a 1024, 1280, 1512 y 1920: ninguna última línea de una o dos palabras
   (la más corta, 23 caracteres, es un párrafo de una sola línea). Mobile y tablet idénticos.
4. Tablet de Impacto sigue siendo la columna mobile escalada (D7 de `docs/secciones-impacto/`);
   no se tocó.
