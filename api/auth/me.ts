/**
 * GET /api/auth/me
 * Headers: Authorization: Bearer <token>
 * Response: { user, roles }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin, extractToken, corsHeaders } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const token = extractToken(req.headers.authorization as string);
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ message: 'Invalid token' });

    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    return res.status(200).json({
      user: { id: user.id, email: user.email },
      roles: rolesData?.map(r => r.role) || [],
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
}
