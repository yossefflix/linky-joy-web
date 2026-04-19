/**
 * Link Service — uses Supabase when configured, mock fallback otherwise.
 */

import { Link } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getLinks as mockGetLinks, addLink as mockAddLink, deleteLink as mockDeleteLink, generateShortCode } from '@/lib/mock-data';

export async function getLinks(): Promise<Link[]> {
  if (!isSupabaseConfigured) return mockGetLinks();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function createLink(
  originalUrl: string,
  customCode?: string,
  password?: string,
  expiresAt?: string
): Promise<Link> {
  if (!isSupabaseConfigured) return mockAddLink(originalUrl, customCode, password, expiresAt);

  const { data: { user } } = await supabase.auth.getUser();
  // Anonymous users can't insert due to RLS — use mock fallback
  if (!user) return mockAddLink(originalUrl, customCode, password, expiresAt);

  const shortCode = customCode || generateShortCode();
  let title: string;
  try {
    title = new URL(originalUrl).hostname;
  } catch {
    title = originalUrl;
  }

  const newLink = {
    user_id: user?.id,
    original_url: originalUrl,
    short_code: shortCode,
    custom_code: customCode || null,
    title,
    expires_at: expiresAt || null,
    password: password || null,
    is_active: true,
    total_clicks: 0,
  };

  const { data, error } = await supabase
    .from('links')
    .insert(newLink)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteLink(id: string): Promise<void> {
  if (!isSupabaseConfigured) { mockDeleteLink(id); return; }

  const { error } = await supabase
    .from('links')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}
