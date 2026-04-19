/**
 * GET /api/r/[code]
 * Resolves short code → redirect to original URL.
 * Logs click with metadata.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin, corsHeaders } from '../_lib/supabase';

function parseUserAgent(ua: string) {
  let device = 'Desktop';
  if (/mobile/i.test(ua)) device = 'Mobile';
  else if (/tablet|ipad/i.test(ua)) device = 'Tablet';

  let browser = 'Other';
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/edg/i.test(ua)) browser = 'Edge';

  return { device, browser };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ message: 'Short code required' });

    const supabase = getSupabaseAdmin();

    // Find the link
    const { data: link, error } = await supabase
      .from('links')
      .select('*')
      .eq('short_code', code as string)
      .eq('is_active', true)
      .single();

    if (error || !link) return res.status(404).json({ message: 'Link not found' });

    // Check expiration
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return res.status(410).json({ message: 'Link has expired' });
    }

    // Check password
    if (link.password) {
      const { password } = req.query;
      if (password !== link.password) {
        return res.status(403).json({ message: 'Password required', passwordProtected: true });
      }
    }

    // Log click
    const ua = req.headers['user-agent'] || '';
    const { device, browser } = parseUserAgent(ua);
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket?.remoteAddress || '';

    // Get country from Vercel headers
    const country = (req.headers['x-vercel-ip-country'] as string) || 'Unknown';

    await supabase.from('clicks').insert({
      link_id: link.id,
      ip_address: ip,
      country,
      device,
      browser,
    });

    // Increment click count
    await supabase.rpc('increment_click_count', { link_short_code: code as string });

    // Redirect
    return res.redirect(302, link.original_url);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
}
