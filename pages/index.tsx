import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

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
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Bienvenido a Las Fuertes
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                This page was server-side rendered at: {new Date(timestamp).toLocaleString()}
              </p>
          </div>
        </div>
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
