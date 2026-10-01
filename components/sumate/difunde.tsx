import Image from 'next/image';
import { sendGAEvent } from '@next/third-parties/google';
import { useTranslation } from '../../hooks/useTranslation';
import { INSTAGRAM_HANDLE, instagramHref } from './sumate.data';
import { CtaLink, MarcoRasgado } from './ui';

/**
 * Las mismas URLs que el footer (components/layout/footer.tsx, docs/navegacion D2). Viven
 * duplicadas porque el footer las tiene como constantes privadas; si se mueven a un archivo de
 * datos compartido, este archivo debe importarlas de ahí.
 */
const REDES = {
  instagram: { href: 'https://www.instagram.com/las.fuertes/', nombre: 'Instagram' },
  linkedin: {
    href: 'https://www.linkedin.com/company/fundaci%C3%B3n-las-fuertes/',
    nombre: 'LinkedIn',
  },
} as const;

type Red = keyof typeof REDES;

/**
 * Enlace dentro del párrafo. `py-2 -my-2` sube el área táctil a 42 px (26 de la línea más 16)
 * sin mover el interlineado del párrafo.
 */
function EnlaceRed({ red }: { red: Red }) {
  const { href, nombre } = REDES[red];
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-difunde-red={red}
      onClick={() => sendGAEvent('event', `${red}_click`, { origen: 'difunde_texto' })}
      className="-my-2 inline-block rounded-sm py-2 font-bold text-blue underline underline-offset-4 transition hover:text-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue"
    >
      {nombre}
    </a>
  );
}

/** Parte el texto del locale por los marcadores `{instagram}` y `{linkedin}` y pone los enlaces. */
function textoConEnlaces(texto: string) {
  return texto.split(/(\{instagram\}|\{linkedin\})/).map((pieza, i) => {
    const red = pieza.slice(1, -1);
    if (red === 'instagram' || red === 'linkedin') return <EnlaceRed key={i} red={red} />;
    return pieza;
  });
}

/**
 * Figma `1300:1865` la deja como tarjeta de 495 px bajo el formulario. Lleva el marco rasgado
 * negro del modal del mapa en lugar de la tarjeta blanca redondeada (docs/sumate-drawer, D3).
 */
export default function Difunde() {
  const { t } = useTranslation();
  const href = instagramHref();

  return (
    <div className="relative mx-auto max-w-[31rem] px-6 py-xl text-center md:px-xxl">
      <MarcoRasgado tono="negro" grosor="fino" sombra relleno="bg-white/70" />
      <h3 className="relative text-[1.75rem] font-bold leading-tight tracking-[-0.04em] text-blue md:text-[2.5rem]">
        {t('sumate.difunde.title')}
      </h3>
      <span className="relative mx-auto mt-2 block h-[0.3125rem] w-full max-w-[10rem]">
        <Image
          src="/images/welcome/subtitle-underline.svg"
          alt=""
          fill
          className="object-contain object-center"
          sizes="160px"
        />
      </span>
      <p className="relative mt-m text-base leading-relaxed text-black">
        {textoConEnlaces(t('sumate.difunde.text'))}
      </p>
      {href && (
        <div className="relative mt-l">
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
