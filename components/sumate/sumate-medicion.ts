import { track, type GaLegacy, type OpcionesTrack, type PropsAnalytics } from '../../lib/analytics';
import type { SumateOrigen } from './sumate-drawer-context';

/**
 * Medición del drawer de Súmate (docs/mixpanel/DECISIONES.md, D4). Guarda lo que pasa en cada
 * apertura para poder decir, al cerrar, si hubo pago y cuál fue la última forma de ayudar elegida
 * (`sumate_closed`), y para contar la transferencia una sola vez por apertura.
 */

export type FormaAyuda = 'dinero' | 'cosas' | 'tiempo';

const ENTRY_SOURCE: Record<SumateOrigen, string> = {
  tripulantes: 'donations_button',
  flotante: 'floating_button',
  footer: 'footer',
  hash: 'shared_link',
};

const HELP_TYPE: Record<FormaAyuda, string> = {
  dinero: 'money',
  cosas: 'goods',
  tiempo: 'time',
};

let ultimaForma: string = 'none';
let huboPago = false;
let transferenciaVista = false;

export function medirAperturaSumate(origen: SumateOrigen) {
  ultimaForma = 'none';
  huboPago = false;
  transferenciaVista = false;
  track(
    'sumate_opened',
    { entry_source: ENTRY_SOURCE[origen] },
    { nombre: 'sumate_open', props: { origen } }
  );
}

export function medirCierreSumate() {
  if (!huboPago) track('sumate_closed', { last_help_type: ultimaForma });
}

/** Solo por clic de la persona, nunca por el valor inicial del selector. */
export function medirFormaAyuda(forma: FormaAyuda) {
  ultimaForma = HELP_TYPE[forma];
  track('sumate_help_type_selected', { help_type: ultimaForma });
}

/** `payment_flow_started`: la persona sale a Bold o a Mercado Pago. */
export function medirPago(props: PropsAnalytics, gaLegacy: GaLegacy) {
  huboPago = true;
  track('payment_flow_started', props, gaLegacy, { saliente: true });
}

export function medirTransferencia() {
  if (transferenciaVista) return;
  transferenciaVista = true;
  track('transfer_details_viewed');
}

/** Clic que sale del sitio (WhatsApp, Give Lively, redes): el evento va por `sendBeacon`. */
export const SALIENTE: OpcionesTrack = { saliente: true };
