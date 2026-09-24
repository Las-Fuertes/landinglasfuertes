# Las Fuertes — landing

Web de la Fundación Las Fuertes (educación menstrual integral, EMI). Si estás empezando una sesión
nueva, lee este archivo entero antes de tocar nada: te ahorra media hora de exploración.

## Cómo correrlo

```bash
npm run dev          # http://localhost:3000
npm run type-check   # tsc --noEmit
npm run lint
npm run build
```

## Stack — lee esto antes de escribir código

- **Next.js 16 con Pages Router**, no App Router. Las rutas viven en `pages/`, no en `app/`.
  Cualquier receta de App Router (server components, `app/layout.tsx`, `next-intl`) **no aplica**.
- **TypeScript**, **Tailwind 3**.
- Animación: **framer-motion** para entradas y micro-interacciones, **GSAP + ScrollTrigger** solo
  en la intro, **Swiper** en el carrusel de principios.
- i18n nativo de Pages Router (`next.config.js`), idiomas `es` (por defecto), `en`, `fr`.

## Orden de la página

`pages/index.tsx` es el dueño del orden de secciones. No está dentro de ningún componente:

```
Introducción -> Bienvenida (hero) -> EMI (con el slider de Principles dentro) -> Donaciones -> Mapa educativo -> Impacto -> Quiénes somos -> Footer
```

Desde el 2026-09-23, **Súmate no es una sección**: es un drawer (lateral en desktop, sheet desde
abajo en móvil y tablet) que abren el botón de Donaciones, el enlace del footer, un botón flotante
fijo y el deep link `/#sumate`. Se abre desde cualquier componente con
`useSumateDrawer().open('<origen>')` (`components/sumate/sumate-drawer-context.tsx`). "Saltar
animación" de la intro lleva a Welcome (`#bienvenida`). Ver `docs/sumate-drawer/DECISIONES.md`.

Desde el 2026-09-23 (rama `23-sep-emi`), Bienvenida es un hero de una pantalla (`min-h-dvh`) y
"Educación menstrual integral como mapa de cambio" es la sección propia `components/emi/` (id
`emi`), que monta el slider de `components/principles/` como su segunda mitad. Ver
`docs/emi/DECISIONES.md`.

Ya NO existe el query param `?show=all`: se retiró el 2026-09-21 y todo el sitio carga por defecto.
Si ves referencias a ese param en algún lado, están obsoletas.

`main` despliega solo a producción, así que lo que se mergea se ve. Nada llega ahí sin que Johan lo
pida explícitamente.

## Trabajo en curso

**Arranque de sesión nueva: `docs/CONTINUAR.md`.** Tiene el prompt listo para pegar, el estado,
el mapa de secciones, los pendientes y las lecciones que costaron horas.

Frentes cerrados y en producción (2026-09-23), con su historial:

- Transiciones de la Introducción (PR #17): `docs/introduccion/` (D1 a D5).
- Orden nuevo y Súmate como drawer (PR #18): `docs/sumate-drawer/` (D1 y D2, pendientes en
  PROGRESS).
- Bienvenida como hero y sección EMI (rama `23-sep-emi`): `docs/emi/` (D1 y D2, pendientes en
  PROGRESS).
- Donaciones fiel a Figma en mobile y con desktop nuevo (rama `23-sep-emi`): `docs/donaciones/`
  (D1 y D2, pendientes en PROGRESS).
- `docs/secciones-impacto/`: historial cerrado del primer tramo (Impacto, Quiénes somos, la
  Introducción estática). Se consulta, no se reescribe.

- `docs/PATTERNS.md`: convenciones del repo (grid, colores, copy, assets, animación)

## Reglas

- **No hagas commits ni push a menos que se pidan explícitamente en el mensaje.**
- `main` está protegido: se llega por PR, nunca por push directo.
- No agregues dependencias nuevas sin preguntar.
- Colores y espaciados por nombre de Tailwind, nunca hex ni px sueltos. Ver `docs/PATTERNS.md`.

## Dónde vive el repo en esta máquina

El repo está repartido en varios worktrees de git y eso despista:

- `~/Sites/personal/landinglasfuertes` — el checkout principal, con `main` cargado.
- `~/orca/workspaces/landinglasfuertes/<rama>/` — los worktrees de trabajo, uno por rama.

Un cambio hecho en un worktree **no se ve en el checkout de `main`** hasta que se mergea y se hace
`git pull` ahí. Si alguien dice "no veo nada", casi siempre es esto.

## Publicar

`main` despliega solo a producción. Hoy no tiene protección de rama ni rulesets en GitHub, pero el
camino sigue siendo rama, PR y merge: llega igual de rápido y deja historial.

**Antes de usar `gh`, cambia de cuenta.** En esta máquina hay dos sesiones y la que queda activa
sola no es la correcta:

```bash
gh auth switch --user johanmendezb
```

El push en sí no usa ese token: el remoto es un alias SSH (`git@github.com-personal:...`). La cuenta
de `gh` solo decide quién figura en el PR.

La identidad de los commits en este repo es `Johaneto <johan@beu.app>`, consistente con todo el
historial. No la cambies sin preguntar.

`husky` y `lint-staged` corren en cada commit: formatean lo que esté en el índice y usan un stash
propio que limpian solos.
