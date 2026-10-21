# Feedback de Johan, 2026-10-20 (literal, con las aclaraciones que dio en el chat)

Rama `20-oct`, creada desde `origin/main` en `8365d76` (merge del PR #40).

## Intro y navegación (Constructor A)

- A1. Navegación en la intro siempre visible (la de "Saltar intro" y las flechas).
- A2. Cambiar las flechas: en vez de arriba y abajo, izquierda y derecha.
- A3. En el último slide de la intro, habilitar el siguiente (flecha derecha); al darle siguiente
  o "Saltar" entra al hero (Bienvenida, `#bienvenida`).
- A4. Volver a implementar el menú hamburguesa (ya existió, hoy apagado con `MENU_ACTIVO = false`).
  Esta vez el menú ofrece ÚNICAMENTE el cambio de idioma. El CTA Súmate sigue en su lugar, quizá a
  la derecha del botón hamburguesa, para que siempre esté visible.

## Secciones (Constructor B)

- B1. EMI: abajo el mismo padding que arriba; hoy el de abajo es mucho más corto.
- B2. Donaciones: los íconos no activos deben ser grises como el borde, no naranja, rosa y azul
  como están ahora. Seleccionados siguen igual. El hover hoy es distinto al click: debe ser igual
  al estado click/activo.
- B3. Mapa educativo: aumentar la fuente de "haz click aquí". Hoy está dentro del SVG; sacarla del
  SVG y usar la fuente normal del proyecto, también porque hay que traducirla (es, en, fr).
- B4. Impacto: el título "Así se ve el impacto en acción" tiene poco padding arriba; aumentarlo
  para que tenga sentido con el resto de la página.
- B5. Impacto: el mapa dice "Ibagué" y debe decir "Tolima".
- B6. Impacto: darle más relevancia a "Isla Fuerte": borde rosa como el que usa cada mapa
  seleccionado, y el relleno de la isla gris oscuro para que resalte.
- B7. Impacto, desktop: la niña del último bloque casi se monta en la sección siguiente (Quiénes
  somos) y les gustó. Que en desktop la niña parezca posarse sobre la siguiente sección: el pelo
  se solapa por encima del borde de Quiénes somos.
- B8. Quiénes somos: cambiar la foto de Erika por la nueva `public/images/quienes-somos/erika.jpeg`.
- B9. Quiénes somos: la foto de Erika debe tener el mismo tamaño que la de Lina; hoy es muy pequeña.
- B10. Tripulantes (Donaciones): el azul actual recibió feedback de muy saturado, cansa la vista.
  Bajarle solo un poco (saturación/tono), sin cambiar el azul del resto del sitio.
- B11. Copies (es; en y fr equivalentes en la misma entrega):
  - "8 de 10 se conocen más con lo explorado en los talleres" -> "8 de cada 10 niñas se conocen
    más con lo explorado en los talleres" (Johan eligió "8 de cada 10 niñas").
  - "Ahora ellas ven claro lo que siempre estuvo ahí." -> "Las fuertes reconocen bajo la luz de la
    dignidad; su naturaleza cíclica."
  - "Las Fuertes tienen 5 estrellas" -> "La educación menstrual como guía de niñas y adolescentes
    resilientes."
  - Descripción bajo "¿Quiénes somos?": "Somos un arrecife de mujeres voluntarias y aliadas que
    crece desde Bogotá para trabajar con niñas y adolescentes en los territorios más olvidados de
    Colombia. Construimos espacios donde: el reconocimiento del cuerpo se comparte sin tabúes, la
    educación menstrual integral está al alcance de todas como derecho fundamental, y donde cada
    niña, adolescente y mujer construya su identidad para navegar su vida con amor propio,
    confianza e independencia."

## Parallax (ola 2)

- C1. Efecto parallax "bien hecho" entre Bienvenida (hero) y EMI, y entre EMI y Donaciones
  (Johan confirmó que "Súmate" se refería a Donaciones).

## Después

- Ronda de performance (LCP, peso de imágenes, JS de GSAP/Swiper/framer-motion, filtro de pincel,
  Lighthouse mobile en producción) y pendientes de `docs/feedback-5-oct/ROADMAP.md`.
