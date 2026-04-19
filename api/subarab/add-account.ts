/**
 * POST /api/subarab/add-account
 * Adds a new IPTV account to the inventory (admin only).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSubarabSupabase, applyCors } from './_lib/supabase';

const ADMIN_PASSWORD = process.env.SUBARAB_ADMIN_PASSWORD || 'Yossef123$';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { adminPassword, username, password, plan_duration } = req.body || {};

    if (adminPassword !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!username || !password || !plan_duration) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    const supabase = getSubarabSupabase();
    const { error } = await supabase
      .from('iptv_accounts')
      .insert([{ username, password, plan_duration: parseInt(plan_duration), status: 'available' }]);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('[SubArab AddAccount] Error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
