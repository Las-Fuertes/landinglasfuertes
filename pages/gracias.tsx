import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  CheckCircle2,
  Clock3,
  HeartHandshake,
  Loader2,
  PauseCircle,
  Share2,
  XCircle,
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { instagramHref } from '../components/sumate/sumate.data';
import { CtaLink } from '../components/sumate/ui';
import { track, trackSinRepetir, type PropsAnalytics } from '../lib/analytics';
import { montoDeOrden } from '../lib/orden-bold';
import {
  confirmarConPasarela,
  leerVueltaPasarela,
  type RespuestaEstadoPago,
  type VueltaPasarela,
} from '../lib/resultado-pago';

/** Pantallas finales: cada una tiene su `gracias.<pantalla>Title` y `Text`. */
type Outcome =
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'suscripcion'
  | 'suscripcionPending'
  | 'suscripcionPaused';

/** Para la clave de la suscripción vieja (`origen=suscripcion`, sin id): una vez por visita. */
const VENTANA_SUSCRIPCION_SIN_ID = 30 * 60 * 1000;

interface ResultadoFinal {
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
function decidir(vuelta: VueltaPasarela, estado: RespuestaEstadoPago): ResultadoFinal {
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

/**
 * Página de resultado a la que vuelven las pasarelas (docs/mixpanel/DECISIONES.md, D5 y D6):
 * - Bold (data-redirection-url) añade bold-order-id y bold-tx-status.
 * - El plan de suscripción de Mercado Pago añade preapproval_id (y el retorno viejo,
 *   origen=suscripcion, se sigue reconociendo).
 * Con el id de la URL se pregunta el estado real a la pasarela (/api/estado-pago) mientras se
 * muestra "Confirmando tu pago…"; si no responde o no sabe, manda la URL. Sin parámetros de
 * pasarela no hay resultado que mostrar y se vuelve al inicio: ni un "gracias" ni un "pago
 * fallido" serían ciertos.
 */
export default function Gracias() {
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

  const ICONS: Record<Outcome, typeof CheckCircle2> = {
    approved: CheckCircle2,
    pending: Clock3,
    rejected: XCircle,
    suscripcion: HeartHandshake,
    suscripcionPending: Clock3,
    suscripcionPaused: PauseCircle,
  };
  const COLORS: Record<Outcome, string> = {
    approved: 'text-blue',
    pending: 'text-orange',
    rejected: 'text-red',
    suscripcion: 'text-blue',
    suscripcionPending: 'text-orange',
    suscripcionPaused: 'text-orange',
  };

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

  if (!vuelta) {
    return (
      <>
        <Head>
          <title>Las Fuertes</title>
          <meta name="robots" content="noindex" />
        </Head>
        <main className="min-h-screen bg-beige" />
      </>
    );
  }

  if (!final) {
    return (
      <>
        <Head>
          <title>{`${t('gracias.confirmandoTitle')} · Las Fuertes`}</title>
          <meta name="robots" content="noindex" />
        </Head>
        <main className="flex min-h-screen items-center justify-center bg-beige px-page-margin py-16">
          <div
            role="status"
            className="w-full max-w-lg rounded-3xl border border-black/10 bg-white p-8 text-center shadow-md md:p-12"
          >
            <Loader2
              className="mx-auto h-16 w-16 text-blue motion-safe:animate-spin"
              strokeWidth={1.5}
              aria-hidden
            />
            <h1 className="mt-6 text-[1.8rem] font-bold leading-tight text-black">
              {t('gracias.confirmandoTitle')}
            </h1>
            <p className="mt-4 leading-relaxed text-black">{t('gracias.confirmandoText')}</p>
          </div>
        </main>
      </>
    );
  }

  const outcome = final.pantalla;
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
