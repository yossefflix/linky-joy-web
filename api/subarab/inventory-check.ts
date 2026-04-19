/**
 * GET /api/subarab/inventory-check?plan=3|6|12|24
 * Checks available IPTV accounts for a given plan duration.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSubarabSupabase, applyCors } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const plan = req.query.plan;
  if (!plan) return res.status(400).json({ error: 'Plan parameter is required' });

  try {
    const supabase = getSubarabSupabase();
    const { count, error } = await supabase
      .from('iptv_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('plan_duration', parseInt(plan as string))
      .eq('status', 'available');

    if (error) throw error;

    return res.status(200).json({
      availableCount: count || 0,
      inStock: (count || 0) > 0,
    });
  } catch (err: any) {
    console.error('[SubArab Inventory] Error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
