'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useInView, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, Navigation } from 'swiper/modules';
import type { Swiper as SwiperClass } from 'swiper';

import 'swiper/css';

import { useTranslation } from '../../hooks/useTranslation';
import { crearEfectoMazo, repintarMazo, type ConfigMazo } from './efecto-mazo';
import {
  ESTAMPILLAS,
  ESTAMPILLA_ALTO_PX,
  ESTAMPILLA_ANCHO_PX,
  POSES_ABANICO,
  POSES_PILA,
} from './estampillas.data';
import { PistaDeslizar } from './pista-deslizar';
import estilos from './principles.module.css';

/** Desde tablet el mazo es abanico; debajo, pila (frames 1288:676 y 1288:913). */
const MEDIA_ABANICO = '(min-width: 768px)';

/**
 * La pista de "desliza" se va la primera vez que la persona usa el slider y no vuelve en esa
 * visita. Vive en el módulo (no en el estado del componente) para que un remontaje no la traiga.
 */
let pistaUsadaEnEstaVisita = false;

type Props = {
  /**
   * id del título que nombra al carrusel (aria-labelledby). El título, el fondo y el padding
   * de sección los pone quien lo monta: hoy la sección EMI (components/emi/emi-section.tsx).
   */
  etiquetadoPor?: string;
};

export default function PrinciplesSection({ etiquetadoPor }: Props) {
  const { t } = useTranslation();
  const reducido = useReducedMotion() ?? false;
  const escenarioRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperClass | null>(null);
  // La instancia también en estado: los efectos que dependen de ella se rehacen si Swiper se
  // vuelve a crear (StrictMode monta, desmonta y monta de nuevo en desarrollo).
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  /** Tras la primera interacción el autoplay se para y no vuelve (docs/emi/DECISIONES.md, D3). */
  const interactuadoRef = useRef(false);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const enPantalla = useInView(escenarioRef, { amount: 0.35 });
  const [conFoco, setConFoco] = useState(false);
  const enPantallaRef = useRef(false);
  enPantallaRef.current = enPantalla;
  const [pistaVisible, setPistaVisible] = useState(!pistaUsadaEnEstaVisita);

  const configMazo = useRef<ConfigMazo>({ poses: POSES_PILA, reducido: false });
  const efectoMazo = useMemo(() => crearEfectoMazo(configMazo), []);

  /** La persona usó el slider: se va la pista (una vez por visita) y se para el autoplay. */
  const marcarUso = () => {
    interactuadoRef.current = true;
    const sw = swiperRef.current;
    if (sw && !sw.destroyed && sw.autoplay?.running) sw.autoplay.stop();
    if (pistaUsadaEnEstaVisita) return;
    pistaUsadaEnEstaVisita = true;
    setPistaVisible(false);
  };
  const marcarUsoRef = useRef(marcarUso);
  marcarUsoRef.current = marcarUso;

  // Abanico o pila según el ancho, y sin arco con prefers-reduced-motion.
  useEffect(() => {
    const mq = window.matchMedia(MEDIA_ABANICO);
    const aplicar = () => {
      configMazo.current = {
        poses: mq.matches ? POSES_ABANICO : POSES_PILA,
        reducido,
      };
      const sw = swiperRef.current;
      if (sw && !sw.destroyed) repintarMazo(sw);
    };
    aplicar();
    mq.addEventListener('change', aplicar);
    return () => mq.removeEventListener('change', aplicar);
  }, [reducido]);

  // Autoplay: corre solo con el slider en pantalla, sin el foco del teclado dentro, sin
  // prefers-reduced-motion y hasta la primera interacción. Se decide en un efecto que depende de
  // la instancia (en estado) y de `enPantalla` (el mismo useInView de la pista): así sobrevive al
  // doble montaje de StrictMode, que destruye y rehace la instancia de Swiper.
  useEffect(() => {
    if (!swiper || swiper.destroyed || !swiper.autoplay) return;
    const debe = enPantalla && !conFoco && !reducido && !interactuadoRef.current;
    if (debe && !swiper.autoplay.running) swiper.autoplay.start();
    if (!debe && swiper.autoplay.running) swiper.autoplay.stop();
  }, [swiper, enPantalla, conFoco, reducido]);

  useEffect(() => {
    if (!swiper) return;
    return () => {
      if (!swiper.destroyed && swiper.autoplay?.running) swiper.autoplay.stop();
    };
  }, [swiper]);

  // Anuncio para lectores de pantalla: "polite" cuando nadie más mueve el slider (autoplay
  // parado o en pausa), "off" mientras rota solo, para no hablar cada 4,5 s.
  useEffect(() => {
    if (!swiper) return;
    const actualizar = () => {
      if (swiper.destroyed) return;
      const rotando = swiper.autoplay?.running && !swiper.autoplay.paused;
      swiper.wrapperEl.setAttribute('aria-live', rotando ? 'off' : 'polite');
    };
    const eventos = ['autoplayStart', 'autoplayStop', 'autoplayPause', 'autoplayResume'] as const;
    actualizar();
    eventos.forEach(ev => swiper.on(ev, actualizar));
    return () => {
      if (!swiper.destroyed) eventos.forEach(ev => swiper.off(ev, actualizar));
    };
  }, [swiper]);

  // Teclado: flechas izquierda y derecha con el slider en pantalla. Propio y no el módulo
  // Keyboard de Swiper, que escucha en document sin mirar si hay un diálogo abierto encima:
  // con el drawer de Súmate (o cualquier modal) abierto, las flechas no mueven el slider.
  useEffect(() => {
    if (!swiper) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (!enPantallaRef.current || swiper.destroyed) return;
      const destino = e.target instanceof Element ? e.target : null;
      if (destino?.closest('input, textarea, select, [contenteditable], [role=dialog]')) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      marcarUsoRef.current();
      if (e.key === 'ArrowRight') swiper.slideNext();
      else swiper.slidePrev();
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [swiper]);

  return (
    <div
      ref={escenarioRef}
      id="estampillas"
      className={estilos.escenario}
      onFocus={() => setConFoco(true)}
      onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setConFoco(false);
      }}
    >
      <p id="estampillas-instrucciones" className="sr-only">
        {t('principles.instrucciones')}
      </p>
      {/* Las flechas no están en el diseño: siguen ahí para teclado y lectores de pantalla,
          ocultas a la vista hasta que reciben el foco. */}
      <button
        ref={prevRef}
        type="button"
        className="sr-only z-30 flex items-center justify-center rounded-full border border-black/10 bg-white/90 text-black shadow-md focus-visible:not-sr-only focus-visible:absolute focus-visible:left-0 focus-visible:top-1/2 focus-visible:h-11 focus-visible:w-11 focus-visible:-translate-y-1/2"
        aria-label={t('principles.prev')}
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={2} aria-hidden />
      </button>

      <Swiper
        modules={[efectoMazo, Navigation, Autoplay, A11y]}
        effect="mazo"
        grabCursor
        loop
        slideToClickedSlide
        longSwipesRatio={0.3}
        speed={reducido ? 250 : 1000}
        a11y={{
          enabled: true,
          containerRole: 'region',
          containerRoleDescriptionMessage: t('principles.rolCarrusel'),
          prevSlideMessage: t('principles.prev'),
          nextSlideMessage: t('principles.next'),
          slideRole: 'group',
          slideLabelMessage: '{{index}} / {{slidesLength}}',
        }}
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
          disableOnInteraction: true,
          pauseOnMouseEnter: true,
        }}
        onSliderFirstMove={marcarUso}
        onNavigationNext={marcarUso}
        onNavigationPrev={marcarUso}
        onClick={swiper => {
          // Clic en una de las de detrás: slideToClickedSlide la trae al frente.
          if (swiper.clickedSlide && swiper.clickedIndex !== swiper.activeIndex) marcarUso();
        }}
        onSwiper={instancia => {
          swiperRef.current = instancia;
          setSwiper(instancia);
          instancia.autoplay.stop();

          requestAnimationFrame(() => {
            const prev = prevRef.current;
            const next = nextRef.current;
            if (!prev || !next || !instancia.navigation) return;
            const nav = instancia.params.navigation;
            if (nav && typeof nav !== 'boolean') {
              nav.prevEl = prev;
              nav.nextEl = next;
            }
            instancia.navigation.init();
            instancia.navigation.update();
          });
        }}
        aria-labelledby={etiquetadoPor}
        aria-describedby="estampillas-instrucciones"
        className={`principles-swiper ${estilos.mazo}`}
      >
        {ESTAMPILLAS.map((estampilla, index) => (
          <SwiperSlide key={estampilla.src}>
            {/* El cuerpo: lo que mueve el amago de la pista (pista-deslizar.tsx) sin tocar la pose que
                el efecto mazo pone al slide. */}
            <div data-estampilla-cuerpo="">
              <Image
                src={estampilla.src}
                alt={t(estampilla.altKey)}
                width={ESTAMPILLA_ANCHO_PX}
                height={ESTAMPILLA_ALTO_PX}
                draggable={false}
                className="block h-auto w-full select-none"
                sizes="(min-width: 1024px) 360px, (min-width: 768px) 320px, 90vw"
                priority={index === 0}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        ref={nextRef}
        type="button"
        className="sr-only z-30 flex items-center justify-center rounded-full border border-black/10 bg-white/90 text-black shadow-md focus-visible:not-sr-only focus-visible:absolute focus-visible:right-0 focus-visible:top-1/2 focus-visible:h-11 focus-visible:w-11 focus-visible:-translate-y-1/2"
        aria-label={t('principles.next')}
      >
        <ChevronRight className="h-6 w-6" strokeWidth={2} aria-hidden />
      </button>

      {/* El hueco de la pista existe siempre y con el mismo alto (en mobile y tablet es su propia
          fila): aparecer o irse nunca mueve el layout. Es decorativa: las instrucciones para
          lectores de pantalla van en `estampillas-instrucciones`. */}
      <div
        className={estilos.pista}
        aria-hidden="true"
        data-pista-swipe=""
        data-visible={pistaVisible ? '' : undefined}
      >
        <PistaDeslizar
          swiper={swiper}
          visible={pistaVisible}
          enPantalla={enPantalla}
          reducido={reducido}
        />
      </div>
    </div>
  );
}
