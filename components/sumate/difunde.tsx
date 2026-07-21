import Image from 'next/image';
import { sendGAEvent } from '@next/third-parties/google';
import { useTranslation } from '../../hooks/useTranslation';
import { INSTAGRAM_HANDLE, instagramHref } from './sumate.data';
import { CtaLink } from './ui';

export default function Difunde() {
  const { t } = useTranslation();
  const href = instagramHref();

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-black/10 bg-white px-6 py-10 text-center shadow-md md:max-w-3xl md:px-12 md:py-12">
      <h3 className="text-[1.4rem] font-bold leading-tight text-blue md:text-[2rem]">
        {t('sumate.difunde.title')}
      </h3>
      <span className="relative mx-auto mt-2 block h-[5px] w-full max-w-[160px]">
        <Image
          src="/images/welcome/subtitle-underline.svg"
          alt=""
          fill
          className="object-contain object-center"
          sizes="160px"
        />
      </span>
      <p className="mt-3 leading-relaxed text-black md:mt-4 md:text-[1.1rem]">
        {t('sumate.difunde.text')}
      </p>
      {href && (
        <div className="mt-6">
          <CtaLink
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sendGAEvent('event', 'instagram_click', { origen: 'difunde' })}
          >
            {t('sumate.difunde.cta')}{' '}
            {INSTAGRAM_HANDLE.startsWith('@') ? INSTAGRAM_HANDLE : `@${INSTAGRAM_HANDLE}`}
          </CtaLink>
        </div>
      )}
    </div>
  );
}
