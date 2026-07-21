import Image from 'next/image';
import { useTranslation } from '../../hooks/useTranslation';

export default function SumateHero() {
  const { t } = useTranslation();

  return (
    <div className="text-center">
      <h2
        id="sumate-title"
        className="text-[38px] font-bold leading-[1.22] tracking-tight text-blue md:text-[48px]"
      >
        {t('sumate.hero.title')}
      </h2>
      <div className="relative mx-auto mt-3 h-[6px] w-full max-w-[260px]">
        <Image
          src="/images/welcome/subtitle-underline.svg"
          alt=""
          fill
          className="object-contain object-center"
          sizes="260px"
        />
      </div>
      <p className="mx-auto mt-5 max-w-xl text-[1.1rem] leading-relaxed text-black md:max-w-2xl md:text-[1.25rem]">
        {t('sumate.hero.subtitle')}
      </p>
    </div>
  );
}
