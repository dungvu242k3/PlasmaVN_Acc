import { createClient } from '@supabase/supabase-js';

// Supabase configuration - Using environment variables for security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Missing Supabase credentials! Please check your .env file and ensure ' +
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are defined.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
