import gsap from 'gsap';
import {
  APLASTADO,
  EMERGER_DURACION,
  ESCALA_TIEMPO,
  HOLGURA_RECORTE,
  HUNDIMIENTO,
  HUNDIR_DURACION,
  PROPIEDADES,
  RECORTE_ABIERTO,
  T,
  TEXTO_BLUR_PX,
  TEXTO_DESPLAZAMIENTO_PX,
  cajaDe,
  mapear,
  recorte,
  salir,
  type Reposo,
} from './intro.motion';

/**
 * Bienvenida como un paso más de la Introducción (docs/introduccion/DECISIONES.md, D6).
 *
 * Desde la parte 3, un gesto hacia abajo: la intro sale con su coreografía (el texto al final)
 * salvo el sol rojo, que viaja hasta el sol rosado de Bienvenida y cambia por él con squash and
 * stretch, como el barco (D4). Mientras tanto la página ya se asentó en Bienvenida (lo hace el
 * componente, antes del primer pintado) y Bienvenida entra por piezas: el texto primero, luego
 * los rayos del sol, las nubes y la ilustración.
 *
 * Mismo vocabulario que `intro.motion.ts`: cada pieza de Bienvenida lleva `data-rol` y todas las
 * cifras son base, a multiplicar por `ESCALA_TIEMPO`.
 */

/** Roles de las piezas de Bienvenida (`data-rol` en `components/welcome/`). */
export type RolBienvenida =
  | 'texto'
  | 'garabato'
  | 'nube'
  | 'sol'
  | 'rayo'
  | 'palmera'
  | 'ola'
  | 'persona'
  | 'trazo'
  | 'flor'
  | 'gaviota';

/** Tiempos base de la llegada, en segundos desde el gesto (a multiplicar por ESCALA_TIEMPO). */
const LLEGADA = {
  /** El texto nuevo entra cuando el viejo ya se fue (D3): título, subtítulo, párrafo. */
  TEXTO: T.ENTRADA_TEXTO,
  TEXTO_ESCALON: 0.12,
  TEXTO_DURACION: 0.4,
  /** El subrayado se dibuja justo después del subtítulo. */
  SUBRAYADO: T.ENTRADA_TEXTO + 0.2,
  SUBRAYADO_DURACION: 0.5,
  /** Los rayos salen del disco en cascada, en el sentido del reloj, tras el relevo. */
  RAYOS_TRAS_RELEVO: 0.08,
  RAYO_ESCALON: 0.035,
  RAYO_DURACION: 0.32,
  /**
   * El sol viaja más corto que el barco (es un disco que sube un poco, no una travesía) y no
   * espera a la persona, que no va con él: así llega mientras entra el texto.
   */
  SOL_VIAJE: T.VIAJE,
  SOL_VIAJE_DURACION: 0.7,
  /** Las nubes son fondo: solo opacidad y un desplazamiento corto, lento. Tras el texto. */
  NUBES: 0.9,
  NUBES_DURACION: 0.9,
  NUBE_DESPLAZAMIENTO_PX: 14,
  /** Las gaviotas son fondo, como las nubes: bajan un poco mientras aparecen, tras las nubes. */
  GAVIOTAS: 1.05,
  GAVIOTA_ESCALON: 0.08,
  GAVIOTAS_DURACION: 0.8,
  GAVIOTA_DESPLAZAMIENTO_PX: 6,
  /** La ilustración por piezas: palmera, olas, mujer, trazos y flor. */
  ILUSTRACION: 1.0,
  PIEZA_DURACION: 0.45,
  /**
   * Las olas entran de lado, alternando. En px y no en % de su caja: desde D7 el grupo grande de
   * olas mide todo el ancho de la ilustración y un % lo movería de más.
   */
  OLA_DESPLAZAMIENTO_PX: 24,
} as const;

/** Desfase de cada pieza de la ilustración respecto a `LLEGADA.ILUSTRACION`. */
const ILUSTRACION_DESFASE: Partial<Record<RolBienvenida, number>> = {
  palmera: 0,
  ola: 0.06,
  persona: 0.15,
  trazo: 0.22,
  flor: 0.3,
};

function piezas(raiz: HTMLElement, rol: RolBienvenida): HTMLElement[] {
  return Array.from(raiz.querySelectorAll<HTMLElement>(`[data-rol="${rol}"]`));
}

/** Estado oculto del texto, igual que en la intro: 24 px abajo, transparente y desenfocado. */
const TEXTO_OCULTO: gsap.TweenVars = {
  y: TEXTO_DESPLAZAMIENTO_PX,
  opacity: 0,
  filter: `blur(${TEXTO_BLUR_PX}px)`,
};
const TEXTO_NEUTRO: gsap.TweenVars = { y: 0, opacity: 1, filter: 'blur(0px)' };

/** Un trazo cerrado por la derecha: se dibuja de izquierda a derecha al abrirlo. */
const TRAZO_CERRADO = recorte(HOLGURA_RECORTE, '120%', HOLGURA_RECORTE, HOLGURA_RECORTE);

/**
 * Los rayos en el sentido del reloj empezando por arriba, medidos alrededor del centro del
 * disco, con el vector que los separa de él (en unidades del viewBox del sol).
 */
function rayosEnOrden(rayos: HTMLElement[], cx: number, cy: number) {
  return rayos
    .map(el => {
      const b = (el as unknown as SVGGraphicsElement).getBBox();
      const dx = b.x + b.width / 2 - cx;
      const dy = b.y + b.height / 2 - cy;
      // 0 arriba, creciendo en el sentido del reloj.
      const angulo = (Math.atan2(dx, -dy) + 2 * Math.PI) % (2 * Math.PI);
      return { el, dx, dy, angulo };
    })
    .sort((a, b) => a.angulo - b.angulo);
}

/** Centro del disco del sol rosado en unidades de su viewBox (lo escribe el componente). */
function centroDelDisco(bienvenida: HTMLElement) {
  const svg = bienvenida.querySelector<SVGSVGElement>('[data-rayos]')?.ownerSVGElement;
  const c = svg?.dataset.centro?.split(' ').map(Number);
  return { cx: c?.[0] ?? 0, cy: c?.[1] ?? 0 };
}

/**
 * Llegada a Bienvenida desde la parte 3. `origen` es la parte 3 montada en la capa fija y
 * `bienvenida` la sección, ya en su sitio en la pantalla. El timeline arranca pausado y oculta
 * en el acto (al crearse) todas las piezas de Bienvenida, para que el primer pintado tras el
 * desplazamiento no las muestre. `deshacer` quita lo que se añadió al DOM (el sol viajero); va
 * como retorno de la función de `gsap.context`, que lo llama al revertir.
 */
export function crearLlegada(
  origen: HTMLElement,
  bienvenida: HTMLElement
): { tl: gsap.core.Timeline; deshacer: () => void } {
  const tl = gsap.timeline({ paused: true });
  let viajero: HTMLElement | null = null;

  // 1. La intro sale con su coreografía, menos el sol, que viaja.
  salir(tl, origen, 1, ['sol']);
  const inicioViaje = LLEGADA.SOL_VIAJE;
  const viaje = LLEGADA.SOL_VIAJE_DURACION;

  // 2. Relevo del sol: el rojo viaja hasta el disco rosado, se aplasta al llegar, cambia por el
  //    rosado en un fotograma y este se estira. Nunca hay dos soles a la vez (D3, D4).
  //    La parte recorta lo que se sale de su lienzo y en móvil el sol rosado cae fuera de él: el
  //    que viaja es una copia del sol rojo colgada de la capa fija (solo la recorta la
  //    pantalla), puesta encima del original, que se oculta en el mismo fotograma.
  const original = origen.querySelector<HTMLElement>('[data-rol="sol"]');
  const disco = bienvenida.querySelector<HTMLElement>('[data-rol="sol"]');
  const relevo = inicioViaje + viaje;
  if (original && disco && origen.parentElement) {
    const r = original.getBoundingClientRect();
    const rojo = original.cloneNode(true) as HTMLElement;
    rojo.removeAttribute('data-rol');
    rojo.setAttribute('aria-hidden', 'true');
    Object.assign(rojo.style, {
      position: 'fixed',
      left: `${r.left}px`,
      top: `${r.top}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
      pointerEvents: 'none',
    });
    origen.parentElement.appendChild(rojo);
    viajero = rojo;
    gsap.set(original, { opacity: 0 });
    const ida = mapear(rojo, cajaDe([rojo]), cajaDe([disco]));
    tl.to(rojo, { ...ida, duration: viaje, ease: 'power3.inOut' }, inicioViaje);
    const hundido = { yPercent: HUNDIMIENTO, scaleY: APLASTADO, transformOrigin: '50% 100%' };
    const interiorRojo = rojo.firstElementChild as HTMLElement | null;
    if (interiorRojo) {
      tl.to(
        interiorRojo,
        { ...hundido, duration: HUNDIR_DURACION, ease: 'power2.in' },
        relevo - HUNDIR_DURACION
      );
    }
    tl.set(rojo, { opacity: 0 }, relevo);
    // Invisible ya, antes del primer pintado (ver D3: un `fromTo` de duración cero no sirve).
    gsap.set(disco, { opacity: 0 });
    tl.set(disco, { opacity: 1 }, relevo);
    const interiorDisco = disco.firstElementChild as HTMLElement | null;
    if (interiorDisco) {
      tl.fromTo(
        interiorDisco,
        hundido,
        { yPercent: 0, scaleY: 1, duration: EMERGER_DURACION, ease: 'back.out(2.5)' },
        relevo
      );
    }
  }

  // 3. Los rayos salen del disco en cascada, cada uno desde más cerca del centro.
  const { cx, cy } = centroDelDisco(bienvenida);
  rayosEnOrden(piezas(bienvenida, 'rayo'), cx, cy).forEach(({ el, dx, dy }, i) => {
    tl.fromTo(
      el,
      { x: -dx * 0.35, y: -dy * 0.35, scale: 0.2, opacity: 0, transformOrigin: '50% 50%' },
      {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        duration: LLEGADA.RAYO_DURACION,
        ease: 'back.out(1.7)',
      },
      relevo + LLEGADA.RAYOS_TRAS_RELEVO + i * LLEGADA.RAYO_ESCALON
    );
  });

  // 4. El texto entra primero: título, subtítulo (y su subrayado se dibuja) y párrafo.
  piezas(bienvenida, 'texto').forEach((el, i) => {
    tl.fromTo(
      el,
      TEXTO_OCULTO,
      { ...TEXTO_NEUTRO, duration: LLEGADA.TEXTO_DURACION, ease: 'power3.out' },
      LLEGADA.TEXTO + i * LLEGADA.TEXTO_ESCALON
    );
  });
  piezas(bienvenida, 'garabato').forEach(el => {
    tl.fromTo(
      el,
      { clipPath: TRAZO_CERRADO },
      {
        clipPath: RECORTE_ABIERTO,
        duration: LLEGADA.SUBRAYADO_DURACION,
        ease: 'power2.inOut',
      },
      LLEGADA.SUBRAYADO
    );
  });

  // 5. Las nubes derivan: son fondo, solo opacidad y un desplazamiento corto hacia su sitio.
  piezas(bienvenida, 'nube').forEach((el, i) => {
    tl.fromTo(
      el,
      { x: (i % 2 === 0 ? -1 : 1) * LLEGADA.NUBE_DESPLAZAMIENTO_PX, opacity: 0 },
      { x: 0, opacity: 1, duration: LLEGADA.NUBES_DURACION, ease: 'sine.out' },
      LLEGADA.NUBES + i * 0.1
    );
  });

  // 5b. Las gaviotas: fondo también, solo opacidad y unos px hacia abajo, una tras otra.
  piezas(bienvenida, 'gaviota').forEach((el, i) => {
    tl.fromTo(
      el,
      { y: -LLEGADA.GAVIOTA_DESPLAZAMIENTO_PX, opacity: 0 },
      { y: 0, opacity: 1, duration: LLEGADA.GAVIOTAS_DURACION, ease: 'sine.out' },
      LLEGADA.GAVIOTAS + i * LLEGADA.GAVIOTA_ESCALON
    );
  });

  // 6. La ilustración por piezas.
  const t = (rol: RolBienvenida) => LLEGADA.ILUSTRACION + (ILUSTRACION_DESFASE[rol] ?? 0);
  const d = LLEGADA.PIEZA_DURACION;
  piezas(bienvenida, 'palmera').forEach(el => {
    tl.fromTo(
      el,
      { scaleY: 0.85, opacity: 0, transformOrigin: '50% 100%' },
      { scaleY: 1, opacity: 1, duration: d, ease: 'power3.out' },
      t('palmera')
    );
  });
  piezas(bienvenida, 'ola').forEach((el, i) => {
    tl.fromTo(
      el,
      { x: (i % 2 === 0 ? 1 : -1) * LLEGADA.OLA_DESPLAZAMIENTO_PX, opacity: 0 },
      { x: 0, opacity: 1, duration: d, ease: 'power3.out' },
      t('ola') + i * 0.05
    );
  });
  piezas(bienvenida, 'persona').forEach(el => {
    tl.fromTo(
      el,
      { yPercent: 8, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: d, ease: 'power3.out' },
      t('persona')
    );
  });
  piezas(bienvenida, 'trazo').forEach((el, i) => {
    tl.fromTo(
      el,
      { clipPath: TRAZO_CERRADO },
      { clipPath: RECORTE_ABIERTO, duration: 0.35, ease: 'power2.out' },
      t('trazo') + i * 0.05
    );
  });
  piezas(bienvenida, 'flor').forEach(el => {
    tl.fromTo(
      el,
      { scale: 0, rotation: -40, opacity: 0, transformOrigin: '50% 50%' },
      { scale: 1, rotation: 0, opacity: 1, duration: 0.4, ease: 'back.out(2)' },
      t('flor')
    );
  });

  return { tl: tl.timeScale(1 / ESCALA_TIEMPO), deshacer: () => viajero?.remove() };
}

/** Borra lo que la llegada dejó escrito en las piezas de Bienvenida. */
export function limpiarBienvenida(bienvenida: HTMLElement | null) {
  if (!bienvenida) return;
  const todas = bienvenida.querySelectorAll('[data-rol]');
  if (todas.length) gsap.set(todas, { clearProps: PROPIEDADES });
  const interior = bienvenida.querySelector('[data-rol="sol"] > *');
  if (interior) gsap.set(interior, { clearProps: 'transform,transformOrigin' });
}

/*
 * Movimiento en reposo de Bienvenida, muy sutil (D6 y D7):
 *
 * - Los rayos del sol giran despacio alrededor del centro del disco. El disco no gira: es un
 *   raster con textura de lápiz y su contorno no es redondo, así que al girar se vería bailar su
 *   silueta y el remuestreo lo haría titilar. Los rayos llevan el movimiento solos.
 * - El pelo de la mujer se mece desde la nuca: gira un poco (la raíz casi quieta, las puntas con
 *   todo el recorrido) y, con un desfase, se inclina, así la punta sigue a la raíz como una onda
 *   (seguimiento). Es un SVG propio desde D7, no un filtro sobre un raster.
 * - Las gaviotas suben y bajan unos px, cada una con su ciclo y su fase.
 *
 * El pelo y las gaviotas oscilan como un seno puro alrededor de su sitio en Figma, y su amplitud
 * crece de 0 a la suya al arrancar: nunca hay un salto y el primer fotograma es el diseño.
 * Duraciones en segundos reales (no pasan por ESCALA_TIEMPO).
 */
export const REPOSO_BIENVENIDA = {
  /** Una vuelta completa de los rayos. */
  SOL_VUELTA_S: 80,
  /** Lo que tardan los rayos en tomar su velocidad al arrancar. */
  SOL_ARRANQUE_S: 2,
  /** Giro máximo del pelo a cada lado, en grados, con el origen en la nuca. */
  PELO_GIRO_GRADOS: 3,
  /** Inclinación máxima (skewX) del pelo a cada lado, en grados, también desde la nuca. */
  PELO_INCLINACION_GRADOS: 2,
  /** Un ciclo completo del pelo (ida y vuelta). */
  PELO_CICLO_S: 4.2,
  /** Retraso de la inclinación respecto al giro, en fracción de ciclo: la onda llega tarde. */
  PELO_DESFASE_CICLO: 0.18,
  /** Lo que tarda el pelo (y las gaviotas) en llegar a su amplitud al arrancar. */
  AMPLITUD_ARRANQUE_S: 2.5,
  /** Vaivén vertical de cada gaviota, en px a cada lado. */
  GAVIOTA_VAIVEN_PX: 3,
  /** Ciclos de las gaviotas: cada una toma el suyo (en orden, dando la vuelta a la lista). */
  GAVIOTA_CICLOS_S: [4.4, 5.6, 4.9, 5.2, 4.1, 5.9],
} as const;

/**
 * Una oscilación senoidal que arranca en su sitio: `aplicar(valor)` recibe
 * `amplitud * sin(fase)` con la amplitud creciendo de 0 a 1 en `arranque` segundos.
 */
function oscilar(
  ciclo: number,
  fase0: number,
  arranque: number,
  aplicar: (seno: number) => void
): gsap.core.Animation[] {
  const estado = { fase: fase0, amplitud: 0 };
  const pintar = () => aplicar(estado.amplitud * Math.sin(estado.fase));
  const giro = gsap.to(estado, {
    fase: fase0 + 2 * Math.PI,
    duration: ciclo,
    ease: 'none',
    repeat: -1,
    onUpdate: pintar,
  });
  const entrada = gsap.to(estado, { amplitud: 1, duration: arranque, ease: 'sine.inOut' });
  return [giro, entrada];
}

/** Arranca el reposo de Bienvenida. Lo pausa y reanuda quien lo creó (fuera de pantalla, pestaña). */
export function crearReposoBienvenida(bienvenida: HTMLElement): Reposo {
  const tls: gsap.core.Animation[] = [];
  const R = REPOSO_BIENVENIDA;

  // Los rayos giran alrededor del centro del disco.
  const rayos = bienvenida.querySelector<SVGGElement>('[data-rayos]');
  if (rayos) {
    const { cx, cy } = centroDelDisco(bienvenida);
    const giro = gsap.to(rayos, {
      rotation: '+=360',
      svgOrigin: `${cx} ${cy}`,
      duration: R.SOL_VUELTA_S,
      ease: 'none',
      repeat: -1,
    });
    // Arranca suave: la velocidad sube de 0 a la suya.
    giro.timeScale(0);
    tls.push(giro, gsap.to(giro, { timeScale: 1, duration: R.SOL_ARRANQUE_S, ease: 'sine.in' }));
  }

  // El pelo se mece desde la nuca (hay dos mujeres montadas, la de mobile y la de desktop).
  const pelos = Array.from(bienvenida.querySelectorAll<SVGGElement>('[data-pelo]'));
  const ondas = Array.from(bienvenida.querySelectorAll<SVGGElement>('[data-pelo-onda]'));
  pelos.forEach(pelo => {
    const onda = pelo.querySelector<SVGGElement>('[data-pelo-onda]');
    const nuca = pelo.ownerSVGElement?.dataset.nuca;
    if (!onda || !nuca) return;
    gsap.set([pelo, onda], { svgOrigin: nuca });
    tls.push(
      ...oscilar(R.PELO_CICLO_S, 0, R.AMPLITUD_ARRANQUE_S, s =>
        gsap.set(pelo, { rotation: s * R.PELO_GIRO_GRADOS })
      ),
      ...oscilar(R.PELO_CICLO_S, -2 * Math.PI * R.PELO_DESFASE_CICLO, R.AMPLITUD_ARRANQUE_S, s =>
        gsap.set(onda, { skewX: s * R.PELO_INCLINACION_GRADOS })
      )
    );
  });

  // Las gaviotas suben y bajan, cada una a su ritmo y con su fase.
  const gaviotas = piezas(bienvenida, 'gaviota');
  gaviotas.forEach((el, i) => {
    const ciclo = R.GAVIOTA_CICLOS_S[i % R.GAVIOTA_CICLOS_S.length];
    // Fases repartidas por la proporción áurea: nunca dos gaviotas a la par.
    const fase = (i * 2.39996) % (2 * Math.PI);
    // En la caja interior: la de fuera la mueve la entrada.
    const caja = (el.firstElementChild as HTMLElement | null) ?? el;
    tls.push(
      ...oscilar(ciclo, fase, R.AMPLITUD_ARRANQUE_S, s =>
        gsap.set(caja, { y: s * R.GAVIOTA_VAIVEN_PX })
      )
    );
  });

  return {
    pausar: () => tls.forEach(t => t.pause()),
    reanudar: () => tls.forEach(t => t.resume()),
    detener: () => {
      tls.forEach(t => t.kill());
      if (rayos) gsap.set(rayos, { clearProps: 'transform' });
      // Vuelve a neutro: el pelo y las gaviotas, en su sitio de Figma.
      if (pelos.length) gsap.set([...pelos, ...ondas], { clearProps: 'transform' });
      gaviotas.forEach(el => {
        const caja = (el.firstElementChild as HTMLElement | null) ?? el;
        gsap.set(caja, { clearProps: 'transform' });
      });
    },
  };
}
