import { useTranslation } from '../../hooks/useTranslation';

export default function SumateHero() {
  const { t } = useTranslation();

  return (
    <div className="text-center">
      <h2
        id="sumate-title"
        className="text-[38px] font-bold leading-[1.22] tracking-tight text-blue"
      >
        {t('sumate.hero.title')}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-[1.1rem] leading-relaxed text-black">
        {t('sumate.hero.subtitle')}
      </p>
    </div>
  );
}
