import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ⚠️ Service key must NEVER be exposed to frontend builds.
// Only use it in server-side code, edge functions, or local admin tools.

// Public client (safe for frontend usage)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: false,
  },
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("[supabaseClient] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing.");
}

export default supabase;
