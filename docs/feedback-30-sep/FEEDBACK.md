# Feedback de Johan, 2026-09-30 (texto original)

Archivo Figma: `ng8HnnYyaDJ2nTWauh7Otb` (Las fuertes reloaded). Los node-id van con `:` en la API
(`1152-287` en la URL es `1152:287`).

## 1. Términos e Intro

- Los colores de las bubbles en la intro paso 1 cambiaron: Figma `1152:287`.
- Cuando entramos de términos o directamente (términos ya aceptados) entra la animación de cada
  elemento. Actualmente entra todo muy rápido; pasos un poco más separados:
  - Primero entra cada bubble una a una de forma rápida con las formas en espiral; estas giran
    lentamente; al final de la animación la línea amarilla se "dibuja/traza" como si se escribiera.
    El resto de elementos están bien como están, menos la bolita roja: esta aparece cuando se hace
    el primer scroll para ir a la parte dos. La bola sale debajo del resto de bubbles, la línea
    amarilla traza su recorrido y al final cae a ser el sol de la segunda parte. Al hacer scroll
    back y volver a animar tiene que pasar lo mismo.
- Parte dos: el sol entra de arriba abajo (cae de la línea amarilla de la parte uno). Igual que en
  la parte uno, al final de todo se dibuja el espiral amarillo. Dejar las animaciones del barco y
  el resto.
- Parte tres: dejar animaciones; lo único que cambia es el espiral amarillo, que también se dibuja.
- Importante: en desktop, con mouse o tableta, la intro pasa derecho al hero al bajar la barra
  lateral; y quien navega con Tab se pierde la intro. Decisión (ver ROADMAP): "Saltar intro" + dos
  flechas (avanzar/retroceder si se puede), en el lugar del actual "Saltar animación", desde el
  primer paso y en todos, visibles al final de las animaciones de cada paso. Bien accesible.

## 2. Menú y navegación

- Quitar el Súmate de donde está y moverlo a una nueva navegación flotante: Figma `1402:225`. El
  comportamiento es el mismo del Súmate actual. "Inicio" lleva a la intro.
- La intro solo muestra el selector de idioma (no hay conflicto).
- El ícono de hamburguesa del diseño no convence: usar nuestros íconos, alineado con la
  implementación actual.

## 3. Bienvenida

- Las nubes tienen un leve movimiento de derecha a izquierda, unas más rápidas que otras, muy sutil.
- Desktop: añadir un par de nubes más: Figma `1280:9`.

## 4. Tripulantes (Donaciones)

- Animar las olas como se viene haciendo, al igual que el barco.
- Pegar el mar al borde izquierdo en los viewports que haga falta.
- Más padding top y bottom para que ocupe la pantalla como otras secciones.

## 5. Mapa

- SVG nuevo del mapa: Figma `1431:985`. No cambia mucho: un poco más grande y se arreglaron cosas.
- Modales desktop según diseño (antes se hicieron sin guía): `1335:2046`, `1338:2690`,
  `1338:3182`, `1338:3669`, `1338:4157`, `1338:4644`.
- Mobile: el modal toma más espacio de la pantalla, más relleno y centrado verticalmente.
- Accesibilidad: botón de cerrar de 30x30 px; botones de 40x40 px.

## 6. Impacto

- Cada animación y texto se ve en pantalla completa: cada par texto + imagen del alto del viewport
  (desktop y mobile). Decisión: scroll libre con imán (scroll-snap).
- El primer impacto tiene mucho contenido y altura dinámica, pero el título está muy pegado al mapa.
- Las animaciones entran muy rápido: algo más intencionado y bello. La de la luz se queda tal cual.

## 7. Quiénes somos

- Desktop final: Figma `1437:1518`. Mobile: Figma `1219:985`.
- Nota: algunas chicas salieron del mapa.

## 8. Formulario de donación

- Implementar con el diseño `1300:1865`. En desktop no drawer: modal a pantalla completa. El diseño
  es guía, no resultado final. La iteración actual (hecha con IA) no se ve bien. Mucha atención a
  bordes y colores; dejar los íconos, solo cambiar bordes y fondo. Que se parezca más al look and
  feel de la página.

## 9. Footer

- Diseño final: Figma `1402:230`.
- LinkedIn: https://www.linkedin.com/company/fundaci%C3%B3n-las-fuertes/
- Instagram: https://www.instagram.com/las.fuertes/
- Transparencia: escoger el año (hoy solo 2025, extensible). PDF 2025 en
  `public/images/estados financieros/Fund. Las Fuertes-estados financieros 2025.pdf` del checkout
  principal (`~/Sites/personal/landinglasfuertes`).
- Quitar el formulario de contacto.
- Nota: el aire entre título y texto de cada sección debe ser el mismo en toda la página, o al
  menos suficiente para que nada se vea apeñuscado.

## 10. Otros

- La fuente de los acentos (como "de Isla Fuerte, Colombia") pasa a "Indie Flower".
