import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from './types';
import * as authService from '@/services/authService';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    if (isSupabaseConfigured) {
      // Listen for auth state changes FIRST
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email! });
            // Fetch roles
            const { data: rolesData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id);
            setRoles(rolesData?.map(r => r.role) || []);
          } else {
            setUser(null);
            setRoles([]);
          }
          setLoading(false);
        }
      );

      // Then check existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email! });
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Mock mode: check localStorage token
      const token = localStorage.getItem('sniplink_token');
      if (token) {
        authService.getMe()
          .then(({ user, roles }) => { setUser(user); setRoles(roles); })
          .catch(() => { localStorage.removeItem('sniplink_token'); })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    setUser(result.user);
    if (!isSupabaseConfigured) {
      localStorage.setItem('sniplink_token', result.token);
      const me = await authService.getMe();
      setRoles(me.roles);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const result = await authService.signup(email, password);
    setUser(result.user);
    if (!isSupabaseConfigured) {
      localStorage.setItem('sniplink_token', result.token);
    }
    setRoles(['user']);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setRoles([]);
  }, []);

  const isAdmin = roles.includes('admin');

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
