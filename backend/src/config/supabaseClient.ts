import { createClient } from '@supabase/supabase-js';
import { getRequiredEnv } from './env.js';

const supabaseUrl = getRequiredEnv('SUPABASE_URL');
const supabaseAnonKey = getRequiredEnv('SUPABASE_ANON_KEY');
const supabaseServiceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

// Regular Supabase client for user operations (RLS enforced)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Admin Supabase client (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Create an authenticated client with a specific JWT token
export const getSupabaseClient = (token: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
