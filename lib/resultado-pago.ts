/**
 * Lee de la URL de vuelta a /gracias qué pasarela devolvió a la persona y con qué resultado
 * (docs/mixpanel/DECISIONES.md, D5), y lo confirma con la pasarela por /api/estado-pago (D6).
 * Si la confirmación falla o no sabe, manda lo que dice la URL.
 *
 * - Bold añade `bold-order-id` y `bold-tx-status` (approved, pending, rejected y otros).
 * - Mercado Pago, al volver del plan de suscripción, añade `preapproval_id`: el id de la
 *   suscripción recién creada. Su documentación no describe ningún otro parámetro en el
 *   `back_url` de una suscripción (ni `status`), así que la vuelta con `preapproval_id` se toma
 *   como suscripción creada.
 * - `origen=suscripcion` es el retorno viejo, configurado a mano en el plan: se sigue
 *   reconociendo por si alguna vez se usa.
 *
 * Sin ninguno de esos parámetros no hay resultado que mostrar (null).
 */

export type ResultadoPago = 'approved' | 'pending' | 'rejected' | 'suscripcion';
export type ProveedorPago = 'bold' | 'mercado_pago';

export interface VueltaPasarela {
  resultado: ResultadoPago;
  proveedor: ProveedorPago;
  /** Estado tal cual lo mandó la pasarela (solo Bold lo manda). */
  estadoCrudo?: string;
  /** Referencia de la orden de Bold, para mostrarla y leer el monto. */
  orderId?: string;
  /** Id con el que se consulta a la pasarela (order id de Bold o preapproval_id). */
  idConsulta?: string;
  /** Clave para no contar dos veces el mismo resultado (`trackSinRepetir`). */
  clave: string;
}

type Query = Record<string, string | string[] | undefined>;

const unico = (valor: string | string[] | undefined) =>
  typeof valor === 'string' && valor.trim() ? valor.trim() : null;

export function leerVueltaPasarela(query: Query): VueltaPasarela | null {
  const estadoBold = unico(query['bold-tx-status']);
  if (estadoBold) {
    const estado = estadoBold.toLowerCase();
    const orderId = unico(query['bold-order-id']) ?? undefined;
    return {
      resultado: estado === 'approved' ? 'approved' : estado === 'pending' ? 'pending' : 'rejected',
      proveedor: 'bold',
      estadoCrudo: estadoBold,
      orderId,
      idConsulta: orderId,
      clave: `bold:${orderId ?? `sin-orden-${estadoBold}`}`,
    };
  }

  const preapprovalId = unico(query.preapproval_id);
  if (preapprovalId) {
    return {
      resultado: 'suscripcion',
      proveedor: 'mercado_pago',
      idConsulta: preapprovalId,
      clave: `mp:${preapprovalId}`,
    };
  }

  if (query.origen === 'suscripcion') {
    return { resultado: 'suscripcion', proveedor: 'mercado_pago', clave: 'suscripcion' };
  }

  return null;
}

/**
 * Estado normalizado que devuelve /api/estado-pago (D6). `not_found` es el `NO_TRANSACTION_FOUND`
 * de Bold (la venta aún no aparece) y `paused`, la suscripción pausada de Mercado Pago (ampliación
 * de D6).
 */
export type EstadoProveedor =
  | 'approved'
  | 'pending'
  | 'paused'
  | 'rejected'
  | 'cancelled'
  | 'not_found'
  | 'unknown';

export interface RespuestaEstadoPago {
  status: EstadoProveedor;
  amount_value: number | null;
  currency: string | null;
}

const NO_SE: RespuestaEstadoPago = { status: 'unknown', amount_value: null, currency: null };

/** Tope del lado del navegador: un poco más que el de la ruta (6 s). */
const TOPE_CLIENTE_MS = 8000;

/**
 * Esperas entre reintentos cuando Bold dice pendiente o que aún no encuentra la venta (Bold tarda
 * en asentar el pago).
 */
export const ESPERAS_REINTENTO_BOLD_MS = [2500, 4000, 6000];

const dormir = (ms: number) => new Promise(resolver => setTimeout(resolver, ms));

async function preguntarEstado(vuelta: VueltaPasarela): Promise<RespuestaEstadoPago> {
  if (!vuelta.idConsulta) return NO_SE;
  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), TOPE_CLIENTE_MS);
  try {
    const params = new URLSearchParams({ provider: vuelta.proveedor, id: vuelta.idConsulta });
    const res = await fetch(`/api/estado-pago?${params}`, {
      signal: control.signal,
      cache: 'no-store',
    });
    if (!res.ok) return NO_SE;
    const datos = (await res.json()) as Partial<RespuestaEstadoPago>;
    const estados: EstadoProveedor[] = [
      'approved',
      'pending',
      'paused',
      'rejected',
      'cancelled',
      'not_found',
    ];
    if (!datos.status || !estados.includes(datos.status)) return NO_SE;
    return {
      status: datos.status,
      amount_value: typeof datos.amount_value === 'number' ? datos.amount_value : null,
      currency: typeof datos.currency === 'string' ? datos.currency : null,
    };
  } catch {
    return NO_SE;
  } finally {
    clearTimeout(reloj);
  }
}

/** Estados de Bold que todavía pueden cambiar en segundos: se vuelve a preguntar. */
const SIN_ASENTAR: EstadoProveedor[] = ['pending', 'not_found'];

/**
 * Pregunta el estado real a la pasarela. Con Bold, si sale pendiente o la venta aún no aparece
 * (`NO_TRANSACTION_FOUND`, Bold puede tardar hasta 10 minutos en registrarla), reintenta con las
 * esperas de `ESPERAS_REINTENTO_BOLD_MS`. Si tras los reintentos sigue sin aparecer, no se sabe
 * nada: `unknown`, y /gracias cae a lo que dice la URL (ampliación de D6).
 */
export async function confirmarConPasarela(
  vuelta: VueltaPasarela,
  esperas: number[] = ESPERAS_REINTENTO_BOLD_MS
): Promise<RespuestaEstadoPago> {
  let respuesta = await preguntarEstado(vuelta);
  if (vuelta.proveedor === 'bold') {
    for (const espera of esperas) {
      if (!SIN_ASENTAR.includes(respuesta.status)) break;
      await dormir(espera);
      const nueva = await preguntarEstado(vuelta);
      // Un reintento que no sabe no borra lo que sí se confirmó, y un "no aparece" tampoco borra
      // un "pendiente" ya visto.
      if (nueva.status === 'unknown') continue;
      if (nueva.status === 'not_found' && respuesta.status === 'pending') continue;
      respuesta = nueva;
    }
  }
  return respuesta.status === 'not_found' ? NO_SE : respuesta;
}
