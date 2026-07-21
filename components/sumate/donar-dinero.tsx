'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import {
  BOLD_API_KEY,
  DIRECT_TRANSFER,
  MIN_AMOUNT_COP,
  MP_SUBSCRIPTION_URL,
  SUGGESTED_AMOUNTS_COP,
  formatCop,
} from './sumate.data';
import { CtaButton, CtaLink, DisabledCta } from './ui';

const BOLD_BUTTON_SRC = 'https://checkout.bold.co/library/boldPaymentButton.js';

type Frequency = 'once' | 'monthly';
type Status = 'idle' | 'loading' | 'ready' | 'error';

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

    setStatus('loading');
    try {
      const orderId = `lasfuertes-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const amount = String(amountCop); // Bold espera el monto en COP, sin centavos

      const res = await fetch('/api/bold-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount, currency: 'COP' }),
      });
      if (!res.ok) throw new Error('Firma no disponible');
      const { signature } = await res.json();

      const container = boldContainerRef.current;
      if (!container) throw new Error('Contenedor no disponible');

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
      container.innerHTML = '';
      container.appendChild(script);

      setStatus('ready');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Donación única:', error);
      }
      setStatus('error');
    }
  }

  return (
    <div className="mx-auto max-w-md">
      {/* Toggle Una vez / Cada mes */}
      <div
        role="tablist"
        aria-label={t('sumate.wizard.question')}
        className="mx-auto flex w-full max-w-xs rounded-full border border-black/10 bg-beige p-1"
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
              }}
              className="relative flex-1 rounded-full px-4 py-2 text-[0.95rem] font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue"
            >
              {active && (
                <motion.span
                  layoutId="frequency-pill"
                  className="absolute inset-0 rounded-full bg-blue"
                  transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                />
              )}
              <span className={`relative z-10 ${active ? 'text-white' : 'text-black'}`}>
                {t(`sumate.wizard.${freq === 'once' ? 'once' : 'monthly'}`)}
              </span>
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
          className="mt-6"
        >
          <p className="text-center leading-relaxed text-black">{t('sumate.unica.text')}</p>

          <fieldset className="mt-6">
            <legend className="mx-auto text-center text-[0.95rem] font-bold uppercase tracking-wide text-black/70">
              {t('sumate.unica.amountLabel')}
            </legend>
            {/* Montos como chips grandes, con la rotación juguetona de los chips del sitio */}
            <div className="mt-3 grid grid-cols-3 gap-2 md:gap-3">
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
                    }}
                    className={`rounded-2xl border-2 px-2 py-4 text-[1.05rem] font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 md:text-[1.2rem] ${
                      active
                        ? `border-blue bg-blue text-white shadow-md ${tilt}`
                        : 'border-black/10 bg-beige-light text-black hover:border-blue'
                    }`}
                  >
                    {formatCop(amount)}
                  </motion.button>
                );
              })}
            </div>
            <div className="relative mt-3">
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
                placeholder={t('sumate.unica.customPlaceholder')}
                aria-label={t('sumate.unica.customPlaceholder')}
                className={`h-14 w-full rounded-2xl border-2 px-4 text-center text-[1.05rem] font-bold transition focus:ring-0 ${
                  customAmount
                    ? 'border-blue bg-white text-blue'
                    : 'border-black/10 bg-beige-light text-black focus:border-blue'
                }`}
              />
            </div>
          </fieldset>

          {validationError && (
            <p role="alert" className="mt-3 text-center text-[0.9rem] font-bold text-red">
              {validationError}
            </p>
          )}
          {status === 'error' && (
            <p role="alert" className="mt-3 text-center text-[0.9rem] font-bold text-red">
              {t('sumate.unica.error')}
            </p>
          )}

          <div className="mt-6">
            {boldConfigured ? (
              <CtaButton
                onClick={iniciarDonacion}
                disabled={status === 'loading'}
                className={`h-14 text-[1.15rem] md:w-full ${status === 'ready' ? 'hidden' : ''}`}
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
            {status === 'ready' && (
              <p className="mt-2 text-center text-[0.9rem] text-black">
                {t('sumate.unica.readyHint')}
              </p>
            )}

            <p className="mt-4 border-t border-black/10 pt-3 text-center text-[0.85rem] text-black/60">
              {t('sumate.unica.methods')}
            </p>
            <p className="mt-1 text-center text-[0.85rem] text-black/60">
              {t('sumate.unica.international')}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="monthly"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-6"
        >
          <p className="text-center leading-relaxed text-black">{t('sumate.mensual.text')}</p>
          <div className="mt-6">
            {MP_SUBSCRIPTION_URL ? (
              <CtaLink
                href={MP_SUBSCRIPTION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="h-14 text-[1.15rem] md:w-full"
              >
                {t('sumate.mensual.cta')}
              </CtaLink>
            ) : (
              <DisabledCta>{t('sumate.mensual.comingSoon')}</DisabledCta>
            )}
          </div>
          {DIRECT_TRANSFER.nequi && (
            <p className="mt-4 text-center text-[0.9rem] leading-relaxed text-black/70">
              {t('sumate.mensual.fallback', { number: DIRECT_TRANSFER.nequi })}
            </p>
          )}
        </motion.div>
      )}

      {(DIRECT_TRANSFER.nequi || DIRECT_TRANSFER.bancolombia) && frequency === 'once' && (
        <div className="mt-6 border-t border-black/10 pt-4 text-[0.9rem] leading-relaxed text-black">
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
