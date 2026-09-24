# Resaltado y copies por idioma: progreso

Rama `24-sep-resaltado` (desde `origin/main` 7066bfc). Sin commitear.

## Patrón del chip y text-wrap (D1), 2026-09-24

**Hecho.** Un solo resaltado (`components/layout/resaltado.tsx`, `lib/use-lineas-medidas.ts`,
`.resaltado*` en `styles/global.css`) con variantes `linea`, `titulo` y `etiqueta`, giro por prop
y tonos `negro`, `rosa` y `papel`. Los 12 usos migraron; `.map-chip` y `.donation-title-chip`
ya no existen. `TituloCinta` comparte el hook de corte. El sello dice CME en inglés. `text-wrap:
balance` en títulos y `pretty` en párrafos, en `@layer base`.

**Cómo se verificó.** `scripts/medir-resaltado.js` sobre los locales finales del constructor de
copies (se comprobó por md5 que no cambiaron durante la medición): 12 usos (los 4 títulos de
Impacto y las 5 rutas del modal por separado, 19 casos) x es, en, fr x 390, 768, 1280, 1512,
1920: **285 PASA y 0 FALLA** (repetido tras los arreglos del verificador: igual) (antes: 123 PASA y 162 FALLA). Peor separación entre el fondo y la
línea vecina: antes -8,6 px, ahora -0,6 px (tolerancia 1). `npm run type-check` y `npm run lint`
limpios. Las entradas de la intro se revisaron con `captura.js --gesto` y `--tras-lista`.
Capturas `antes-*` y `despues-*` (580 PNG, ninguno de menos de 10 KB) en el scratchpad de la
sesión `3826136d`, carpeta `chip/`, con las medidas en `chip/medidas/`.

**Pendiente.**

- Impacto en español con balance: "La comprensión de / la menstruación / como ciclo natural /
  pasó del 45% al 95%" no reproduce los cortes de Figma (consecuencia de la decisión 2). Si
  Johan quiere los de Figma, habría que limitar el ancho del título por idioma.
- Los `==a== ==b==` por línea de Impacto en los locales ya no hacen falta: se pueden dejar en un
  solo `==...==` en la próxima pasada de copies (hoy funcionan igual).
- El borde rasgado sale recortado en recto arriba y abajo (la región del filtro es corta a
  propósito para que el fondo no pise la línea vecina; H11 de la auditoría queda así).

## Copies en/fr (D2), 2026-09-24

**Hecho** (solo `locales/*.json`): claves cambiadas es 28, en 43, fr 81. Las 205 claves siguen
idénticas en los tres archivos y los tres son JSON válido (comprobado con script).

- Sigla por idioma: 0 "EMI" en `en.json`, 0 "CME" en `fr.json`.
- Francés con "tu": 0 "vous", "votre" o "vos" en `fr.json`.
- U+00A0 antes de `: ; ! ? %` en francés y dentro de "Las Fuertes", "Isla Fuerte" y "802 m²" en
  los tres idiomas (salvo textos de WhatsApp y `gracias.shareText`).
- Aplicadas de `COPIES.md`: C1, C4 a C7, C9 a C23, C25 a C28, C29 a C31, C34 a C37 y el
  resaltado de `emi.paragraph1` en inglés (1.6).
- En `es.json` solo erratas: "802 m²", "Bogotá D.C.", "Cofundadora", el `\n` de "Mi ruta" movido
  para que "mi" no cuelgue, y los U+00A0.
- Añadido al aplicar: "Voix souveraines : jeunes leaders" (con "leadership des jeunes" el título del
  modal partía en tres líneas a 390); "costar un mundo" en inglés como "still takes a world of
  effort" (conserva "world" y el sentido de dificultad).

**Cómo se verificó.** `scripts/captura.js` en en y fr a 390x844 y 1280x832: intro 1 a 3 (`--paso`),
bienvenida, EMI (2 tramos), donaciones, mapa, impacto (4 tramos), quiénes somos (2 tramos),
footer, drawer (`--hash sumate`) y los modales del mapa Voces, Mi ruta y Clubes (en 390 con
`--y` para que el punto quede en pantalla). 76 PNG, ninguno bajo 10 KB. En cada una, por `--leer`:
`scrollWidth == clientWidth`, cero claves crudas y ningún `.map-chip` partido. Capturas en el
scratchpad de la sesión `3826136d`, carpeta `copies-fix/` (`resultados.txt` con las medidas).
Ojo: se tomaron mientras el otro constructor cambiaba el chip; hay que repetir las de títulos con
resaltado cuando su parte esté cerrada.

**Pendiente (fuera de mi alcance o para decidir).**

- `donations.cta` en mayúsculas dentro del JSON (C40): pasar a `uppercase` en CSS y el texto a
  minúsculas.
- `meta.title` sigue anunciando "está en camino" (C38): título definitivo de la fundación.
- Cambios de redacción en español para la fundación (ver resumen en `COPIES.md`, 1.5).
- "adolescents" frente a "teenagers" en inglés (C33): hoy es consistente dentro de cada sección.
- Raya larga en `es.json` `sumate.usa.text` (el inciso "una vez o cada mes" va entre rayas largas): no se tocó; en en y fr se
  cambió por comas.
