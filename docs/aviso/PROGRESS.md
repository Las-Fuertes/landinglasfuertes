# Aviso de protección de menores: estado

Rama `29-sep-aviso` desde `origin/main` `2122c29`. Sin commitear (2026-09-29). Decisiones en
`DECISIONES.md` (D1 la puerta, D2 bloqueo de imágenes a la IA).

## Hecho

- `components/aviso/`: `aviso.ts` (cookie, versión, script sin parpadeo, `alAceptarAviso`),
  `puerta-aviso.tsx` y `puerta-aviso.module.css`. Montada en `pages/_app.tsx`; script en
  `pages/_document.tsx`; reglas en `styles/global.css`; color `arena` en `tailwind.config.js`.
- La intro (`use-intro-pin.ts`) y el drawer de Súmate (`sumate-drawer-context.tsx`) esperan a
  que se acepte.
- Claves `aviso.*` en es, en y fr.
- Estrella en `public/images/aviso/estrella-de-mar.svg` (fuente en `design-assets/aviso/`).
- `public/robots.txt` y `X-Robots-Tag` en `next.config.js` (D2).
- `scripts/aviso-cdp.js`: `scripts/captura.js` y `scripts/medir-resaltado.js` fijan la cookie
  antes de navegar; `captura.js --aviso` muestra la puerta. Anotado en `docs/PATTERNS.md`.

## Verificado (2026-09-29)

Capturas en
`/private/tmp/claude-501/-Users-johaneto-orca-workspaces-landinglasfuertes-24-sep/3826136d-6674-498b-b321-d960b35db571/scratchpad/aviso/`
(`puerta-<lang>-<ancho>x<alto>.png`, `telon-<ms>.png`, `figma-m.png`, `figma-d.png`; la sonda de
CDP es `sonda.js` y el lector de tinta `png.js`, en la misma carpeta):

- Fidelidad: bandas de tinta contra el render de Figma, 0 a 1 px en todos los bloques a 1280x832
  y a 390 (relativo a la estrella).
- 360x640, 390x844, 768x1024, 1000x800, 1280x832 y 1920x1080 en es, en y fr: sin scroll en la
  puerta ni desborde horizontal.
- Primer frame (screencast por CDP): sin cookie, arena; con cookie, beige de la landing y la
  puerta nunca visible. 0 errores de hidratación en es, en y fr en los dos casos.
- Tras "Acepto": cookie `lf_aviso=v1`, caduca en 31 535 996 s (Max-Age 31536000), `Path=/`,
  `SameSite=Lax` (`Network.getCookies`). Intro: arranca a los 732 ms con el telón al 13 %.
- Frames con CPU 4x a 390x844, desde el clic hasta 5 s después: en el build de producción (copia
  en el scratchpad, `next start` en :3111), 6 de 8 corridas con 0 frames > 34 ms; 2 corridas con
  1 o 2 frames de 50 ms, entre los 532 y los 676 ms (el montaje del pin de la intro). La carga
  normal con cookie ya tenía esos 50 ms en la entrada de la intro. El telón es opacidad en el
  compositor: esos frames del hilo principal no lo frenan. En `next dev` salen 1 a 3 frames de 50
  a 100 ms (React de desarrollo).
- `/#sumate`: puerta, y al aceptar el drawer abierto. `/#impacto`: puerta, y al aceptar la página
  en Impacto (y=9808, igual que con cookie) con su entrada tras el telón.
- Tab, Shift+Tab (foco se queda en "Acepto", con anillo), Escape (no cierra). Desde el 2026-09-30
  recorren también el selector de idioma (ver abajo).
- Reduced-motion: sin fundido, todo en un frame.
- `curl` a :3000: `/images/aviso/estrella-de-mar.svg` lleva `X-Robots-Tag: noimageai, noai`; `/`
  y `/en` no.
- `npm run type-check` y `npm run lint` limpios. No se corrió `npm run build` en el worktree.

## Selector de idioma en la puerta (2026-09-30)

Hecho, por feedback de Johan (DECISIONES, ampliación al final de D1). `language-switcher.tsx`
con la prop `enPuerta`, montado en `puerta-aviso.tsx`; foco en ciclo por los botones de la puerta;
el hash se conserva al cambiar de idioma. Verificado por CDP (sonda `sonda-idioma.js` y capturas en
`scratchpad/aviso-idioma/`): 0 px de solape en 5 tamaños por 3 idiomas; es, en, fr desde
`/#sumate` con la puerta puesta; aceptar en fr deja `/fr#sumate`, drawer y cookie; Tab y Shift+Tab
en ciclo; landing con cookie igual antes y después (390 y 1280). `type-check` y `lint` limpios.

## Salto de la estrella (2026-09-30)

Hecho, por pedido de Johan (DECISIONES, segunda ampliación al final de D1):
`components/aviso/salto-estrella.ts`, montado en `puerta-aviso.tsx`. Salto de 1150 ms con
squash and stretch al aparecer y luego cada 4,5 a 7,5 s; se detiene a reposo en 240 ms al pulsar
"Acepto"; quieta con reduced-motion. Verificado por CDP: layout inmóvil (texto, botón y caja de la
estrella en la misma posición en todos los frames), 0 frames de más de 34 ms en los saltos con CPU
4x a 390x844, 4 capturas `estrella-<ms>.png`. `type-check` y `lint` limpios.

## Revisión del verificador (2026-09-30)

Aprobado sin bloqueantes; arreglados los cuatro menores (DECISIONES, tercera ampliación de D1):
cookie también desde el servidor (`pages/api/aviso.ts`, por el recorte a 7 días de Safari),
`<noscript>` que suelta la puerta sin JS, inglés del aviso reescrito, estrella solo cargada
cuando la puerta se muestra y SVG de 399 a 180 KB (31 KB con gzip). Verificado con `curl -i -X
POST` y por CDP (primer frame con y sin cookie, "Acepto" con POST 204 y cookie de 365 días,
telón, estrella, sin JS). `type-check` y `lint` limpios.

## Google Imágenes y frase de la IA (2026-09-30)

Decisiones de Johan: `Googlebot-Image` bloqueado en `/images/` y `/_next/image` (grupo propio en
`public/robots.txt`, D2); la frase de la IA precisada en es, en y fr (D1, ampliación). Verificado
por CDP en 5 tamaños por 3 idiomas: 0 px de solape, sin scroll ni desborde.

## Pendiente

1. En el preview de Vercel: que `POST /api/aviso` devuelve la cookie con `Secure`, y comprobar que `/_next/image` lleva `X-Robots-Tag` (en local no, ver
   D2) y que `robots.txt` se sirve con el grupo de IA.
2. Que Johan valide las traducciones en y fr del aviso.
3. Que Johan valide el selector de idioma en la puerta y el salto de la estrella (hechos el
   2026-09-30, ver arriba).
