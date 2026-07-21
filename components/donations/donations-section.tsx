'use client';

import Image from 'next/image';
import { PageGrid } from '../layout/page-grid';
import { useTranslation } from '../../hooks/useTranslation';
import { renderTextWithBold } from '../../lib/render-text-with-bold';

const TITLE_LINE_KEYS = [
  'donations.titleLine1',
  'donations.titleLine2',
  'donations.titleLine3',
  'donations.titleLine4',
  'donations.titleLine5',
  'donations.titleLine6',
] as const;

export default function DonationsSection() {
  const { t } = useTranslation();

  return (
    <section
      className="relative overflow-hidden bg-blue pb-48 pt-12 md:pb-24 md:pt-16"
      aria-labelledby="donations-title"
    >
      {/* SVG filter: rough paper-edge for title chips (Figma Texture Size 4, Radius 2) */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <filter id="paper-texture" x="-2%" y="-2%" width="104%" height="104%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="4"
              seed="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <PageGrid className="relative z-10">
        <div className="col-span-4 md:col-span-12">
          <div className="relative max-w-[44rem]">
            <h2
              id="donations-title"
              className="max-w-[26rem] text-[clamp(1.75rem,9.7vw,2.375rem)] font-bold leading-[1.22] tracking-tight text-blue md:max-w-[40rem] md:text-[48px]"
            >
              {TITLE_LINE_KEYS.map(key => (
                <span key={key} className="block">
                  <span className="donation-title-chip">{t(key)}</span>
                </span>
              ))}
            </h2>

            <div className="pointer-events-none absolute right-0 top-[50%] w-[clamp(9rem,26vw,15rem)] translate-x-[70%] -translate-y-1/2 md:top-[50%] md:w-[clamp(15rem,24vw,21rem)] md:translate-x-[95%]">
              <div className="relative aspect-[1/1] w-full">
                <Image
                  src="/images/donations/paper-ship.png"
                  alt=""
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 35vw, 240px"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-4 mt-8 max-w-xl md:col-span-12 md:mt-10 md:max-w-3xl">
          <p className="text-left text-base text-[clamp(1.5rem,3.2vw,2.25rem)] font-normal leading-tight text-white md:text-[1.75rem] md:leading-snug">
            {renderTextWithBold(t('donations.paragraph1'))}
          </p>
          <p className="text-base mt-8 text-left text-[clamp(1.5rem,3.2vw,2.25rem)] font-normal leading-tight text-white md:text-[1.75rem] md:leading-snug">
            {renderTextWithBold(t('donations.paragraph2'))}
          </p>
        </div>
        <div className="col-span-4 mt-4 max-w-xl text-center md:col-span-12 md:mt-12 md:max-w-3xl md:text-left">
          <a
            href="#sumate"
            className="inline-flex h-[3.25rem] items-center justify-center rounded-lg bg-white px-7 text-[clamp(1.05rem,2.4vw,1.5rem)] font-bold uppercase tracking-tight text-blue transition hover:bg-beige focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue"
            aria-label={t('donations.cta')}
          >
            {t('donations.cta')}
          </a>
        </div>
      </PageGrid>

      {/* Olas del fondo: solo en mobile (el asset es de 390px y no escala bien a anchos grandes). */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 w-[100%] -translate-x-1/2 md:hidden"
        aria-hidden
      >
        <div className="relative aspect-[1440/240] w-full min-w-[48rem]">
          <Image
            src="/images/donations/sea-waves.svg"
            alt=""
            fill
            className="object-contain object-bottom"
            sizes="100vw"
          />
        </div>
      </div>
    </section>
  );
}
