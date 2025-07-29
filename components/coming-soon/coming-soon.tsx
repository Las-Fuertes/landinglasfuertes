import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface HomeProps {
  timestamp: string;
}

export default function ComingSoon({ timestamp }: HomeProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('https://formspree.io/f/mqalerak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setSubmitStatus('idle');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', email: '', message: '' });
    setSubmitStatus('idle');
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Las Fuertes - Algo fuerte está en camino</title>
        <meta name="description" content="Estamos construyendo un espacio para que la Educación Menstrual Integral (EMI) marque un nuevo hito en Colombia." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💜</text></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet" />
      </Head>

      <main className="min-h-screen relative overflow-hidden">
        <Image
          src="/images/hero-background-desktop-min.jpg"
          alt="Las Fuertes - Educación menstrual en la naturaleza"
          fill
          style={{ objectFit: 'cover' }}
          priority
          quality={85}
          className="z-0"
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
        <div className="relative z-20 container mx-auto px-6 py-16 min-h-screen flex flex-col justify-center">
          <div className="max-w-4xl mx-auto text-center lg:text-left">

          <div className="mb-6 lg:mb-12 transform -rotate-1 space-y-1 text-center">
              <h1 className="text-brand-yellow text-[40px] lg:text-[82px] -mb-6 lg:-mb-16 font-bold">
                Algo fuerte está
              </h1>
              <h1 className="text-brand-yellow text-[40px] lg:text-[82px] mb-2 font-bold">
                en camino
              </h1>
            </div>

            <div className="transform space-y-1 text-center mb-[10vh] font-semibold lg:font-normal">
              <div className="inline-block bg-brand-yellow px-2 lg:px-4 py-0">
                <p className="text-brand-blue text-[16px] lg:text-[40px] leading-1">
                  Aunque aún no puedas verlo, lo que viene
                </p>
              </div>
              <div className="inline-block bg-brand-yellow px-6 lg:px-10 py-0">
                <p className="text-brand-blue text-[16px] lg:text-[40px]">
                  será una sorpresa increíble.
                </p>
              </div>
            </div>

            <div className="text-white lg:space-y-4 max-w-xl mx-auto text-left lg:text-center">
              <p className="text-md lg:text-xl leading-relaxed">
                Estamos construyendo un espacio para que la{' '}
                <span className="font-bold italic">
                  Educación Menstrual Integral (EMI)
                </span>{' '}
                marque un nuevo hito en&nbsp;Colombia.
              </p>

              <p className="text-base lg:text-lg leading-relaxed opacity-90 mb-4 lg:mb-0">
                Desde 2021, Las Fuertes ha creado espacios seguros donde la
                información rompe barreras de silencio y transforma vidas.
              </p>

              <p className="text-md lg:text-xl font-semibold">
                Gracias por estar aquí. Síguenos y sé parte del cambio.
              </p>
            </div>

            <div className="mt-12 text-center">
              <button
                onClick={openModal}
                className="bg-brand-pink rounded hover:bg-pink-400 text-white px-8 py-2 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-300 text-lg lg:text-xl"
              >
                Quiero ser parte del cambio
              </button>
              <p className="text-white text-sm opacity-75 mt-1">
                Contáctanos y únete a la revolución de EMI
              </p>
            </div>
          </div>
        </div>

        <div className="hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-70 z-20">
          {isMounted && `Generado el ${new Date(timestamp).toLocaleString('es-CO')}`}
        </div>

        {/* Modal */}
        {isMounted && isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={closeModal}
            ></div>
            {/* Modal Content */}
            <div className="relative bg-white rounded shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-brand-blue">
                  Contáctanos
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {submitStatus === 'success' ? (
                  <div className="text-center">
                    <div className="text-green-600 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      ¡Mensaje enviado!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Gracias por contactarnos. Te responderemos pronto.
                    </p>
                    <button 
                      onClick={() => setSubmitStatus('idle')}
                      className="w-full bg-brand-pink rounded hover:bg-pink-400 text-white font-bold py-3 px-6 transition-colors text-xl"
                    >
                      Enviar otro mensaje
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 mb-6 lg:text-center">
                      Cuéntanos qué te interesa sobre Las Fuertes o la Educación Menstrual Integral
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                          placeholder="¿Cómo te llamas?"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                          Correo electrónico *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                          placeholder="tu@correo.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-gray-700 text-sm font-medium mb-2">
                          Mensaje *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={4}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all resize-none"
                          placeholder="Cuéntanos qué te interesa sobre Las Fuertes o EMI..."
                        />
                      </div>

                      {submitStatus === 'error' && (
                        <div className="bg-red-50 text-red-800 p-4 rounded-lg text-center">
                          <p>Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-brand-pink hover:bg-pink-400 disabled:bg-pink-400 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-300 disabled:transform-none text-xl"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enviando...
                          </span>
                        ) : (
                          'Enviar mensaje'
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      timestamp: new Date().toISOString(),
    },
  };
};
