import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

/**
 * Genera la firma de integridad de Bold: sha256 de `{orderId}{amount}{currency}{secretKey}`.
 * La llave secreta solo vive en el servidor: nunca usar NEXT_PUBLIC para esta variable.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, amount, currency = 'COP' } = req.body ?? {};
  const amountNumber = Number(amount);

  if (
    typeof orderId !== 'string' ||
    !orderId ||
    !Number.isInteger(amountNumber) ||
    amountNumber <= 0 ||
    typeof currency !== 'string'
  ) {
    return res.status(400).json({ error: 'Missing or invalid params' });
  }

  const secret = process.env.BOLD_SECRET_KEY;
  if (!secret) {
    return res.status(500).json({ error: 'Not configured' });
  }

  const signature = crypto
    .createHash('sha256')
    .update(`${orderId}${amountNumber}${currency}${secret}`)
    .digest('hex');

  return res.status(200).json({ signature });
}
