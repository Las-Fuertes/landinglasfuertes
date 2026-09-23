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
  barco: 0,
  garabato: 0.05,
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
  barco: 0.65,
  garabato: 0.5,
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
  barco: 0,
  garabato: 0.02,
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
function oculto(rol: Rol, s: Sentido, i: number): gsap.TweenVars {
  switch (rol) {
    case 'burbuja':
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
  'sol',
  'nube',
  'agua',
  'reflejo',
  'ola',
  'barco',
  'persona',
  'texto',
];

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
  return rol === 'burbuja' ? ordenarDesdeElCentro(piezas) : piezas;
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

/**
 * Añade al timeline la entrada de todas las piezas de `raiz`, excepto las de `excluir`. El texto
 * arranca en `inicioTexto` y el resto de piezas en `inicioPiezas`.
 */
function entrar(
  tl: gsap.core.Timeline,
  raiz: HTMLElement,
  s: Sentido,
  inicioTexto: number,
  inicioPiezas: number,
  excluir: Rol[] = []
) {
  ROLES.filter(r => !excluir.includes(r)).forEach(rol => {
    const piezas = ordenar(rol, piezasDe(raiz, rol));
    const t = rol === 'texto' ? inicioTexto : inicioPiezas + DESFASE[rol];
    piezas.forEach((el, i) => {
      const ti = t + i * ESCALON[rol];
      if (rol === 'persona') {
        // Escondida toda la transición: se asoma después, con `crearAsomo`.
        esconderYa(el);
        return;
      }
      const ease =
        rol === 'burbuja' ? 'back.out(1.6)' : rol === 'horizonte' ? 'power1.inOut' : 'power3.out';
      const fin = neutro(rol);
      // La rotación del barco la lleva su propio tween de cabeceo, más abajo.
      if (rol === 'barco') delete fin.rotation;
      tl.fromTo(el, oculto(rol, s, i), { ...fin, duration: DURACION[rol], ease }, ti);
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

/** Añade al timeline la salida de todas las piezas de `raiz`, excepto las de `excluir`. */
export function salir(tl: gsap.core.Timeline, raiz: HTMLElement, s: Sentido, excluir: Rol[] = []) {
  const opuesto = -s as Sentido;
  ROLES.filter(r => !excluir.includes(r)).forEach(rol => {
    // Las burbujas salen de fuera hacia dentro: el orden de entrada, al revés.
    const piezas = ordenar(rol, piezasDe(raiz, rol)).reverse();
    const esTexto = rol === 'texto';
    const t = esTexto ? T.SALIDA_TEXTO : T.SALIDA_PIEZAS;
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
          ...oculto(rol, opuesto, i),
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
export function cajaDe(piezas: HTMLElement[]) {
  const rs = piezas.map(p => p.getBoundingClientRect());
  const left = Math.min(...rs.map(r => r.left));
  const top = Math.min(...rs.map(r => r.top));
  const right = Math.max(...rs.map(r => r.right));
  const bottom = Math.max(...rs.map(r => r.bottom));
  return { left, top, width: right - left, height: bottom - top };
}

type Caja = ReturnType<typeof cajaDe>;

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
    const cajaVieja = cajaDe(viejas);
    const cajaNueva = cajaDe(nuevas);
    // Se mide todo antes de crear un solo tween: `fromTo` aplica su estado inicial en el acto.
    const idas = viejas.map(el => mapear(el, cajaVieja, cajaNueva));
    const vueltas = nuevas.map(el => mapear(el, cajaNueva, cajaVieja));
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
  // La caja interior del barco (el aplastamiento del relevo) solo lleva transform. Con una lista
  // vacía GSAP avisa en consola, por eso se mira antes.
  const interiores = raiz.querySelectorAll('[data-rol="barco"] > *');
  if (interiores.length) gsap.set(interiores, { clearProps: 'transform,transformOrigin' });
}

/**
 * Transición entre dos partes montadas a la vez. `continuidad` activa el viaje del sol, el
 * barco y las olas (solo entre las partes 2 y 3). El timeline arranca pausado: lo reproduce
 * quien lo pidió, para poder guardarlo antes (saltar lo termina con `progress(1)`).
 */
export function crearTransicion(
  origen: HTMLElement,
  destino: HTMLElement,
  s: Sentido,
  continuidad: boolean
): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });
  // Si sale la persona, el barco espera a que termine de esconderse para empezar a viajar.
  const conPersona = !!origen.querySelector('[data-rol="persona"]');
  const viajaron = continuidad
    ? viajar(tl, origen, destino, conPersona ? VIAJE_TRAS_PERSONA : T.VIAJE)
    : [];
  salir(tl, origen, s, viajaron);
  entrar(tl, destino, s, T.ENTRADA_TEXTO, T.ENTRADA_PIEZAS, viajaron);
  return tl.timeScale(1 / ESCALA_TIEMPO);
}

/** Entrada de la parte 1 (al cargar y al volver desde abajo): el texto primero, luego las piezas. */
export function crearEntrada(raiz: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });
  entrar(tl, raiz, 1, 0, ENTRADA_INICIAL_PIEZAS);
  return tl.timeScale(1 / ESCALA_TIEMPO);
}

/*
 * Movimiento en reposo (D5): mientras se está en una parte, algo flota muy sutilmente. Va sobre
 * elementos que las transiciones no animan (la caja interior de cada pieza, o el envoltorio del
 * grupo del barco), para que las transformaciones no se pisen. Solo transform y opacity.
 *
 * Las amplitudes están en px del lienzo mobile y se escalan con el alto real de la parte respecto
 * a ese lienzo: así no se ven enormes en móvil ni diminutas a 1920. Las duraciones, en segundos
 * reales (no pasan por ESCALA_TIEMPO).
 */
const REPOSO = {
  BURBUJA_Y: 2.5,
  BURBUJA_S: [3, 5],
  BARCO_Y: 2.5,
  BARCO_ROTACION: 1.2,
  BARCO_Y_S: 5,
  BARCO_ROTACION_S: 4.2,
  OLA_X: 3,
  OLA_S: [3.5, 5.5],
  NUBE_X: 2.5,
  NUBE_S: 8,
  /** El reflejo del sol respira entre su opacidad y esta. */
  REFLEJO_OPACIDAD: 0.85,
  REFLEJO_S: 4.5,
  /** Lo que tarda en volver a su sitio cuando empieza una transición. */
  VUELTA_S: 0.35,
} as const;

/** Azar fijo por índice, para que cada pieza tenga su fase y su duración y sea reproducible. */
const azar = (i: number) => (((Math.sin(i * 12.9898 + 4.1) * 43758.5453) % 1) + 1) % 1;
const entre = ([a, b]: readonly number[], t: number) => a + (b - a) * t;

/**
 * Oscila una propiedad alrededor de 0. El primer medio ciclo sale de 0 con la misma curva, así
 * el movimiento arranca sin salto; luego va de +amp a -amp sin fin.
 */
export function oscilar(
  el: HTMLElement,
  prop: 'x' | 'y' | 'rotation',
  amp: number,
  dur: number,
  fase: number
) {
  return gsap
    .timeline({ delay: fase * dur })
    .to(el, { [prop]: amp, duration: dur / 2, ease: 'sine.inOut' })
    .to(el, { [prop]: -amp, duration: dur, ease: 'sine.inOut', repeat: -1, yoyo: true });
}

export interface Reposo {
  pausar: () => void;
  reanudar: () => void;
  /** Para y devuelve todo a su valor neutro, suave. */
  detener: () => void;
}

export function crearReposo(raiz: HTMLElement): Reposo {
  const paso = raiz.querySelector<HTMLElement>('[id^="intro-paso-"]');
  const k = (paso?.offsetHeight ?? CANVAS.height) / CANVAS.height;
  const tls: gsap.core.Timeline[] = [];
  const tocados: HTMLElement[] = [];
  const interior = (el: HTMLElement) => el.firstElementChild as HTMLElement | null;
  const mover = (el: HTMLElement | null, fn: (el: HTMLElement) => gsap.core.Timeline) => {
    if (!el) return;
    tocados.push(el);
    tls.push(fn(el));
  };

  piezasDe(raiz, 'burbuja').forEach((el, i) =>
    mover(interior(el), e =>
      oscilar(e, 'y', REPOSO.BURBUJA_Y * k, entre(REPOSO.BURBUJA_S, azar(i)), azar(i + 7))
    )
  );
  [...piezasDe(raiz, 'ola'), ...piezasDe(raiz, 'agua')].forEach((el, i) =>
    mover(interior(el), e =>
      oscilar(e, 'x', REPOSO.OLA_X * k, entre(REPOSO.OLA_S, azar(i + 20)), azar(i + 31))
    )
  );
  piezasDe(raiz, 'nube').forEach((el, i) =>
    mover(interior(el), e => oscilar(e, 'x', REPOSO.NUBE_X * k, REPOSO.NUBE_S, azar(i + 40)))
  );
  piezasDe(raiz, 'reflejo').forEach(el =>
    mover(interior(el), e =>
      gsap.timeline().to(e, {
        opacity: REPOSO.REFLEJO_OPACIDAD,
        duration: REPOSO.REFLEJO_S,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    )
  );
  // El barco se mece con todo su grupo: en la parte 3 la persona va dentro, así que se mueve con
  // él y nunca se desincroniza. El giro es alrededor del centro del barco.
  piezasDe(raiz, 'barco').forEach(barco => {
    const grupo = barco.closest<HTMLElement>('[data-grupo]');
    if (!grupo) return;
    gsap.set(grupo, {
      transformOrigin: `${barco.offsetLeft + barco.offsetWidth / 2}px ${barco.offsetTop + barco.offsetHeight / 2}px`,
    });
    mover(grupo, e => oscilar(e, 'y', REPOSO.BARCO_Y * k, REPOSO.BARCO_Y_S, 0));
    tls.push(oscilar(grupo, 'rotation', REPOSO.BARCO_ROTACION, REPOSO.BARCO_ROTACION_S, 0.3));
  });

  return {
    pausar: () => tls.forEach(t => t.pause()),
    reanudar: () => tls.forEach(t => t.resume()),
    detener: () => {
      tls.forEach(t => t.kill());
      if (tocados.length === 0) return;
      gsap.to(tocados, {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        duration: REPOSO.VUELTA_S,
        ease: 'sine.out',
        overwrite: true,
        onComplete: () => {
          gsap.set(tocados, { clearProps: 'transform,transformOrigin,opacity' });
        },
      });
    },
  };
}
