/**
 * GET /api/admin/stats
 * Requires admin role.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin, extractToken, corsHeaders } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  const token = extractToken(req.headers.authorization as string);
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const supabase = getSupabaseAdmin();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ message: 'Invalid token' });

  // Check admin role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .single();

  if (!roleData) return res.status(403).json({ message: 'Admin access required' });

  try {
    const [linksCount, clicksSum, usersCount] = await Promise.all([
      supabase.from('links').select('id', { count: 'exact', head: true }),
      supabase.from('links').select('total_clicks'),
      supabase.auth.admin.listUsers(),
    ]);

    const totalClicks = (clicksSum.data || []).reduce((sum, l) => sum + (l.total_clicks || 0), 0);

    return res.status(200).json({
      totalUsers: usersCount.data?.users?.length || 0,
      totalLinks: linksCount.count || 0,
      totalClicks,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
}
