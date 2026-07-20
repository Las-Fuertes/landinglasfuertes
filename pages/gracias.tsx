import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CheckCircle2, Clock3, HeartHandshake, XCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { instagramHref } from '../components/sumate/sumate.data';
import { CtaLink } from '../components/sumate/ui';

type Outcome = 'approved' | 'pending' | 'rejected' | 'suscripcion';

/**
 * Página de resultado a la que Bold redirige tras el pago
 * (data-redirection-url), añadiendo bold-order-id y bold-tx-status.
 * También sirve como retorno del plan de suscripción de Mercado Pago:
 * configurar en el panel de MP la URL /gracias?origen=suscripcion.
 * El estado del query param es informativo para la UI; la conciliación
 * real se hace en el panel de cada pasarela.
 */
export default function Gracias() {
  const { t } = useTranslation();
  const router = useRouter();

  const status = String(router.query['bold-tx-status'] ?? '').toLowerCase();
  const orderId =
    typeof router.query['bold-order-id'] === 'string' ? router.query['bold-order-id'] : null;

  const outcome: Outcome =
    router.query.origen === 'suscripcion'
      ? 'suscripcion'
      : status === 'approved'
        ? 'approved'
        : status === 'pending'
          ? 'pending'
          : 'rejected';

  const ICONS: Record<Outcome, typeof CheckCircle2> = {
    approved: CheckCircle2,
    pending: Clock3,
    rejected: XCircle,
    suscripcion: HeartHandshake,
  };
  const COLORS: Record<Outcome, string> = {
    approved: 'text-blue',
    pending: 'text-orange',
    rejected: 'text-red',
    suscripcion: 'text-blue',
  };
  const Icon = ICONS[outcome];
  const igHref = instagramHref();

  return (
    <>
      <Head>
        <title>{`${t(`gracias.${outcome}Title`)} · Las Fuertes`}</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main className="flex min-h-screen items-center justify-center bg-beige px-page-margin py-16">
        <div className="w-full max-w-lg rounded-3xl border border-black/10 bg-white p-8 text-center shadow-md md:p-12">
          <Icon className={`mx-auto h-16 w-16 ${COLORS[outcome]}`} strokeWidth={1.5} aria-hidden />
          <h1 className="mt-6 text-[1.8rem] font-bold leading-tight text-black">
            {t(`gracias.${outcome}Title`)}
          </h1>
          <p className="mt-4 leading-relaxed text-black">{t(`gracias.${outcome}Text`)}</p>

          {orderId && (
            <p className="mt-4 text-[0.85rem] text-black/60">
              {t('gracias.orderLabel')}: <span className="font-mono">{orderId}</span>
            </p>
          )}

          <div className="mt-8 flex flex-col items-center gap-3">
            {outcome === 'rejected' ? (
              <CtaLink href="/#donar">{t('gracias.retry')}</CtaLink>
            ) : (
              igHref && (
                <CtaLink href={igHref} target="_blank" rel="noopener noreferrer">
                  {t('gracias.share')}
                </CtaLink>
              )
            )}
            <Link
              href="/"
              className="rounded-lg px-4 py-2 font-bold text-blue underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue"
            >
              {t('gracias.back')}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
