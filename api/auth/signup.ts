/**
 * POST /api/auth/signup
 * Body: { email, password }
 * Response: { user, token }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin, corsHeaders } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) return res.status(400).json({ message: error.message });

    // Sign in to get a token
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) return res.status(400).json({ message: signInError.message });

    // Assign default 'user' role
    await supabase.from('user_roles').insert({
      user_id: data.user.id,
      role: 'user',
    });

    return res.status(201).json({
      user: { id: data.user.id, email: data.user.email },
      token: signInData.session?.access_token,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
}
