/**
 * DELETE /api/links/[id]
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin, extractToken, corsHeaders } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).json({ message: 'Method not allowed' });

  const token = extractToken(req.headers.authorization as string);
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const supabase = getSupabaseAdmin();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ message: 'Invalid token' });

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: 'Link ID required' });

    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id as string)
      .eq('user_id', user.id);

    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
}
