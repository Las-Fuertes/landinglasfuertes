# Estado: navegación flotante, footer nuevo, fuente de acento y Términos

Última actualización: 2026-10-01 (datos legales y coming-soon, ampliaciones de D4 y D5). Rama
`30-sep` (desde `main` en `21bca2d`), worktree `~/orca/workspaces/landinglasfuertes/30-sep/`. **Sin commitear**: nada se commitea ni publica sin
que Johan lo pida. Decisiones en `DECISIONES.md` de esta carpeta (D1 a D5).

## Hecho

- Navegación flotante (D1) en `components/sumate/sumate-flotante.tsx`: cerrada y abierta según
  Figma `1402:225`, Inicio a la intro (o a la home desde otra página), Súmate abre el drawer,
  mismas reglas de visibilidad que el botón de antes. Token nuevo `papel-tostado`.
- Footer nuevo (D2) en `components/layout/footer.tsx`, con `menu-transparencia.tsx`,
  `transparencia.data.ts`, el filtro `footer-rough-edge` en `rough-edge-filter.tsx`, assets en
  `public/images/footer/` (fuente en `design-assets/footer/`) y el PDF en
  `public/transparencia/estados-financieros-2025.pdf`. Mobile y tablet propios (D5).
- Indie Flower (D3) como `font-acento`, cargada en `pages/_app.tsx`; Bienvenida y la pista
  "desliza" la usan, con tamaños ajustados.
- Página de Términos y condiciones (D4) en `pages/terminos.tsx`, enlazada desde el footer
  (los marcadores de datos que faltaban se cerraron el 2026-10-01).
- Borrado (D5): `components/contact/`, `modal.close`, `sumate.drawer.flotante` y `p-md`.
- Términos con los datos legales reales, sin marcadores ni la sección de cambios y ley aplicable;
  correo como `mailto:` (ampliación de D4, 2026-10-01).
- Borrado `components/coming-soon/` y sus claves `content.*`, `cta.*`, `modal.*`, `timestamp` y
  `hero.mainTitle*`/`hero.subtitle*` (ampliación de D5, 2026-10-01).
- Copy en `es`, `en` y `fr`: `footer.*` reescrito, `nav.*` y `terminos.*` nuevos.
- `docs/PATTERNS.md` (fuente, `data-oculta-flotante`, `--clic` del drawer) y la cabecera de
  `scripts/captura.js`.

- 2026-10-01 (ronda 3, frente O): el CTA "Súmate" temporal toma la forma y la esquina del
  selector de idioma (ampliación de D1): 42,4 de alto los dos, mismo radio, borde, sombra, relleno
  y letra.

## Cómo se verificó (dev server en :3000, Chrome por CDP)

- Sondeo propio por CDP en la home a 1280x800 y 390x844: nav oculta e `inert` en la intro y sobre
  el mapa, visible en Impacto; Enter abre (`aria-expanded`, `aria-controls` a la lista), Tab
  recorre Inicio y Súmate, Escape cierra y devuelve el foco; Tab fuera y clic fuera cierran;
  Súmate abre el drawer con `#sumate` y al cerrarlo el foco vuelve al botón del menú; Inicio deja
  `scrollY 0` y el foco en `main`. Botón 44x44, entradas de 40 de alto.
- En `/terminos` (1280) y `/fr/terminos` (390): nav oculta arriba (selector de idioma visible) y
  visible a `scrollY 600` (selector oculto); Súmate abre el drawer; el enlace del footer lleva
  `aria-current="page"`; Inicio lleva a `/` y a `/fr`; los 8 marcadores se pintan; sin scroll
  horizontal.
- Transparencia: Enter abre, el enlace 2025 va al PDF con `_blank` y `noopener noreferrer`,
  Escape devuelve el foco, clic fuera cierra.
- `curl`: `/terminos`, `/en/terminos` y `/fr/terminos` 200; el PDF 200.
- Capturas en el scratchpad (`ola1B/`): nav cerrada y abierta a 390, 768, 1280 y 1920; footer a
  390, 768, 1024, 1280 y 1920; transparencia abierta; Términos a 1280 (es) y 390 (fr); acentos
  antes y después en es, en y fr.
- `npm run type-check`, `npm run lint` y `prettier --check` limpios en el repo entero.

## Qué sigue, en orden

1. **Que Johan lo mire** en `localhost:3000`: la nav tras la intro, el footer en mobile, tablet y
   desktop, Transparencia y `/terminos`.
2. ~~Completar los datos legales de `/terminos`~~: hecho el 2026-10-01 (ampliación de D4). Falta
   solo la dirección para notificaciones, que no se dio y no aparece. Conviene que alguien con
   criterio legal lo lea antes de publicar.
3. Confirmar con la diseñadora el footer de mobile y tablet (D5), que no tiene frame en Figma.
4. ~~Decidir qué hacer con `components/coming-soon/`~~: borrado el 2026-10-01 con sus claves
   (ampliación de D5). Queda huérfano `components/app-image/`: borrarlo en otra pasada.
5. Si se quiere, mover la nav a `components/layout/navegacion-flotante.tsx` (hoy vive en el
   archivo del botón viejo para no tocar el `index.ts` de `components/sumate/`).
