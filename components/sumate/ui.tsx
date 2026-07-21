import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

const CTA_BASE =
  'inline-flex h-[3.25rem] w-full items-center justify-center rounded-lg px-7 text-center text-[1.05rem] font-bold uppercase tracking-tight transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 md:w-auto';

export function SumateCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex h-full flex-col rounded-2xl border border-black/10 bg-white p-6 shadow-md md:p-8 ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export function CtaLink({
  children,
  className = '',
  colorClassName = 'bg-blue text-white hover:bg-blue-300',
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; colorClassName?: string }) {
  return (
    <a className={`${CTA_BASE} ${colorClassName} ${className}`.trim()} {...rest}>
      {children}
    </a>
  );
}

export function CtaButton({
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="button"
      className={`${CTA_BASE} bg-blue text-white hover:bg-blue-300 disabled:cursor-not-allowed disabled:bg-black/20 ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

/** CTA deshabilitado con microcopy cuando falta configuración ("Pronto disponible").
 *  Sin altura fija: el microcopy puede ocupar dos líneas en mobile. */
export function DisabledCta({ children }: { children: ReactNode }) {
  return (
    <span
      aria-disabled="true"
      className="inline-flex min-h-[3.25rem] w-full cursor-not-allowed items-center justify-center rounded-lg bg-black/20 px-7 py-3 text-center text-[1.05rem] font-bold uppercase leading-snug tracking-tight text-white md:w-auto"
    >
      {children}
    </span>
  );
}
