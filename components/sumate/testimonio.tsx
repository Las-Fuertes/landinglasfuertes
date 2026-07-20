import Image from 'next/image';

export interface TestimonioProps {
  quote?: string;
  author?: string;
  role?: string;
  imageSrc?: string;
  imageAlt?: string;
}

/**
 * Testimonio con cita y foto real. Se oculta si aún no hay testimonio autorizado
 * (usar solo con autorización, y de acudiente si es menor de edad).
 */
export default function Testimonio({ quote, author, role, imageSrc, imageAlt }: TestimonioProps) {
  if (!quote || !author) return null;

  return (
    <figure className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
      {imageSrc && (
        <div className="relative h-20 w-20 overflow-hidden rounded-full">
          <Image
            src={imageSrc}
            alt={imageAlt ?? author}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      )}
      <blockquote className="text-[1.4rem] font-bold leading-snug text-blue">“{quote}”</blockquote>
      <figcaption className="text-[0.95rem] text-black">
        <strong>{author}</strong>
        {role ? ` · ${role}` : ''}
      </figcaption>
    </figure>
  );
}
