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
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return (
    <a className={`${CTA_BASE} bg-blue text-white hover:bg-blue-300 ${className}`.trim()} {...rest}>
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

/** CTA deshabilitado con microcopy cuando falta configuración ("Pronto disponible"). */
export function DisabledCta({ children }: { children: ReactNode }) {
  return (
    <span aria-disabled="true" className={`${CTA_BASE} cursor-not-allowed bg-black/20 text-white`}>
      {children}
    </span>
  );
}
