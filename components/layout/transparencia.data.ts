/**
 * Estados financieros que publica el footer en "Transparencia" (docs/navegacion/DECISIONES.md,
 * D2). Para sumar un año: poner el PDF en `public/transparencia/` con un nombre sin espacios y
 * añadir su línea aquí. El menú los muestra en este orden (el más reciente primero).
 */
export type EstadoFinanciero = {
  anio: number;
  /** Ruta pública del PDF, desde la raíz del sitio. */
  ruta: string;
};

export const ESTADOS_FINANCIEROS: EstadoFinanciero[] = [
  { anio: 2025, ruta: '/transparencia/estados-financieros-2025.pdf' },
];
