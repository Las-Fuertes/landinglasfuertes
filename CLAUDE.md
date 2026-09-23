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
Hero (intro) -> Welcome -> Principles -> Donaciones -> Mapa educativo -> Súmate -> [Quiénes somos] -> Footer
```

Ya NO existe el query param `?show=all`: se retiró el 2026-09-21 y todo el sitio carga por defecto.
Si ves referencias a ese param en algún lado, están obsoletas.

`main` despliega solo a producción, así que lo que se mergea se ve. Nada llega ahí sin que Johan lo
pida explícitamente.

## Trabajo en curso

**Las transiciones de la Introducción** son el trabajo activo. Su estado vivo, sus decisiones y el
prompt para continuar están en `docs/introduccion/`. Empieza por ahí:

- `docs/introduccion/CONTINUAR.md`: arranque de sesión nueva
- `docs/introduccion/PROGRESS.md`: qué va hecho y qué sigue
- `docs/introduccion/DECISIONES.md`: qué se decidió y por qué (D2: la mecánica actual)

`docs/secciones-impacto/` es el historial cerrado del resto del primer tramo (Impacto, Quiénes
somos y la Introducción estática). Se consulta, no se escribe ahí.

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
