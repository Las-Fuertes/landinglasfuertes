'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { FEATURED_PROJECT, formatCop } from './sumate.data';

export default function ProyectoDestacado() {
  const { t } = useTranslation();
  const { goalCop, raisedCop, imageSrc, imageAlt } = FEATURED_PROJECT;
  const hasProgress = goalCop > 0 && raisedCop >= 0;
  const progress = hasProgress ? Math.min(100, Math.round((raisedCop / goalCop) * 100)) : 0;

  return (
    <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl bg-blue shadow-md md:flex">
      {imageSrc && (
        <div className="relative aspect-[4/3] w-full md:aspect-auto md:w-2/5">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
      )}

      {/* Barquito de papel decorativo (mismo de la sección de donaciones) */}
      <div
        className="pointer-events-none absolute -right-6 -top-4 hidden w-[7.5rem] rotate-6 md:block"
        aria-hidden
      >
        <div className="relative aspect-square w-full">
          <Image
            src="/images/donations/paper-ship.png"
            alt=""
            fill
            className="object-contain"
            sizes="120px"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 md:p-8">
        <p>
          <span className="donation-title-chip text-[0.85rem] font-bold uppercase tracking-wide text-blue">
            {t('sumate.proyecto.label')}
          </span>
        </p>
        <h3 className="mt-3 text-[1.6rem] font-bold leading-tight text-white">
          {t('sumate.proyecto.title')}
        </h3>
        <p className="mt-3 leading-relaxed text-white/90">{t('sumate.proyecto.description')}</p>

        {hasProgress && (
          <div className="mt-6">
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              aria-label={`${t('sumate.proyecto.raisedLabel')}: ${formatCop(raisedCop)}`}
              className="h-3 w-full overflow-hidden rounded-full bg-white/20"
            >
              <motion.div
                className="h-full rounded-full bg-white"
                initial={{ width: 0 }}
                whileInView={{ width: `${progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className="mt-2 text-[0.9rem] text-white">
              {t('sumate.proyecto.raisedLabel')}: <strong>{formatCop(raisedCop)}</strong> ·{' '}
              {t('sumate.proyecto.goalLabel')}: <strong>{formatCop(goalCop)}</strong>
            </p>
          </div>
        )}

        <div className="mt-6">
          <a
            href="#donar"
            className="inline-flex h-[3.25rem] w-full items-center justify-center rounded-lg bg-white px-7 text-center text-[1.05rem] font-bold uppercase tracking-tight text-blue transition hover:bg-beige focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue md:w-auto"
          >
            {t('sumate.proyecto.cta')}
          </a>
        </div>
      </div>
    </div>
  );
}
