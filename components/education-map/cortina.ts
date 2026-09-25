import { CURVA, cssCurva, PASO } from './coreografia';

const esperar = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/** Espera a que termine una animación sin romper si se cancela. */
const terminada = (anim: Animation) =>
  anim.finished.then(
    () => undefined,
    () => undefined
  );

/**
 * Mientras la cortina está puesta, `<html>` lleva `data-cortina-puesta` y al ponerla y al quitarla
 * se emite este evento en `window`. Impacto lo escucha para no empezar su entrada debajo de la
 * cortina (docs/impacto/DECISIONES.md, D2): la entrada arranca cuando la cortina ya se fue.
 */
export const EVENTO_CORTINA = 'cortina-mapa';

const marcarCortina = (puesta: boolean) => {
  if (puesta) document.documentElement.dataset.cortinaPuesta = '';
  else delete document.documentElement.dataset.cortinaPuesta;
  window.dispatchEvent(new Event(EVENTO_CORTINA));
};

/**
 * Paso a una sección lejana con cortina (D9). Recorrer a la vista los ~1300 px que separan la
 * última parada de Impacto marea y cuesta en un celular; en su lugar, un telón: una capa del
 * beige de la página aparece con un fundido sobre el mapa, la página salta debajo (`saltar`) y
 * el telón se desvanece descubriendo Impacto. Nada se desplaza. La entrada de Impacto arranca
 * `PASO.cortinaSolape` ms antes de que el telón termine de irse (ver `EVENTO_CORTINA`).
 *
 * Solo anima `opacity` de una capa plana, con la Web Animations API: corre en el compositor y
 * no pinta nada más que un color. Si se interrumpe, `finally` quita la capa y la marca.
 */
export async function pasarConCortina(saltar: () => void) {
  const cortina = document.createElement('div');
  cortina.setAttribute('aria-hidden', 'true');
  cortina.dataset.cortinaMapa = '';
  cortina.className = 'pointer-events-none fixed inset-0 z-[120] bg-beige';
  cortina.style.opacity = '0';
  document.body.appendChild(cortina);
  marcarCortina(true);

  try {
    await terminada(
      cortina.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: PASO.cortinaAparece,
        easing: cssCurva(CURVA.viaje),
        fill: 'forwards',
      })
    );
    saltar();
    await esperar(PASO.cortinaPausa);
    const abre = cortina.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: PASO.cortinaSeVa,
      easing: cssCurva(CURVA.viaje),
      fill: 'forwards',
    });
    // La sección empieza su entrada con el telón ya casi transparente.
    const aviso = setTimeout(() => marcarCortina(false), PASO.cortinaSeVa - PASO.cortinaSolape);
    await terminada(abre);
    clearTimeout(aviso);
  } finally {
    cortina.remove();
    marcarCortina(false);
  }
}
