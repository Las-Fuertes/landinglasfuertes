'use client';

import { motion } from 'framer-motion';
import { sendGAEvent } from '@next/third-parties/google';
import { Palette, Scale, HeartHandshake, NotebookPen, Globe } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { buildWhatsAppHref } from './sumate.data';
import { CtaLink, DisabledCta, MarcoRasgado } from './ui';

const ROLES = [
  { key: 'sumate.voluntariado.role1', icon: Palette },
  { key: 'sumate.voluntariado.role2', icon: Scale },
  { key: 'sumate.voluntariado.role3', icon: HeartHandshake },
  { key: 'sumate.voluntariado.role4', icon: NotebookPen },
] as const;

export default function DonarTiempo() {
  const { t } = useTranslation();
  const whatsappHref = buildWhatsAppHref(t('sumate.voluntariado.whatsappMessage'));

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-center">
        <span className="inline-flex items-center gap-1.5 bg-pink-sol px-2 py-1.5 text-sm font-bold uppercase leading-none text-black">
          <Globe className="h-4 w-4" strokeWidth={2.2} aria-hidden />
          {t('sumate.voluntariado.badge')}
        </span>
      </p>
      <h4 className="mt-m text-center text-[1.3rem] font-bold leading-tight tracking-[-0.04em] text-black md:text-[1.875rem]">
        {t('sumate.voluntariado.title')}
      </h4>
      <p className="mt-s text-center text-base leading-normal text-black md:text-h4">
        {t('sumate.voluntariado.text')}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-3">
        {ROLES.map(({ key, icon: Icon }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className={`relative flex items-center gap-3 px-4 py-3.5 ${
              i % 2 === 0 ? 'rotate-1' : '-rotate-1'
            }`}
          >
            <MarcoRasgado tono="gris" grosor="fino" />
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink/15">
              <Icon className="h-5 w-5 text-pink" strokeWidth={2} aria-hidden />
            </span>
            <span className="relative text-[0.95rem] font-bold leading-snug text-black">
              {t(key)}
            </span>
          </motion.div>
        ))}
      </div>

      <p className="mt-4 text-center text-[0.95rem] text-black/80">
        {t('sumate.voluntariado.commitment')}
      </p>

      <div className="mt-5 text-center">
        {whatsappHref ? (
          <CtaLink
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sendGAEvent('event', 'voluntariado_click', {})}
          >
            {t('sumate.voluntariado.cta')}
          </CtaLink>
        ) : (
          <DisabledCta>{t('sumate.whatsappUnavailable')}</DisabledCta>
        )}
      </div>
    </div>
  );
}
