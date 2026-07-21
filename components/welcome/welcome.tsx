'use client';

import Image from 'next/image';
import { Homemade_Apple } from 'next/font/google';
import { PageGrid } from '../layout/page-grid';
import { useTranslation } from '../../hooks/useTranslation';
import { renderTextWithBold } from '../../lib/render-text-with-bold';

const homemadeApple = Homemade_Apple({
  subsets: ['latin'],
  weight: ['400'],
});

export default function WelcomeSection() {
  const { t } = useTranslation();

  return (
    <section className="relative w-full pb-16 pt-10" aria-labelledby="welcome-title">
      <PageGrid className="mb-10">
        <div className="relative col-span-4 mx-auto flex min-h-[9rem] w-full max-w-lg items-start justify-center md:col-span-12">
          {/* Left cloud — ~25% past left edge; ~24px below vertical center */}
          <div
            className="pointer-events-none absolute left-0 top-1/2 z-0 w-[clamp(5.5rem,38vw,9rem)] -translate-x-[50%] translate-y-[calc(-50%+24px)]"
            aria-hidden
          >
            <div className="relative aspect-[154/65] w-full">
              <Image
                src="/images/welcome/left-cloud.svg"
                alt=""
                fill
                className="object-contain object-left"
                sizes="(max-width: 768px) 38vw, 9rem"
              />
            </div>
          </div>

          {/* Sun */}
          <div className="relative z-10 mx-auto w-[clamp(6.5rem,42vw,9rem)] shrink-0">
            <div className="relative aspect-[147/141] w-full">
              <Image
                src="/images/welcome/pink-sun.svg"
                alt=""
                fill
                className="object-contain"
                sizes="(max-width: 768px) 42vw, 9rem"
                priority
              />
            </div>
          </div>

          {/* Right cloud — ~10% past right edge; ~24px above vertical center */}
          <div
            className="pointer-events-none absolute right-0 top-1/2 z-0 w-[clamp(5rem,34vw,8rem)] translate-x-[40%] translate-y-[calc(-50%-24px)]"
            aria-hidden
          >
            <div className="relative aspect-[110/45] w-full">
              <Image
                src="/images/welcome/right-cloud.svg"
                alt=""
                fill
                className="object-contain object-right"
                sizes="(max-width: 768px) 34vw, 8rem"
              />
            </div>
          </div>
        </div>
      </PageGrid>

      <PageGrid>
        <div className="col-span-4 mx-auto w-full max-w-md text-center md:col-span-12 md:max-w-2xl">
          <h2
            id="welcome-title"
            className="text-[40px] font-bold leading-none text-black md:text-[52px]"
          >
            <span className="block">{t('welcome.titleLine1')}</span>
            <span className="block">{t('welcome.titleLine2')}</span>
          </h2>

          <p
            className={`${homemadeApple.className} mt-7 text-[clamp(1rem,4vw,1.125rem)] font-normal leading-snug text-blue lg:text-[1.4rem]`}
          >
            {t('welcome.subtitle')}
          </p>

          <div className="relative mx-auto mt-3 h-[6px] w-full max-w-[220px]">
            <Image
              src="/images/welcome/subtitle-underline.svg"
              alt=""
              fill
              className="object-contain object-center"
              sizes="220px"
            />
          </div>

          <p className="mt-8 text-left text-[16px] font-normal leading-tight text-black md:text-center md:text-[19px] md:leading-snug lg:text-[22px]">
            {renderTextWithBold(t('welcome.body'))}
          </p>
        </div>
      </PageGrid>

      {/* Full width: section has no horizontal padding; grid uses 40px inset above.
          Capped on desktop so the illustration doesn't blow up on wide screens. */}
      <div className="relative mt-10 w-full">
        <div
          className="relative mx-auto w-full max-w-[1400px] lg:max-w-[720px]"
          style={{ aspectRatio: '390 / 244' }}
        >
          <Image
            src="/images/welcome/beach-woman.png"
            alt=""
            fill
            className="object-cover object-bottom"
            sizes="(max-width: 768px) 100vw, 28rem"
          />
        </div>
      </div>

      <PageGrid className="mt-36 md:mt-16">
        <div
          className="col-span-4 md:col-span-10 md:col-start-2"
          role="region"
          aria-labelledby="welcome-emi-title"
        >
          <div className="flex flex-col items-center text-center">
            <div className="relative mx-auto aspect-[123/59] w-full max-w-[7.6875rem] shrink-0">
              <Image
                src="/images/welcome/emi-dove.svg"
                alt="EMI"
                fill
                className="object-contain"
                sizes="154px"
              />
            </div>
            <h3
              id="welcome-emi-title"
              className="mt-6 text-center text-[clamp(1.25rem,4vw,1.75rem)] font-bold leading-tight text-black md:mt-8 lg:text-[2rem]"
            >
              {t('welcome.emiTitle')}
            </h3>
          </div>
          <p className="mx-auto mt-6 max-w-3xl text-left text-[16px] font-normal leading-tight text-black md:mt-8 md:text-[18px] md:leading-snug lg:text-[20px]">
            {renderTextWithBold(t('welcome.emiParagraph1'))}
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-left text-[16px] font-normal leading-tight text-black md:text-[18px] md:leading-snug lg:text-[20px]">
            {renderTextWithBold(t('welcome.emiParagraph2'))}
          </p>
        </div>
      </PageGrid>
    </section>
  );
}
