# Feedback del 1-oct: roadmap por olas

Rama `1-oct`, desde `origin/main` en `9cf867d` (PR #29). Mixpanel va aparte en `docs/mixpanel/`.

## Feedback literal de Johan (2026-10-01)

1. Impacto: "creo que va a tocar quitar el auto ajuste de la pantalla en mobile, cada vez que la
   toco salta, la experiencia es terrible".
2. Quiénes somos: "aunque está alineada al diseño, en dispositivos pequeños se ejecutan muy
   temprano los saltos de línea, así que reduce el padding de este texto para que llene más
   horizontalmente".
3. Intro: "en el último paso no necesitamos la flecha hacia abajo pues es el último paso".
4. Mapa educativo, mobile: "hay un espacio muy grande en el footer temporal del mapa, necesito que
   lo reduzcas y que centres el contenido de este verticalmente; solo pasa en dispositivos reales"
   (captura de iPhone en Safari: bajo el nombre de la ruta y los puntos queda una franja azul vacía
   de un sexto de la pantalla). **Lo ha pedido varias veces**: el arreglo tiene que explicar por qué
   no se ve en el emulador.

## Ola 1 (dos constructores en paralelo, archivos sin solape)

- Constructor A: puntos 3 y 4 (`components/intro/`, `components/education-map/`).
- Constructor B: puntos 1 y 2 (`components/impacto/`, `components/quienes-somos/`).

## Ola 2

- Verificador independiente de la ola 1.

## Estado (2026-10-01)

- Ola 1 hecha y aprobada por el verificador independiente: intro sin flecha en la parte 3
  (`docs/introduccion/` D17), barra del mapa en iPhone (`docs/mapa-educativo/` D14 y su ampliación:
  el stage usa `h-dvh` y la posición del mapa se vuelve a medir con un ResizeObserver), Impacto sin
  imán en táctil (`docs/impacto/` D7), Quiénes somos con más ancho de texto en mobile
  (`docs/quienes-somos/` D3).
- Mixpanel integrado en la misma rama (`docs/mixpanel/` D4); verificado y con las cuatro
  correcciones del verificador aplicadas.
- Falta: prueba de Johan en iPhone real; commit y PR cuando lo pida; tras el merge, comprobar en el
  panel de Mixpanel que llegan eventos y revisar a ojo un replay sin fotos.
