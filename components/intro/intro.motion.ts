import gsap from 'gsap';
import { CANVAS, type Rol } from './intro.data';

/**
 * Coreografía de las transiciones de la Introducción (docs/introduccion/DECISIONES.md, D2).
 *
 * Cada pieza del lienzo lleva `data-rol` y cada rol sabe cómo entrar y cómo salir. Las dos
 * cosas usan el mismo "estado oculto": la entrada parte de él con el sentido del gesto y la
 * salida va hacia él con el sentido contrario, así adelante y atrás quedan en espejo.
 *
 * Solo se animan `transform`, `opacity`, `filter` y `clip-path` sobre la caja de cada pieza, y
 * al terminar se borran (`limpiar`): el estado final es el markup estático, sin restos.
 */

/** 1 cuando el gesto avanza, -1 cuando retrocede. */
export type Sentido = 1 | -1;

/** Lo que sube o baja el texto al entrar y salir. */
export const TEXTO_DESPLAZAMIENTO_PX = 24;
/** Desenfoque del texto mientras aparece. */
export const TEXTO_BLUR_PX = 6;
/** Cuánto se sale el trazo de un garabato de su caja; el recorte lo deja respirar. */
export const HOLGURA_RECORTE = '-20%';

/**
 * Escala de todos los tiempos. Las cifras de abajo son la base; el timeline entero se reproduce
 * a `1 / ESCALA_TIEMPO` de velocidad, así una sola cifra alarga o acorta todo por igual. Con 1,4
 * la transición dura unos 1,75 s y la entrada de la parte 1 unos 1,3 s (D3).
 */
export const ESCALA_TIEMPO = 1.4;

/**
 * Tiempos base de una transición, en segundos desde el gesto. El texto manda (D3): en la salida
 * las piezas se van primero y el texto viejo es lo último en apagarse; en la entrada el texto
 * nuevo llega el primero, justo cuando el viejo ya se fue, y las piezas lo siguen.
 */
export const T = {
  SALIDA_PIEZAS: 0,
  SALIDA_TEXTO: 0.15,
  ENTRADA_TEXTO: 0.44,
  ENTRADA_PIEZAS: 0.55,
  VIAJE: 0.1,
} as const;

/** Entrada de la parte 1 (sin texto viejo que esperar): cuánto después del texto van las piezas. */
const ENTRADA_INICIAL_PIEZAS = 0.15;

/** Desfases de cada rol dentro de la entrada de las piezas, respecto a su arranque. */
const DESFASE: Record<Rol, number> = {
  horizonte: 0,
  burbuja: 0,
  espiral: 0,
  barco: 0,
  garabato: 0.05,
  // La bola no entra con los roles: su viaje es propio (`viajeDeLaBola`).
  bola: 0,
  sol: 0.05,
  agua: 0.1,
  reflejo: 0.1,
  ola: 0.1,
  nube: 0.1,
  // El texto no usa desfase: tiene sus propios tiempos en `T`.
  texto: 0,
  // La persona no entra con la transición: es una nota aparte, al final (`crearAsomo`).
  persona: 0,
};

/** Duración de la entrada de cada rol. */
const DURACION: Record<Rol, number> = {
  // La tierra es fondo: solo un fundido de opacidad, suave (D4).
  horizonte: 0.7,
  burbuja: 0.45,
  espiral: 0.55,
  barco: 0.65,
  garabato: 0.5,
  bola: 0,
  sol: 0.6,
  agua: 0.45,
  reflejo: 0.45,
  ola: 0.45,
  nube: 0.55,
  texto: 0.4,
  // Duración del asomo de la persona, que se reproduce fuera del timeline (D5).
  persona: 0.6,
};

/** Separación entre piezas del mismo rol. */
const ESCALON: Record<Rol, number> = {
  horizonte: 0,
  burbuja: 0.012,
  espiral: 0.012,
  barco: 0,
  garabato: 0.02,
  bola: 0,
  sol: 0,
  agua: 0.03,
  reflejo: 0,
  ola: 0.03,
  nube: 0,
  texto: 0.06,
  persona: 0,
};

/** El cabeceo del barco dura un poco más que su entrada, para que se asiente. */
const CABECEO_DURACION = 0.7;

/**
 * Salida: las piezas se van rápido y todas dentro de `SALIDA_ABANICO`, para que el texto viejo
 * sea siempre lo último en apagarse.
 */
const SALIDA_DURACION = 0.25;
const SALIDA_ESCALON = 0.012;
const SALIDA_ABANICO = 0.1;
const SALIDA_TEXTO_DURACION = 0.25;
const SALIDA_TEXTO_ESCALON = 0.04;

/** La tierra sale con un fundido algo más corto que el de entrada, para no pasar al texto. */
const SALIDA_HORIZONTE_DURACION = 0.42;

/** Piezas que viajan de su sitio viejo al nuevo entre las partes 2 y 3. */
const VIAJAN: Rol[] = ['sol', 'barco', 'ola'];
export const VIAJE_DURACION = 0.85;

/**
 * Relevo del barco entre las partes 2 y 3, "salto con squash" (D4, elegido por Johan): cuánto se
 * hunde (en % de su alto), cuánto se aplasta y cuánto dura cada tramo.
 */
export const HUNDIMIENTO = 12;
export const APLASTADO = 0.55;
export const HUNDIR_DURACION = 0.14;
export const EMERGER_DURACION = 0.4;

/** Propiedades que la animación toca y que se borran al terminar. */
export const PROPIEDADES = 'transform,transformOrigin,opacity,filter,clipPath,visibility';

export const recorte = (arriba: string, derecha: string, abajo: string, izquierda: string) =>
  `inset(${arriba} ${derecha} ${abajo} ${izquierda})`;
export const RECORTE_ABIERTO = recorte(
  HOLGURA_RECORTE,
  HOLGURA_RECORTE,
  HOLGURA_RECORTE,
  HOLGURA_RECORTE
);

/** Estado oculto de un rol. La entrada parte de aquí; la salida va aquí con el sentido opuesto. */
function oculto(rol: Rol, s: Sentido, i: number, el?: HTMLElement): gsap.TweenVars {
  switch (rol) {
    case 'burbuja':
      return { scale: 0, opacity: 0 };
    case 'espiral':
      // La espiral quieta (D16) solo aparece: crece y se funde, sin girar.
      if (el && esQuieta(el)) return { scale: 0, opacity: 0 };
      // Entra girando sobre sí misma, en el sentido en que se enrosca (D10).
      return { scale: 0, rotation: -150 * s, opacity: 0 };
    case 'bola':
      // Entra con su propio recorrido (D15); sale con la intro, como el sol, desde la cola.
      return { scale: 0, opacity: 0 };
    case 'persona':
      // La persona tiene su propia animación (`asomar`): sale del doblez del barco.
      return {};
    case 'garabato':
      // Se dibuja de izquierda a derecha: el recorte arranca cerrado por el lado hacia el
      // que va el trazo. 120% deja fuera también la holgura.
      return {
        clipPath:
          s === 1
            ? recorte(HOLGURA_RECORTE, '120%', HOLGURA_RECORTE, HOLGURA_RECORTE)
            : recorte(HOLGURA_RECORTE, HOLGURA_RECORTE, HOLGURA_RECORTE, '120%'),
      };
    case 'horizonte':
      return { opacity: 0 };
    case 'sol':
      return { yPercent: 50 * s, rotation: -15 * s, opacity: 0 };
    case 'nube':
      return { xPercent: -60 * s, opacity: 0 };
    case 'agua':
    case 'reflejo':
    case 'ola':
      // Alternan de lado, una desde cada orilla.
      return { xPercent: (i % 2 === 0 ? -30 : 30) * s, opacity: 0 };
    case 'barco':
      return { xPercent: -40 * s, opacity: 0 };
    case 'texto':
      return {
        y: TEXTO_DESPLAZAMIENTO_PX * s,
        opacity: 0,
        filter: `blur(${TEXTO_BLUR_PX}px)`,
      };
  }
}

/** Estado neutro al que llega cada propiedad que `oculto` puede tocar. */
function neutro(rol: Rol): gsap.TweenVars {
  switch (rol) {
    case 'garabato':
      return { clipPath: RECORTE_ABIERTO };
    case 'horizonte':
      return { opacity: 1 };
    case 'texto':
      return { y: 0, opacity: 1, filter: 'blur(0px)' };
    default:
      return { x: 0, y: 0, xPercent: 0, yPercent: 0, rotation: 0, scale: 1, opacity: 1 };
  }
}

const ROLES: Rol[] = [
  'horizonte',
  'garabato',
  'burbuja',
  'espiral',
  'bola',
  'sol',
  'nube',
  'agua',
  'reflejo',
  'ola',
  'barco',
  'persona',
  'texto',
];

/** Una pieza marcada `quieta` en los datos: no gira ni se mece, solo aparece (D16). */
const esQuieta = (el: HTMLElement) => el.dataset.quieta !== undefined;

function piezasDe(raiz: HTMLElement, rol: Rol): HTMLElement[] {
  return Array.from(raiz.querySelectorAll<HTMLElement>(`[data-rol="${rol}"]`));
}

/** Centro de una caja medida en pantalla. */
function centro(r: DOMRect) {
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/**
 * Las burbujas aparecen en cascada desde el centro del racimo hacia fuera; al salir, al
 * revés. El orden se mide en pantalla, así vale igual en los tres breakpoints.
 */
function ordenarDesdeElCentro(piezas: HTMLElement[]): HTMLElement[] {
  const centros = piezas.map(p => centro(p.getBoundingClientRect()));
  const cx = centros.reduce((a, c) => a + c.x, 0) / (centros.length || 1);
  const cy = centros.reduce((a, c) => a + c.y, 0) / (centros.length || 1);
  return piezas
    .map((p, i) => ({ p, d: Math.hypot(centros[i].x - cx, centros[i].y - cy) }))
    .sort((a, b) => a.d - b.d)
    .map(({ p }) => p);
}

function ordenar(rol: Rol, piezas: HTMLElement[]) {
  return rol === 'burbuja' || rol === 'espiral' ? ordenarDesdeElCentro(piezas) : piezas;
}

/** Curva de entrada de cada rol. */
function curvaDeEntrada(rol: Rol) {
  if (rol === 'burbuja') return 'back.out(1.6)';
  if (rol === 'espiral') return 'back.out(1.4)';
  if (rol === 'horizonte') return 'power1.inOut';
  return 'power3.out';
}

/**
 * La persona de la parte 3 se asoma desde dentro del barco (D4, D5): sube sin escalar,
 * recortada con un `clip-path: polygon()` cuyo borde inferior es el trazo del barco por donde se
 * asoma, el que va del pliegue central a la punta derecha y sube hacia la derecha. El recorte se
 * compensa con el desplazamiento (se mueve al revés que ella), así el borde queda fijo respecto
 * al barco. Es lineal, sin pasarse de largo. Vive dentro del grupo del barco: si el barco se
 * mece o se mueve, la línea de recorte va con él.
 *
 * El borde sale de los paths de `paso3-barco.svg` (viewBox 307,84 x 181): es el lado superior
 * del polígono claro `M204.6 106.8 153.75 128 l94.06 42.43 58.44-94.46z`, que va de
 * (153,75, 128) a (204,6, 106,8) y a la punta (306,25, 75,97), con un quiebre leve. D5.
 */
const BORDE_BARCO_3 = {
  viewBox: { ancho: 307.84, alto: 181 },
  puntos: [
    [153.75, 128],
    [204.6, 106.8],
    [306.25, 75.97],
  ],
  /**
   * Desplazamiento de la línea en unidades del viewBox. Los puntos son el filo del relleno claro,
   * que coincide con el filo superior del trazo negro; 0,8 más abajo queda por encima del centro
   * del trazo: la persona desaparece detrás de la línea sin filo visible y, en reposo, el
   * polígono no le recorta nada (medido: 0 px distintos a 390 y a 1280).
   */
  subir: -0.8,
} as const;

/** Dirección en la que se asoma (x, y por unidad de recorrido): hacia arriba, en vertical. */
const ASOMO_DIRECCION = { x: 0, y: 1 };

const fraccion = (v: string) => parseFloat(v) / 100;

/**
 * El borde del barco en px locales de la persona. Se calcula con las cajas en porcentaje que
 * `Capa` escribe en el estilo (y el `inset` del SVG del barco), no con medidas en pantalla: así
 * no le afectan ni el redondeo ni el idle que esté meciendo el grupo en ese momento.
 */
function bordeEnPersona(persona: HTMLElement): [number, number][] {
  const paso = persona.closest<HTMLElement>('[id^="intro-paso-"]');
  const barco = paso?.querySelector<HTMLElement>('[data-rol="barco"]');
  const svg = barco?.firstElementChild as HTMLElement | null;
  if (!paso || !barco || !svg) return [];
  const { width: W, height: H } = paso.getBoundingClientRect();
  const caja = (el: HTMLElement) => ({
    left: fraccion(el.style.left) * W,
    top: fraccion(el.style.top) * H,
    width: fraccion(el.style.width) * W,
    height: fraccion(el.style.height) * H,
  });
  const b = caja(barco);
  const p = caja(persona);
  // `inset` del SVG dentro de su caja (arriba, derecha, abajo, izquierda), en % de la caja.
  const [it, ir, ib, il] = svg.style.inset.split(' ').map(v => fraccion(v) || 0);
  const img = {
    left: b.left + il * b.width,
    top: b.top + it * b.height,
    width: b.width * (1 - il - ir),
    height: b.height * (1 - it - ib),
  };
  const { viewBox, puntos, subir } = BORDE_BARCO_3;
  return puntos.map(([x, y]) => [
    img.left + (x / viewBox.ancho) * img.width - p.left,
    img.top + ((y - subir) / viewBox.alto) * img.height - p.top,
  ]);
}

/** El polígono que deja ver solo lo que está por encima del borde, con la persona movida (dx, dy). */
function recortePersona(borde: [number, number][], dx: number, dy: number): string {
  const LEJOS = 10000;
  const pts = borde.map(([x, y]) => [x - dx, y - dy]);
  const izq = pts[0];
  const der = pts[pts.length - 1];
  const todos = [
    [-LEJOS, -LEJOS],
    [LEJOS, -LEJOS],
    [LEJOS, der[1]],
    ...[...pts].reverse(),
    [-LEJOS, izq[1]],
  ];
  return `polygon(${todos.map(([x, y]) => `${x.toFixed(2)}px ${y.toFixed(2)}px`).join(', ')})`;
}

/**
 * Recorrido que la esconde del todo bajo el borde: hasta que su borde de arriba pasa la línea.
 * Manda el punto más bajo del borde dentro de su ancho (el borde sube hacia la derecha).
 */
function recorridoPersona(el: HTMLElement, borde: [number, number][]): number {
  return Math.max(...borde.map(([, y]) => y), el.offsetHeight) + 2;
}

/**
 * Coloca a la persona a `d` de su sitio (0 es su sitio) con el recorte compensado. No se
 * interpola la cadena del `polygon()` con GSAP: empareja mal sus números y el borde se torcía a
 * mitad del asomo (D5). Se anima un solo número y aquí se escriben las dos cosas a la vez.
 */
function colocarPersona(el: HTMLElement, borde: [number, number][], d: number) {
  const dx = ASOMO_DIRECCION.x * d;
  const dy = ASOMO_DIRECCION.y * d;
  gsap.set(el, { x: dx, y: dy });
  el.style.clipPath = recortePersona(borde, dx, dy);
}

/** Escondida del todo bajo el borde. */
function esconderYa(el: HTMLElement) {
  const borde = bordeEnPersona(el);
  colocarPersona(el, borde, recorridoPersona(el, borde));
}
/** La persona llega como nota aparte: esto después de que la transición terminó (s reales). */
const PERSONA_RETRASO_S = 0.5;
/** Lo que tarda en esconderse al retroceder (base). El barco no se mueve hasta que termina. */
const PERSONA_SALIDA = 0.25;
export const VIAJE_TRAS_PERSONA = PERSONA_SALIDA + 0.05;

/**
 * Se esconde hacia abajo dentro del barco, desde donde esté (quieta o a medio asomarse): así un
 * gesto que llega durante el asomo lo invierte sin salto.
 */
function esconderPersona(tl: gsap.core.Timeline, el: HTMLElement, t: number) {
  const borde = bordeEnPersona(el);
  // Parte de donde esté: su desplazamiento actual dice cuánto le queda.
  const estado = { d: Number(gsap.getProperty(el, 'y')) / ASOMO_DIRECCION.y || 0 };
  tl.to(
    estado,
    {
      d: recorridoPersona(el, borde),
      duration: PERSONA_SALIDA,
      ease: 'sine.in',
      onUpdate: () => colocarPersona(el, borde, estado.d),
    },
    t
  );
}

/**
 * El asomo de la persona, fuera del timeline de la transición: arranca `PERSONA_RETRASO_S`
 * después de que la transición terminó y no alarga el bloqueo de gestos. Quien lo crea lo
 * guarda para matarlo (sin revertir) si llega un gesto.
 */
export function crearAsomo(raiz: HTMLElement): gsap.core.Tween | null {
  const el = raiz.querySelector<HTMLElement>('[data-rol="persona"]');
  if (!el) return null;
  const borde = bordeEnPersona(el);
  const estado = { d: recorridoPersona(el, borde) };
  colocarPersona(el, borde, estado.d);
  return gsap.to(estado, {
    d: 0,
    duration: DURACION.persona * ESCALA_TIEMPO,
    delay: PERSONA_RETRASO_S,
    ease: 'sine.out',
    onUpdate: () => colocarPersona(el, borde, estado.d),
  });
}

/*
 * Trazos que se dibujan (D10). Una capa con `trazo` se pinta como un SVG en línea: la imagen del
 * pincel, una máscara con la línea central y una guía invisible con la misma línea. Para
 * dibujarla, la máscara se despliega con `stroke-dashoffset` (el trazo mide 1 por `pathLength`).
 * La máscara solo se pone mientras se anima: en reposo la imagen va sin máscara y se ve
 * exactamente el diseño.
 */

/**
 * Largo normalizado de la línea (`pathLength` del SVG). Con 1, GSAP redondea el
 * `stroke-dashoffset` a píxeles enteros y el dibujo salta de golpe: con 1000 el paso es fino.
 */
export const LARGO_TRAZO = 1000;

/** Cuánto dura el dibujo de un trazo (base, pasa por ESCALA_TIEMPO). */
export const DIBUJO_DURACION = 0.6;
/** El trazo largo de la parte 1 se escribe más despacio: recorre media pantalla. */
export const DIBUJO_LINEA_DURACION = 1.05;
/** En una transición, el trazo se dibuja al final de todo: esto después del arranque de las piezas. */
export const TRAZO_TRAS_PIEZAS = 0.45;

interface PartesTrazo {
  imagen: SVGElement;
  mascara: SVGPathElement;
  guia: SVGPathElement;
  id: string;
}

function partesTrazo(el: Element): PartesTrazo | null {
  const svg = el.querySelector<SVGSVGElement>('svg[data-trazo]');
  const imagen = svg?.querySelector<SVGElement>('[data-trazo-imagen]');
  const mascara = svg?.querySelector<SVGPathElement>('[data-trazo-mascara]');
  const guia = svg?.querySelector<SVGPathElement>('[data-trazo-guia]');
  const id = mascara?.parentElement?.id;
  if (!imagen || !mascara || !guia || !id) return null;
  return { imagen, mascara, guia, id };
}

const esTrazo = (el: Element) => !!el.querySelector('svg[data-trazo]');

/**
 * Pone la máscara con el trazo desplazado `desplazamiento` (en fracciones del largo: 1 no se ve
 * nada, 0 se ve entero, -0,5 se borró la primera mitad) en el acto, antes del primer pintado. Son
 * `gsap.set` fuera del timeline: el contexto de GSAP los deshace igual.
 */
function enmascarar(p: PartesTrazo, desplazamiento: number) {
  gsap.set(p.imagen, { attr: { mask: `url(#${p.id})` } });
  gsap.set(p.mascara, {
    strokeDasharray: `${LARGO_TRAZO} ${LARGO_TRAZO}`,
    strokeDashoffset: desplazamiento * LARGO_TRAZO,
  });
}

/**
 * Curva del dibujo de un trazo (D12): empieza despacio y termina rápido, como una mano que toma
 * impulso. `power2.in` y no `power3.in`: al 25 % del tiempo lleva un 6 % del trazo (con power3,
 * un 1,6 %, y el primer tercio se leía como una pausa) y termina al doble de su velocidad media.
 */
export const CURVA_DIBUJO = 'power2.in';

/** Dibuja el trazo de `el` desde su principio, como si se escribiera. */
function dibujar(tl: gsap.core.Timeline, el: Element, t: number, duracion = DIBUJO_DURACION) {
  const p = partesTrazo(el);
  if (!p) return;
  enmascarar(p, 1);
  tl.to(p.mascara, { strokeDashoffset: 0, duration: duracion, ease: CURVA_DIBUJO }, t);
}

/** Quita la máscara de los trazos de `raiz`: el reposo es la imagen tal cual. */
function desenmascarar(raiz: HTMLElement) {
  raiz.querySelectorAll('svg[data-trazo]').forEach(svg => {
    svg.querySelector('[data-trazo-imagen]')?.removeAttribute('mask');
    const mascara = svg.querySelector('[data-trazo-mascara]');
    if (mascara) gsap.set(mascara, { clearProps: 'strokeDasharray,strokeDashoffset' });
  });
}

interface OpcionesEntrada {
  /** Cuándo empiezan a dibujarse los trazos. Por defecto, al final de las piezas. */
  inicioTrazo?: number;
  /** Piezas concretas que no entran con su rol (las anima otra cosa). */
  saltar?: Set<Element>;
}

/**
 * Añade al timeline la entrada de todas las piezas de `raiz`, excepto las de `excluir`. El texto
 * arranca en `inicioTexto` y el resto de piezas en `inicioPiezas`; los trazos amarillos se dibujan
 * al final (D10).
 */
function entrar(
  tl: gsap.core.Timeline,
  raiz: HTMLElement,
  s: Sentido,
  inicioTexto: number,
  inicioPiezas: number,
  excluir: Rol[] = [],
  { inicioTrazo = inicioPiezas + TRAZO_TRAS_PIEZAS, saltar }: OpcionesEntrada = {}
) {
  ROLES.filter(r => !excluir.includes(r)).forEach(rol => {
    const piezas = ordenar(rol, piezasDe(raiz, rol)).filter(el => !saltar?.has(el));
    const t = rol === 'texto' ? inicioTexto : inicioPiezas + DESFASE[rol];
    piezas.forEach((el, i) => {
      const ti = t + i * ESCALON[rol];
      if (rol === 'persona') {
        // Escondida toda la transición: se asoma después, con `crearAsomo`.
        esconderYa(el);
        return;
      }
      if (rol === 'bola') return;
      if (esTrazo(el)) {
        dibujar(tl, el, inicioTrazo);
        return;
      }
      const fin = neutro(rol);
      // La rotación del barco la lleva su propio tween de cabeceo, más abajo.
      if (rol === 'barco') delete fin.rotation;
      tl.fromTo(
        el,
        oculto(rol, s, i, el),
        { ...fin, duration: DURACION[rol], ease: curvaDeEntrada(rol) },
        ti
      );
      // El barco cabecea un poco al llegar.
      if (rol === 'barco') {
        tl.fromTo(
          el,
          { rotation: -8 * s },
          { rotation: 0, duration: CABECEO_DURACION, ease: 'elastic.out(1, 0.45)' },
          ti
        );
      }
    });
  });
}

/**
 * Añade al timeline la salida de todas las piezas de `raiz`, excepto las de `excluir` y las de
 * `saltar`. Todo arranca `inicio` segundos después del principio del timeline.
 */
export function salir(
  tl: gsap.core.Timeline,
  raiz: HTMLElement,
  s: Sentido,
  excluir: Rol[] = [],
  inicio = 0,
  saltar?: Set<Element>
) {
  const opuesto = -s as Sentido;
  ROLES.filter(r => !excluir.includes(r)).forEach(rol => {
    // Las burbujas salen de fuera hacia dentro: el orden de entrada, al revés.
    const piezas = ordenar(rol, piezasDe(raiz, rol))
      .reverse()
      .filter(el => !saltar?.has(el));
    const esTexto = rol === 'texto';
    const t = inicio + (esTexto ? T.SALIDA_TEXTO : T.SALIDA_PIEZAS);
    const escalon = esTexto
      ? SALIDA_TEXTO_ESCALON
      : Math.min(SALIDA_ESCALON, SALIDA_ABANICO / Math.max(1, piezas.length - 1));
    // `clip-path` no se interpola desde `none`: los roles que se recortan parten del abierto.
    const recortado = rol === 'garabato';
    piezas.forEach((el, i) => {
      if (rol === 'persona') {
        esconderPersona(tl, el, t);
        return;
      }
      tl.fromTo(
        el,
        recortado ? { clipPath: RECORTE_ABIERTO } : {},
        {
          ...oculto(rol, opuesto, i, el),
          duration: esTexto
            ? SALIDA_TEXTO_DURACION
            : rol === 'horizonte'
              ? SALIDA_HORIZONTE_DURACION
              : SALIDA_DURACION,
          ease: rol === 'horizonte' ? 'power1.inOut' : 'power2.in',
          immediateRender: false,
        },
        t + i * escalon
      );
    });
  });
}

/** Caja que envuelve a varias piezas, medida en pantalla. */
export function cajaDe(
  piezas: HTMLElement[],
  medir: (p: HTMLElement) => { left: number; top: number; width: number; height: number } = p =>
    p.getBoundingClientRect()
) {
  const rs = piezas
    .map(medir)
    .map(r => ({ left: r.left, top: r.top, right: r.left + r.width, bottom: r.top + r.height }));
  const left = Math.min(...rs.map(r => r.left));
  const top = Math.min(...rs.map(r => r.top));
  const right = Math.max(...rs.map(r => r.right));
  const bottom = Math.max(...rs.map(r => r.bottom));
  return { left, top, width: right - left, height: bottom - top };
}

type Caja = ReturnType<typeof cajaDe>;

/**
 * Lo que se ve de una pieza: su caja, o el disco del sol cuando la imagen trae algo más
 * (`data-disco`, en fracciones de la imagen). El sol de mobile de la parte 2 trae el hueco de su
 * espiral a la derecha: viajando caja a caja, en el relevo con el sol de la parte 3 (que llena su
 * caja) el disco saltaba unos 11 px a la derecha y crecía un 39 % en un fotograma (D16).
 */
function cajaVisible(el: HTMLElement): Caja {
  const r = el.getBoundingClientRect();
  if (!el.dataset.disco) return { left: r.left, top: r.top, width: r.width, height: r.height };
  const [fx, fy, fw, fh] = el.dataset.disco.split(' ').map(Number);
  const img = (el.querySelector('img') ?? el).getBoundingClientRect();
  return {
    left: img.left + fx * img.width,
    top: img.top + fy * img.height,
    width: fw * img.width,
    height: fh * img.height,
  };
}

/**
 * Transformación que lleva una pieza, que vive dentro de la caja `de`, al sitio equivalente
 * dentro de la caja `a`. Es la base del viaje: se aplica a todo un rol a la vez para que las
 * piezas conserven su posición relativa mientras se mueven.
 */
export function mapear(el: HTMLElement, de: Caja, a: Caja): gsap.TweenVars {
  const c = centro(el.getBoundingClientRect());
  const sx = a.width / (de.width || 1);
  const sy = a.height / (de.height || 1);
  return {
    x: a.left + (c.x - de.left) * sx - c.x,
    y: a.top + (c.y - de.top) * sy - c.y,
    scaleX: sx,
    scaleY: sy,
  };
}

/**
 * Continuidad entre las partes 2 y 3: el sol, el barco y sus olas no salen y entran, viajan.
 * Nunca puede haber dos a la vez (D3): es un relevo, no un crossfade. La pieza vieja viaja
 * hacia la caja de la nueva y la nueva, todavía invisible, hace el mismo recorrido desde la caja
 * de la vieja. Las dos ocupan la misma caja en cada instante, así que a mitad del viaje, cuando
 * van más rápido, se cambia una por otra y la nueva termina el viaje. El sol y las olas cambian
 * en un fotograma; el barco se hunde y se aplasta, cambia en el aplastamiento máximo y el nuevo
 * se estira hacia arriba (D4). El viaje empieza en `inicio`. Devuelve los roles que viajaron.
 */
function viajar(
  tl: gsap.core.Timeline,
  origen: HTMLElement,
  destino: HTMLElement,
  inicio: number
): Rol[] {
  const viajaron: Rol[] = [];
  const relevo = inicio + VIAJE_DURACION / 2;
  VIAJAN.forEach(rol => {
    const viejas = piezasDe(origen, rol);
    const nuevas = piezasDe(destino, rol);
    if (viejas.length === 0 || nuevas.length === 0) return;
    viajaron.push(rol);
    // Se mide con los grupos en su sitio: el reposo mece el del barco y, al empezar la transición,
    // vuelve a cero (`detener`). Medido mecido, la caja del barco viejo salía inflada por el giro y
    // en el relevo el nuevo era 10 px más ancho (D16).
    const grupos = [
      ...new Set([...viejas, ...nuevas].map(el => el.closest<HTMLElement>('[data-grupo]'))),
    ]
      .filter((g): g is HTMLElement => !!g)
      .map(g => [g, g.style.transform] as const);
    grupos.forEach(([g]) => (g.style.transform = 'none'));
    const cajaVieja = cajaDe(viejas, cajaVisible);
    const cajaNueva = cajaDe(nuevas, cajaVisible);
    // Se mide todo antes de crear un solo tween: `fromTo` aplica su estado inicial en el acto.
    const idas = viejas.map(el => mapear(el, cajaVieja, cajaNueva));
    const vueltas = nuevas.map(el => mapear(el, cajaNueva, cajaVieja));
    grupos.forEach(([g, t]) => (g.style.transform = t));
    viejas.forEach((el, i) => {
      tl.to(el, { ...idas[i], duration: VIAJE_DURACION, ease: 'power3.inOut' }, inicio);
    });
    nuevas.forEach((el, i) => {
      tl.fromTo(
        el,
        vueltas[i],
        { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: VIAJE_DURACION, ease: 'power3.inOut' },
        inicio
      );
      // Invisible ya, antes del primer pintado (un `set` fuera del timeline, que el contexto de
      // GSAP deshace igual). Un `fromTo` de duración cero no sirve: GSAP lo trata como un `set`
      // y pinta su estado final en el acto.
      gsap.set(el, { opacity: 0 });
    });

    if (rol === 'barco') {
      // Salto con squash: se anima la caja interior del barco, para no pisar el viaje, que
      // mueve la exterior. Se hunde y se aplasta desde su línea de flotación; en el aplastamiento
      // máximo cambia, y el nuevo se estira hacia arriba como si saliera del agua.
      const hundido = { yPercent: HUNDIMIENTO, scaleY: APLASTADO, transformOrigin: '50% 100%' };
      viejas.forEach(el => {
        const interior = el.firstElementChild as HTMLElement | null;
        if (interior) {
          tl.to(
            interior,
            { ...hundido, duration: HUNDIR_DURACION, ease: 'power2.in' },
            relevo - HUNDIR_DURACION
          );
        }
        tl.set(el, { opacity: 0 }, relevo);
      });
      nuevas.forEach(el => {
        const interior = el.firstElementChild as HTMLElement | null;
        if (interior) {
          tl.fromTo(
            interior,
            hundido,
            { yPercent: 0, scaleY: 1, duration: EMERGER_DURACION, ease: 'back.out(2.5)' },
            relevo
          );
        }
        tl.set(el, { opacity: 1 }, relevo);
      });
      return;
    }
    viejas.forEach(el => tl.set(el, { opacity: 0 }, relevo));
    nuevas.forEach(el => tl.set(el, { opacity: 1 }, relevo));
  });
  return viajaron;
}

/** Borra todo lo que la animación dejó escrito en las piezas de `raiz`. */
export function limpiar(raiz: HTMLElement | null) {
  if (!raiz) return;
  // La persona no: sigue escondida hasta que se asoma (`crearAsomo`).
  const piezas = raiz.querySelectorAll('[data-rol]:not([data-rol="persona"])');
  if (piezas.length) gsap.set(piezas, { clearProps: PROPIEDADES });
  // Las cajas interiores (el aplastamiento del barco en el relevo, el del sol al caer) solo
  // llevan transform. Con una lista vacía GSAP avisa en consola, por eso se mira antes.
  const interiores = raiz.querySelectorAll(
    '[data-rol="barco"] > *, [data-rol="sol"] > *, [data-rol="bola"] > *'
  );
  if (interiores.length) gsap.set(interiores, { clearProps: 'transform,transformOrigin' });
  desenmascarar(raiz);
}

/*
 * La bolita roja y el sol entre las partes 1 y 2 (D15, reemplaza el salto de D12).
 *
 * Tablet y desktop: en la entrada de la parte 1 la bola sale de debajo de las burbujas detrás de la
 * punta del trazo que se escribe y rueda hasta el final de la cola, donde descansa (su caja en
 * `intro.data.ts`). Con el gesto a la parte 2 baja rodando por la misma línea, que se recoge hacia
 * ella desde sus dos puntas, hasta la vertical del sol de la parte 2; ahí, en un fotograma y sin que
 * se note (es el mismo dibujo, a otra escala, con el giro en una vuelta entera), cambia por el sol,
 * que amanece: sube despacio y crece hasta su sitio. Nunca hay dos soles ni un fundido.
 *
 * Mobile: no hay bola. El sol de la parte 2 cae desde arriba por detrás de las burbujas, que siguen
 * ahí, y se aplasta un poco al llegar (squash and stretch, D4).
 *
 * Al volver a la parte 1 se reproduce la misma ida al revés (`bola-vuelve`): el sol se pone, cambia
 * por la bola, que sube rodando a la cola mientras la línea se vuelve a extender. Así 1, 2, 1, 2
 * repite exactamente lo mismo.
 */

/** Lo que tarda la bola en bajar por la línea hasta la vertical del sol (base). */
export const DESCENSO_BOLA = 0.95;
/** Lo que tarda el sol en subir desde donde se paró la bola hasta su sitio (base). */
export const AMANECER = 0.8;
/** La parte 1 empieza a irse cuando la bola ya va rodando. */
const SALIDA_TRAS_DESCENSO = 0.3;
/** En la entrada de la parte 1, lo que sigue rodando la bola después de que el trazo terminó. */
const BOLA_TRAS_LINEA = 0.7;
/** La bola asoma de debajo de las burbujas creciendo desde esto hasta su tamaño. */
const APARECE_DESDE = 0.6;
/** Mobile: cuándo empieza a caer el sol, cuánto tarda y cuándo empieza a irse la parte 1. */
const CAIDA_INICIO = 0.1;
export const CAIDA_SOL = 0.6;
const SALIDA_TRAS_CAIDA = 0.45;
/**
 * Lo que tarda en aplastarse el sol de mobile al llegar, cuánto, y cómo recupera su forma. Era
 * 0,62 de alto con `back.out(2.5)`: se hundía 31 px y rebotaba 6 por encima; Johan lo vio
 * demasiado (D16). Ahora un aterrizaje corto: se aplasta poco y vuelve con un único rebote pequeño.
 */
const ATERRIZAR = 0.08;
const APLASTADA = { x: 1.08, y: 0.88 };
const RECUPERAR = 0.3;
const CURVA_RECUPERAR = 'back.out(1.2)';
/** Muestras de la línea para buscar dónde sale la bola, la cola y la vertical del sol. */
const MUESTRAS_LINEA = 400;
/** Una burbuja tapa a la bola si su centro cae dentro de la caja reducida a esto. */
const CAJA_BURBUJA_UTIL = 0.7;

const lienzoDe = (raiz: HTMLElement) =>
  (raiz.querySelector<HTMLElement>('[id^="intro-paso-"]') ?? raiz).getBoundingClientRect();

function dentro(x: number, y: number, r: DOMRect, k: number) {
  const mx = (r.width * (1 - k)) / 2;
  const my = (r.height * (1 - k)) / 2;
  return x > r.left + mx && x < r.right - mx && y > r.top + my && y < r.bottom - my;
}

/**
 * El disco del sol y el origen (en % de su caja interior) desde el que se aplasta. El sol de mobile
 * trae su espiral en el mismo lienzo: `data-disco` dice qué parte de la caja interior es el disco.
 */
function origenDelDisco(sol: HTMLElement) {
  const [fx, fy, fw, fh] = (sol.dataset.disco ?? '0 0 1 1').split(' ').map(Number);
  return `${(fx + fw / 2) * 100}% ${(fy + fh) * 100}%`;
}

interface Punto {
  l: number;
  x: number;
  y: number;
}

/** La línea amarilla de la parte 1 con su bola, medidas en pantalla con todo en reposo. */
interface LineaConBola {
  bola: HTMLElement;
  interior: HTMLElement;
  partes: PartesTrazo;
  L: number;
  punto: (l: number) => { x: number; y: number };
  muestras: Punto[];
  /** Último punto de la línea tapado por una burbuja: de ahí asoma la bola en la entrada. */
  lInicio: number;
  /** Donde descansa la bola: el punto de la línea más cercano a su centro en reposo. */
  lCola: number;
  /** Centro de la bola en reposo, en pantalla. */
  c0: { x: number; y: number };
  ancho: number;
  /** Grados que gira la bola por unidad de línea recorrida (rueda sin resbalar). */
  gradosPorUnidad: number;
}

/**
 * Mide la línea y la bola de la parte 1. Hay que llamarla antes de crear un solo tween: un
 * `fromTo` aplica su estado inicial en el acto (las burbujas a escala 0 no tapan nada).
 */
function lineaConBola(raiz: HTMLElement): LineaConBola | null {
  const bola = raiz.querySelector<HTMLElement>('[data-rol="bola"]');
  const interior = bola?.firstElementChild as HTMLElement | null;
  const linea = piezasDe(raiz, 'garabato').find(esTrazo);
  const partes = linea && partesTrazo(linea);
  if (!bola || !interior || !partes) return null;
  const ctm = partes.guia.getScreenCTM();
  if (!ctm) return null;
  const L = partes.guia.getTotalLength();
  const punto = (l: number) => {
    const q = partes.guia.getPointAtLength(Math.min(Math.max(l, 0), L));
    const p = new DOMPoint(q.x, q.y).matrixTransform(ctm);
    return { x: p.x, y: p.y };
  };
  const muestras = Array.from({ length: MUESTRAS_LINEA + 1 }, (_, i) => {
    const l = (L * i) / MUESTRAS_LINEA;
    return { l, ...punto(l) };
  });
  const burbujas = piezasDe(raiz, 'burbuja').map(b => b.getBoundingClientRect());
  const tapadas = muestras.filter(m => burbujas.some(r => dentro(m.x, m.y, r, CAJA_BURBUJA_UTIL)));
  const lInicio = tapadas.length ? tapadas[tapadas.length - 1].l : 0;

  const r = bola.getBoundingClientRect();
  const c0 = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  const d = (m: { x: number; y: number }) => Math.hypot(m.x - c0.x, m.y - c0.y);
  // El más cercano entre las muestras y, alrededor de él, con un paso diez veces más fino.
  let cola = muestras.reduce((a, m) => (d(m) < d(a) ? m : a));
  const paso = L / MUESTRAS_LINEA;
  for (let i = -10; i <= 10; i++) {
    const l = cola.l + (paso * i) / 10;
    const m = { l, ...punto(l) };
    if (d(m) < d(cola)) cola = m;
  }
  if (cola.l <= lInicio) return null;
  const radio = r.width / 2 || 1;
  return {
    bola,
    interior,
    partes,
    L,
    punto,
    muestras,
    lInicio,
    lCola: cola.l,
    c0,
    ancho: r.width,
    gradosPorUnidad: ((Math.hypot(ctm.a, ctm.b) / radio) * 180) / Math.PI,
  };
}

/**
 * El giro de la bola en cada punto de la línea entre la cola (giro 0, el del diseño) y `lOtro`.
 * Rueda sin resbalar, ajustado un poco para que en `lOtro` también lleve vueltas enteras: ahí
 * aparece o cambia por el sol, que tiene el dibujo derecho.
 */
function giroDesdeLaCola(g: LineaConBola, lOtro: number) {
  const total = (lOtro - g.lCola) * g.gradosPorUnidad;
  const vueltas = Math.max(1, Math.round(Math.abs(total) / 360));
  const k = total === 0 ? 0 : (vueltas * 360) / Math.abs(total);
  return (l: number) => (l - g.lCola) * g.gradosPorUnidad * k;
}

/** Deja ver solo el tramo de la línea entre `a` y `b` (fracciones de su largo). */
function mostrarTramo(p: PartesTrazo, a: number, b: number) {
  gsap.set(p.mascara, {
    strokeDasharray: `${Math.max(0, b - a) * LARGO_TRAZO} ${2 * LARGO_TRAZO}`,
    strokeDashoffset: -a * LARGO_TRAZO,
  });
}

/** Coloca la bola con su centro en `l` de la línea, con su escala y su giro. */
function ponerBola(g: LineaConBola, l: number, escala: number, giro: number) {
  const q = g.punto(l);
  gsap.set(g.bola, { x: q.x - g.c0.x, y: q.y - g.c0.y, scale: escala });
  gsap.set(g.interior, { rotation: giro });
}

/** Cómo encaja un relevo de las partes 1 y 2 con la salida y la entrada genéricas. */
interface Relevo12 {
  /** Piezas que el relevo anima: la salida y la entrada genéricas no las tocan. */
  piezas: Set<Element>;
  /** Cuándo empieza a irse la parte 1, cuándo llega el texto de la 2, sus piezas y su trazo. */
  salida: number;
  texto: number;
  entrada: number;
  trazo: number;
}

/**
 * Tablet y desktop: la bola baja por la línea hasta la vertical del sol de la parte 2 y amanece
 * como ese sol. Devuelve null si falta algo (mobile no tiene bola).
 */
function bolaAmanece(
  tl: gsap.core.Timeline,
  origen: HTMLElement,
  destino: HTMLElement
): Relevo12 | null {
  const g = lineaConBola(origen);
  const sol = destino.querySelector<HTMLElement>('[data-rol="sol"]');
  const linea = g && (g.partes.guia.closest('[data-rol]') as HTMLElement | null);
  if (!g || !sol || !linea) return null;
  // La caja exterior del sol: el reposo solo mueve la interior.
  const rSol = sol.getBoundingClientRect();
  const cSol = centro(rSol);

  // Hacia atrás desde la cola, el primer punto de la línea en la vertical del sol. Si la línea no
  // la cruza antes de meterse bajo las burbujas (tablet), el punto más bajo de ese tramo: la bola
  // siempre baja, y el sol amanece desde ahí con un poco de arco hacia su sitio.
  const atras = g.muestras.filter(m => m.l > g.lInicio && m.l < g.lCola).reverse();
  const lado = Math.sign(g.c0.x - cSol.x) || 1;
  let lCentro: number | null = null;
  let previo: Punto = { l: g.lCola, ...g.punto(g.lCola) };
  for (const m of atras) {
    if ((m.x - cSol.x) * lado <= 0) {
      const t = (previo.x - cSol.x) / (previo.x - m.x || 1);
      lCentro = previo.l + (m.l - previo.l) * t;
      break;
    }
    previo = m;
  }
  if (lCentro === null) {
    lCentro = atras.reduce((a, m) => (m.y > a.y ? m : a), { l: g.lCola, ...g.punto(g.lCola) }).l;
  }
  const abajo = g.punto(lCentro);
  const giro = giroDesdeLaCola(g, lCentro);

  // Un solo estado pinta la bola y el tramo de línea que queda: la bola en `l` y la línea, que se
  // recoge hacia ella desde su principio (`a`) y desde la cola (detrás de la bola).
  const e = { l: g.lCola, a: 0 };
  const pintar = () => {
    ponerBola(g, e.l, 1, giro(e.l));
    mostrarTramo(g.partes, e.a, e.l / g.L);
  };
  enmascarar(g.partes, 0);
  pintar();
  tl.to(
    e,
    { l: lCentro, a: lCentro / g.L, duration: DESCENSO_BOLA, ease: 'sine.inOut', onUpdate: pintar },
    0
  );

  // El relevo: el sol, invisible hasta ahora, ocupa la caja de la bola y amanece desde ahí.
  const relevo = DESCENSO_BOLA;
  gsap.set(sol, { opacity: 0 });
  tl.set(g.bola, { opacity: 0 }, relevo);
  tl.fromTo(
    sol,
    {
      x: abajo.x - cSol.x,
      y: abajo.y - cSol.y,
      scale: g.ancho / (rSol.width || 1),
      opacity: 1,
    },
    {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      duration: AMANECER,
      ease: 'sine.inOut',
      immediateRender: false,
    },
    relevo
  );
  return {
    piezas: new Set<Element>([g.bola, linea, sol]),
    salida: SALIDA_TRAS_DESCENSO,
    texto: relevo - 0.05,
    entrada: relevo + 0.05,
    // El espiral se escribe cuando el sol ya casi llegó.
    trazo: relevo + AMANECER - 0.2,
  };
}

/**
 * Mobile: el sol de la parte 2 cae desde arriba por detrás de las burbujas de la parte 1, que
 * siguen ahí mientras cae, y se aplasta un poco al llegar. La parte 1 va encima mientras dura.
 */
function solCae(
  tl: gsap.core.Timeline,
  origen: HTMLElement,
  destino: HTMLElement
): Relevo12 | null {
  const sol = destino.querySelector<HTMLElement>('[data-rol="sol"]');
  const interior = sol?.firstElementChild as HTMLElement | null;
  if (!sol || !interior) return null;
  const lienzo = lienzoDe(destino);
  const r = sol.getBoundingClientRect();
  // Por detrás de las burbujas: la parte que sale, encima de la que entra (un `set` fuera del
  // timeline, que el contexto de GSAP deshace).
  gsap.set(origen, { zIndex: 1 });
  tl.fromTo(
    sol,
    { y: -(r.bottom - lienzo.top + 2) },
    { y: 0, duration: CAIDA_SOL, ease: 'power2.in' },
    CAIDA_INICIO
  );
  const aterriza = CAIDA_INICIO + CAIDA_SOL;
  tl.fromTo(
    interior,
    { scaleX: 1, scaleY: 1, transformOrigin: origenDelDisco(sol) },
    {
      scaleX: APLASTADA.x,
      scaleY: APLASTADA.y,
      duration: ATERRIZAR,
      ease: 'power2.out',
      immediateRender: false,
    },
    aterriza
  );
  tl.to(
    interior,
    { scaleX: 1, scaleY: 1, duration: RECUPERAR, ease: CURVA_RECUPERAR },
    aterriza + ATERRIZAR
  );
  return {
    piezas: new Set<Element>([sol]),
    salida: SALIDA_TRAS_CAIDA,
    texto: aterriza + 0.2,
    entrada: aterriza + 0.3,
    trazo: aterriza + 0.15,
  };
}

/**
 * Qué hace la transición además de salir y entrar: el relevo de la bola o del sol de la parte 1 a
 * la 2, o el mismo al revés de la 2 a la 1.
 */
export type Relevo = 'bola' | 'bola-vuelve' | null;

/**
 * Transición entre dos partes montadas a la vez. `continuidad` activa el viaje del sol, el
 * barco y las olas (solo entre las partes 2 y 3); `relevo`, el de la bola y el sol entre las partes
 * 1 y 2 (D15). El timeline arranca pausado: lo reproduce quien lo pidió, para poder guardarlo antes
 * (saltar lo termina con `progress(1)`).
 */
export function crearTransicion(
  origen: HTMLElement,
  destino: HTMLElement,
  s: Sentido,
  continuidad: boolean,
  relevo: Relevo = null
): gsap.core.Timeline {
  if (relevo === 'bola-vuelve') {
    // La ida de la 1 a la 2, armada con las dos partes en reposo, llevada a su final y reproducida
    // hacia atrás. Va envuelta en un timeline que avanza, para que `progress(1)` siga siendo
    // "terminar" (deja la parte 1 en reposo) y `onComplete` se dispare como en las demás.
    const ida = crearTransicion(destino, origen, 1, false, 'bola');
    ida.progress(1);
    return gsap.timeline({ paused: true }).add(ida.tweenFromTo(ida.duration(), 0));
  }
  const tl = gsap.timeline({ paused: true });
  const r12 =
    relevo === 'bola' ? (bolaAmanece(tl, origen, destino) ?? solCae(tl, origen, destino)) : null;
  if (r12) {
    salir(tl, origen, s, [], r12.salida, r12.piezas);
    entrar(tl, destino, s, r12.texto, r12.entrada, [], {
      saltar: r12.piezas,
      inicioTrazo: r12.trazo,
    });
    return tl.timeScale(1 / ESCALA_TIEMPO);
  }
  // Si sale la persona, el barco espera a que termine de esconderse para empezar a viajar.
  const conPersona = !!origen.querySelector('[data-rol="persona"]');
  const viajaron = continuidad
    ? viajar(tl, origen, destino, conPersona ? VIAJE_TRAS_PERSONA : T.VIAJE)
    : [];
  salir(tl, origen, s, viajaron, 0);
  entrar(tl, destino, s, T.ENTRADA_TEXTO, T.ENTRADA_PIEZAS, viajaron);
  return tl.timeScale(1 / ESCALA_TIEMPO);
}

/*
 * Entrada de la parte 1, al cargar (desde el aviso o con la cookie ya puesta) y al volver desde
 * abajo (D10). Por pasos: primero el texto; luego las burbujas y las espirales, una a una y
 * rápido, desde el centro del racimo hacia fuera (los trazos negros sueltos llegan con la pieza
 * que les toca, sin sumar un paso); al final la línea amarilla se escribe y, en tablet y desktop,
 * la bola sale de debajo de las burbujas detrás de la punta del trazo y rueda hasta la cola (D15).
 */

/** Cadencia de la entrada una a una (base). */
export const UNO_A_UNO = 0.05;
/** La línea empieza a escribirse cuando la última burbuja ya casi aterrizó. */
const LINEA_TRAS_ULTIMA = 0.3;

/**
 * La bola de la entrada: asoma de debajo de las burbujas cuando la punta del trazo pasa por ahí y
 * rueda hasta la cola. Arranca con la velocidad que le deja el trazo, que termina rápido
 * (`power2.in`), y frena hasta quedar quieta (`power2.out`): el seguimiento del trazo. Nunca va por
 * delante de la punta: se mide contra ella en cada fotograma.
 */
function rodarHastaLaCola(
  tl: gsap.core.Timeline,
  g: LineaConBola,
  inicioLinea: number,
  duracion: number
) {
  // `power2.in`: la punta va por t² del largo.
  const asoma = inicioLinea + duracion * Math.sqrt(g.lInicio / g.L);
  const fin = inicioLinea + duracion + BOLA_TRAS_LINEA;
  const giro = giroDesdeLaCola(g, g.lInicio);
  const e = { l: g.lInicio, escala: APARECE_DESDE };
  const pintar = () => {
    const t = Math.min(Math.max((tl.time() - inicioLinea) / duracion, 0), 1);
    const l = Math.min(e.l, g.L * t * t);
    ponerBola(g, l, e.escala, giro(l));
  };
  gsap.set(g.bola, { opacity: 0 });
  tl.set(g.bola, { opacity: 1 }, asoma);
  tl.to(e, { escala: 1, duration: 0.2, ease: 'power1.out', onUpdate: pintar }, asoma);
  tl.to(e, { l: g.lCola, duration: fin - asoma, ease: 'power2.out', onUpdate: pintar }, asoma);
}

export function crearEntrada(raiz: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });
  // Antes de crear un solo tween: con las burbujas ya a escala 0 no se sabría de dónde sale.
  const g = lineaConBola(raiz);
  entrar(tl, raiz, 1, 0, ENTRADA_INICIAL_PIEZAS, ['burbuja', 'espiral', 'garabato']);
  const sueltas = piezasDe(raiz, 'garabato').filter(el => !esTrazo(el));
  const piezas = ordenarDesdeElCentro([
    ...piezasDe(raiz, 'burbuja'),
    ...piezasDe(raiz, 'espiral'),
    ...sueltas,
  ]);
  let paso = 0;
  piezas.forEach((el, i) => {
    const rol = el.dataset.rol as Rol;
    const t = ENTRADA_INICIAL_PIEZAS + paso * UNO_A_UNO;
    if (rol !== 'garabato') paso++;
    tl.fromTo(
      el,
      oculto(rol, 1, i, el),
      { ...neutro(rol), duration: DURACION[rol], ease: curvaDeEntrada(rol) },
      t
    );
  });
  const inicioLinea =
    ENTRADA_INICIAL_PIEZAS + Math.max(0, paso - 1) * UNO_A_UNO + LINEA_TRAS_ULTIMA;
  piezasDe(raiz, 'garabato')
    .filter(esTrazo)
    .forEach(el => dibujar(tl, el, inicioLinea, DIBUJO_LINEA_DURACION));
  if (g) rodarHastaLaCola(tl, g, inicioLinea, DIBUJO_LINEA_DURACION);
  return tl.timeScale(1 / ESCALA_TIEMPO);
}

/*
 * Movimiento en reposo (D5, D8): mientras se está en una parte, las piezas flotan. Sutil, pero
 * que se vea que se mueve. Va sobre elementos que las transiciones no animan (la caja interior de
 * cada pieza, o el envoltorio del grupo del barco), para que las transformaciones no se pisen.
 * Solo transform y opacity.
 *
 * Las amplitudes están en px del lienzo mobile y se escalan con el alto real de la parte respecto
 * a ese lienzo: así no se ven enormes en móvil ni diminutas a 1920. Las duraciones, en segundos
 * reales (no pasan por ESCALA_TIEMPO).
 */
interface NivelDeReposo {
  BURBUJA_Y: number;
  BURBUJA_S: readonly [number, number];
  BARCO_Y: number;
  /** Grados. */
  BARCO_ROTACION: number;
  BARCO_Y_S: number;
  BARCO_ROTACION_S: number;
  OLA_X: number;
  OLA_S: readonly [number, number];
  NUBE_X: number;
  NUBE_S: number;
  /** El reflejo del sol respira entre su opacidad y esta. */
  REFLEJO_OPACIDAD: number;
  REFLEJO_S: number;
  /** El sol respira en escala alrededor de su centro, entre 1 y esta. */
  SOL_ESCALA: number;
  SOL_S: number;
  /**
   * Los garabatos pequeños (espirales, trazos sueltos) se balancean sobre su centro: el giro que
   * mueve su punta más lejana estos px, sin pasar de `GARABATO_GIRO_MAX` grados.
   */
  GARABATO_PX: number;
  GARABATO_GIRO_MAX: number;
  GARABATO_S: readonly [number, number];
}

/**
 * Dos niveles para decidir mirando (`?reposo=medio|alto`, regla 12 de docs/PATTERNS.md). Sin
 * parámetro, `medio`. Cuando Johan elija, se borra el otro y se deja una sola tabla.
 */
const NIVELES_REPOSO = {
  medio: {
    BURBUJA_Y: 5,
    BURBUJA_S: [2.8, 4.2],
    BARCO_Y: 6,
    BARCO_ROTACION: 2.8,
    BARCO_Y_S: 3.6,
    BARCO_ROTACION_S: 4.4,
    OLA_X: 7,
    OLA_S: [2.8, 4.2],
    NUBE_X: 6,
    NUBE_S: 5.5,
    REFLEJO_OPACIDAD: 0.65,
    REFLEJO_S: 3.4,
    SOL_ESCALA: 1.04,
    SOL_S: 4,
    GARABATO_PX: 4,
    GARABATO_GIRO_MAX: 7,
    GARABATO_S: [3, 4.5],
  },
  alto: {
    BURBUJA_Y: 7,
    BURBUJA_S: [2.5, 3.8],
    BARCO_Y: 8.5,
    BARCO_ROTACION: 4,
    BARCO_Y_S: 3.2,
    BARCO_ROTACION_S: 4,
    OLA_X: 10,
    OLA_S: [2.5, 3.8],
    NUBE_X: 9,
    NUBE_S: 5,
    REFLEJO_OPACIDAD: 0.55,
    REFLEJO_S: 3,
    SOL_ESCALA: 1.065,
    SOL_S: 3.5,
    GARABATO_PX: 6,
    GARABATO_GIRO_MAX: 10,
    GARABATO_S: [2.6, 4],
  },
} as const satisfies Record<string, NivelDeReposo>;

export type NivelReposo = keyof typeof NIVELES_REPOSO;
export const NIVEL_REPOSO_POR_DEFECTO: NivelReposo = 'medio';

/** Lee `?reposo=medio|alto`; cualquier otro valor, o ninguno, es el nivel por defecto. */
export function nivelReposoDe(valor: string | null): NivelReposo {
  return valor === 'alto' || valor === 'medio' ? valor : NIVEL_REPOSO_POR_DEFECTO;
}

/**
 * Una vuelta entera de una espiral negra en reposo, en segundos reales. Era 24 (D10); Johan pidió
 * al menos 1,5 veces más rápido (D15): 14 s es 1,71 veces.
 */
const ESPIRAL_VUELTA_S = 14;
/** Lo que tarda una espiral en volver a su giro de diseño al detenerse. */
const ESPIRAL_VUELTA_FINAL_S = 0.6;

/** Lo que tarda en volver a su sitio cuando empieza una transición. Igual en los dos niveles. */
const VUELTA_S = 0.35;
/** Lo que una pieza que el lienzo corta deja de margen entre su extremo y el borde, en px. */
const MARGEN_BORDE = 1;

/** Azar fijo por índice, para que cada pieza tenga su fase y su duración y sea reproducible. */
const azar = (i: number) => (((Math.sin(i * 12.9898 + 4.1) * 43758.5453) % 1) + 1) % 1;
const entre = ([a, b]: readonly number[], t: number) => a + (b - a) * t;

/**
 * Oscila una propiedad alrededor de `centro` (0 por defecto; 1 para la escala) con amplitud
 * `amp`. El primer medio ciclo sale del valor neutro con la misma curva, así el movimiento arranca
 * sin salto; luego va de un extremo al otro sin fin.
 */
export function oscilar(
  el: HTMLElement,
  prop: 'x' | 'y' | 'rotation' | 'scale',
  amp: number,
  dur: number,
  fase: number,
  centro = prop === 'scale' ? 1 : 0
) {
  return gsap
    .timeline({ delay: fase * dur })
    .to(el, { [prop]: centro + amp, duration: dur / 2, ease: 'sine.inOut' })
    .to(el, { [prop]: centro - amp, duration: dur, ease: 'sine.inOut', repeat: -1, yoyo: true });
}

/**
 * Rango de deriva en `x` que no deja ver el extremo de una pieza que el lienzo corta (una ola que
 * sale por un lado, la nube que se asoma por la izquierda). Conserva el recorrido total: si un
 * lado no tiene holgura, la pieza deriva hacia el otro. Devuelve centro y amplitud para `oscilar`.
 */
function derivaSegura(pieza: HTMLElement, lienzo: DOMRect, amp: number) {
  const r = (pieza.querySelector('img') ?? pieza).getBoundingClientRect();
  const sobraIzq = lienzo.left - r.left;
  const sobraDer = r.right - lienzo.right;
  let hi = amp;
  let lo = -amp;
  if (sobraIzq > 0) {
    hi = Math.min(hi, Math.max(0, sobraIzq - MARGEN_BORDE));
    lo = hi - 2 * amp;
  }
  if (sobraDer > 0) {
    lo = Math.max(lo, -Math.max(0, sobraDer - MARGEN_BORDE));
    if (sobraIzq <= 0) hi = lo + 2 * amp;
  }
  return { centro: (hi + lo) / 2, amp: (hi - lo) / 2 };
}

export interface Reposo {
  pausar: () => void;
  reanudar: () => void;
  /** Para y devuelve todo a su valor neutro, suave. */
  detener: () => void;
}

export function crearReposo(
  raiz: HTMLElement,
  nivel: NivelReposo = NIVEL_REPOSO_POR_DEFECTO
): Reposo {
  const R: NivelDeReposo = NIVELES_REPOSO[nivel];
  const paso = raiz.querySelector<HTMLElement>('[id^="intro-paso-"]');
  const lienzo = (paso ?? raiz).getBoundingClientRect();
  const k = (paso?.offsetHeight ?? CANVAS.height) / CANVAS.height;
  const tls: gsap.core.Timeline[] = [];
  const tocados: HTMLElement[] = [];
  const conOpacidad: HTMLElement[] = [];
  const interior = (el: HTMLElement) => el.firstElementChild as HTMLElement | null;
  const mover = (el: HTMLElement | null, fn: (el: HTMLElement) => gsap.core.Timeline) => {
    if (!el) return;
    tocados.push(el);
    tls.push(fn(el));
  };
  /** Una pieza que el lienzo corta por algún lado (el garabato de fondo): no se balancea. */
  const cortada = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return r.left < lienzo.left || r.right > lienzo.right;
  };

  piezasDe(raiz, 'burbuja').forEach((el, i) =>
    mover(interior(el), e =>
      oscilar(e, 'y', R.BURBUJA_Y * k, entre(R.BURBUJA_S, azar(i)), azar(i + 7))
    )
  );
  [...piezasDe(raiz, 'ola'), ...piezasDe(raiz, 'agua')].forEach((el, i) => {
    const { centro, amp } = derivaSegura(el, lienzo, R.OLA_X * k);
    mover(interior(el), e =>
      oscilar(e, 'x', amp, entre(R.OLA_S, azar(i + 20)), azar(i + 31), centro)
    );
  });
  piezasDe(raiz, 'nube').forEach((el, i) => {
    const { centro, amp } = derivaSegura(el, lienzo, R.NUBE_X * k);
    mover(interior(el), e => oscilar(e, 'x', amp, R.NUBE_S, azar(i + 40), centro));
  });
  piezasDe(raiz, 'sol').forEach((el, i) =>
    mover(interior(el), e =>
      oscilar(e, 'scale', (R.SOL_ESCALA - 1) / 2, R.SOL_S, azar(i + 50), 1 + (R.SOL_ESCALA - 1) / 2)
    )
  );
  // Las cintas amarillas (los trazos que se escriben) se quedan quietas una vez dibujadas (D12):
  // solo se balancean los garabatos negros sueltos.
  piezasDe(raiz, 'garabato')
    .filter(el => !cortada(el) && !esTrazo(el))
    .forEach((el, i) => {
      const radio = Math.max(el.offsetWidth, el.offsetHeight) / 2;
      const giro = Math.min(
        R.GARABATO_GIRO_MAX,
        (Math.atan((R.GARABATO_PX * k) / Math.max(radio, 1)) * 180) / Math.PI
      );
      mover(interior(el), e =>
        oscilar(e, 'rotation', giro, entre(R.GARABATO_S, azar(i + 60)), azar(i + 70))
      );
    });
  // Las espirales negras de la parte 1 giran despacio sobre sí mismas, sin fin (D10). Van aparte de
  // `tocados`: al detenerse no se desenroscan de golpe, terminan la vuelta que llevan.
  const espirales: HTMLElement[] = [];
  // La espiral quieta (Vector 1282, D16) no gira: Johan la quiere fija, distinta de las demás.
  piezasDe(raiz, 'espiral')
    .filter(el => !esQuieta(el))
    .forEach((el, i) => {
      const e = interior(el);
      if (!e) return;
      espirales.push(e);
      const sentido = i % 2 === 0 ? 1 : -1;
      tls.push(
        gsap.timeline().to(e, {
          rotation: `+=${360 * sentido}`,
          duration: ESPIRAL_VUELTA_S,
          ease: 'none',
          repeat: -1,
        })
      );
    });
  piezasDe(raiz, 'reflejo').forEach(el =>
    mover(interior(el), e => {
      conOpacidad.push(e);
      return gsap.timeline().to(e, {
        opacity: R.REFLEJO_OPACIDAD,
        duration: R.REFLEJO_S,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    })
  );
  // El barco se mece con todo su grupo: en la parte 3 la persona va dentro, así que se mueve con
  // él y nunca se desincroniza. El giro es alrededor del centro del barco.
  piezasDe(raiz, 'barco').forEach(barco => {
    const grupo = barco.closest<HTMLElement>('[data-grupo]');
    if (!grupo) return;
    gsap.set(grupo, {
      transformOrigin: `${barco.offsetLeft + barco.offsetWidth / 2}px ${barco.offsetTop + barco.offsetHeight / 2}px`,
    });
    mover(grupo, e => oscilar(e, 'y', R.BARCO_Y * k, R.BARCO_Y_S, 0));
    tls.push(oscilar(grupo, 'rotation', R.BARCO_ROTACION, R.BARCO_ROTACION_S, 0.3));
  });

  return {
    pausar: () => tls.forEach(t => t.pause()),
    reanudar: () => tls.forEach(t => t.resume()),
    detener: () => {
      tls.forEach(t => t.kill());
      espirales.forEach(e => {
        // Termina la vuelta que lleva por el camino corto, sin prisa, y queda en su sitio.
        const giro = Number(gsap.getProperty(e, 'rotation')) % 360;
        gsap.set(e, { rotation: giro });
        gsap.to(e, {
          rotation: Math.abs(giro) > 180 ? 360 * Math.sign(giro) : 0,
          duration: ESPIRAL_VUELTA_FINAL_S,
          ease: 'sine.out',
          overwrite: 'auto',
          onComplete: () => {
            gsap.set(e, { clearProps: 'transform' });
          },
        });
      });
      if (tocados.length === 0) return;
      // La opacidad solo vuelve donde se tocó (el reflejo): en las demás cajas no se escribe.
      if (conOpacidad.length) {
        gsap.to(conOpacidad, {
          opacity: 1,
          duration: VUELTA_S,
          ease: 'sine.out',
          overwrite: 'auto',
          onComplete: () => {
            gsap.set(conOpacidad, { clearProps: 'opacity' });
          },
        });
      }
      gsap.to(tocados, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: VUELTA_S,
        ease: 'sine.out',
        overwrite: 'auto',
        onComplete: () => {
          gsap.set(tocados, { clearProps: 'transform,transformOrigin' });
        },
      });
    },
  };
}
