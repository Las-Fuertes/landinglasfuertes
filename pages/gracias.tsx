import Head from 'next/head';
import { useTranslation } from '../hooks/useTranslation';
import { GraciasVista } from '../components/gracias';
import { useResultadoGracias } from '../components/gracias/use-resultado-gracias';

/**
 * Página de resultado a la que vuelven las pasarelas (docs/mixpanel/DECISIONES.md, D5 y D6):
 * - Bold (data-redirection-url) añade bold-order-id y bold-tx-status.
 * - El plan de suscripción de Mercado Pago añade preapproval_id (y el retorno viejo,
 *   origen=suscripcion, se sigue reconociendo).
 * Con el id de la URL se pregunta el estado real a la pasarela (/api/estado-pago) mientras se
 * muestra "Confirmando tu pago…"; si no responde o no sabe, manda la URL. Sin parámetros de
 * pasarela no hay resultado que mostrar y se vuelve al inicio: ni un "gracias" ni un "pago
 * fallido" serían ciertos.
 *
 * La lógica vive en `components/gracias/use-resultado-gracias.ts` y el diseño en
 * `components/gracias/gracias-vista.tsx` (docs/gracias/DECISIONES.md, D1).
 */
export default function Gracias() {
  const { t } = useTranslation();
  const { vuelta, final, orderId, share, copied } = useResultadoGracias();

  if (!vuelta) {
    return (
      <>
        <Head>
          <title>Las Fuertes</title>
          <meta name="robots" content="noindex" />
        </Head>
        <main className="min-h-dvh bg-beige" />
      </>
    );
  }

  const pantalla = final?.pantalla ?? 'confirmando';
  const titulo = final ? t(`gracias.${final.pantalla}Title`) : t('gracias.confirmandoTitle');

  return (
    <>
      <Head>
        <title>{`${titulo} · Las Fuertes`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <GraciasVista pantalla={pantalla} orderId={orderId} onShare={share} copied={copied} />
    </>
  );
}
