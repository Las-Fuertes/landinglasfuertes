import { useTranslation } from '../../hooks/useTranslation';
import { INSTAGRAM_HANDLE, instagramHref } from './sumate.data';
import { CtaLink } from './ui';

export default function Difunde() {
  const { t } = useTranslation();
  const href = instagramHref();

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h3 className="text-[1.4rem] font-bold leading-tight text-black">
        {t('sumate.difunde.title')}
      </h3>
      <p className="mt-3 leading-relaxed text-black">{t('sumate.difunde.text')}</p>
      {href && (
        <div className="mt-6">
          <CtaLink href={href} target="_blank" rel="noopener noreferrer">
            {t('sumate.difunde.cta')}{' '}
            {INSTAGRAM_HANDLE.startsWith('@') ? INSTAGRAM_HANDLE : `@${INSTAGRAM_HANDLE}`}
          </CtaLink>
        </div>
      )}
    </div>
  );
}
