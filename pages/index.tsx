import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useTranslation } from '../hooks/useTranslation';
import Hero from '../components/hero';

interface HomeProps {
  timestamp: string;
}

export default function Home({ timestamp: _timestamp }: HomeProps) {
  const { t } = useTranslation();

  const handleHeroComplete = () => {
    // This will be called when the hero animation is skipped or completed
    // You can add logic here to show the rest of the page content
    console.log('Hero animation completed');
  };

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name="description" content={t('meta.description')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen">
        <Hero onComplete={handleHeroComplete} />
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
