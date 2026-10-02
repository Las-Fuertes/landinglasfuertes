import type { NextApiRequest, NextApiResponse } from 'next';
import type { EstadoProveedor, RespuestaEstadoPago } from '../../lib/resultado-pago';

/**
 * Estado real de un pago, consultado a la pasarela con el id que trae la URL de vuelta a
 * /gracias (docs/mixpanel/DECISIONES.md, D6). Responde SOLO `{ status, amount_value, currency }`:
 * nunca datos de quien paga.
 *
 * - Bold: `GET https://payments.api.bold.co/v2/payment-voucher/<order id>` con
 *   `Authorization: x-api-key <llave de identidad>` (la misma NEXT_PUBLIC_BOLD_API_KEY del botón).
 * - Mercado Pago: `GET https://api.mercadopago.com/preapproval/<preapproval_id>` con
 *   `Authorization: Bearer <MP_ACCESS_TOKEN>` (solo servidor).
 *
 * Sin llave, con id inválido para la pasarela, si la pasarela tarda más del tope o responde algo
 * que no se entiende: `unknown`, y /gracias cae a lo que dice la URL.
 */

const TOPE_MS = 6000;

/** Formatos aceptados: así la ruta no sirve de proxy abierto a las APIs de las pasarelas. */
const ID_BOLD = /^lasfuertes-\d{1,12}(-\d{1,16}){1,2}$/;
const ID_MP = /^[A-Za-z0-9]{8,64}$/;

/**
 * Bases de las APIs. Fuera de producción se pueden apuntar a un servidor de prueba con
 * `ESTADO_PAGO_BOLD_BASE` y `ESTADO_PAGO_MP_BASE` (verificación local con un mock); en producción
 * se ignoran.
 */
const esProduccion = process.env.NODE_ENV === 'production';
const BASE_BOLD =
  (!esProduccion && process.env.ESTADO_PAGO_BOLD_BASE) || 'https://payments.api.bold.co';
const BASE_MP = (!esProduccion && process.env.ESTADO_PAGO_MP_BASE) || 'https://api.mercadopago.com';

const DESCONOCIDO: RespuestaEstadoPago = { status: 'unknown', amount_value: null, currency: null };

/**
 * payment_status de Bold: PROCESSING, PENDING (solo PSE), APPROVED, REJECTED, FAILED, VOIDED, y
 * NO_TRANSACTION_FOUND mientras Bold aún no registra la venta (puede tardar hasta 10 minutos):
 * ese se responde `not_found` para que /gracias reintente como con pendiente (ampliación de D6).
 */
const ESTADO_BOLD: Record<string, EstadoProveedor> = {
  NO_TRANSACTION_FOUND: 'not_found',
  APPROVED: 'approved',
  PENDING: 'pending',
  PROCESSING: 'pending',
  REJECTED: 'rejected',
  FAILED: 'rejected',
  VOIDED: 'cancelled',
};

/**
 * status de una suscripción de Mercado Pago. `authorized` es la suscripción activa (se responde
 * `approved`; /gracias la reporta como `authorized`). `paused` no cobra y no se va a confirmar
 * sola: tiene su propia pantalla (ampliación de D6).
 */
const ESTADO_MP: Record<string, EstadoProveedor> = {
  authorized: 'approved',
  pending: 'pending',
  paused: 'paused',
  cancelled: 'cancelled',
  canceled: 'cancelled',
};

const montoValido = (valor: unknown) =>
  typeof valor === 'number' && Number.isFinite(valor) && valor > 0 ? valor : null;

async function consultar(url: string, autorizacion: string): Promise<unknown> {
  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), TOPE_MS);
  try {
    const res = await fetch(url, {
      headers: { Authorization: autorizacion, Accept: 'application/json' },
      signal: control.signal,
      cache: 'no-store',
    });
    // Un 404 puede traer igual el estado (`NO_TRANSACTION_FOUND` de Bold): se lee el cuerpo, y si
    // no trae un estado conocido, queda en `unknown` como cualquier otro error.
    if (!res.ok && res.status !== 404) return null;
    return await res.json().catch(() => null);
  } finally {
    clearTimeout(reloj);
  }
}

async function estadoBold(orderId: string): Promise<RespuestaEstadoPago> {
  const llave = process.env.NEXT_PUBLIC_BOLD_API_KEY;
  if (!llave) return DESCONOCIDO;
  const datos = (await consultar(
    `${BASE_BOLD}/v2/payment-voucher/${encodeURIComponent(orderId)}`,
    `x-api-key ${llave}`
  )) as { payment_status?: unknown; total?: unknown } | null;
  const status = ESTADO_BOLD[String(datos?.payment_status ?? '').toUpperCase()] ?? 'unknown';
  if (status === 'unknown') return DESCONOCIDO;
  // Bold no devuelve la moneda: el botón del sitio solo cobra en COP.
  return { status, amount_value: montoValido(datos?.total), currency: 'COP' };
}

async function estadoMercadoPago(preapprovalId: string): Promise<RespuestaEstadoPago> {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return DESCONOCIDO;
  const datos = (await consultar(
    `${BASE_MP}/preapproval/${encodeURIComponent(preapprovalId)}`,
    `Bearer ${token}`
  )) as {
    status?: unknown;
    auto_recurring?: { transaction_amount?: unknown; currency_id?: unknown };
  } | null;
  const status = ESTADO_MP[String(datos?.status ?? '').toLowerCase()] ?? 'unknown';
  if (status === 'unknown') return DESCONOCIDO;
  const moneda = datos?.auto_recurring?.currency_id;
  return {
    status,
    amount_value: montoValido(datos?.auto_recurring?.transaction_amount),
    currency: typeof moneda === 'string' && /^[A-Z]{3}$/.test(moneda) ? moneda : null,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { provider, id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ error: 'Missing or invalid params' });

  let consulta: (() => Promise<RespuestaEstadoPago>) | null = null;
  if (provider === 'bold' && ID_BOLD.test(id)) consulta = () => estadoBold(id);
  if (provider === 'mercado_pago' && ID_MP.test(id)) consulta = () => estadoMercadoPago(id);
  if (!consulta) return res.status(400).json({ error: 'Missing or invalid params' });

  try {
    return res.status(200).json(await consulta());
  } catch {
    // Tope de tiempo, red o JSON roto: no se sabe, y /gracias cae a la URL.
    return res.status(200).json(DESCONOCIDO);
  }
}
