# Mapa educativo: estado

Rama `24-sep-mapa` desde `origin/main` `5bae81e`. Sin commitear (2026-09-24). Decisiones en
`DECISIONES.md` (D1 mapa y orden, D2 zoom, D3 título, D4 salto, D5 flotante, D6 Terminar lleva a Impacto,
D7 título y barra en pantallas bajas, D8 modales, D9 coreografía de Siguiente ruta y Terminar, D10
modal a dos columnas en desktop).

Tanda del 2026-09-24 en la rama `24-sep-pulido` (desde `origin/main` `4518852`, sin commitear):
D9 y D10.

## Hecho

- Mapa nuevo (Figma `966:11627`) con el orden Talleres -> Clubes -> Mi ruta -> ChiquiFuertes ->
  Voces Soberanas; cada parada clicable en todo su grupo, con foco visible y nombre accesible.
- Encuadre por parada calculado desde las cajas de los grupos; mobile y tablet cumplen el criterio
  de D2 (activa 100 %, otras <= 15 %).
- Encabezado con el mapa doblado y el pin sobre el mar (Figma `1311:14`), flotando sobre la primera
  pantalla del mapa en mobile y tablet; en flujo en desktop.
- "Saltar mapa" ante scroll fuerte, Tab o Escape, que lleva a `#impacto`. Detección de gestos
  compartida con la intro en `lib/gesto-rueda.ts`.
- Botón flotante de Súmate oculto con `data-oculta-flotante` (mecanismo reutilizable).
- Claves `educationMap.saltar` en es, en y fr.
- "Terminar" en la última parada cierra el modal y lleva a Impacto, sin volver a Talleres (D6).
- Título sin montarse sobre la casa en pantallas bajas: encuadre de entrada con la silueta del
  mapa, título que escala con `svh` en mobile y barra inferior de 77 px (D7). Evidencia (capturas
  `antes|despues-<vp>-titulo.png`, `despues-<vp>-terminar*.png` y scripts `tools/medir.js`,
  `tools/terminar.js`, `tools/paradas.js`) en el scratchpad de la sesión `3826136d`, carpeta
  `mapa-a/`.
- Modales de parada fieles a Figma en mobile y, en desktop y tablet, la misma tarjeta centrada
  sin scroll interno (D8, 2026-09-24). Evidencia y script CDP `modal.js` en el scratchpad de la
  sesión `3826136d`, carpeta `modal/`.

- "Siguiente ruta" rehecha según el lenguaje de movimiento (D9): cierre, viaje del mapa por el
  compositor (900 a 1400 ms según la distancia, sine.inOut), llegada y apertura con la foto después.
  Con la CPU a 4x y DPR 3: 0 frames de más de 34 ms (antes 8 en 12 transiciones, máx. 117 ms),
  raster de ~1,25 s a ~65 ms por transición. Se quitó un parpadeo de un frame al terminar de entrar
  la tarjeta (framer-motion y la Web Animations API).
- "Terminar" y "Saltar mapa" pasan a Impacto con cortina beige cuando está lejos (mobile y tablet)
  o desplazamiento suave cuando está cerca; Impacto entra con su propia animación. Reduced-motion:
  salto directo (D9).
- Modal de parada a dos columnas en desktop, 896 x 464, sin scroll en 1280, 1440 y 1920 en los tres
  idiomas (D10). Evidencia de D9 y D10 en el scratchpad de la sesión `3826136d`, carpeta
  `mapa-anim/`.

## Verificado (2026-09-24)

Evidencia en
`/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-23-sep/e1bea937-3490-4abc-9d57-20da256c2279/scratchpad/mapa/`,
con scripts CDP propios en la misma carpeta (`cdp.js` arnés; `capturas.js`, `despues.js`,
`verificar.js <prueba> <ancho>x<alto>`, `intro.js`, `idiomas.js`):

- `antes-<vp>-paradaN.png` (tomadas antes de tocar nada) y `despues-<vp>-paradaN.png` en 390x844,
  360x800, 768x1024, 1280x832 y 1920x1080. Medición del criterio en `medicion-despues.txt`.
- Rueda (`verificar.js rueda`, 390 y 768): recorrido 1 -> 5 -> 1 con gestos normales, inercia
  larga suave sin botón, ráfaga de 1680 px muestra "Saltar mapa", clic lleva a `#impacto` (top 0,
  foco en la sección), volver desde abajo entra por Voces.
- Touch emulado (`verificar.js touch`): arrastres normales sin botón; un deslizar rápido lo muestra
  y el tap lleva a `#impacto`.
- Teclas: Escape muestra y enfoca; Escape otra vez salta; Tab lo muestra sin robar el foco; Enter
  sobre el botón salta.
- Clic (390, 768, 1280) y tap (390) en la esquina del grupo opuesta al punto (160 a 550 px de él)
  abren el modal correcto en las cinco paradas. Tab + Enter abre cada una y Escape devuelve el foco.
- Flotante: opacidad 1 en Donaciones, 0 en todo el mapa, 1 en Impacto y Quiénes somos.
- `prefers-reduced-motion`: sin recorrido ni botón de saltar, mapa estático con paradas clicables.
- Intro con el módulo extraído: 1 -> 2 -> 3 -> Bienvenida, vuelta arriba, scroll fuerte + "Saltar
  animación" y Escape, a 390 y 1280.
- es, en y fr a 390 y 1280 sin claves crudas ni desborde horizontal (`idioma-<lang>-<w>-titulo.png`).
- `npm run type-check` y `npm run lint` limpios. No se corrió `npm run build`.

## Pendiente / a decidir con Johan

1. **Modelo de avance.** El mapa sigue avanzando por posición de scroll: un gesto normal de
   trackpad recorre algo más de una parada. Si se quiere "un gesto, un paso" como en la intro, es
   un cambio de modelo (pin por gestos), no un ajuste.
2. **Título en desktop** sin frame de Figma: adaptación propia (D3), a validar con la diseñadora.
3. Tablet apaisada (1000x700): Clubes deja ver 17 % de Talleres aun con el zoom máximo.
4. "Saltar mapa" arriba a la derecha (la intro lo tiene abajo a la derecha, pero abajo en el mapa
   están el nombre y los puntos).
5. **Ver D9 y D10 en un celular real** (Johan): ritmo de "Siguiente ruta" (~2,1 s de clic a tarjeta
   asentada; todo cuelga de `TIEMPO` en `coreografia.ts`) y la cortina de "Terminar". Si se quiere
   otra opción de cortina (con borde rasgado, o del azul del mapa), se construye detrás de un
   parámetro para comparar.
6. Con el modal de Clubes abierto y la página quieta, la traza de Chrome marca todos los frames
   como perdidos (también con el código anterior; en las otras paradas no). No se ve en pantalla en
   headless; si en un celular se nota calor o batería en esa parada, investigar ahí.
7. Desktop del modal (D10) sin diseño de Figma: adaptación a validar con la diseñadora.
