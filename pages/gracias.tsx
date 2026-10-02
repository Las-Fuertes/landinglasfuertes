import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CheckCircle2, Clock3, HeartHandshake, Share2, XCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { instagramHref } from '../components/sumate/sumate.data';
import { CtaLink } from '../components/sumate/ui';
import { track, trackSinRepetir, type PropsAnalytics } from '../lib/analytics';
import { montoDeOrden } from '../lib/orden-bold';

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
  const [copied, setCopied] = useState(false);

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

  // `donation_result_viewed` (docs/mixpanel, D4), con la query ya leída. Solo si se vuelve de
  // una pasarela: entrar a /gracias sin `bold-tx-status` ni `origen=suscripcion` no es un
  // resultado. No se repite por recarga: una vez por `bold-order-id` y, la suscripción, una vez
  // por visita (30 min). `subscription_returned` solo dice que la persona volvió de Mercado
  // Pago, no que pagó.
  const medidoRef = useRef(false);
  useEffect(() => {
    if (!router.isReady || medidoRef.current) return;
    medidoRef.current = true;
    const crudo = router.query['bold-tx-status'];
    const esSuscripcion = outcome === 'suscripcion';
    if (!esSuscripcion && typeof crudo !== 'string') return;
    const props: PropsAnalytics = {
      payment_status: outcome === 'suscripcion' ? 'subscription_returned' : outcome,
      frequency: outcome === 'suscripcion' ? 'monthly' : 'one_time',
    };
    if (typeof crudo === 'string') props.provider_status_code = crudo;
    const monto = outcome === 'suscripcion' ? null : montoDeOrden(orderId);
    if (monto !== null) props.amount_value = monto;
    if (esSuscripcion) {
      trackSinRepetir('donation_result_viewed', props, 'suscripcion', 30 * 60 * 1000);
    } else {
      trackSinRepetir('donation_result_viewed', props, `bold:${orderId ?? `sin-orden-${crudo}`}`);
    }
  }, [router.isReady, router.query, outcome, orderId]);
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
              <>
                {/* Momento de máxima emoción: convertir al donante en difusor */}
                <button
                  type="button"
                  onClick={share}
                  className="inline-flex h-[3.25rem] w-full items-center justify-center gap-2 rounded-lg bg-blue px-7 text-[1.05rem] font-bold uppercase tracking-tight text-white transition hover:bg-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 md:w-auto"
                >
                  <Share2 className="h-5 w-5" aria-hidden />
                  {copied ? t('gracias.copied') : t('gracias.shareCta')}
                </button>
                {igHref && (
                  <a
                    href={igHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      track(
                        'social_click',
                        { network: 'instagram', location: 'thank_you' },
                        undefined,
                        { saliente: true }
                      )
                    }
                    className="rounded-lg px-4 py-2 font-bold text-blue underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue"
                  >
                    {t('gracias.share')}
                  </a>
                )}
              </>
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
