'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useEnDrawer } from './sumate-drawer-context';

/**
 * Entrada sutil al hacer scroll: fade + slide desde abajo, una sola vez. Dentro del drawer de
 * Súmate se muestra directamente: el panel ya entra animado (docs/sumate-drawer/DECISIONES.md).
 */
export function FadeIn({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const enDrawer = useEnDrawer();
  if (enDrawer) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
