'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Instagram, MessageCircle } from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';
import { PageGrid } from './page-grid';
import { useTranslation } from '../../hooks/useTranslation';
import { instagramHref } from '../sumate/sumate.data';
import ContactModal from '../contact/contact-modal';

const NAV_LINKS = [
  { key: 'footer.navWelcome', href: '#welcome-title' },
  { key: 'footer.navPrinciples', href: '#principles-title' },
  { key: 'footer.navSumate', href: '#sumate' },
] as const;

export default function Footer() {
  const { t } = useTranslation();
  const [contactOpen, setContactOpen] = useState(false);
  const igHref = instagramHref();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-blue pb-8 pt-12 md:pt-16">
      <PageGrid className="relative z-10">
        {/* Marca */}
        <div className="col-span-4 md:col-span-5">
          <p className="text-[1.6rem] font-bold leading-tight text-white">Las Fuertes</p>
          <div className="relative mt-1 h-[5px] w-full max-w-[150px] brightness-0 invert">
            <Image
              src="/images/welcome/subtitle-underline.svg"
              alt=""
              fill
              className="object-contain object-left"
              sizes="150px"
            />
          </div>
          <p className="mt-4 max-w-xs leading-relaxed text-white/80">{t('footer.tagline')}</p>
        </div>

        {/* Navegación */}
        <nav className="col-span-4 md:col-span-3" aria-label={t('footer.navTitle')}>
          <p className="text-[0.85rem] font-bold uppercase tracking-wide text-white/60">
            {t('footer.navTitle')}
          </p>
          <ul className="mt-3 space-y-2">
            {NAV_LINKS.map(({ key, href }) => (
              <li key={key}>
                <a
                  href={href}
                  className="font-bold text-white underline-offset-4 transition hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {t(key)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contacto / redes */}
        <div className="col-span-4 md:col-span-4">
          <p className="text-[0.85rem] font-bold uppercase tracking-wide text-white/60">
            {t('footer.helpTitle')}
          </p>
          <div className="mt-3 flex flex-col items-start gap-2">
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="inline-flex items-center gap-2 font-bold text-white underline-offset-4 transition hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              {t('footer.contact')}
            </button>
            {igHref && (
              <a
                href={igHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sendGAEvent('event', 'instagram_click', { origen: 'footer' })}
                className="inline-flex items-center gap-2 font-bold text-white underline-offset-4 transition hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Instagram className="h-4 w-4" aria-hidden />
                {t('footer.followUs')}
              </a>
            )}
          </div>
        </div>

        {/* Legal */}
        <div className="col-span-4 mt-6 border-t border-white/15 pt-5 md:col-span-12">
          <p className="text-[0.85rem] text-white/60">
            © {year} {t('footer.legal')}
          </p>
          <p className="mt-1 text-[0.85rem] text-white/60">{t('footer.madeWith')}</p>
        </div>
      </PageGrid>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </footer>
  );
}
