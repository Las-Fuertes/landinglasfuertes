# Aire entre título y texto en toda la página (frente H, 2026-09-30)

**Pedido** (`FEEDBACK.md`, nota del punto 9): que el aire entre el título de cada sección y su
texto sea el mismo en toda la página, o al menos suficiente para que nada se vea apeñuscado.

## La escala

Dos valores de Tailwind, por nombre, medidos de caja a caja (borde inferior del título, borde
superior de lo que sigue):

| Qué hay bajo el título de la sección              | Mobile y tablet | Desktop (`lg+`) |
| ------------------------------------------------- | --------------- | --------------- |
| Texto (párrafo, pregunta, subtítulo)              | `xl` (40 px)    | `xl` (40 px)    |
| Un dibujo o un componente grande (mapa, selector) | `xl` (40 px)    | `xxl` (65 px)   |

Por qué 40: es lo que ya fijaron Quiénes somos (D1) e Impacto (D4) y es un token del sistema. Por
qué 65 en desktop para dibujos: Impacto (título a mapa, D4) y "¿Cómo quieres ayudar?" (título a
selector, 72 en Figma) ya estaban ahí; un dibujo grande necesita más aire que un párrafo para leerse
como bloque aparte. La escala está también en `docs/PATTERNS.md`, "Tipografía y espaciado".

## Qué cambió

| Sección                  | Antes (390 / 768 / 1280 / 1920) | Después     | Clase                                                                |
| ------------------------ | ------------------------------- | ----------- | -------------------------------------------------------------------- |
| EMI, título a párrafos   | 18 / 18 / 36 / 36               | 40 en todos | `mt-[1.125rem] lg:mt-9` a `mt-xl` (`components/emi/emi-section.tsx`) |
| Súmate, título a párrafo | 25 / 25 / 40 / 40               | 40 en todos | `mt-l lg:mt-xl` a `mt-xl` (`components/sumate/sumate-hero.tsx`)      |

EMI era el caso apeñuscado: 18 px bajo un título de dos líneas a 30 px. Los 18 y 36 venían del
frame de Figma de EMI; se elige la escala, que no rompe nada (la sección solo crece 22 px en
mobile). En Súmate, "¿Cómo quieres ayudar?" ya iba a 40 justo debajo, así que la cabecera se veía
más apretada que la pregunta que la sigue.

## Lo que ya cumplía o se deja a propósito

- **Quiénes somos** (40 en todos) e **Impacto** (título a mapa: 40, 50 con `--k` en tablet, 65 en
  desktop): ya en la escala.
- **Donaciones** (47 en mobile, 69 desde tablet): son las distancias explícitas de Figma
  (1288:1478 y 1288:1594), en el módulo CSS. Conflicto: 7 px sobre la escala en mobile y 4 sobre
  `xxl` en desktop. No se ve apeñuscado y la columna está encajada contra el barco y las cintas;
  se queda como Figma.
- **"¿Cómo quieres ayudar?"** (40 en mobile y tablet, 72 en desktop, título a selector): Figma
  fija 72; 7 px sobre `xxl`, se queda.
- **Principios** (título "Así lo comprendimos nosotras" al mazo de estampillas: 46 a 100 según el
  ancho): el aire lo da el propio mazo (su padding y la pose de la carta activa). Nunca baja de 40.
- **Bienvenida** (27 a 30, título al subtítulo manuscrito): es un hero de una pantalla (Figma
  1280:9) donde título, subtítulo en Indie Flower y garabato son una sola pieza; separarlos 40
  rompería el bloque y el `min-h-dvh` (docs/emi/DECISIONES.md, D1).
- **Intro**: composición de Figma por pasos, fuera de alcance.
- **Mapa educativo**: el título va doblado sobre el mar y debajo solo está el mapa; geometría
  medida (docs/mapa-educativo/DECISIONES.md, D3 y D7).
- **Subtítulos dentro de una sección**, con su texto pegado (`s` o `m`): bloques de Impacto,
  apartados de `/terminos` (15), columnas del footer (10, Figma 1402:230), la fecha bajo el título
  de `/terminos` (10) y la tarjeta Difunde de Súmate (28, con el garabato bajo el título).

## Verificación

- Medido por CDP a 390x844, 768x1024, 1280x800 y 1920x1080, antes y después (script y tabla
  completa en el scratchpad del frente: `ola4H/medir.js` y `ola4H/medidas.md`).
- Capturas antes y después de EMI y de Súmate abierto a 390 y 1280, todas de más de 60 KB.
- Sin scroll horizontal en ningún ancho (`scrollWidth` igual al ancho de la ventana).
- El primer bloque de Impacto sigue cabiendo: fondo del mapa en 621 de 844, 745 de 1024, 785 de
  800 y 820 de 1080 (no se tocó Impacto).
- `npm run type-check` y `npm run lint` limpios.
