import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { track, trackSinRepetir, type PropsAnalytics } from '../../lib/analytics';
import {
  confirmarConPasarela,
  leerVueltaPasarela,
  type VueltaPasarela,
} from '../../lib/resultado-pago';
import { decidir, VENTANA_SUSCRIPCION_SIN_ID, type ResultadoFinal } from './resultado';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * La lógica de `/gracias` (docs/mixpanel/DECISIONES.md, D5 y D6), separada de la presentación
 * (`gracias-vista.tsx`) sin cambiar nada de su comportamiento:
 * - lee la vuelta de la pasarela de la URL (hasta que el router está listo no hay resultado);
 * - sin parámetros de pasarela, vuelve al inicio en el mismo idioma (D5);
 * - confirma con /api/estado-pago y manda `donation_result_viewed` UNA vez, con el resultado
 *   final (una vez por `bold-order-id` o `preapproval_id`; el ref aguanta el doble efecto de
 *   StrictMode);
 * - compartir (`thank_you_shared`).
 */
export function useResultadoGracias() {
  const { t } = useTranslation();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [final, setFinal] = useState<ResultadoFinal | null>(null);

  async function share() {
    track('thank_you_shared');
    const url = window.location.origin;
    const text = t('gracias.shareText');
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Las Fuertes', text, url });
      } catch {
        // usuario canceló el share nativo: no hacer nada
      }
      return;
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  // La página se prerenderiza sin query: hasta que el router la tiene no se pinta ningún
  // resultado (antes el HTML estático mostraba "El pago no se completó" un instante).
  const vuelta = router.isReady ? leerVueltaPasarela(router.query) : null;
  const orderId = vuelta?.orderId ?? null;

  // Sin parámetros de pasarela: al inicio, en el mismo idioma (D5).
  const sinResultado = router.isReady && !vuelta;
  useEffect(() => {
    if (sinResultado) void router.replace('/');
  }, [sinResultado, router]);

  // Confirmación con la pasarela y `donation_result_viewed` (docs/mixpanel, D4 a D6): UNA vez,
  // con el resultado final. No se repite por recarga: una vez por `bold-order-id` o por
  // `preapproval_id`. El ref aguanta el doble efecto de StrictMode.
  const clave = vuelta?.clave ?? null;
  const vueltaRef = useRef<VueltaPasarela | null>(null);
  vueltaRef.current = vuelta;
  const iniciadoRef = useRef(false);
  useEffect(() => {
    const actual = vueltaRef.current;
    if (!clave || !actual || iniciadoRef.current) return;
    iniciadoRef.current = true;
    void confirmarConPasarela(actual).then(estado => {
      const resultado = decidir(actual, estado);
      setFinal(resultado);
      const esMensual = actual.proveedor === 'mercado_pago';
      const props: PropsAnalytics = {
        payment_provider: actual.proveedor,
        payment_status: resultado.paymentStatus,
        donation_success: resultado.exito,
        verified: resultado.verificado,
        frequency: esMensual ? 'monthly' : 'one_time',
      };
      if (actual.estadoCrudo) props.provider_status_code = actual.estadoCrudo;
      if (resultado.monto !== null) props.amount_value = resultado.monto;
      const ventana = actual.clave === 'suscripcion' ? VENTANA_SUSCRIPCION_SIN_ID : undefined;
      trackSinRepetir('donation_result_viewed', props, actual.clave, ventana);
    });
  }, [clave]);

  return { vuelta, final, orderId, share, copied };
}
