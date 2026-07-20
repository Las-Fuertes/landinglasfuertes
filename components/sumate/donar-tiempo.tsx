import { useTranslation } from '../../hooks/useTranslation';
import { buildWhatsAppHref } from './sumate.data';
import { CtaLink, DisabledCta } from './ui';

const ROLE_KEYS = [
  'sumate.voluntariado.role1',
  'sumate.voluntariado.role2',
  'sumate.voluntariado.role3',
  'sumate.voluntariado.role4',
] as const;

export default function DonarTiempo() {
  const { t } = useTranslation();
  const whatsappHref = buildWhatsAppHref(t('sumate.voluntariado.whatsappMessage'));

  return (
    <div>
      <h4 className="text-[1.15rem] font-bold leading-tight text-black">
        {t('sumate.voluntariado.title')}
      </h4>
      <p className="mt-3 leading-relaxed text-black">{t('sumate.voluntariado.text')}</p>
      <ul className="mt-3 grid gap-2 md:grid-cols-2">
        {ROLE_KEYS.map(key => (
          <li
            key={key}
            className="rounded-xl border border-black/10 bg-beige px-4 py-3 leading-snug text-black"
          >
            {t(key)}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[0.95rem] text-black/70">{t('sumate.voluntariado.commitment')}</p>
      <div className="mt-5">
        {whatsappHref ? (
          <CtaLink href={whatsappHref} target="_blank" rel="noopener noreferrer">
            {t('sumate.voluntariado.cta')}
          </CtaLink>
        ) : (
          <DisabledCta>{t('sumate.whatsappUnavailable')}</DisabledCta>
        )}
      </div>
    </div>
  );
}
