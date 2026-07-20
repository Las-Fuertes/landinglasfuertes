/**
 * Config central de la sección "Súmate".
 * Los copys viven en /locales/*.json bajo la llave "sumate" (convención del repo).
 * Aquí solo va configuración: montos, enlaces, campaña y helpers.
 */

/** Llaves públicas / enlaces desde variables de entorno (inlined por Next). */
export const BOLD_API_KEY = process.env.NEXT_PUBLIC_BOLD_API_KEY ?? '';
export const MP_SUBSCRIPTION_URL = process.env.NEXT_PUBLIC_MP_SUBSCRIPTION_URL ?? '';
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';
export const INSTAGRAM_HANDLE = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? '';

/** Montos sugeridos para donación única (COP). */
export const SUGGESTED_AMOUNTS_COP = [20000, 50000, 100000];

/** Monto mínimo aceptado para donación única (COP). */
export const MIN_AMOUNT_COP = 5000;

/** Campaña destacada. Editar manualmente para el MVP. `goalCop`/`raisedCop` en COP;
 *  si alguno queda en 0, la barra de progreso se oculta. */
export const FEATURED_PROJECT = {
  goalCop: 0,
  raisedCop: 0,
  imageSrc: '', // ej. '/images/sumate/proyecto.jpg'
  imageAlt: '',
};

/** Datos de transferencia directa. Completar con datos reales de la fundación. */
export const DIRECT_TRANSFER = {
  nequi: '', // ej. '300 000 0000'
  bancolombia: '', // ej. 'Ahorros 000-000000-00, Fundación Las Fuertes'
};

/** Ubicación de la sede (Llegue-Llegue). */
export const SEDE_LOCATION = 'Isla Fuerte, Bolívar, Colombia';

export function formatCop(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Enlace de WhatsApp con mensaje prellenado; null si no hay número configurado. */
export function buildWhatsAppHref(message: string): string | null {
  if (!WHATSAPP_NUMBER) return null;
  return `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

export function instagramHref(): string | null {
  if (!INSTAGRAM_HANDLE) return null;
  return `https://www.instagram.com/${INSTAGRAM_HANDLE.replace(/^@/, '')}`;
}
