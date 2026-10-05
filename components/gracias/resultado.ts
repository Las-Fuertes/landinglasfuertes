import { montoDeOrden } from '../../lib/orden-bold';
import type { RespuestaEstadoPago, VueltaPasarela } from '../../lib/resultado-pago';

/** Pantallas finales: cada una tiene su `gracias.<pantalla>Title` y `Text`. */
export type Outcome =
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'suscripcion'
  | 'suscripcionPending'
  | 'suscripcionPaused';

/** Para la clave de la suscripción vieja (`origen=suscripcion`, sin id): una vez por visita. */
export const VENTANA_SUSCRIPCION_SIN_ID = 30 * 60 * 1000;

export interface ResultadoFinal {
  pantalla: Outcome;
  /** true si el estado vino de la pasarela; false si se cayó a lo que dice la URL. */
  verificado: boolean;
  paymentStatus: string;
  exito: boolean;
  monto: number | null;
}

/**
 * Cruza la URL de vuelta con lo que respondió la pasarela (D6). Si la pasarela no sabe
 * (`unknown`: sin llave, tope de tiempo, error), manda la URL, como en D5.
 */
export function decidir(vuelta: VueltaPasarela, estado: RespuestaEstadoPago): ResultadoFinal {
  const montoUrl = vuelta.proveedor === 'bold' ? montoDeOrden(vuelta.orderId) : null;
  if (estado.status === 'unknown') {
    const esSuscripcion = vuelta.resultado === 'suscripcion';
    return {
      pantalla: vuelta.resultado,
      verificado: false,
      paymentStatus: esSuscripcion ? 'subscription_returned' : vuelta.resultado,
      exito: esSuscripcion || vuelta.resultado === 'approved',
      monto: montoUrl,
    };
  }
  const monto = estado.amount_value ?? montoUrl;
  if (vuelta.proveedor === 'mercado_pago') {
    // `approved` de la ruta es la suscripción `authorized` de Mercado Pago.
    if (estado.status === 'approved') {
      return {
        pantalla: 'suscripcion',
        verificado: true,
        paymentStatus: 'authorized',
        exito: true,
        monto,
      };
    }
    // Pausada: no cobra y no se confirma sola; se reactiva o cancela desde Mercado Pago
    // (ampliación de D6). Antes caía en "todavía está confirmando", que no era cierto.
    if (estado.status === 'paused') {
      return {
        pantalla: 'suscripcionPaused',
        verificado: true,
        paymentStatus: 'paused',
        exito: false,
        monto,
      };
    }
    if (estado.status === 'pending') {
      return {
        pantalla: 'suscripcionPending',
        verificado: true,
        paymentStatus: 'pending',
        exito: false,
        monto,
      };
    }
    return {
      pantalla: 'rejected',
      verificado: true,
      paymentStatus: 'cancelled',
      exito: false,
      monto,
    };
  }
  const pantalla: Outcome =
    estado.status === 'approved'
      ? 'approved'
      : estado.status === 'pending'
        ? 'pending'
        : 'rejected';
  return {
    pantalla,
    verificado: true,
    paymentStatus: estado.status,
    exito: estado.status === 'approved',
    monto,
  };
}
