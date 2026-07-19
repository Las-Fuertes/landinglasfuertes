'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { renderTextWithBold } from '../../lib/render-text-with-bold';
import { PageGrid } from '../layout/page-grid';
import { WelcomeSection } from '../welcome';
import { PrinciplesSection } from '../principles';
import { DonationsSection } from '../donations';
import Image from 'next/image';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroProps {
  onComplete?: () => void;
}

export default function Hero({ onComplete }: HeroProps) {
  const { t } = useTranslation();
  const [showSkip, setShowSkip] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);
  /** Oculta el hint "SCROLL" tras el primer scroll; se resetea al recargar la página. */
  const [scrollHintVisible, setScrollHintVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const redCircleRef = useRef<HTMLDivElement>(null);

  // Check if user has visited before
  useEffect(() => {
    const hasVisited = localStorage.getItem('las-fuertes-visited');
    if (hasVisited) {
      setShowSkip(true);
    } else {
      localStorage.setItem('las-fuertes-visited', 'true');
    }
  }, []);

  // Primer scroll en la página: fade out del indicador SCROLL (solo en memoria; vuelve al refrescar)
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 8) {
        setScrollHintVisible(false);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // GSAP ScrollTrigger animations
  useEffect(() => {
    if (skipAnimation) return;

    const ctx = gsap.context(() => {
      if (!redCircleRef.current) return;

      // CV1 queda QUIETO en su sitio (posición y tamaño vienen del CSS). No lo anima GSAP en S1.

      // Section 1: Bottom hand animation
      // Moves like a clock hand from ~3 o'clock to 6 o'clock while fading out to the left.
      // On scroll up, the scrubbed animation naturally reverses (6 -> 3) back to its initial pose.
      gsap.fromTo(
        '.hand-bottom',
        {
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          // Usamos el punto más alto de la manga como pivote aproximado
          // para que la punta de la mano nunca se “salga” visualmente.
          transformOrigin: '25% 15%',
        },
        {
          // Arc-style movement (3 -> 6 en un reloj) + salida hacia la izquierda
          x: '-40%', // se desplaza hacia la izquierda
          y: '-10%', // un poco hacia arriba para dar la sensación de arco
          rotation: 90, // gira como manecilla de reloj de 3 a 6
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: section1Ref.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );

      // ───────── PUNTO VIAJERO (CV1) ─────────
      // CV1 se queda QUIETO en su sitio (viewport 50%, 47%) durante toda S1 y "aterriza" haciendo crossfade
      // a un círculo REAL del techo de S2 (.s2-landing), que ya hace scroll con la sección y se queda atrás.
      const vw = () => window.innerWidth;
      const vh = () => window.innerHeight;
      const REST_FILTER = 'hue-rotate(0deg) saturate(1) brightness(1)';

      // CV1 es GRANDE en S1 y ENCOGE a su tamaño base (44px = .s2-landing) justo cuando .s2-landing sube
      // hasta la posición de CV1 (47%). Así, al relevar, ambos coinciden en tamaño (sin salto).
      gsap.fromTo(
        '.cv1-inner',
        { scale: 2.16 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.s2-landing',
            start: 'center bottom',
            end: 'center 47%',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );

      // El relevo con .s2-landing (mismo punto, mismo tamaño) se dispara EXACTAMENTE cuando .s2-landing sube
      // y pasa por la posición de CV1 (su centro a 47% del viewport). Así no hay salto: el punto "suelta" y
      // .s2-landing se va con el scroll.
      ScrollTrigger.create({
        trigger: '.s2-landing',
        start: 'center 47%',
        onEnter: () => {
          gsap.set(redCircleRef.current, { opacity: 0 });
          gsap.set('.s2-landing', { opacity: 1 });
        },
        onLeaveBack: () => {
          gsap.set(redCircleRef.current, { opacity: 1 });
          gsap.set('.s2-landing', { opacity: 0 });
        },
      });

      // Monstruo de S2: la mirada empieza ARRIBA y, al avanzar el scroll, gira hacia la IZQUIERDA hasta
      // mirar ABAJO (pivote en su base derecha para que no se corte).
      gsap.fromTo(
        '.splash-eye',
        { rotation: 16 },
        {
          rotation: -24,
          transformOrigin: '82% 92%',
          ease: 'none',
          scrollTrigger: {
            trigger: section2Ref.current,
            start: 'top center',
            end: 'bottom center',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );

      // Section 2 opacity - aparece cuando entra en el viewport
      if (section2Ref.current) {
        gsap.fromTo(
          section2Ref.current,
          {
            opacity: 0,
          },
          {
            opacity: 1,
            scrollTrigger: {
              trigger: section2Ref.current,
              start: 'top bottom', // Empieza cuando el top de section2 llega al bottom del viewport
              end: 'top center', // Termina cuando el top de section2 está en el center del viewport
              scrub: 1,
            },
          }
        );
      }

      // Splash monster: solo fade-in al llegar a la sección, sin parpadeo
      gsap.to('.splash-monster', {
        opacity: 1,
        scrollTrigger: {
          trigger: section2Ref.current,
          start: 'top center',
          end: 'bottom center',
          toggleActions: 'play none none reverse',
        },
      });

      // Section 3 opacity - aparece cuando entra en el viewport
      if (section3Ref.current) {
        gsap.fromTo(
          section3Ref.current,
          {
            opacity: 0,
          },
          {
            opacity: 1,
            scrollTrigger: {
              trigger: section3Ref.current,
              start: 'top bottom', // Empieza cuando el top de section3 llega al bottom del viewport
              end: 'top center', // Termina cuando el top de section3 está en el center del viewport
              scrub: 1,
            },
          }
        );
      }

      // Tramo FINAL de S3: las burbujas suben y se tiñen de azul marino. Animación DISPARADA al llegar
      // al final (no pegada al scroll), reproducida una sola vez. Color por hue-rotate NEGATIVO
      // (rojo→morado→azul, NUNCA verde) y rápido al inicio de la subida.
      const NAVY = 'hue-rotate(-140deg) saturate(1.3) brightness(0.8)';
      const riseTL = gsap.timeline({ paused: true });
      riseTL.fromTo(
        '.s3-bubble',
        { filter: REST_FILTER },
        { filter: NAVY, duration: 0.4, ease: 'power1.out' },
        0
      );
      riseTL.to(
        '.s3-bubble',
        { y: () => -0.6 * vh(), opacity: 0, duration: 2.8, ease: 'power1.in' },
        0
      );

      // El pez koi nada hacia la IZQUIERDA y se va junto con las burbujas. Al devolverse, NO revierte
      // por la izquierda: reaparece entrando DESDE LA DERECHA (su lado natural) y nada de vuelta.
      const koiAway = () => {
        const tl = gsap.timeline({ delay: 0.35 });
        // Nada hacia la izquierda + SUBE un poco (para que no se corte abajo) + gira fuerte (más horizontal).
        // Sin fade: sale de cuadro nadando.
        tl.to(
          '.koi',
          {
            x: () => -1.3 * vw(),
            y: () => -0.14 * vh(),
            rotation: 85,
            duration: 1.6,
            ease: 'power1.in',
            overwrite: 'auto',
          },
          0
        );
        // CRECE desde la mitad de la animación (sensación más realista).
        tl.fromTo('.koi', { scale: 1 }, { scale: 1.4, duration: 0.8, ease: 'power1.out' }, 0.8);
        return tl;
      };
      const koiBackFromRight = () =>
        gsap.fromTo(
          '.koi',
          { x: () => 1.3 * vw(), y: () => -0.14 * vh(), rotation: 85, scale: 1.4 },
          {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 1.2,
            ease: 'power2.out',
            overwrite: 'auto',
          }
        );

      ScrollTrigger.create({
        trigger: section3Ref.current,
        start: 'bottom 70%', // un poco más tarde, para que no suban demasiado pronto
        onEnter: () => {
          riseTL.play();
          koiAway();
        },
        onLeaveBack: () => {
          riseTL.reverse();
          koiBackFromRight();
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [skipAnimation]);

  // Skip animation handler — show welcome-only view; scroll to top
  const handleSkip = () => {
    setSkipAnimation(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 1500);
  };

  // Red circle: float + slow spin on the motion.div child (GSAP scales the outer wrapper)

  if (skipAnimation) {
    return (
      <div className="min-h-screen bg-beige">
        <WelcomeSection />
        <PrinciplesSection />
        <DonationsSection />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative bg-beige overflow-x-hidden">
      {/* Skip Button */}
      {showSkip && (
        <motion.button
          onClick={handleSkip}
          className="fixed right-page-margin top-4 z-50 rounded-full bg-white/80 px-4 py-2 text-[16px] font-medium text-gray-700 shadow-lg backdrop-blur-sm transition-colors hover:bg-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {t('hero.skip')}
        </motion.button>
      )}

      {/* Section 1: Initial State with Hands */}
      <motion.div
        ref={section1Ref}
        className="relative isolate min-h-screen flex items-center justify-center"
      >
        {/* CV1 — punto quieto en S1 (centrado en viewport 50%/47%). Grande en S1; encoge a 44px (tamaño de
            .s2-landing) justo al llegar al techo de S2. El scale lo hace GSAP sobre .cv1-inner. */}
        <div
          ref={redCircleRef}
          className="red-circle-main fixed z-0"
          style={{ top: '47%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 1 }}
        >
          <div className="cv1-inner relative h-[44px] w-[44px]">
            {/* Rotación lenta y continua sobre su eje central (Framer en hijo; GSAP escala el padre) */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            >
              <Image
                src="/images/hero/red-circle-2.svg"
                alt="Red circle"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          </div>
        </div>

        {/* Top Hand - Snapped to top-right corner */}
        <motion.div
          className="hand-top absolute top-0 right-0 z-10"
          style={{
            margin: 0,
            padding: 0,
            width: '480px',
            height: '480px',
          }}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src="/images/hero/hand-top.svg"
            alt="Hand top"
            fill
            className="object-contain"
            style={{ objectPosition: 'right top' }}
          />
        </motion.div>

        {/* Bottom Hand - Snapped to bottom-left edge, same size as top */}
        <motion.div
          className="hand-bottom absolute bottom-0 left-0 z-10"
          style={{
            margin: 0,
            padding: 0,
            width: '384px',
            height: '384px',
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src="/images/hero/hand-bottom.svg"
            alt="Hand bottom"
            fill
            className="object-contain"
            style={{ objectPosition: 'left bottom' }}
          />
        </motion.div>

        {/* Text Content - 16px, right-aligned, positioned slightly below center */}
        <motion.div
          className="relative z-30 w-full"
          style={{
            position: 'absolute',
            top: '58%',
            left: 0,
            right: 0,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <PageGrid>
            <div className="col-span-4 md:col-span-12">
              <h1
                className="ml-auto max-w-2xl text-right text-[16px] font-normal leading-tight text-gray-900"
                style={{ marginTop: 0, marginBottom: 0 }}
              >
                {renderTextWithBold(t('hero.section1.text1'))}
                <br />
                {renderTextWithBold(t('hero.section1.text2'))}
                <br />
                {renderTextWithBold(t('hero.section1.text3'))}
              </h1>
            </div>
          </PageGrid>
        </motion.div>

        {/* Scroll Indicator - Bottom-right corner; desaparece al primer scroll */}
        <motion.div
          className="pointer-events-none absolute bottom-8 right-page-margin z-30 flex flex-col items-center gap-2 md:bottom-12"
          initial={{ opacity: 0 }}
          animate={{
            opacity: scrollHintVisible ? 1 : 0,
          }}
          transition={{
            opacity: {
              duration: scrollHintVisible ? 0.6 : 0.45,
              delay: scrollHintVisible ? 0.6 : 0,
              ease: 'easeOut',
            },
          }}
        >
          <span className="text-[16px] text-gray-500 uppercase tracking-wider font-medium">
            SCROLL
          </span>
          <motion.div
            animate={scrollHintVisible ? { y: [0, 8, 0] } : { y: 0 }}
            transition={{
              duration: 1.5,
              repeat: scrollHintVisible ? Infinity : 0,
              ease: 'easeInOut',
            }}
          >
            <ChevronDown className="w-5 h-5 text-gray-500" strokeWidth={2} />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Section 2 — recorte en X: ventana estrecha + translateX (no clip-path arriba/abajo) */}
      <motion.div
        ref={section2Ref}
        className="relative flex min-h-screen items-center py-10"
        style={{ opacity: 0 }}
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {/* 1 · Grande: snap izquierda; ~30% del ancho cortado por la izquierda (overflow + translateX negativo) */}
          <div className="absolute left-0 top-6 overflow-hidden h-[clamp(6.3rem,22.4vw,9.1rem)] w-[clamp(4.41rem,15.68vw,6.37rem)]">
            <div className="relative h-full w-[clamp(6.3rem,22.4vw,9.1rem)] max-w-none -translate-x-[30%]">
              <div className="relative h-full w-full">
                <Image
                  src="/images/hero/red-circle-2.svg"
                  alt=""
                  fill
                  sizes="140px"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
          {/* 2 · Mediano: snap derecha; ~20% del ancho cortado por la derecha */}
          <div className="absolute right-0 top-[10%] flex h-[clamp(3.25rem,12vw,5rem)] justify-end overflow-hidden sm:top-[12%] w-[clamp(2.6rem,9.6vw,4rem)]">
            <div className="relative h-full w-[clamp(3.25rem,12vw,5rem)] shrink-0 translate-x-[20%]">
              <div className="relative h-full w-full">
                <Image
                  src="/images/hero/red-circle-1.svg"
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
          {/* 3 · Pequeño sobre el bloque de texto (centro-izquierda) */}
          <div className="absolute left-[34%] top-[22%] h-[clamp(2rem,7vw,2.75rem)] w-[clamp(2rem,7vw,2.75rem)] sm:left-[36%] sm:top-[24%]">
            <div className="relative h-full w-full">
              <Image
                src="/images/hero/red-circle-1.svg"
                alt=""
                fill
                sizes="44px"
                className="object-contain"
              />
            </div>
          </div>
          {/* 4 · Pequeño abajo-izquierda */}
          <div className="absolute bottom-[28%] left-5 h-[clamp(1.75rem,6vw,2.25rem)] w-[clamp(1.75rem,6vw,2.25rem)] sm:bottom-[30%] sm:left-8">
            <div className="relative h-full w-full">
              <Image
                src="/images/hero/red-circle-2.svg"
                alt=""
                fill
                sizes="36px"
                className="object-contain"
              />
            </div>
          </div>
          {/* 5 · Mediano: al FINAL de la sección 2 (movido desde S3) */}
          <div className="absolute bottom-[8%] left-[24%] h-[clamp(2.75rem,10vw,4rem)] w-[clamp(2.75rem,10vw,4rem)]">
            <div className="relative h-full w-full">
              <Image
                src="/images/hero/red-circle-1.svg"
                alt=""
                fill
                sizes="64px"
                className="object-contain"
              />
            </div>
          </div>
          {/* 6 · Pequeño: al FINAL de la sección 2 (movido desde S3) */}
          <div className="absolute bottom-[14%] left-[46%] h-[clamp(1.75rem,6vw,2.25rem)] w-[clamp(1.75rem,6vw,2.25rem)]">
            <div className="relative h-full w-full">
              <Image
                src="/images/hero/red-circle-2.svg"
                alt=""
                fill
                sizes="36px"
                className="object-contain"
              />
            </div>
          </div>
          {/* CV1 aterriza aquí: mismo tamaño y centro-X que CV1. Oculto hasta el relevo; luego scroll natural → se va atrás. */}
          <div className="s2-landing absolute left-[50%] top-[10%] h-[44px] w-[44px] -translate-x-1/2 -translate-y-1/2 opacity-0">
            <div className="relative h-full w-full">
              <Image
                src="/images/hero/red-circle-2.svg"
                alt=""
                fill
                sizes="44px"
                className="object-contain"
              />
            </div>
          </div>
          {/* Splash: snap abajo-derecha; ~15% del ancho cortado por la derecha (no por abajo) */}
          <div
            className="splash-monster absolute bottom-0 right-0 flex items-end justify-end opacity-0"
            style={{
              width: 'calc(0.85 * min(16.5rem, calc(100vw - 2.5rem)))',
              height: 'min(16.5rem, calc(100vw - 2.5rem))',
            }}
          >
            <div
              className="relative shrink-0 translate-x-[15%]"
              style={{
                width: 'min(16.5rem, calc(100vw - 2.5rem))',
                height: 'min(16.5rem, calc(100vw - 2.5rem))',
              }}
            >
              <div className="splash-eye relative h-full w-full">
                <Image
                  src="/images/hero/splash-monster.svg"
                  alt=""
                  fill
                  sizes="(max-width:768px) 264px, 280px"
                  className="object-contain object-right-bottom"
                />
              </div>
            </div>
          </div>
        </div>

        <PageGrid className="relative z-10 pt-4">
          <div className="col-span-4 max-w-md md:col-span-12">
            <h2 className="text-left text-[16px] font-normal leading-snug text-gray-900">
              {renderTextWithBold(t('hero.section2.paragraph'))}
            </h2>
          </div>
        </PageGrid>
      </motion.div>

      {/* Section 3 */}
      <motion.div
        ref={section3Ref}
        className="relative flex min-h-[64vh] items-center py-10 mb-[calc(30vh_-_100px)]"
        style={{ opacity: 0 }}
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {/* blue-fish-vertical (pez koi): abajo-derecha, VERTICAL en reposo. Asoma ~18% por la derecha
              (lo recorta la SECCIÓN con su overflow-hidden, no una caja propia). Al animar (koiAway) se
              mueve a la izquierda → SALE completo → se va. Así no se recorta cuando se mueve. */}
          <div
            className="koi absolute right-0 bottom-[calc(3%_-_40px)]"
            style={{
              width: 'clamp(12.5rem, 56vw, 25rem)',
              height: 'clamp(18rem, 55vw, 28rem)',
            }}
          >
            {/* Recorte EN REPOSO: empuja el pez ~18% fuera por la derecha (lo recorta la sección) */}
            <div className="relative h-full w-full translate-x-[18%]">
              {/* Nado sutil en reposo (leve balanceo + flotación) */}
              <motion.div
                className="relative h-full w-full"
                style={{ transformOrigin: '50% 85%' }}
                animate={{ rotate: [0, 2.5, 0, -2.5, 0], y: [0, -5, 0, 4, 0], x: [0, 3, 0, -3, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image
                  src="/images/hero/blue-fish-vertical.svg"
                  alt=""
                  fill
                  sizes="400px"
                  className="object-contain object-right-bottom"
                />
              </motion.div>
            </div>
          </div>

          {/* Círculos rojos — mismo patrón que la Sección 2 (mezcla grandes recortados / pequeños visibles).
              Repartidos arriba/abajo a la izquierda (lejos del koi a la derecha y del texto centrado), bien separados.
              .s3-bubble: al hacer scroll por la sección se vuelven azules y suben como burbujas. */}
          {/* 1 · Grande (futura burbuja, abajo): snap izquierda; ~30% cortado por la izquierda */}
          <div className="s3-bubble absolute left-0 bottom-[14%] overflow-hidden h-[clamp(6.3rem,22.4vw,9.1rem)] w-[clamp(4.41rem,15.68vw,6.37rem)]">
            <div className="relative h-full w-[clamp(6.3rem,22.4vw,9.1rem)] max-w-none -translate-x-[30%]">
              <div className="relative h-full w-full">
                <Image
                  src="/images/hero/red-circle-2.svg"
                  alt=""
                  fill
                  sizes="140px"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
          {/* 3 · Pequeño (futura burbuja, abajo centro-izquierda) */}
          <div className="s3-bubble absolute bottom-[9%] left-[34%] h-[clamp(2rem,7vw,2.75rem)] w-[clamp(2rem,7vw,2.75rem)]">
            <div className="relative h-full w-full">
              <Image
                src="/images/hero/red-circle-1.svg"
                alt=""
                fill
                sizes="44px"
                className="object-contain"
              />
            </div>
          </div>
          {/* 3b · Pequeño extra (futura burbuja, abajo) */}
          <div className="s3-bubble absolute bottom-[12%] left-[18%] h-[clamp(1.5rem,5.5vw,2rem)] w-[clamp(1.5rem,5.5vw,2rem)]">
            <div className="relative h-full w-full">
              <Image
                src="/images/hero/red-circle-2.svg"
                alt=""
                fill
                sizes="32px"
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Texto — alineado a la izquierda, centrado verticalmente */}
        <PageGrid className="relative z-10">
          <div className="col-span-4 max-w-md md:col-span-12">
            <h2 className="mb-4 text-left text-[16px] font-bold leading-snug text-gray-900">
              {t('hero.section3.title')}
            </h2>
            <p className="text-left text-[16px] font-normal leading-snug text-gray-900">
              {renderTextWithBold(t('hero.section3.text'))}
            </p>
          </div>
        </PageGrid>
      </motion.div>

      <WelcomeSection />
      <PrinciplesSection />
      <DonationsSection />
    </div>
  );
}
