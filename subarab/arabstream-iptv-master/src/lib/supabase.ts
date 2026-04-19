import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'placeholder_key';

// Note: Ensure this is only used on the server side (Edge Functions / API Routes)
// if it carries the SERVICE_KEY.
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
