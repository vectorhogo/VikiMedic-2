/**
 * VikiMedic v2 - Supabase Infrastructure Client
 * Clean Architecture Layer: Infrastructure
 */

import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const getSupabaseStatus = () => {
  const isConfigured =
    Boolean(env.VITE_SUPABASE_URL) &&
    env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

  return {
    isConfigured,
    url: supabaseUrl,
  };
};
