import { ROUTE_COUNT } from './education-map.data';

/** Cinco puntos de progreso. Decorativos: quien lee lo escucha por la región viva. */
export default function MapProgressDots({ activeIndex }: { activeIndex: number }) {
  return (
    <span aria-hidden className="flex items-center justify-center gap-2">
      {Array.from({ length: ROUTE_COUNT }, (_, i) => (
        <span
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === activeIndex ? 'w-5 bg-black' : 'w-2 bg-black/30'
          }`}
        />
      ))}
    </span>
  );
}
