# Scroll en mobile: decisiones

## D1. Alto de pantalla fijo (2026-10-07)

**Decisión de Johan, reemplaza la del 2-oct** (que aceptaba los saltos de 81 px con la barra de
Safari): el alto de pantalla se mide UNA vez y no se recalcula al mostrar u ocultar la barra, y las
pantallas a sangre siempre se ven completas.

**Por qué.** La auditoría del 6-oct (`docs/auditoria/SCROLL-MOBILE-6-OCT.md`, M1) midió que dos
bloques de `100dvh` encima de todo (el placeholder de la intro y Bienvenida) hacen que el documento
cambie 168 px de alto (2 x 84) al pasar el viewport de 844 a 760, y Safari no compensa el scroll.
No eran 81 px sino el doble, y afectaban a todas las secciones de abajo.

**Cómo.**

- `pages/_document.tsx`: un script inline en el `<head>` escribe `--alto-fijo` en `:root`
  (`innerHeight` en px) antes del primer pintado. Solo se re-mide si cambia el ANCHO (rotación,
  ventana de escritorio); los cambios solo de alto (barra, teclado) se ignoran.
- `tailwind.config.js`: `h-pantalla` y `min-h-pantalla` = `var(--alto-fijo, 100svh)`; sin JS cae a
  `100svh`.
- Reemplazan a `h-dvh`/`min-h-dvh`/`100dvh` en `intro-section.tsx` (placeholder del pin),
  `welcome.tsx` (clase y `--hero-k`), `ilustracion-playa.tsx` (dos clamps de desktop) y
  `donations-section.tsx`. La intro no lee `innerHeight` ni usa ScrollTrigger: no hay medida que
  unificar en GSAP.
- Full bleed (ronda 2, el caso real: la página carga con la barra visible, `--alto-fijo` 760, y la
  barra se esconde, viewport 844). El script mide también `--alto-grande` (`100lvh`, constante en
  Safari) y la utilidad `mb-barra` = `max(0, alto-grande - alto-fijo)` se pone como margen bajo la
  intro (el placeholder) y bajo Bienvenida. Con la barra escondida, los 84 px bajo la pantalla son
  beige de la página, no la sección siguiente. Medido antes del arreglo: sin gesto, en `y=0`, los
  84 px de abajo mostraban el sol y la nube de Bienvenida; bajo Bienvenida, EMI (`bg-cream`). Se
  descartó una capa de fondo que desborde: EMI es opaca y tiene contenido arriba. Coste aceptado:
  84 px de beige extra bajo cada una cuando se cargó con la barra visible (0 si cargó con ella
  escondida o en desktop), constantes, sin saltos. Con la barra visible a 844 carga, Bienvenida se
  ve igual que producción (capturas a 390x844).
- Mapa: la medida de las paradas (`altoRef`) pasa de `h-svh` a `h-pantalla`, y el tramo del track
  suma `mb-barra` en lugar de `100lvh - 100svh`. El stage sticky sigue en `h-dvh`: no empuja nada.

**Medido** (CDP, 390 de ancho, dev server; se fija `--alto-grande` a 844 en la carga a 760 porque
el emulador no distingue lvh de svh). Ciclo 760, 844, 760, 844 y el inverso, con `scrollHeight` y
`top+scrollY` de Bienvenida, EMI, Tripulantes, Mapa, Impacto y Quiénes somos:

| Carga | scrollHeight | Cambio al alternar        |
| ----- | ------------ | ------------------------- |
| 760   | 14692        | 0 px en todos los títulos |
| 844   | 15099        | 0 px en todos los títulos |

Antes: 168 px (auditoría) y 491 en emulación por el mapa. La rotación a 844x390 re-mide el alto.

## D2. `touchmove` no bloqueante fuera del pin (M3, 2026-10-07)

La auditoría midió 295 de 295 `touchmove` bloqueantes arriba del todo. Causa: con la página en
`y=0` sin enganchar, el listener se registraba con `passive: false` solo para tragar el primer
gesto hacia abajo.

**Arreglo** (`components/intro/use-intro-pin.ts`, `sincronizar`). Tres estados:

- Enganchada o llegando a Bienvenida: no pasivo (hace falta `preventDefault`).
- Arriba del todo sin enganchar: listener PASIVO y `touch-action: pinch-zoom` en `html`, que retiene
  el scroll nativo sin esperar al hilo principal. El primer gesto hacia abajo engancha igual.
- En cualquier otra posición: sin listener, y `touch-action` limpio.

`preventDefault` pasa por `frenar(e)`, que solo actúa en modo no pasivo.

**Medido** (CDP táctil, `DOMDebugger.getEventListeners`): inicio pasivo; swipes 1 y 2 llevan a las
partes 2 y 3, el 3 a Bienvenida (y=844), con el listener bloqueante solo mientras dura el pin; ya
fuera, ningún listener de `touchmove`. Queda sin verificar en iPhone real que `touch-action` dinámico
en `html` se lea bien en Safari.
