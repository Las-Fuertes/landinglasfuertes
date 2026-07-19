import type { HTMLAttributes, ReactNode } from 'react';

export interface PageGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * 4 columns (mobile) / 12 columns (md+), 40px horizontal inset, 25px gutters.
 */
export function PageGrid({ children, className = '', ...rest }: PageGridProps) {
  return (
    <div
      className={`grid w-full grid-cols-4 gap-x-grid-gutter gap-y-grid-gutter px-page-margin md:grid-cols-12 ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
