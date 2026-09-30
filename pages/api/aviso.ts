import type { NextApiRequest, NextApiResponse } from 'next';
import { cookieAviso } from '../../components/aviso/aviso';

/**
 * Repite desde el servidor la cookie del aviso de protección de menores
 * (docs/aviso/DECISIONES.md, D1). Safari (ITP) y Brave recortan a 7 días las cookies escritas
 * con `document.cookie`; las que llegan en un `Set-Cookie` del mismo sitio duran lo que dicen.
 * La cabecera sale de la misma `cookieAviso` que usa el cliente: nombre, versión y duración en
 * un solo sitio (components/aviso/aviso.ts).
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const proto = String(req.headers['x-forwarded-proto'] ?? '')
    .split(',')[0]
    .trim();
  const segura = proto === 'https' || Boolean((req.socket as { encrypted?: boolean }).encrypted);

  res.setHeader('Set-Cookie', cookieAviso(segura));
  res.setHeader('Cache-Control', 'no-store');
  return res.status(204).end();
}
