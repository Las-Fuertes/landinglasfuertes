import { useTranslation } from '../../hooks/useTranslation';
import { Resaltado } from '../layout/resaltado';

/**
 * Cabecera del formulario (Figma `1300:1865`, docs/sumate-drawer/DECISIONES.md, D3): el título en
 * la cinta negra del sitio con su giro de Figma (-1,26°) y el párrafo de EMI debajo. El cielo de
 * garabatos que la rodea vive en `sumate-contenido.tsx`.
 */
export default function SumateHero() {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col items-center">
      <h2
        id="sumate-title"
        className="text-center text-[2.125rem] font-bold leading-[1.2] tracking-[-0.04em] md:text-[2.75rem] lg:text-[3.25rem]"
      >
        <Resaltado tono="negro" giro={-1.26}>
          {t('sumate.hero.title')}
        </Resaltado>
      </h2>
      <p className="mt-xl max-w-[40rem] text-base leading-normal text-black md:text-h4">
        {t('sumate.hero.subtitle')}
      </p>
    </div>
  );
}
