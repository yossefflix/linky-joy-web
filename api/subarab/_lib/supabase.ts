/**
 * Supabase Admin client for SubArab (sniplink-pay) API routes.
 * Uses a SEPARATE Supabase project: yjkrszolonytxkorwymm.supabase.co
 *
 * Required Vercel env vars:
 *   - SUBARAB_SUPABASE_URL
 *   - SUBARAB_SUPABASE_SERVICE_KEY
 *   - SUBARAB_WASENDER_API_KEY
 */

import { createClient } from '@supabase/supabase-js';
import type { VercelResponse } from '@vercel/node';

export function getSubarabSupabase() {
  const url = process.env.SUBARAB_SUPABASE_URL;
  const key = process.env.SUBARAB_SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUBARAB_SUPABASE_URL or SUBARAB_SUPABASE_SERVICE_KEY');
  return createClient(url, key);
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function applyCors(res: VercelResponse) {
  const headers = corsHeaders();
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
}
