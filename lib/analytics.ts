import { sendGAEvent } from '@next/third-parties/google';
import type { Mixpanel } from 'mixpanel-browser';

/**
 * Medición del sitio: un solo `track()` que manda cada evento a Mixpanel y, cuando el evento ya
 * existía en Google Analytics, también a GA con su nombre y propiedades viejos, para no romper el
 * histórico (docs/mixpanel/DECISIONES.md, D1 y D4). El plan de eventos, con sus propiedades, está
 * en docs/mixpanel/tracking-plan.json.
 *
 * Mixpanel solo se carga y envía en producción (`NEXT_PUBLIC_VERCEL_ENV === 'production'`, que
 * Vercel pone solo). En local y en previews no se carga el SDK ni sale ninguna petición: `track`
 * escribe `console.debug('[analytics]', evento, props)` para poder verificar.
 */

/** Token público del proyecto de Mixpanel (va en el cliente, como el id de GA). Región EE. UU. */
const MIXPANEL_TOKEN = 'a2f6a1d6485fa4bcc7aa30d3e5c40603';

export const MIXPANEL_ACTIVO = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

/**
 * Lo que la grabación de sesiones nunca guarda (D2): toda imagen, video, canvas, las `<image>`
 * dentro de un SVG y cualquier elemento marcado a mano con `data-mp-bloquear` (por ejemplo una
 * foto puesta como imagen de fondo). En el replay quedan como cajas vacías del mismo tamaño.
 */
const BLOQUEO_REPLAY = 'img, picture, video, audio, canvas, svg image, [data-mp-bloquear]';

/**
 * Propiedad persistida por el propio Mixpanel (su cookie `mp_<token>_mixpanel`) con el último
 * resultado de donación ya reportado: `<clave>@<marca de tiempo>`. Va en `property_blacklist`,
 * así se guarda pero nunca viaja en los eventos (docs/mixpanel/DECISIONES.md, D4, ampliación).
 */
const PROP_RESULTADO = 'lf_resultado_medido';

export type EventoAnalytics =
  | 'child_protection_notice_accepted'
  | 'intro_skipped'
  | 'section_viewed'
  | 'map_route_opened'
  | 'sumate_opened'
  | 'sumate_help_type_selected'
  | 'donation_frequency_selected'
  | 'donation_amount_chosen'
  | 'payment_flow_started'
  | 'payment_flow_failed'
  | 'donation_result_viewed'
  | 'transfer_details_viewed'
  | 'us_donation_clicked'
  | 'whatsapp_click'
  | 'social_click'
  | 'thank_you_shared'
  | 'sumate_closed';

export type PropsAnalytics = Record<string, string | number | boolean>;

/** El evento equivalente en GA, con su nombre y propiedades de siempre. */
export interface GaLegacy {
  nombre: string;
  props?: Record<string, string | number>;
}

export interface OpcionesTrack {
  /**
   * El clic saca a la persona del sitio (WhatsApp, Bold, Mercado Pago, Give Lively): el evento
   * sale en el acto por `sendBeacon`, sin esperar al lote, para no perderse al navegar.
   */
  saliente?: boolean;
}

export type ClaseDispositivo = 'mobile' | 'tablet' | 'desktop';

/** Mismos cortes que Tailwind: md (768) y lg (1024). */
export const claseDispositivo = (ancho: number): ClaseDispositivo =>
  ancho >= 1024 ? 'desktop' : ancho >= 768 ? 'tablet' : 'mobile';

let mixpanel: Mixpanel | null = null;
let iniciado = false;
/** Lo que se pide antes de que el SDK termine de cargar: se envía en orden al cargar. */
let pendientes: Array<(mp: Mixpanel) => void> = [];
let superProps: PropsAnalytics = {};

function conMixpanel(accion: (mp: Mixpanel) => void) {
  if (!MIXPANEL_ACTIVO) return;
  if (mixpanel) accion(mixpanel);
  else pendientes.push(accion);
}

/**
 * Carga e inicia Mixpanel una sola vez por carga de página (el guardia de módulo aguanta el
 * doble montaje de StrictMode). Se llama desde pages/_app.tsx, en cliente.
 */
export function initAnalytics() {
  if (iniciado || typeof window === 'undefined') return;
  iniciado = true;
  if (!MIXPANEL_ACTIVO) return;

  import('mixpanel-browser')
    .then(({ default: mp }) => {
      mp.init(MIXPANEL_TOKEN, {
        autocapture: false,
        track_pageview: 'url-with-path',
        // Session Replay (D2): todas las sesiones, sin imágenes, con los campos enmascarados.
        record_sessions_percent: 100,
        record_block_selector: BLOQUEO_REPLAY,
        record_canvas: false,
        record_mask_all_inputs: true,
        // El texto de la página es el copy público del sitio: se deja ver para que el replay
        // sirva. Los campos (inputs) siguen enmascarados.
        record_mask_all_text: false,
        property_blacklist: [PROP_RESULTADO],
      });
      mp.register(superProps);
      mixpanel = mp;
      const cola = pendientes;
      pendientes = [];
      cola.forEach(accion => accion(mp));
    })
    .catch(() => undefined);
}

/** Súper propiedades (`language`, `device_class`): van solas en cada evento de Mixpanel. */
export function registrarSuperPropiedades(props: PropsAnalytics) {
  const cambia = Object.keys(props).some(clave => superProps[clave] !== props[clave]);
  if (!cambia) return;
  superProps = { ...superProps, ...props };
  if (!MIXPANEL_ACTIVO) {
    // eslint-disable-next-line no-console -- verificación en local (docs/mixpanel, D4)
    console.debug('[analytics] super', props);
    return;
  }
  conMixpanel(mp => mp.register(props));
}

/**
 * Registra un evento. `gaLegacy` solo cuando el evento ya existía en GA (tabla "Nombre en GA" de
 * docs/mixpanel/PLAN-DE-EVENTOS.md); los eventos nuevos no van a GA.
 */
export function track(
  evento: EventoAnalytics,
  props: PropsAnalytics = {},
  gaLegacy?: GaLegacy,
  opciones: OpcionesTrack = {}
) {
  if (typeof window === 'undefined') return;

  if (gaLegacy) sendGAEvent('event', gaLegacy.nombre, gaLegacy.props ?? {});

  if (!MIXPANEL_ACTIVO) {
    // eslint-disable-next-line no-console -- verificación en local (docs/mixpanel, D4)
    console.debug('[analytics]', evento, props);
    return;
  }
  conMixpanel(mp => {
    if (opciones.saliente)
      mp.track(evento, props, { transport: 'sendBeacon', send_immediately: true });
    else mp.track(evento, props);
  });
}

/** true si `guardado` (`<clave>@<marca>`) ya cubre esta clave, dentro de la ventana si la hay. */
export function yaReportado(guardado: unknown, clave: string, ahora: number, ventanaMs?: number) {
  const previo = typeof guardado === 'string' ? guardado : '';
  const corte = previo.lastIndexOf('@');
  if (corte < 0 || previo.slice(0, corte) !== clave) return false;
  const cuando = Number(previo.slice(corte + 1)) || 0;
  return ventanaMs === undefined || ahora - cuando < ventanaMs;
}

/** Claves ya reportadas en esta carga: basta en local, donde no hay SDK que persista nada. */
const reportadasEnCarga = new Set<string>();

/**
 * Como `track`, pero sin repetir el evento para la misma `clave`: una recarga de /gracias no
 * vuelve a contar el mismo pago. En producción la última clave reportada se guarda en la
 * persistencia de Mixpanel (sin almacenamiento propio); con `ventanaMs`, la misma clave solo se
 * descarta dentro de esa ventana (la vuelta de una suscripción cuenta una vez por visita).
 */
export function trackSinRepetir(
  evento: EventoAnalytics,
  props: PropsAnalytics,
  clave: string,
  ventanaMs?: number
) {
  if (typeof window === 'undefined' || reportadasEnCarga.has(clave)) return;
  reportadasEnCarga.add(clave);
  if (!MIXPANEL_ACTIVO) {
    track(evento, props);
    return;
  }
  conMixpanel(mp => {
    const ahora = Date.now();
    if (yaReportado(mp.get_property(PROP_RESULTADO), clave, ahora, ventanaMs)) return;
    mp.register({ [PROP_RESULTADO]: `${clave}@${ahora}` });
    mp.track(evento, props);
  });
}
