import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from '../hooks/useTranslation';
import { PageGrid } from '../components/layout/page-grid';

/** 404 traducida (docs/auditoria, S11 y A8): el idioma sale del prefijo de la URL. */
export default function NotFound() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{`${t('notFound.title')} · Las Fuertes`}</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main
        id="contenido"
        tabIndex={-1}
        className="flex min-h-dvh items-center bg-beige py-xxl text-black outline-none"
      >
        <PageGrid>
          <div className="col-span-4 md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3">
            <h1 className="text-h1 font-bold leading-tight tracking-[-0.04em]">
              {t('notFound.heading')}
            </h1>
            <p className="mt-m text-h4 leading-relaxed">{t('notFound.text')}</p>
            <Link
              href="/"
              className="mt-l inline-block rounded-md bg-black px-l py-s font-bold text-papel focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              {t('notFound.home')}
            </Link>
          </div>
        </PageGrid>
      </main>
    </>
  );
}
