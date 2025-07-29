import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import ComingSoon from '../components/coming-soon/coming-soon';

interface HomeProps {
  timestamp: string;
}

export default function Home({ timestamp }: HomeProps) {
  return (
    <>
      <Head>
        <title>Las Fuertes</title>
        <meta name="description" content="Amazing landing page with SSR" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <ComingSoon timestamp={timestamp} />
      </main>
    </>
  );
}

// This function runs on the server for each request
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      timestamp: new Date().toISOString(),
    },
  };
};
