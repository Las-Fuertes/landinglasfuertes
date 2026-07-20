import { useTranslation } from '../../hooks/useTranslation';
import { SEDE_LOCATION, buildWhatsAppHref } from './sumate.data';
import { CtaLink, DisabledCta } from './ui';

const ITEM_KEYS = [
  'sumate.especie.item1',
  'sumate.especie.item2',
  'sumate.especie.item3',
  'sumate.especie.item4',
] as const;

export default function DonarCosas() {
  const { t } = useTranslation();
  const especieHref = buildWhatsAppHref(t('sumate.especie.whatsappMessage'));
  const ropaHref = buildWhatsAppHref(t('sumate.llegue.whatsappMessage'));

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h4 className="text-[1.15rem] font-bold leading-tight text-black">
          {t('sumate.especie.title')}
        </h4>
        <p className="mt-3 leading-relaxed text-black">{t('sumate.especie.text')}</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 leading-relaxed text-black">
          {ITEM_KEYS.map(key => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
        <div className="mt-5">
          {especieHref ? (
            <CtaLink href={especieHref} target="_blank" rel="noopener noreferrer">
              {t('sumate.especie.cta')}
            </CtaLink>
          ) : (
            <DisabledCta>{t('sumate.whatsappUnavailable')}</DisabledCta>
          )}
        </div>
      </div>

      <div className="border-t border-black/10 pt-8 md:border-l md:border-t-0 md:pl-8 md:pt-0">
        <h4 className="text-[1.15rem] font-bold leading-tight text-black">
          {t('sumate.llegue.title')}
        </h4>
        <p className="mt-3 leading-relaxed text-black">{t('sumate.llegue.text')}</p>
        <p className="mt-3 leading-relaxed text-black">{t('sumate.llegue.donateNote')}</p>
        <p className="mt-3 text-[0.95rem] text-black/70">
          <strong>{t('sumate.llegue.locationLabel')}</strong> {SEDE_LOCATION}
        </p>
        <div className="mt-5">
          {ropaHref ? (
            <CtaLink href={ropaHref} target="_blank" rel="noopener noreferrer">
              {t('sumate.llegue.cta')}
            </CtaLink>
          ) : (
            <DisabledCta>{t('sumate.whatsappUnavailable')}</DisabledCta>
          )}
        </div>
      </div>
    </div>
  );
}
