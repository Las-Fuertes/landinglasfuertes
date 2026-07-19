import type { HTMLAttributes, ReactNode } from 'react';

const COL_SPAN: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12',
};

const MD_COL_SPAN: Record<number, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  6: 'md:col-span-6',
  7: 'md:col-span-7',
  8: 'md:col-span-8',
  9: 'md:col-span-9',
  10: 'md:col-span-10',
  11: 'md:col-span-11',
  12: 'md:col-span-12',
};

function spanClass(n: number): string {
  return COL_SPAN[n] ?? COL_SPAN[4];
}

function mdSpanClass(n: number): string {
  return MD_COL_SPAN[n] ?? MD_COL_SPAN[12];
}

export interface GridColumnProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Column span on the 4-column mobile grid */
  mobile: number;
  /** Column span on the 12-column desktop grid (md+) */
  desktop: number;
}

/**
 * Places children in the page grid with explicit mobile/desktop column spans.
 */
export function GridColumn({
  children,
  mobile,
  desktop,
  className = '',
  ...rest
}: GridColumnProps) {
  return (
    <div className={`${spanClass(mobile)} ${mdSpanClass(desktop)} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
