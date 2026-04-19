/**
 * Auth Service — uses Supabase Auth when configured, mock fallback otherwise.
 */

import { User } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthResponse {
  user: User;
  token: string;
}

interface MeResponse {
  user: User;
  roles: string[];
}

// ── Mock implementation ──────────────────────────────────

const mockUsers: Record<string, { user: User; password: string; roles: string[] }> = {
  'admin@sniplink.io': {
    user: { id: 'user-admin', email: 'admin@sniplink.io' },
    password: 'admin123',
    roles: ['admin'],
  },
};

function mockLogin(email: string, _password: string): AuthResponse {
  const existing = mockUsers[email];
  if (existing) return { user: existing.user, token: `mock-token-${existing.user.id}` };
  const user: User = { id: `user-${Date.now()}`, email };
  mockUsers[email] = { user, password: _password, roles: ['user'] };
  return { user, token: `mock-token-${user.id}` };
}

function mockSignup(email: string, password: string): AuthResponse {
  const user: User = { id: `user-${Date.now()}`, email };
  mockUsers[email] = { user, password, roles: ['user'] };
  return { user, token: `mock-token-${user.id}` };
}

function mockMe(token: string): MeResponse {
  const entry = Object.values(mockUsers).find(u => `mock-token-${u.user.id}` === token);
  if (!entry) throw new Error('Invalid token');
  return { user: entry.user, roles: entry.roles };
}

// ── Supabase implementation ──────────────────────────────

async function supabaseLogin(email: string, password: string): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error(error?.message || 'Login failed');
  return {
    user: { id: data.user.id, email: data.user.email! },
    token: data.session?.access_token || '',
  };
}

async function supabaseSignup(email: string, password: string): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error || !data.user) throw new Error(error?.message || 'Signup failed');
  return {
    user: { id: data.user.id, email: data.user.email! },
    token: data.session?.access_token || '',
  };
}

async function supabaseGetMe(): Promise<MeResponse> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Not authenticated');

  const { data: rolesData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  const roles = rolesData?.map(r => r.role) || ['user'];

  return {
    user: { id: user.id, email: user.email! },
    roles,
  };
}

// ── Public API ───────────────────────────────────────────

export async function login(email: string, password: string): Promise<AuthResponse> {
  if (!isSupabaseConfigured) return mockLogin(email, password);
  return supabaseLogin(email, password);
}

export async function signup(email: string, password: string): Promise<AuthResponse> {
  if (!isSupabaseConfigured) return mockSignup(email, password);
  return supabaseSignup(email, password);
}

export async function getMe(): Promise<MeResponse> {
  if (!isSupabaseConfigured) {
    const token = localStorage.getItem('sniplink_token');
    if (!token) throw new Error('Not authenticated');
    return mockMe(token);
  }
  return supabaseGetMe();
}

export async function logout(): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem('sniplink_token');
}
