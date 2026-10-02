/**
 * Lee el monto de una referencia de Bold con el formato `lasfuertes-<monto>-<marca>-<azar>`
 * (components/sumate/donar-dinero.tsx, docs/mixpanel/DECISIONES.md, D4). Las órdenes viejas
 * (`lasfuertes-<marca>-<azar>`) no llevan monto: devuelve null.
 */
export function montoDeOrden(orderId: string | null | undefined): number | null {
  const partes = orderId?.match(/^lasfuertes-(\d+)-(\d+)-(\d+)$/);
  if (!partes) return null;
  const monto = Number(partes[1]);
  return Number.isSafeInteger(monto) && monto > 0 ? monto : null;
}
