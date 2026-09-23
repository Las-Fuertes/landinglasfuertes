# Estado: orden nuevo y Súmate como drawer

Última actualización: 2026-09-23. Rama `23-sep-orden-drawer` (desde `main` en `eb5d15f`), en el
worktree `~/orca/workspaces/landinglasfuertes/23-sep-intro/`. **Sin commitear**: nada se
commitea ni publica sin que Johan lo pida. Decisiones en `DECISIONES.md` de esta carpeta.

## Hecho

- Orden nuevo en `pages/index.tsx` (D1). "Saltar animación" lleva a `#bienvenida`.
- Drawer de Súmate con sus cuatro disparadores, deep link, trampa de foco y bloqueo del body (D2).
- Copy nuevo en `es`, `en` y `fr` bajo `sumate.drawer` (flotante, su aria-label, cerrar).
- `scripts/captura.js --clic <selector>` para abrir el drawer en una captura.

## Cómo se verificó (servidor de desarrollo en :3000, Chrome por CDP)

- Orden en el DOM: Introducción, bienvenida, principles, donations, mapa, impacto,
  quienes-somos, footer. Uniones capturadas a 390 y 1280.
- Drawer desde los 4 orígenes a 390x844, 1000x1366 y 1440x900, arriba y abajo del scroll interno:
  caja 390x776 (sheet, franja de 68 px), 1000x1257 (franja de 109 px) y 576x900 a la derecha;
  hash `#sumate` al abrir y vacío al cerrar; foco inicial en "Cerrar"; foco de vuelta al
  disparador en los 3 con disparador.
- Teclado: 80 Tab y 20 Shift+Tab sin salir del drawer (12 focos distintos). Escape y clic en el
  overlay cierran. Rueda sobre el overlay: `scrollY` 3808 antes y después; sobre el panel, el
  scroll interno pasa de 503 a 1226 con `scrollY` quieto.
- Flotante: opacidad 0 con la intro enganchada, 1 tras la intro, 0 con el drawer abierto.
- Saltar animación (Tab y Escape) a 390, 1000 y 1280: top de `#bienvenida` = 0.
- Reduced motion: transform `none` en todo momento y opacidad 1 desde el primer cuadro.
- `/#donar`: abre el drawer, deja `#sumate` en la URL y baja hasta "¿Cómo quieres ayudar?".
- `npm run type-check`, `npm run lint` y `npm run build` limpios.

## Qué sigue, en orden

1. **Que Johan lo mire** en `localhost:3000` (desde el botón de Donaciones, el footer, el flotante
   y `localhost:3000/#sumate`) en móvil y desktop.
2. Decisiones de diseño abiertas:
   - Aire de arriba de Impacto (`k(32)`) ahora que va tras el mapa azul y no tras la intro.
   - El flotante tapa la esquina inferior derecha del contenido en móvil (por ejemplo, el final
     del párrafo de Quiénes somos al pasar). Opciones: ocultarlo sobre el footer, o hacerlo más
     pequeño en móvil.
   - Si el flotante debe esconderse cuando la sección de Donaciones (con su propio botón) está en
     pantalla.
   - El footer lista "Súmate" como botón al final de "Explora"; podría ir en "¿Quieres ayudar?".
3. Probar el pago real de Bold dentro del drawer en un preview con https (en local no hay llave).
4. Publicar cuando Johan lo pida: commit, PR contra `main`, merge (`gh auth switch --user
johanmendezb` antes de `gh`).
