import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yjkrszolonytxkorwymm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlqa3Jzem9sb255dHhrb3J3eW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MTk2MjksImV4cCI6MjA4OTE5NTYyOX0.ZnoUuoc3UB6GFr8cv9j9TCkCJmgoTUpUnkCeFLrfzt8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
