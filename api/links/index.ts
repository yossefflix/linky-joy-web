/**
 * GET  /api/links — list user's links
 * POST /api/links — create a link
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin, extractToken, corsHeaders } from '../_lib/supabase';

function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = extractToken(req.headers.authorization as string);
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const supabase = getSupabaseAdmin();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ message: 'Invalid token' });

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) return res.status(500).json({ message: error.message });
      return res.status(200).json({ links: data });
    }

    if (req.method === 'POST') {
      const { original_url, custom_code, password, expires_at } = req.body;
      if (!original_url) return res.status(400).json({ message: 'original_url is required' });

      let title: string;
      try { title = new URL(original_url).hostname; } catch { title = original_url; }

      const shortCode = custom_code || generateShortCode();

      // Check if short code exists
      const { data: existing } = await supabase
        .from('links')
        .select('id')
        .eq('short_code', shortCode)
        .single();

      if (existing) return res.status(409).json({ message: 'Short code already taken' });

      const { data, error } = await supabase
        .from('links')
        .insert({
          user_id: user.id,
          original_url,
          short_code: shortCode,
          custom_code: custom_code || null,
          title,
          expires_at: expires_at || null,
          password: password || null,
          is_active: true,
          total_clicks: 0,
        })
        .select()
        .single();

      if (error) return res.status(500).json({ message: error.message });
      return res.status(201).json({ link: data });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
}
