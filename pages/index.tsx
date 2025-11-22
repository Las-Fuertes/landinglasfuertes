import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useTranslation } from '../hooks/useTranslation';
import ComingSoon from '../components/coming-soon/coming-soon';

interface HomeProps {
  timestamp: string;
}

export default function Home({ timestamp }: HomeProps) {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name="description" content={t('meta.description')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <ComingSoon timestamp={timestamp} />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const now = new Date();

  return {
    props: {
      timestamp: now.toLocaleString('es-CO'),
    },
  };
};
