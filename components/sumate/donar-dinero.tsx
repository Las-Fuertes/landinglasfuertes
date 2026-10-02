'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { track } from '../../lib/analytics';
import { medirPago, medirTransferencia } from './sumate-medicion';
import {
  BOLD_API_KEY,
  DIRECT_TRANSFER,
  MIN_AMOUNT_COP,
  MP_SUBSCRIPTION_URL,
  SUGGESTED_AMOUNTS_COP,
  formatCop,
} from './sumate.data';
import { CtaButton, CtaLink, DisabledCta, MarcoRasgado } from './ui';

const BOLD_BUTTON_SRC = 'https://checkout.bold.co/library/boldPaymentButton.js';

type Frequency = 'once' | 'monthly';
type Status = 'idle' | 'loading' | 'ready' | 'error';
/** `failure_reason` de `payment_flow_failed` (docs/mixpanel, D5). */
type MotivoFallo = 'signature_error' | 'network_error' | 'container_error' | 'script_error';

/** Frecuencia con el nombre del plan de eventos de Mixpanel (docs/mixpanel). */
const FRECUENCIA: Record<Frequency, string> = { once: 'one_time', monthly: 'monthly' };

/**
 * Referencia de la orden de Bold. Lleva el monto para que /gracias pueda leerlo de
 * `bold-order-id` sin guardar nada en el navegador (docs/mixpanel/DECISIONES.md, D4):
 * `lasfuertes-<monto>-<marca de tiempo>-<azar>`. Ver `montoDeOrden` en lib/orden-bold.ts.
 */
const crearOrderId = (montoCop: number) =>
  `lasfuertes-${montoCop}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

export default function DonarDinero() {
  const { t } = useTranslation();
  const boldContainerRef = useRef<HTMLDivElement>(null);
  const [frequency, setFrequency] = useState<Frequency>('once');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(SUGGESTED_AMOUNTS_COP[1]);
  const [customAmount, setCustomAmount] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);

  const boldConfigured = Boolean(BOLD_API_KEY);
  const amountCop = customAmount ? Number.parseInt(customAmount, 10) || 0 : (selectedAmount ?? 0);
  const amountType = customAmount ? 'custom' : 'preset';
  /** Último "Otro monto" medido: el blur repetido sin cambio no vuelve a contar. */
  const customMedidoRef = useRef<number | null>(null);
  const transferRef = useRef<HTMLDivElement>(null);

  // `transfer_details_viewed`: el bloque de transferencia está siempre a la vista con "Una vez";
  // cuenta cuando entra en pantalla, una vez por apertura del drawer (sumate-medicion.ts).
  useEffect(() => {
    const el = transferRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entradas => {
      if (!entradas.some(e => e.isIntersecting)) return;
      observer.disconnect();
      medirTransferencia();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [frequency]);

  function medirMontoPropio() {
    const monto = Number.parseInt(customAmount, 10);
    if (!customAmount || !Number.isInteger(monto) || monto <= 0) return;
    if (customMedidoRef.current === monto) return;
    customMedidoRef.current = monto;
    track('donation_amount_chosen', { amount_value: monto, amount_type: 'custom' });
  }

  function resetBoldButton() {
    if (boldContainerRef.current) boldContainerRef.current.innerHTML = '';
    setValidationError(null);
    setStatus(prev => (prev === 'ready' || prev === 'error' ? 'idle' : prev));
  }

  async function iniciarDonacion() {
    setValidationError(null);
    if (!Number.isInteger(amountCop) || amountCop < MIN_AMOUNT_COP) {
      setValidationError(t('sumate.unica.minError', { min: formatCop(MIN_AMOUNT_COP) }));
      return;
    }

    medirPago(
      {
        payment_provider: 'bold',
        frequency: FRECUENCIA.once,
        amount_value: amountCop,
        amount_type: amountType,
      },
      { nombre: 'donacion_unica_click', props: { monto: amountCop } }
    );
    setStatus('loading');

    // `payment_flow_failed` (docs/mixpanel, D5): el pago no se pudo abrir y la persona ve
    // `sumate.unica.error` sin haber salido del sitio. `motivo` dice en qué paso se cayó.
    const fallar = (motivo: MotivoFallo, error?: unknown) => {
      if (process.env.NODE_ENV === 'development' && error) {
        console.error('Donación única:', error);
      }
      track('payment_flow_failed', {
        payment_provider: 'bold',
        frequency: FRECUENCIA.once,
        amount_value: amountCop,
        failure_reason: motivo,
      });
      setStatus('error');
    };

    const orderId = crearOrderId(amountCop);
    const amount = String(amountCop); // Bold espera el monto en COP, sin centavos

    let signature: unknown;
    try {
      const res = await fetch('/api/bold-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount, currency: 'COP' }),
      });
      if (!res.ok) return fallar('signature_error', new Error(`Firma: HTTP ${res.status}`));
      ({ signature } = await res.json());
    } catch (error) {
      // Sin red o respuesta que no es JSON: la firma no llegó.
      return fallar('network_error', error);
    }
    if (typeof signature !== 'string' || !signature) {
      return fallar('signature_error', new Error('Firma vacía'));
    }

    const container = boldContainerRef.current;
    if (!container) return fallar('container_error', new Error('Contenedor no disponible'));

    // Inyección diferida del botón embebido de Bold: solo al primer intento de donar.
    const script = document.createElement('script');
    script.src = BOLD_BUTTON_SRC;
    script.setAttribute('data-bold-button', '');
    script.setAttribute('data-api-key', BOLD_API_KEY);
    script.setAttribute('data-order-id', orderId);
    script.setAttribute('data-amount', amount);
    script.setAttribute('data-currency', 'COP');
    script.setAttribute('data-integrity-signature', signature);
    script.setAttribute('data-description', 'Donación a Las Fuertes');
    script.setAttribute('data-render-mode', 'embedded');
    // Al cerrar el pago, Bold redirige aquí añadiendo bold-order-id y bold-tx-status.
    // Bold exige https:// en redirection-url; en dev (http) se omite para no romper el botón.
    if (window.location.protocol === 'https:') {
      script.setAttribute('data-redirection-url', `${window.location.origin}/gracias`);
    }
    // El script de Bold no cargó (bloqueador, red): sin él no hay botón de pago.
    script.addEventListener('error', () => {
      if (script.isConnected) fallar('script_error', new Error('No cargó el script de Bold'));
    });
    container.innerHTML = '';
    container.appendChild(script);

    setStatus('ready');
  }

  return (
    <div className="mx-auto max-w-[39.25rem]">
      {/* Toggle Una vez / Cada mes */}
      <div
        role="tablist"
        aria-label={t('sumate.wizard.question')}
        className="mx-auto flex w-fit min-w-[14.75rem] max-w-full rounded-full border border-black/10 bg-papel p-1"
      >
        {(['once', 'monthly'] as const).map(freq => {
          const active = frequency === freq;
          return (
            <button
              key={freq}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setFrequency(freq);
                resetBoldButton();
                track('donation_frequency_selected', { frequency: FRECUENCIA[freq] });
              }}
              className={`min-h-10 flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue ${
                active ? 'bg-blue text-papel' : 'text-black hover:text-blue'
              }`}
            >
              {t(`sumate.wizard.${freq === 'once' ? 'once' : 'monthly'}`)}
            </button>
          );
        })}
      </div>

      {/* Sin exit ni mode="wait": ver nota en como-ayudar.tsx (paneles vacíos). */}
      {frequency === 'once' ? (
        <motion.div
          key="once"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-l"
        >
          <p className="text-center text-base leading-normal text-black md:text-h4">
            {t('sumate.unica.text')}
          </p>

          {/* Figma 1300:2080: caja de borde azul con sombra alrededor de los montos. */}
          <fieldset className="relative mt-l px-s pb-l pt-m md:mt-xl md:px-[3.375rem] md:pb-xl md:pt-l">
            <MarcoRasgado tono="azul" grosor="fino" sombra />
            <legend className="sr-only">{t('sumate.unica.amountLabel')}</legend>
            {/* La leyenda de un fieldset no se deja poner dentro de la caja: la visible va aparte. */}
            <p aria-hidden className="relative text-center text-sm font-bold uppercase text-black">
              {t('sumate.unica.amountLabel')}
            </p>
            {/* Montos como chips grandes, con la rotación juguetona de los chips del sitio */}
            {/* En pantallas ultra angostas (<350px) los chips se apilan para no recortar cifras */}
            <div className="relative mt-m grid grid-cols-1 gap-s min-[350px]:grid-cols-3 md:mt-l md:gap-[3.25rem]">
              {SUGGESTED_AMOUNTS_COP.map((amount, i) => {
                const active = !customAmount && selectedAmount === amount;
                const tilt = i % 2 === 0 ? '-rotate-1' : 'rotate-1';
                return (
                  <motion.button
                    key={amount}
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    aria-pressed={active}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                      resetBoldButton();
                      customMedidoRef.current = null;
                      track('donation_amount_chosen', {
                        amount_value: amount,
                        amount_type: 'preset',
                      });
                    }}
                    className={`min-h-[3.25rem] whitespace-nowrap rounded border-2 border-blue px-1 py-s text-[clamp(0.75rem,3.6vw,1.05rem)] font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-papel md:text-[1.1rem] ${
                      active
                        ? `bg-blue text-papel shadow-md ${tilt}`
                        : 'bg-white/60 text-black hover:bg-white'
                    }`}
                  >
                    {/* Sin espacio tras el $: en pantallas angostas cada píxel cuenta */}
                    {formatCop(amount).replace(/\s/g, '')}
                  </motion.button>
                );
              })}
            </div>
            <div className="relative mt-m">
              <input
                type="number"
                inputMode="numeric"
                min={MIN_AMOUNT_COP}
                step={1000}
                value={customAmount}
                onChange={e => {
                  setCustomAmount(e.target.value);
                  resetBoldButton();
                }}
                // El monto propio se mide al confirmar (Enter) o al salir del campo, no por tecla.
                onBlur={medirMontoPropio}
                onKeyDown={e => {
                  if (e.key === 'Enter') medirMontoPropio();
                }}
                placeholder={t('sumate.unica.customPlaceholder')}
                aria-label={t('sumate.unica.customPlaceholder')}
                // Con `!`: la regla base de inputs de styles/global.css (borde gris de 1 px, texto de 14)
                // gana por especificidad a las utilidades.
                className={`h-12 w-full rounded !border-2 !border-blue !px-4 text-center !text-[1.05rem] font-bold transition placeholder:font-normal placeholder:!text-black/70 focus:ring-2 focus:ring-blue/30 ${
                  customAmount ? '!bg-white !text-blue' : '!bg-white/60 !text-black'
                }`}
              />
            </div>
          </fieldset>

          {validationError && (
            <p
              role="alert"
              className="mt-m bg-red/20 px-s py-xs text-center text-sm font-bold text-black"
            >
              {validationError}
            </p>
          )}
          {status === 'error' && (
            <p
              role="alert"
              className="mt-m bg-red/20 px-s py-xs text-center text-sm font-bold text-black"
            >
              {t('sumate.unica.error')}
            </p>
          )}

          <div className="mt-l text-center md:mt-[2.125rem]">
            {boldConfigured ? (
              <CtaButton
                onClick={iniciarDonacion}
                disabled={status === 'loading'}
                className={`md:min-w-[17.75rem] ${status === 'ready' ? 'hidden' : ''}`}
              >
                {status === 'loading'
                  ? t('sumate.unica.loading')
                  : `${t('sumate.unica.cta')} · ${amountCop >= MIN_AMOUNT_COP ? formatCop(amountCop) : ''}`}
              </CtaButton>
            ) : (
              <DisabledCta>{t('sumate.unica.comingSoon')}</DisabledCta>
            )}

            {/* Aquí Bold inyecta su botón de pago embebido */}
            <div ref={boldContainerRef} aria-live="polite" className="[&_button]:w-full" />
            {/* El hint (con los métodos de pago) solo aparece cuando el botón de Bold está listo */}
            {status === 'ready' && (
              <p className="mt-s text-center text-sm leading-relaxed text-black/80">
                {t('sumate.unica.readyHint')}
              </p>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="monthly"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-l"
        >
          <p className="text-center text-base leading-normal text-black md:text-h4">
            {t('sumate.mensual.text')}
          </p>
          <div className="mt-l text-center">
            {MP_SUBSCRIPTION_URL ? (
              <CtaLink
                href={MP_SUBSCRIPTION_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  medirPago(
                    { payment_provider: 'mercado_pago', frequency: FRECUENCIA.monthly },
                    { nombre: 'suscripcion_click' }
                  )
                }
                className="md:min-w-[17.75rem]"
              >
                {t('sumate.mensual.cta')}
              </CtaLink>
            ) : (
              <DisabledCta>{t('sumate.mensual.comingSoon')}</DisabledCta>
            )}
          </div>
          {DIRECT_TRANSFER.nequi && (
            <p className="mt-m text-center text-sm leading-relaxed text-black/80">
              {t('sumate.mensual.fallback', { number: DIRECT_TRANSFER.nequi })}
            </p>
          )}
        </motion.div>
      )}

      {(DIRECT_TRANSFER.nequi || DIRECT_TRANSFER.bancolombia) && frequency === 'once' && (
        <div
          ref={transferRef}
          className="mt-l border-t border-black/15 pt-m text-sm leading-relaxed text-black"
        >
          <p className="font-bold">{t('sumate.unica.transferTitle')}</p>
          {DIRECT_TRANSFER.nequi && (
            <p>{t('sumate.unica.transferNequi', { number: DIRECT_TRANSFER.nequi })}</p>
          )}
          {DIRECT_TRANSFER.bancolombia && (
            <p>{t('sumate.unica.transferBancolombia', { account: DIRECT_TRANSFER.bancolombia })}</p>
          )}
        </div>
      )}
    </div>
  );
}
