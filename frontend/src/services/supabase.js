import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
  console.warn('[Supabase] EXPO_PUBLIC_SUPABASE_URL is missing. Supabase will fail to connect.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
