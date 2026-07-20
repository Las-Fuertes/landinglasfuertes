'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { FEATURED_PROJECT, formatCop } from './sumate.data';
import { CtaLink } from './ui';

export default function ProyectoDestacado() {
  const { t } = useTranslation();
  const { goalCop, raisedCop, imageSrc, imageAlt } = FEATURED_PROJECT;
  const hasProgress = goalCop > 0 && raisedCop >= 0;
  const progress = hasProgress ? Math.min(100, Math.round((raisedCop / goalCop) * 100)) : 0;

  return (
    <div className="overflow-hidden rounded-3xl border-2 border-blue bg-white shadow-md md:flex">
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
      <div className="flex flex-1 flex-col p-6 md:p-8">
        <p className="text-[0.85rem] font-bold uppercase tracking-wide text-blue">
          {t('sumate.proyecto.label')}
        </p>
        <h3 className="mt-2 text-[1.6rem] font-bold leading-tight text-black">
          {t('sumate.proyecto.title')}
        </h3>
        <p className="mt-3 leading-relaxed text-black">{t('sumate.proyecto.description')}</p>

        {hasProgress && (
          <div className="mt-6">
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              aria-label={`${t('sumate.proyecto.raisedLabel')}: ${formatCop(raisedCop)}`}
              className="h-3 w-full overflow-hidden rounded-full bg-beige"
            >
              <motion.div
                className="h-full rounded-full bg-blue"
                initial={{ width: 0 }}
                whileInView={{ width: `${progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className="mt-2 text-[0.9rem] text-black">
              {t('sumate.proyecto.raisedLabel')}: <strong>{formatCop(raisedCop)}</strong> ·{' '}
              {t('sumate.proyecto.goalLabel')}: <strong>{formatCop(goalCop)}</strong>
            </p>
          </div>
        )}

        <div className="mt-6">
          <CtaLink href="#donar">{t('sumate.proyecto.cta')}</CtaLink>
        </div>
      </div>
    </div>
  );
}
