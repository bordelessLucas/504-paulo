import { createClient } from '@supabase/supabase-js';

import { supabaseStorage } from '@/lib/supabase-storage';
import type { Database } from '@/types/supabase';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.EXPO_PUBLIC_SUPABASE_URL ||
  '';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Credenciais ausentes. Use EXPO_PUBLIC_SUPABASE_* (ou VITE_SUPABASE_*) no .env da raiz.',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: supabaseStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
