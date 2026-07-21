'use client';

import { motion } from 'framer-motion';
import { sendGAEvent } from '@next/third-parties/google';
import { Laptop, Camera, Backpack, BookOpen, MapPin } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { SEDE_LOCATION, buildWhatsAppHref } from './sumate.data';
import { CtaLink, DisabledCta } from './ui';

const ITEMS = [
  { key: 'sumate.especie.item1', icon: Laptop },
  { key: 'sumate.especie.item2', icon: Camera },
  { key: 'sumate.especie.item3', icon: Backpack },
  { key: 'sumate.especie.item4', icon: BookOpen },
] as const;

export default function DonarCosas() {
  const { t } = useTranslation();
  const especieHref = buildWhatsAppHref(t('sumate.especie.whatsappMessage'));
  const ropaHref = buildWhatsAppHref(t('sumate.llegue.whatsappMessage'));

  return (
    <div className="mx-auto max-w-xl">
      {/* Donación en especie */}
      <h4 className="text-center text-[1.3rem] font-bold leading-tight text-black md:text-[1.5rem]">
        {t('sumate.especie.title')}
      </h4>
      <p className="mt-3 text-center leading-relaxed text-black">{t('sumate.especie.text')}</p>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-3">
        {ITEMS.map(({ key, icon: Icon }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className={`flex items-center gap-3 rounded-2xl border-2 border-black/5 bg-beige-light px-4 py-3.5 ${
              i % 2 === 0 ? '-rotate-1' : 'rotate-1'
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange/15">
              <Icon className="h-5 w-5 text-orange" strokeWidth={2} aria-hidden />
            </span>
            <span className="text-[0.95rem] font-bold leading-snug text-black">{t(key)}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 text-center">
        {especieHref ? (
          <CtaLink
            href={especieHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sendGAEvent('event', 'especie_whatsapp_click', {})}
            colorClassName="bg-orange text-white hover:bg-orange/85"
          >
            {t('sumate.especie.cta')}
          </CtaLink>
        ) : (
          <DisabledCta>{t('sumate.whatsappUnavailable')}</DisabledCta>
        )}
      </div>

      {/* Llegue-Llegue */}
      <div className="mt-10 rounded-3xl bg-blue p-6 md:p-8">
        <p className="text-center">
          <span className="donation-title-chip text-[0.85rem] font-bold uppercase tracking-wide text-blue">
            Llegue-Llegue
          </span>
        </p>
        <h4 className="mt-3 text-center text-[1.3rem] font-bold leading-tight text-white">
          {t('sumate.llegue.title')}
        </h4>
        <p className="mt-3 text-center leading-relaxed text-white/90">{t('sumate.llegue.text')}</p>
        <p className="mt-3 text-center leading-relaxed text-white/90">
          {t('sumate.llegue.donateNote')}
        </p>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[0.9rem] text-white/80">
          <MapPin className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          <span>
            <strong>{t('sumate.llegue.locationLabel')}</strong> {SEDE_LOCATION}
          </span>
        </p>
        <div className="mt-6 text-center">
          {ropaHref ? (
            <a
              href={ropaHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sendGAEvent('event', 'lleguellegue_click', {})}
              className="inline-flex h-[3.25rem] w-full items-center justify-center rounded-lg bg-white px-7 text-center text-[1.05rem] font-bold uppercase tracking-tight text-blue transition hover:bg-beige focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue md:w-auto"
            >
              {t('sumate.llegue.cta')}
            </a>
          ) : (
            <DisabledCta>{t('sumate.whatsappUnavailable')}</DisabledCta>
          )}
        </div>
      </div>
    </div>
  );
}
