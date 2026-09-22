# Convenciones del repo

Todo lo de aquí está verificado leyendo el código, no asumido. Si algo cambia, actualiza este
archivo en el mismo commit. La idea es que ninguna sesión tenga que volver a derivar esto.

## Grid y layout

`components/layout/page-grid.tsx` exporta `PageGrid`, el contenedor de toda sección:

- 4 columnas en mobile, 12 desde `md`
- inset lateral de 40px (`px-page-margin`), que baja a 24px bajo los 380px de ancho
- gutter de 25px (`gap-x-grid-gutter`)
- ancho máximo 1200px, centrado

Uso típico: `<PageGrid><div className="col-span-4 md:col-span-12">...</div></PageGrid>`.

También existe `components/layout/grid-column.tsx`.

## Breakpoints

`tailwind.config.js` NO define `screens`, así que son los de Tailwind por defecto:

| Nombre | Ancho   | Qué llamamos así |
| ------ | ------- | ---------------- |
| (base) | < 640px | mobile           |
| `sm`   | 640px   | mobile grande    |
| `md`   | 768px   | tablet           |
| `lg`   | 1024px  | desktop          |
| `xl`   | 1280px  | desktop grande   |

Para validar contra Figma: mobile < 768, tablet 768 a 1023, desktop >= 1024.

## Colores de marca

Definidos en `tailwind.config.js`. **Se usan por nombre (`bg-blue`, `text-red`), nunca el hex.**

| Nombre Tailwind | Hex                                                        |
| --------------- | ---------------------------------------------------------- |
| `blue`          | `#0413D8`                                                  |
| `blue-700`      | `#78C2FF` (azul claro, ojo: el número no indica oscuridad) |
| `blue-300`      | `#030fa5` (azul oscuro)                                    |
| `purple`        | `#b3b8f0`                                                  |
| `red`           | `#F57087`                                                  |
| `pink`          | `#FF74BA`                                                  |
| `yellow`        | `#FFD700`                                                  |
| `orange`        | `#FF7E37`                                                  |
| `black`         | `#242424`                                                  |
| `beige`         | `#FCF5E9` (fondo del sitio)                                |
| `beige-light`   | `#FAF9F6`                                                  |
| `cream`         | `#FFEBC6` (fondo de "Quiénes somos")                       |

## Tipografía y espaciado

Escala de texto: `text-h1` (40px), `text-h2` (30px), `text-h3` (20px), `text-h4` (18px),
`text-p-lg` (14px), `text-p-sm` (13px). Todas con `font-weight: 400` por defecto.

Espaciado: `xs` 5px, `s` 10px, `m` 15px, `l` 25px, `xl` 40px, `xxl` 65px. Más
`page-margin` (40px) y `grid-gutter` (25px), que usa el `PageGrid`.

Fuente manuscrita puntual: `Homemade_Apple` vía `next/font/google`, ver `components/welcome/welcome.tsx`.

## Copy e i18n

Los textos NO van hardcodeados en el componente. Viven en `locales/es.json`, `locales/en.json` y
`locales/fr.json`, y se leen con el hook propio:

```tsx
import { useTranslation } from '../../hooks/useTranslation';

const { t } = useTranslation();
t('hero.section1.text1');
t('alguna.clave', { emi: 'EMI' }); // interpolación con {emi}
```

`hooks/useTranslation.ts` resuelve la clave por puntos. **Si falta la clave en el idioma activo,
imprime un warning en consola y renderiza la clave cruda en pantalla.** Por eso conviene agregar la
clave en los tres idiomas a la vez.

Para negritas embebidas en un texto de `locales`, usa `renderTextWithBold` de
`lib/render-text-with-bold.tsx` en lugar de partir el string.

### Regla: los tres idiomas van en la misma entrega

**Ninguna sección se da por terminada con claves solo en español.** Toda entrega incluye `es`, `en`
y `fr` completos. No es un paso aparte ni algo que se pregunte cada vez: es parte de la definición
de "hecho". El copy de referencia viene del diseño en español; `en` y `fr` se traducen en la misma
pasada.

## Resaltado de palabras: el chip rasgado

**Este es el patrón del sitio para una palabra o frase resaltada. No inventes otro.**

```tsx
<span className="map-chip">
  <span className="font-bold text-white">texto resaltado</span>
</span>
```

Definido en `styles/global.css:137`. Es un `inline-block` con fondo `#242424`, texto blanco,
inclinación de -1.2 grados y borde rasgado mediante el filtro SVG `#map-rough-edge`. El texto va en
un hijo porque el fondo se pinta en un `::before`.

Variantes: `map-chip--pink` (fondo rosa) y `map-chip--flat` (sin inclinación).

En textos de `locales` se escribe `==texto==` y lo convierte `renderTextWithMarks`
(`lib/render-text-with-bold.tsx`), igual que `**negrita**` lo convierte `renderTextWithBold`.

**Cuidado con el filtro.** Un `filter: url(#map-rough-edge)` que apunta a un filtro inexistente no
degrada a "sin filtro": hace **desaparecer** el elemento. Por eso el filtro se monta una sola vez
en `pages/_app.tsx` vía `components/layout/rough-edge-filter.tsx`, y no dentro de una sección.

## Verificación visual antes de entregar

**La herramienta es `scripts/captura.js`.** Habla con el Chrome de la máquina por el protocolo de
DevTools (usa el `ws` que Next trae compilado, no instala nada), fija el viewport al ancho exacto y
desplaza hasta el ancla:

```bash
npm run dev   # en :3000
node scripts/captura.js --ancla quienes-somos --w 390 --h 1240 --out /tmp/q.png
node scripts/captura.js --ancla intro-paso-2-desktop --w 1280 --h 832 --lang fr --out /tmp/p2.png
node scripts/captura.js --ancla quienes-somos --w 390 --h 1240 --y 1240 --out /tmp/q2.png  # 2.º tramo
```

Si el PNG pesa menos de 10 KB, algo salió mal (ancla inexistente o página sin hidratar): míralo.

**Antes de arrancar `npm run dev` después de un `npm run build`, borra `.next`.** El build deja
artefactos de producción ahí y el dev server que los hereda sirve páginas que no hidratan.

Lo que sigue es el método anterior, con Chrome a pelo y el banco de iframes. Sigue funcionando pero
se volvió intermitente (capturas grises o en blanco sin causa visible); úsalo solo si el script no
sirve:

```bash
npm run dev
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars \
  --window-size=810,860 --virtual-time-budget=15000 \
  --screenshot=/tmp/revision.png \
  "http://localhost:3000/dev-revision?anclas=intro-paso-1,intro-paso-2"
```

`pages/dev-revision.tsx` monta un iframe por ancla, del ancho que se le pida (`w`, `h`, por
defecto 390x700), en el idioma que se le pida (`lang=en`, `lang=fr`; sin él, español), y lo
desplaza hasta ese elemento. Solo existe en desarrollo: en producción la ruta es 404.

Las anclas de la Introducción son `intro-paso-N` en mobile y `intro-paso-N-tablet` /
`intro-paso-N-desktop` en los otros dos anchos.

**Trampas que cuestan tiempo:**

1. **No uses `--force-device-scale-factor` junto con `--window-size`.** Le cambia el viewport CSS a
   Chrome y la captura sale recortada, como si el layout estuviera roto cuando no lo está.
2. **El banco tiene que servirse desde la propia app.** Un HTML en `file://` no puede tocar el
   iframe de `localhost` por política de mismo origen, y el desplazamiento falla en silencio.
3. **La ventana tiene que ser más ancha que la suma de los iframes.** Si no caben, no se ve el
   sobrante; y antes de que los iframes llevaran `flex:none`, flex los encogía y un iframe pedido a
   768 caía por debajo de `md` y mostraba la variante mobile sin avisar. Para tablet y desktop,
   una ancla por captura.
4. **Chrome headless a veces devuelve una captura gris de 4-5 KB** (la página cargó pero el efecto
   que monta los iframes no llegó a correr) o en blanco justo después de que el dev server
   recompile. No es un bug de la página: repite la captura. Un `ls -la` del PNG lo delata.
5. **Si el puerto 3000 ya responde, puede ser el dev server de OTRO worktree.** Compruébalo con
   `lsof -p <pid> | grep cwd` y levanta el tuyo en otro puerto (`npx next dev -p 3111`).

## Animación

- **Entrada al hacer scroll**: `FadeIn` (framer-motion, `whileInView`, `once: true`, fade + 28px
  desde abajo). Es el patrón por defecto para secciones nuevas; acepta `delay` para stagger.
- **GSAP + ScrollTrigger**: solo en la intro. No lo extiendas a secciones nuevas sin razón.
- **Swiper**: solo en el carrusel de `components/principles/`.
- **`prefers-reduced-motion`**: el repo ya lo respeta en varios sitios (por ejemplo
  `components/education-map/education-map-section.tsx`). Toda animación nueva debe respetarlo.

## Assets

- `design-assets/<seccion>/` guarda el SVG fuente editable, el que vino del diseño.
- `public/images/<seccion>/` guarda lo que sirve producción, en kebab-case, con variantes
  responsive cuando hace falta (ver `public/images/education-map/map-1200.avif` y compañía).
- **No hay svgr configurado**: un `.svg` importado no se vuelve componente React. Si el SVG
  necesita animarse por path (como el mapa de Colombia), va escrito como componente React inline en
  `components/`, no como archivo en `public/`.
- Las imágenes se renderizan con `next/image`. Existe además `components/app-image/`, un wrapper
  con caché propia; mira su `README.md` antes de usarlo.

## Mapa de impacto: mapeo path -> territorio

Derivado el 2026-09-21 comparando el color de relleno del frame "después" (`1102:60`) y escrito en
`components/impacto/mapa.data.ts`. **No hace falta volver a sacarlo.** Los 33 vectores de Figma
se llaman todos `Vector`; en el export del grupo `1102:110` salen numerados `Vector_1..33` en el
mismo orden que el árbol de `get_metadata`:

| Figma       | Nodo       | Territorio      |
| ----------- | ---------- | --------------- |
| `Vector_1`  | `1102:111` | Guajira         |
| `Vector_2`  | `1102:112` | Atlántico       |
| `Vector_13` | `1102:123` | Córdoba         |
| `Vector_25` | `1102:135` | Bolívar         |
| `Vector_30` | `1102:140` | Ibagué (Tolima) |
| `Vector_32` | `1102:142` | Bogotá D.C.     |
| `Group 183` | `1102:144` | Isla Fuerte     |

`Vector_31` (`1102:141`) es un duplicado exacto de `Vector_32` en gris y se descartó. El export de
Figma trae además un path cream por departamento que es el trazo convertido a relleno (720 KB de
los 812 del archivo); se tiró y se reemplazó por `stroke` de 1 px en el `<g>` padre. Colores del
diseño: gris `#B3B3B3` (`ash` en Tailwind), rosa `#FF60AD` (se usa `pink`, `#FF74BA`).

El encendido es CSS puro (`.impacto-territorio` y `.impacto-etiqueta` en `styles/global.css`):
cada path y cada chip llevan su turno en `--i` y el contenedor recibe `data-encendido` cuando
`useInView` (framer-motion, `once`) lo ve. Reduced-motion quita duración y escalonado.

Para capturar el estado final: `node scripts/captura.js --ancla impacto --w 390 --h 828 --tras 4500`.

## Patrón de componente

- Archivo en kebab-case dentro de una carpeta por sección: `components/<seccion>/<nombre>.tsx`.
- Un `index.ts` por carpeta que reexporta, para importar `from '../seccion'`.
- `'use client'` arriba en todo componente con estado, efectos o animación.
- Export default para el componente de sección, named export para las piezas internas.
- Responsive con clases de Tailwind (`md:`, `lg:`), no con JavaScript, salvo cuando la animación
  realmente lo exige.
