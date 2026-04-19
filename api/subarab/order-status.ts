/**
 * GET /api/subarab/order-status?txId=<paddle_transaction_id>
 * Polls the delivery status and returns credentials once ready.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSubarabSupabase, applyCors } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const txId = req.query.txId as string;
  if (!txId) return res.status(400).json({ error: 'Transaction ID required' });

  try {
    const supabase = getSubarabSupabase();
    const { data: order, error } = await supabase
      .from('orders')
      .select('delivery_status, iptv_accounts(username, password)')
      .eq('paddle_transaction_id', txId)
      .single();

    if (error || !order) {
      // Webhook might still be processing — return pending
      return res.status(200).json({ status: 'pending' });
    }

    const responsePayload: any = { status: order.delivery_status };

    if (order.iptv_accounts) {
      const accounts = Array.isArray(order.iptv_accounts)
        ? order.iptv_accounts[0]
        : (order.iptv_accounts as any);

      if (accounts) {
        responsePayload.credentials = {
          username: accounts.username,
          password: accounts.password,
        };
      }
    }

    return res.status(200).json(responsePayload);
  } catch (err: any) {
    console.error('[SubArab OrderStatus] Error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
