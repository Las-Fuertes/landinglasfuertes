# Cuarta ronda de feedback de diseño, 2026-10-01 (texto de Johan, ordenado)

## Intro

- La rotación de las espirales debe ir al menos 1,5 veces más rápida. Hay una espiral un poco
  diferente arriba a la izquierda que no se anima: debe animarse también.
- El paso del sol de la parte 1 a la 2 no gustó: las transiciones de la parte 2 a la 3 y de la 3 a
  Bienvenida son superiores. Hace falta más sutileza. Propuesta de Johan:
  - Desktop: en la carga de la intro, el punto rojo de la parte 1 llega hasta el final de la cola de
    la línea amarilla. Al hacer scroll para ir a la parte 2, la bola baja por la misma línea
    amarilla hasta quedar centrada horizontalmente; así la entrada del sol de la parte 2 se siente
    como un sol saliendo al amanecer, no como un sol que salta.
  - Mobile: no hay espacio horizontal para eso; el sol simplemente cae por debajo de las bubbles
    para crear el sol de la parte 2.

## Impacto

- El título todavía se ve muy abajo: debe ir un poco más arriba y centrado en su franja de título.
  Hoy se ve mal acomodado.
- El imán acomoda el contenido muy rápido y, si alguien está haciendo scroll, parece que toma el
  mando. Esperar al menos medio segundo antes de acomodar, y hacerlo empezando lento y terminando
  rápido, para que el movimiento no sea lineal.
