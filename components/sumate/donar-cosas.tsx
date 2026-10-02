'use client';

import { motion } from 'framer-motion';
import { track } from '../../lib/analytics';
import { SALIENTE } from './sumate-medicion';
import { Laptop, Camera, Backpack, BookOpen, MapPin } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Resaltado } from '../layout/resaltado';
import { SEDE_LOCATION, buildWhatsAppHref } from './sumate.data';
import { CtaLink, DisabledCta, MarcoRasgado } from './ui';

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
      <h4 className="text-center text-[1.3rem] font-bold leading-tight tracking-[-0.04em] text-black md:text-[1.875rem]">
        {t('sumate.especie.title')}
      </h4>
      <p className="mt-s text-center text-base leading-normal text-black md:text-h4">
        {t('sumate.especie.text')}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-3">
        {ITEMS.map(({ key, icon: Icon }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className={`relative flex items-center gap-3 px-4 py-3.5 ${
              i % 2 === 0 ? '-rotate-1' : 'rotate-1'
            }`}
          >
            <MarcoRasgado tono="gris" grosor="fino" />
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange/15">
              <Icon className="h-5 w-5 text-orange" strokeWidth={2} aria-hidden />
            </span>
            <span className="relative text-[0.95rem] font-bold leading-snug text-black">
              {t(key)}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 text-center">
        {especieHref ? (
          <CtaLink
            href={especieHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              track(
                'whatsapp_click',
                { whatsapp_context: 'in_kind_goods' },
                { nombre: 'especie_whatsapp_click' },
                SALIENTE
              )
            }
          >
            {t('sumate.especie.cta')}
          </CtaLink>
        ) : (
          <DisabledCta>{t('sumate.whatsappUnavailable')}</DisabledCta>
        )}
      </div>

      {/* Llegue-Llegue */}
      {/* Bloque azul con el borde rasgado del footer, sobre una capa sin hijos (D3). */}
      <div className="relative mt-xl px-6 py-xl md:px-xl">
        <div aria-hidden className="absolute inset-0 bg-blue [filter:url(#map-rough-edge)]" />
        <p className="relative text-center">
          <Resaltado tono="papel" partir={false} className="text-[0.85rem] uppercase tracking-wide">
            Llegue-Llegue
          </Resaltado>
        </p>
        <h4 className="relative mt-3 text-center text-[1.3rem] font-bold leading-tight text-papel">
          {/* El nombre no se parte por el guion (con `text-wrap: balance` quedaba "Llegue- / Llegue"). */}
          {t('sumate.llegue.title')
            .split(/(Llegue-Llegue)/)
            .map((parte, i) =>
              parte === 'Llegue-Llegue' ? (
                <span key={i} className="whitespace-nowrap">
                  {parte}
                </span>
              ) : (
                parte
              )
            )}
        </h4>
        <p className="relative mt-3 text-center leading-relaxed text-papel">
          {t('sumate.llegue.text')}
        </p>
        <p className="relative mt-3 text-center leading-relaxed text-papel">
          {t('sumate.llegue.donateNote')}
        </p>
        <p className="relative mt-4 flex items-center justify-center gap-1.5 text-center text-[0.9rem] text-papel">
          <MapPin className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          <span>
            <strong>{t('sumate.llegue.locationLabel')}</strong> {SEDE_LOCATION}
          </span>
        </p>
        <div className="relative mt-6 text-center">
          {ropaHref ? (
            <a
              href={ropaHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track(
                  'whatsapp_click',
                  { whatsapp_context: 'clothing_llegue' },
                  { nombre: 'lleguellegue_click' },
                  SALIENTE
                )
              }
              className="inline-flex min-h-12 w-full items-center justify-center rounded bg-papel px-7 py-s text-center text-sm font-extrabold uppercase leading-tight tracking-tight text-blue transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-papel focus-visible:ring-offset-2 focus-visible:ring-offset-blue md:w-auto"
            >
              {t('sumate.llegue.cta')}
            </a>
          ) : (
            <DisabledCta sobreAzul>{t('sumate.whatsappUnavailable')}</DisabledCta>
          )}
        </div>
      </div>
    </div>
  );
}
