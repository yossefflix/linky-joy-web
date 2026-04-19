/**
 * Analytics Service — uses Supabase when configured, mock fallback otherwise.
 */

import { AnalyticsData } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { mockAnalytics } from '@/lib/mock-data';

export async function getLinkAnalytics(linkId: string): Promise<AnalyticsData> {
  if (!isSupabaseConfigured) return { ...mockAnalytics };

  const { data: clicks, error } = await supabase
    .from('clicks')
    .select('*')
    .eq('link_id', linkId)
    .order('timestamp', { ascending: true });

  if (error) throw new Error(error.message);
  if (!clicks || clicks.length === 0) {
    return { clicksOverTime: [], topCountries: [], devices: [], browsers: [] };
  }

  // Aggregate clicks over time (by date)
  const clicksByDate: Record<string, number> = {};
  const countryMap: Record<string, number> = {};
  const deviceMap: Record<string, number> = {};
  const browserMap: Record<string, number> = {};

  clicks.forEach(click => {
    const date = new Date(click.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    clicksByDate[date] = (clicksByDate[date] || 0) + 1;

    const country = click.country || 'Unknown';
    countryMap[country] = (countryMap[country] || 0) + 1;

    const device = click.device || 'Unknown';
    deviceMap[device] = (deviceMap[device] || 0) + 1;

    const browser = click.browser || 'Unknown';
    browserMap[browser] = (browserMap[browser] || 0) + 1;
  });

  return {
    clicksOverTime: Object.entries(clicksByDate).map(([date, count]) => ({ date, clicks: count })),
    topCountries: Object.entries(countryMap)
      .map(([country, count]) => ({ country, clicks: count }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10),
    devices: Object.entries(deviceMap).map(([device, count]) => ({ device, clicks: count })),
    browsers: Object.entries(browserMap).map(([browser, count]) => ({ browser, clicks: count })),
  };
}

export async function exportAnalyticsCSV(linkId: string): Promise<Blob> {
  if (!isSupabaseConfigured) {
    const data = mockAnalytics;
    const headers = ['Date', 'Clicks'];
    const rows = data.clicksOverTime.map(r => [r.date, r.clicks]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    return new Blob([csv], { type: 'text/csv' });
  }

  const { data: clicks, error } = await supabase
    .from('clicks')
    .select('*')
    .eq('link_id', linkId)
    .order('timestamp', { ascending: true });

  if (error) throw new Error(error.message);

  const headers = ['Timestamp', 'IP', 'Country', 'Device', 'Browser'];
  const rows = (clicks || []).map(c => [c.timestamp, c.ip_address || '', c.country || '', c.device || '', c.browser || '']);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  return new Blob([csv], { type: 'text/csv' });
}
