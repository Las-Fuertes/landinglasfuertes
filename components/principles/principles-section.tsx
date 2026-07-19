'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCards, Navigation } from 'swiper/modules';
import type { Swiper as SwiperClass } from 'swiper';

import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/navigation';

import { PageGrid } from '../layout/page-grid';
import { useTranslation } from '../../hooks/useTranslation';

const PRINCIPLE_SLIDES = [
  '/images/principles/slide_1.jpg',
  '/images/principles/slide_2.jpg',
  '/images/principles/slide_3.jpg',
  '/images/principles/slide_4.jpg',
] as const;

export default function PrinciplesSection() {
  const { t } = useTranslation();
  const sliderViewportRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperClass | null>(null);
  const autoplayVisibilityObserverRef = useRef<IntersectionObserver | null>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return () => {
      autoplayVisibilityObserverRef.current?.disconnect();
      autoplayVisibilityObserverRef.current = null;
    };
  }, []);

  return (
    <section
      className="relative w-full bg-beige pb-16 pt-12 md:pb-20 md:pt-16"
      aria-labelledby="principles-title"
    >
      <PageGrid>
        <div className="col-span-4 md:col-span-12">
          <h2
            id="principles-title"
            className="text-left text-[32px] font-bold leading-tight text-black"
          >
            {t('principles.title')}
          </h2>
        </div>

        <div className="col-span-4 md:col-span-12">
          <div className="relative flex w-full items-center justify-center gap-1 py-6 sm:gap-2 md:gap-4 md:py-10 lg:gap-6">
            <button
              ref={prevRef}
              type="button"
              className="z-20 hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/90 text-black shadow-md transition hover:bg-white md:flex"
              aria-label={t('principles.prev')}
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2} aria-hidden />
            </button>

            <div
              ref={sliderViewportRef}
              className="min-h-0 min-w-0 w-full max-w-full flex-1 px-0 sm:px-1"
            >
              <Swiper
                modules={[EffectCards, Navigation, Autoplay]}
                effect="cards"
                cardsEffect={{ slideShadows: false }}
                grabCursor
                loop
                loopAdditionalSlides={2}
                speed={500}
                navigation={{
                  prevEl: prevRef.current,
                  nextEl: nextRef.current,
                }}
                onBeforeInit={swiper => {
                  const nav = swiper.params.navigation;
                  if (nav && typeof nav !== 'boolean') {
                    nav.prevEl = prevRef.current;
                    nav.nextEl = nextRef.current;
                  }
                }}
                autoplay={{
                  delay: 4500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                onSwiper={swiper => {
                  swiperRef.current = swiper;
                  swiper.autoplay.stop();

                  autoplayVisibilityObserverRef.current?.disconnect();

                  const root = sliderViewportRef.current;
                  if (root) {
                    const io = new IntersectionObserver(
                      ([entry]) => {
                        const sw = swiperRef.current;
                        if (!sw?.autoplay) return;
                        if (entry.isIntersecting) sw.autoplay.start();
                        else sw.autoplay.stop();
                      },
                      {
                        threshold: 0.35,
                        rootMargin: '0px',
                      }
                    );
                    io.observe(root);
                    autoplayVisibilityObserverRef.current = io;
                  }

                  requestAnimationFrame(() => {
                    const prev = prevRef.current;
                    const next = nextRef.current;
                    if (!prev || !next || !swiper.navigation) return;
                    const nav = swiper.params.navigation;
                    if (nav && typeof nav !== 'boolean') {
                      nav.prevEl = prev;
                      nav.nextEl = next;
                    }
                    swiper.navigation.init();
                    swiper.navigation.update();
                  });
                }}
                className="principles-swiper mx-auto h-auto w-full max-w-full overflow-visible"
              >
                {PRINCIPLE_SLIDES.map((src, index) => (
                  <SwiperSlide key={src}>
                    <div className="box-border w-full px-1 pb-1 pt-1 sm:px-2 md:px-3 md:pb-2">
                      <div className="relative aspect-[3/4] w-full">
                        <Image
                          src={src}
                          alt=""
                          fill
                          className="object-contain object-center"
                          sizes="(max-width: 768px) 92vw, (max-width: 1200px) 85vw, min(1152px, 85vw)"
                          priority={index === 0}
                        />
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <button
              ref={nextRef}
              type="button"
              className="z-20 hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/90 text-black shadow-md transition hover:bg-white md:flex"
              aria-label={t('principles.next')}
            >
              <ChevronRight className="h-6 w-6" strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>
      </PageGrid>
    </section>
  );
}
