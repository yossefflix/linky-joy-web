/**
 * GET /api/analytics/[linkId]
 * Returns aggregated analytics for a link.
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

  try {
    const { linkId } = req.query;

    // Verify link ownership
    const { data: link } = await supabase
      .from('links')
      .select('id')
      .eq('id', linkId as string)
      .eq('user_id', user.id)
      .single();

    if (!link) return res.status(404).json({ message: 'Link not found' });

    const { data: clicks, error } = await supabase
      .from('clicks')
      .select('*')
      .eq('link_id', linkId as string)
      .order('timestamp', { ascending: true });

    if (error) return res.status(500).json({ message: error.message });

    // Aggregate
    const clicksByDate: Record<string, number> = {};
    const countryMap: Record<string, number> = {};
    const deviceMap: Record<string, number> = {};
    const browserMap: Record<string, number> = {};

    (clicks || []).forEach(click => {
      const date = new Date(click.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;
      const country = click.country || 'Unknown';
      countryMap[country] = (countryMap[country] || 0) + 1;
      const device = click.device || 'Unknown';
      deviceMap[device] = (deviceMap[device] || 0) + 1;
      const browser = click.browser || 'Unknown';
      browserMap[browser] = (browserMap[browser] || 0) + 1;
    });

    return res.status(200).json({
      clicksOverTime: Object.entries(clicksByDate).map(([date, count]) => ({ date, clicks: count })),
      topCountries: Object.entries(countryMap).map(([country, count]) => ({ country, clicks: count })).sort((a, b) => b.clicks - a.clicks).slice(0, 10),
      devices: Object.entries(deviceMap).map(([device, count]) => ({ device, clicks: count })),
      browsers: Object.entries(browserMap).map(([browser, count]) => ({ browser, clicks: count })),
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
}
