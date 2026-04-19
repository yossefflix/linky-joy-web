/**
 * Admin Service — uses Supabase when configured, mock fallback otherwise.
 */

import { AdminStats } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { mockAdminStats } from '@/lib/mock-data';

export async function getAdminStats(): Promise<AdminStats> {
  if (!isSupabaseConfigured) return { ...mockAdminStats };

  const { data, error } = await supabase.rpc('get_admin_stats');
  if (error) throw new Error(error.message);

  return data as AdminStats;
}
