/**
 * GET /api/subarab/admin-stats
 * Returns order list and inventory stats for the admin dashboard.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSubarabSupabase, applyCors } from './_lib/supabase';

const ADMIN_PASSWORD = process.env.SUBARAB_ADMIN_PASSWORD || 'Yossef123$';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const adminPassword = req.query.adminPassword as string;
  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const supabase = getSubarabSupabase();

    // Fetch recent orders with account info
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, paddle_transaction_id, plan, payment_status, delivery_status, created_at, iptv_accounts(username)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (ordersError) throw ordersError;

    // Inventory counts per plan
    const { data: inventory, error: invError } = await supabase
      .from('iptv_accounts')
      .select('plan_duration, status');

    if (invError) throw invError;

    const totalAvailable = inventory?.filter(a => a.status === 'available').length || 0;
    const totalUsed = inventory?.filter(a => a.status === 'used').length || 0;

    // Count failed deliveries in last 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const failedCount = orders?.filter(
      o => o.delivery_status === 'failed' && o.created_at >= yesterday
    ).length || 0;

    // Revenue (count of completed orders × plan price approximation)
    const completedToday = orders?.filter(o => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      return o.payment_status === 'completed' && new Date(o.created_at) >= today;
    }).length || 0;

    return res.status(200).json({
      orders: orders || [],
      stats: {
        completedToday,
        totalAvailable,
        totalUsed,
        failedCount,
      },
    });
  } catch (err: any) {
    console.error('[SubArab AdminStats] Error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
